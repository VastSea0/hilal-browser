use anyhow::{bail, Context, Result};
use clap::{Parser, Subcommand};
use serde::Deserialize;
use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Parser)]
#[command(name = "hil", version, about = "Hilal Browser Patch Manager")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    #[command(about = "Download upstream source and initialize workspace")]
    Setup {
        #[arg(long, help = "Skip build dependency check")]
        skip_build_deps: bool,
    },
    #[command(about = "Apply all patches and overlays sequentially")]
    Apply {
        #[arg(long, short, help = "Reset engine checkout to baseline first")]
        force: bool,
        #[arg(long, help = "Simulate patch application without modifying disk")]
        dry_run: bool,
    },
    #[command(about = "Refresh changes/ from adjustments in engine/")]
    Refresh,
    #[command(about = "Show current workspace status")]
    Status,
    #[command(about = "Validate repository metadata without requiring engine/")]
    Validate,
    #[command(about = "Verify upstream tarball checksum")]
    Verify,
}

#[derive(Deserialize)]
struct Manifest {
    #[allow(dead_code)]
    browser: Option<Browser>,
    patches: Vec<PatchEntry>,
}

#[derive(Deserialize)]
#[allow(dead_code)]
struct Browser {
    name: String,
    codename: String,
    version: String,
}

#[derive(Deserialize)]
struct PatchEntry {
    path: String,
}

#[derive(Deserialize)]
#[allow(dead_code)]
struct UpstreamLock {
    commit: String,
    tarball_url: String,
    tarball_sha256: String,
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    let repo_root = std::env::current_dir().context("Failed to get current directory")?;
    let engine_path = repo_root.join("engine");

    match cli.command {
        Commands::Setup { skip_build_deps: _ } => {
            setup(&repo_root, &engine_path)?;
        }
        Commands::Apply { force, dry_run } => {
            apply(&repo_root, &engine_path, force, dry_run)?;
        }
        Commands::Refresh => {
            refresh(&repo_root, &engine_path)?;
        }
        Commands::Status => {
            status(&repo_root, &engine_path)?;
        }
        Commands::Validate => {
            validate(&repo_root)?;
        }
        Commands::Verify => {
            verify(&repo_root)?;
        }
    }

    Ok(())
}

fn read_upstream_lock(repo_root: &Path) -> Result<UpstreamLock> {
    let lock_path = repo_root.join("upstream.lock");
    if !lock_path.exists() {
        bail!("upstream.lock not found in repository root.");
    }
    let content = fs::read_to_string(lock_path)?;
    let lock: UpstreamLock = toml::from_str(&content).context("Failed to parse upstream.lock")?;
    Ok(lock)
}

fn read_manifest(repo_root: &Path) -> Result<Manifest> {
    let manifest_path = repo_root.join("manifest.toml");
    if !manifest_path.exists() {
        bail!("manifest.toml not found in repository root.");
    }
    let content = fs::read_to_string(manifest_path)?;
    let manifest: Manifest = toml::from_str(&content).context("Failed to parse manifest.toml")?;
    Ok(manifest)
}

fn validate(repo_root: &Path) -> Result<()> {
    let _lock = read_upstream_lock(repo_root)?;
    let manifest = read_manifest(repo_root)?;
    let mut seen = HashSet::new();

    for entry in &manifest.patches {
        if !seen.insert(&entry.path) {
            bail!("Duplicate manifest path: {}", entry.path);
        }
        let path = repo_root.join("changes").join(&entry.path);
        if !path.exists() {
            bail!(
                "Path declared in manifest does not exist: changes/{}",
                entry.path
            );
        }
    }

    println!(
        "[hil] Repository metadata is valid ({} manifest entries).",
        manifest.patches.len()
    );
    Ok(())
}

fn run_cmd(args: &[&str], cwd: &Path) -> Result<String> {
    let mut cmd = Command::new(args[0]);
    cmd.args(&args[1..]);
    cmd.current_dir(cwd);
    let output = cmd
        .output()
        .with_context(|| format!("Failed to execute command: {:?}", args))?;
    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        bail!("Command failed: {:?} in {:?}\nError: {}", args, cwd, err);
    }
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

fn setup(repo_root: &Path, engine_path: &Path) -> Result<()> {
    let lock = read_upstream_lock(repo_root)?;

    println!("[hil] Upstream commit: {}", lock.commit);

    // Check if engine/ already exists and matches the commit
    if engine_path.exists() && engine_path.join(".git").exists() {
        let is_ok = if let Ok(base_commit) =
            run_cmd(&["git", "rev-parse", "upstream-base^{commit}"], engine_path)
        {
            base_commit.trim() == lock.commit
        } else if let Ok(current_commit) =
            run_cmd(&["git", "rev-parse", "HEAD^{commit}"], engine_path)
        {
            current_commit.trim() == lock.commit
        } else {
            false
        };

        if is_ok {
            println!(
                "[hil] engine/ is already initialized at commit {}.",
                lock.commit
            );
            return Ok(());
        }
    }

    // Clone the pinned upstream checkout into engine/.
    setup_git(&lock.commit, engine_path, repo_root)?;
    Ok(())
}

fn setup_git(commit: &str, engine_path: &Path, repo_root: &Path) -> Result<()> {
    if engine_path.exists() {
        println!("[hil] Removing existing engine/ directory...");
        fs::remove_dir_all(engine_path)?;
    }

    println!("[hil] Cloning Firefox from upstream git repository...");
    let output = Command::new("git")
        .args(&[
            "clone",
            "--filter=blob:none",
            "https://github.com/mozilla-firefox/firefox.git",
            "engine",
        ])
        .current_dir(repo_root)
        .output()?;
    if !output.status.success() {
        bail!(
            "Failed to clone Firefox repository: {}",
            String::from_utf8_lossy(&output.stderr)
        );
    }

    // Set local git config for committing
    run_cmd(&["git", "config", "user.name", "Hilal Tool"], engine_path)?;
    run_cmd(
        &["git", "config", "user.email", "hil-tool@hilal.browser"],
        engine_path,
    )?;

    println!("[hil] Checking out pinned commit {}...", commit);
    let output = Command::new("git")
        .args(&["checkout", "-B", "hilal-upstream", commit])
        .current_dir(engine_path)
        .output()?;
    if !output.status.success() {
        bail!(
            "Failed to checkout commit: {}",
            String::from_utf8_lossy(&output.stderr)
        );
    }

    // Create tag upstream-base
    let output = Command::new("git")
        .args(&["tag", "-f", "upstream-base", commit])
        .current_dir(engine_path)
        .output()?;
    if !output.status.success() {
        bail!("Failed to create tag upstream-base");
    }

    println!("[hil] Upstream setup complete.");
    Ok(())
}

fn apply(repo_root: &Path, engine_path: &Path, force: bool, dry_run: bool) -> Result<()> {
    let lock = read_upstream_lock(repo_root)?;
    let manifest = read_manifest(repo_root)?;

    if !engine_path.exists() {
        bail!("engine/ directory not found. Please run 'hil setup' first.");
    }

    let state_file = engine_path.join(".hilal-applied");
    if state_file.exists() && !force {
        println!("[hil] Patches are already applied. Use --force to re-apply.");
        return Ok(());
    }

    // Set local git config for committing if not already set
    let _ = run_cmd(&["git", "config", "user.name", "Hilal Tool"], engine_path);
    let _ = run_cmd(
        &["git", "config", "user.email", "hil-tool@hilal.browser"],
        engine_path,
    );

    // Tag the current HEAD as upstream-base if it's missing
    if run_cmd(&["git", "rev-parse", "upstream-base"], engine_path).is_err() {
        let _ = run_cmd(
            &["git", "tag", "-f", "upstream-base", &lock.commit],
            engine_path,
        );
    }

    if force && !dry_run {
        println!("[hil] Force reset: resetting to upstream baseline...");
        run_cmd(&["git", "reset", "--hard", "upstream-base"], engine_path)?;
        run_cmd(&["git", "clean", "-fd"], engine_path)?;
        if state_file.exists() {
            fs::remove_file(&state_file)?;
        }
    }

    let mut applied = 0;
    let mut copied = 0;

    for entry in &manifest.patches {
        let src = repo_root.join("changes").join(&entry.path);
        let dst = engine_path.join(&entry.path);

        if !src.exists() {
            bail!(
                "Path declared in manifest does not exist: changes/{}",
                entry.path
            );
        }

        if entry.path.ends_with(".patch") {
            // Check if already applied
            let check = Command::new("git")
                .args(&["apply", "--check", "--reverse", src.to_str().unwrap()])
                .current_dir(engine_path)
                .output()?;
            if check.status.success() {
                println!("[hil] Skip (already applied): {}", entry.path);
                continue;
            }

            println!("[hil] Applying patch: {}", entry.path);
            if !dry_run {
                let apply = Command::new("git")
                    .args(&["apply", "--whitespace=nowarn", src.to_str().unwrap()])
                    .current_dir(engine_path)
                    .output()?;
                if !apply.status.success() {
                    bail!(
                        "Conflict: Failed to apply patch changes/{}. Error:\n{}",
                        entry.path,
                        String::from_utf8_lossy(&apply.stderr)
                    );
                }

                // Commit the patch change
                if std::env::var("GITHUB_ACTIONS").is_err() {
                    run_cmd(&["git", "add", "-A"], engine_path)?;
                    Command::new("git")
                        .args(&[
                            "commit",
                            "--allow-empty",
                            "-m",
                            &format!("Apply patch: {}", entry.path),
                        ])
                        .current_dir(engine_path)
                        .output()?;
                }
            }
            applied += 1;
        } else {
            println!("[hil] Syncing overlay: {}", entry.path);
            if !dry_run {
                if src.is_dir() {
                    fs::create_dir_all(&dst)?;
                    copy_dir_recursive(&src, &dst)?;
                } else {
                    if let Some(parent) = dst.parent() {
                        fs::create_dir_all(parent)?;
                    }
                    fs::copy(&src, &dst)?;
                }

                // Commit the overlay change
                if std::env::var("GITHUB_ACTIONS").is_err() {
                    run_cmd(&["git", "add", "-A"], engine_path)?;
                    Command::new("git")
                        .args(&[
                            "commit",
                            "--allow-empty",
                            "-m",
                            &format!("Sync overlay: {}", entry.path),
                        ])
                        .current_dir(engine_path)
                        .output()?;
                }
            }
            copied += 1;
        }
    }

    if !dry_run {
        // Download uBlock
        download_ublock(engine_path)?;

        // Merge Turkish translations
        merge_locales(repo_root, engine_path)?;

        // Mark patches as applied
        fs::write(&state_file, "applied")?;
    }

    println!(
        "[hil] Patches/Overlays: {} applied, {} overlays synced.",
        applied, copied
    );
    Ok(())
}

fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<()> {
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let path = entry.path();
        let name = entry.file_name();
        let target = dst.join(name);
        if path.is_dir() {
            fs::create_dir_all(&target)?;
            copy_dir_recursive(&path, &target)?;
        } else {
            fs::copy(&path, &target)?;
        }
    }
    Ok(())
}

fn download_ublock(engine_path: &Path) -> Result<()> {
    let ubo_version = "1.57.2";
    let ubo_url = format!(
        "https://github.com/gorhill/uBlock/releases/download/{}/uBlock0_{}.firefox.signed.xpi",
        ubo_version, ubo_version
    );
    let ubo_sha256 = "9928e79a52cecf7cfa231fdb0699c7d7a427660d94eb10d711ed5a2f10d2eb89";

    let ext_dir = engine_path.join("browser/app/distribution/extensions");
    fs::create_dir_all(&ext_dir)?;
    let ubo_path = ext_dir.join("uBlock0@raymondhill.net.xpi");

    if ubo_path.exists() {
        let current_sha = get_file_sha256(&ubo_path)?;
        if current_sha == ubo_sha256 {
            println!(
                "[hil] uBlock Origin v{} is already present and verified.",
                ubo_version
            );
            return Ok(());
        }
    }

    println!(
        "[hil] Downloading uBlock Origin v{} extension...",
        ubo_version
    );
    let curl_output = Command::new("curl")
        .args(&["-L", "-f", "-s", "-o", ubo_path.to_str().unwrap(), &ubo_url])
        .output()
        .context("Failed to run curl command to download uBlock")?;
    if !curl_output.status.success() {
        let err = String::from_utf8_lossy(&curl_output.stderr);
        bail!(
            "Failed to download uBlock via curl: status code {}, error: {}",
            curl_output.status,
            err
        );
    }

    let new_sha = get_file_sha256(&ubo_path)?;
    if new_sha != ubo_sha256 {
        fs::remove_file(&ubo_path)?;
        bail!("CRITICAL: uBlock Origin checksum verification failed! Downloaded file is corrupt.");
    }

    println!(
        "[hil] uBlock Origin v{} successfully downloaded and verified.",
        ubo_version
    );
    Ok(())
}

fn get_file_sha256(path: &Path) -> Result<String> {
    use sha2::{Digest, Sha256};
    let content = fs::read(path)?;
    let mut hasher = Sha256::new();
    hasher.update(&content);
    Ok(format!("{:x}", hasher.finalize()))
}

fn merge_locales(repo_root: &Path, engine_path: &Path) -> Result<()> {
    let custom_dir = repo_root.join("changes/browser/locales/tr");
    let target_dir = engine_path.join("browser/locales/tr");

    if !custom_dir.exists() {
        println!("[hilal] No custom locales folder found in changes/browser/locales/tr");
        return Ok(());
    }

    if !target_dir.exists() {
        println!("[hilal] Target locales directory does not exist yet: engine/browser/locales/tr");
        println!("[hilal] Run scripts/setup-locales.sh first to initialize the locale files.");
        return Ok(());
    }

    println!("[hilal] Merging custom translations into {:?}", target_dir);

    let mut changed = false;
    for entry in walk_dir(&custom_dir)? {
        let rel_path = entry.strip_prefix(&custom_dir)?;
        let mut parts: Vec<_> = rel_path.components().map(|c| c.as_os_str()).collect();
        if !parts.is_empty() && parts[0] == "browser" {
            parts.insert(1, std::ffi::OsStr::new("browser"));
        }
        let mut target_file = target_dir.clone();
        for part in &parts {
            target_file.push(part);
        }

        if target_file.extension().and_then(|s| s.to_str()) == Some("ftl") {
            let existing = if target_file.exists() {
                fs::read_to_string(&target_file)?
            } else {
                String::new()
            };
            let custom_content = fs::read_to_string(&entry)?;
            let patched = append_hilal_content(&existing, &custom_content);

            if !target_file.exists() || fs::read_to_string(&target_file)? != patched {
                fs::create_dir_all(target_file.parent().unwrap())?;
                fs::write(&target_file, patched)?;
                println!("  Merged Fluent: {:?}", rel_path);
                changed = true;
            }
        } else {
            let custom_content = fs::read(&entry)?;
            if !target_file.exists() || fs::read(&target_file)? != custom_content {
                fs::create_dir_all(target_file.parent().unwrap())?;
                fs::write(&target_file, custom_content)?;
                println!("  Copied Asset: {:?}", rel_path);
                changed = true;
            }
        }
    }

    if changed {
        println!("[hilal] Locale merge complete.");
    } else {
        println!("[hilal] All locale files are already up-to-date.");
    }
    Ok(())
}

fn walk_dir(dir: &Path) -> Result<Vec<PathBuf>> {
    let mut result = Vec::new();
    if dir.is_dir() {
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_dir() {
                result.extend(walk_dir(&path)?);
            } else {
                result.push(path);
            }
        }
    }
    Ok(result)
}

fn strip_hilal_block(content: &str) -> String {
    let mut result = String::new();
    let mut in_block = false;
    for line in content.lines() {
        if line.contains("# --- Hilal custom localization begin ---") {
            in_block = true;
            continue;
        }
        if line.contains("# --- Hilal custom localization end ---") {
            in_block = false;
            continue;
        }
        if in_block {
            continue;
        }
        if line.contains("## Hilal Welcome Screen")
            || line.contains("## Hilal Browser Settings")
            || line.contains("# Hilal Redesigned Sidebar")
        {
            break;
        }
        result.push_str(line);
        result.push('\n');
    }
    result.trim_end().to_string()
}

fn append_hilal_content(existing: &str, custom: &str) -> String {
    let cleaned = strip_hilal_block(existing);
    format!(
        "{}\n\n# --- Hilal custom localization begin ---\n{}\n# --- Hilal custom localization end ---\n",
        cleaned,
        custom.trim()
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn manifest_parses_browser_metadata_and_patch_paths() {
        let manifest: Manifest = toml::from_str(
            r#"
[browser]
name = "Hilal Browser"
codename = "hilal"
version = "0.3.0"

[[patches]]
path = "browser/example.patch"
"#,
        )
        .expect("manifest should parse");

        let browser = manifest.browser.expect("browser metadata should exist");
        assert_eq!(browser.version, "0.3.0");
        assert_eq!(manifest.patches.len(), 1);
        assert_eq!(manifest.patches[0].path, "browser/example.patch");
    }

    #[test]
    fn append_hilal_content_replaces_existing_hilal_block() {
        let existing = "base\n# --- Hilal custom localization begin ---\nold\n# --- Hilal custom localization end ---\n";
        let patched = append_hilal_content(existing, "new");

        assert!(patched.contains("base"));
        assert!(patched.contains("new"));
        assert!(!patched.contains("old"));
    }
}

fn refresh(repo_root: &Path, engine_path: &Path) -> Result<()> {
    let manifest = read_manifest(repo_root)?;

    if !engine_path.exists() {
        bail!("engine/ directory not found. Please run 'hil setup' first.");
    }

    println!("[hil] Refreshing overlay assets and patches...");

    // Check if there are uncommitted changes in engine/
    let status_out = run_cmd(&["git", "status", "--porcelain"], engine_path)?;
    if !status_out.trim().is_empty() {
        println!("[hil] Warning: You have uncommitted changes in engine/. These changes will not be captured in the diff until they are committed or amended to the corresponding commits.");
    }

    // Get the list of commits between upstream-base and HEAD
    let commits_str = run_cmd(
        &["git", "rev-list", "--reverse", "upstream-base..HEAD"],
        engine_path,
    )?;
    let commits: Vec<&str> = commits_str.lines().collect();

    let mut commit_index = 0;

    for entry in &manifest.patches {
        let src = repo_root.join("changes").join(&entry.path);
        let dst = engine_path.join(&entry.path);

        if entry.path.ends_with(".patch") {
            if commit_index >= commits.len() {
                println!(
                    "[hil] Warning: No commit found corresponding to patch changes/{}",
                    entry.path
                );
                continue;
            }
            let commit_hash = commits[commit_index];
            commit_index += 1;

            // Get git diff for this commit
            let parent = format!("{}~1", commit_hash);
            let diff = run_cmd(&["git", "diff", &parent, commit_hash], engine_path)?;

            if !diff.trim().is_empty() {
                // Read existing patch to preserve its header description
                let mut header = String::new();
                if src.exists() {
                    if let Ok(existing_content) = fs::read_to_string(&src) {
                        if let Some(pos) = existing_content.find("diff --git") {
                            header = existing_content[..pos].to_string();
                        }
                    }
                }
                let cleaned = clean_diff(&diff);
                let new_content = format!("{}{}", header, cleaned);
                fs::write(&src, new_content)?;
                println!("  Refreshed patch: changes/{}", entry.path);
            }
        } else {
            // Overlay
            commit_index += 1; // Overlays are also committed
            if dst.exists() {
                if dst.is_dir() {
                    fs::create_dir_all(&src)?;
                    copy_dir_recursive(&dst, &src)?;
                } else {
                    if let Some(parent) = src.parent() {
                        fs::create_dir_all(parent)?;
                    }
                    fs::copy(&dst, &src)?;
                }
                println!("  Refreshed overlay: changes/{}", entry.path);
            }
        }
    }

    println!("[hil] Refresh complete.");
    Ok(())
}

fn clean_diff(diff: &str) -> String {
    let mut result = String::new();
    for line in diff.lines() {
        if line.starts_with("index ") {
            continue;
        }
        result.push_str(line);
        result.push('\n');
    }
    result
}

fn status(repo_root: &Path, engine_path: &Path) -> Result<()> {
    let lock = read_upstream_lock(repo_root)?;
    println!("Hilal Browser workspace status");
    println!("  Upstream Lock : Commit {}", lock.commit);
    if engine_path.exists() {
        let current_commit = run_cmd(&["git", "rev-parse", "HEAD"], engine_path)?;
        println!("  engine/       : Checked out at {}", current_commit.trim());
        let git_status = run_cmd(&["git", "status", "--short"], engine_path)?;
        if git_status.trim().is_empty() {
            println!("  engine/ status: clean");
        } else {
            println!("  engine/ status:\n{}", git_status);
        }
    } else {
        println!("  engine/       : Not initialized. Run 'hil setup'");
    }
    Ok(())
}

fn verify(repo_root: &Path) -> Result<()> {
    let lock = read_upstream_lock(repo_root)?;
    if lock.tarball_sha256.is_empty() {
        println!("[hil] No tarball checksum configured in upstream.lock.");
        return Ok(());
    }
    let tarball_path = repo_root.join("scratch/firefox-e28b34ab33.tar.gz");
    if !tarball_path.exists() {
        println!("[hil] Tarball archive not found. Run 'hil setup'");
        return Ok(());
    }
    let current_sha = get_file_sha256(&tarball_path)?;
    if current_sha == lock.tarball_sha256 {
        println!("[hil] Tarball checksum matches: {}", current_sha);
    } else {
        bail!(
            "CRITICAL: Tarball checksum mismatch! Expected {}, got {}",
            lock.tarball_sha256,
            current_sha
        );
    }
    Ok(())
}
