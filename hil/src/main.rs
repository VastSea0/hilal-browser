use anyhow::{bail, Context, Result};
use clap::{Parser, Subcommand};
use serde::Deserialize;
use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
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
    #[command(about = "Apply all patches and overlays")]
    Apply {
        #[arg(long, short, help = "Reset engine checkout to baseline first")]
        force: bool,
        #[arg(long, help = "Simulate patch application without modifying disk")]
        dry_run: bool,
        #[arg(
            long,
            help = "Create individual git commits for each patch/overlay (slower, for refresh)"
        )]
        discrete_commits: bool,
        #[arg(long, help = "Create a single git commit containing all changes")]
        commit: bool,
    },
    #[command(about = "Refresh changes/ from adjustments in engine/")]
    Refresh,
    #[command(about = "Show current workspace status")]
    Status,
    #[command(about = "Validate repository metadata without requiring engine/")]
    Validate,
    #[command(about = "Verify upstream tarball checksum")]
    Verify,
    #[command(about = "Build the Hilal Browser natively")]
    Build {
        #[arg(
            long,
            help = "Target platform (windows, linux, macos). Defaults to host platform."
        )]
        platform: Option<String>,
        #[arg(long, short, help = "Build front-end only (JS/HTML/CSS)")]
        faster: bool,
        #[arg(long, short, help = "Build C++/Rust binaries only")]
        binaries: bool,
        #[arg(long, short, help = "Launch the browser after building")]
        run: bool,
        #[arg(long, short, help = "Package the browser after building")]
        package: bool,
        #[arg(long, short, help = "Clean build directory before starting")]
        clobber: bool,
        #[arg(long, help = "Skip applying patches and overlays before building")]
        skip_apply: bool,
    },
    #[command(
        about = "Check if the build environment is ready and diagnose potential build issues"
    )]
    Doctor {
        #[arg(long, help = "Treat warnings as errors and fail the check")]
        strict: bool,
    },
    #[command(
        about = "Preview UI pages (welcome, newtab) in Google Chrome or take headless screenshots"
    )]
    Preview {
        #[arg(default_value = "welcome", help = "Page to preview ('welcome' or 'newtab')")]
        page: String,
        #[arg(long, help = "Stage number to preview directly (0-9 for welcome)")]
        stage: Option<usize>,
        #[arg(long, help = "Path to save screenshot via headless Chrome")]
        screenshot: Option<PathBuf>,
        #[arg(long, help = "Open in Google Chrome directly")]
        open: bool,
        #[arg(long, default_value = "8765", help = "Port for local preview server")]
        port: u16,
    },
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
        Commands::Apply {
            force,
            dry_run,
            discrete_commits,
            commit,
        } => {
            apply(
                &repo_root,
                &engine_path,
                force,
                dry_run,
                discrete_commits,
                commit,
            )?;
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
        Commands::Build {
            platform,
            faster,
            binaries,
            run,
            package,
            clobber,
            skip_apply,
        } => {
            build(
                &repo_root,
                &engine_path,
                platform,
                faster,
                binaries,
                run,
                package,
                clobber,
                skip_apply,
            )?;
        }
        Commands::Doctor { strict } => {
            doctor(&repo_root, strict)?;
        }
        Commands::Preview {
            page,
            stage,
            screenshot,
            open,
            port,
        } => {
            preview(&repo_root, &page, stage, screenshot, open, port)?;
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

fn compute_changes_fingerprint(repo_root: &Path, manifest: &Manifest) -> Result<String> {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();

    let manifest_path = repo_root.join("manifest.toml");
    if manifest_path.exists() {
        hasher.update(&fs::read(&manifest_path)?);
    }

    for entry in &manifest.patches {
        hasher.update(entry.path.as_bytes());
        let src = repo_root.join("changes").join(&entry.path);
        if !src.exists() {
            continue;
        }
        hash_fs_entry(&src, &mut hasher)?;
    }

    Ok(format!("{:x}", hasher.finalize()))
}

fn hash_fs_entry(path: &Path, hasher: &mut sha2::Sha256) -> Result<()> {
    use sha2::Digest;
    let meta = fs::metadata(path)?;
    hasher.update(&meta.len().to_le_bytes());
    if let Ok(mtime) = meta.modified() {
        if let Ok(duration) = mtime.duration_since(std::time::UNIX_EPOCH) {
            hasher.update(&duration.as_nanos().to_le_bytes());
        }
    }
    if meta.is_dir() {
        let mut entries = Vec::new();
        for entry in fs::read_dir(path)? {
            entries.push(entry?);
        }
        entries.sort_by_key(|e| e.file_name());
        for entry in entries {
            let name = entry.file_name();
            hasher.update(name.to_string_lossy().as_bytes());
            hash_fs_entry(&entry.path(), hasher)?;
        }
    } else if path.extension().and_then(|s| s.to_str()) == Some("patch") {
        let content = fs::read(path)?;
        hasher.update(&content);
    }
    Ok(())
}

fn fast_sync_file(src: &Path, dst: &Path) -> Result<bool> {
    if dst.exists() {
        if let (Ok(s_meta), Ok(d_meta)) = (fs::metadata(src), fs::metadata(dst)) {
            if s_meta.len() == d_meta.len() {
                if let (Ok(s_bytes), Ok(d_bytes)) = (fs::read(src), fs::read(dst)) {
                    if s_bytes == d_bytes {
                        return Ok(false);
                    }
                }
            }
        }
    }
    if let Some(parent) = dst.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::copy(src, dst)?;
    Ok(true)
}

fn fast_sync_dir(src: &Path, dst: &Path) -> Result<()> {
    fs::create_dir_all(dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let path = entry.path();
        let target = dst.join(entry.file_name());
        if path.is_dir() {
            fast_sync_dir(&path, &target)?;
        } else {
            fast_sync_file(&path, &target)?;
        }
    }
    Ok(())
}

fn ensure_ublock(repo_root: &Path, engine_path: &Path) -> Result<()> {
    let ext_dir = engine_path.join("browser/app/distribution/extensions");
    fs::create_dir_all(&ext_dir)?;
    let ubo_path = ext_dir.join("uBlock0@raymondhill.net.xpi");

    if ubo_path.exists() && fs::metadata(&ubo_path).map(|m| m.len() > 0).unwrap_or(false) {
        return Ok(());
    }

    let local_src = repo_root.join("changes/browser/app/distribution/extensions/uBlock0@raymondhill.net.xpi");
    if local_src.exists() {
        fast_sync_file(&local_src, &ubo_path)?;
        return Ok(());
    }

    download_ublock(engine_path)?;
    Ok(())
}

fn apply(
    repo_root: &Path,
    engine_path: &Path,
    force: bool,
    dry_run: bool,
    discrete_commits: bool,
    commit: bool,
) -> Result<()> {
    let manifest = read_manifest(repo_root)?;

    if !engine_path.exists() {
        bail!("engine/ directory not found. Please run 'hil setup' first.");
    }

    let state_file = engine_path.join(".hilal-applied");
    let fingerprint_file = engine_path.join(".hilal-state");
    let current_fingerprint = compute_changes_fingerprint(repo_root, &manifest)?;

    if !force && fingerprint_file.exists() {
        if let Ok(saved) = fs::read_to_string(&fingerprint_file) {
            if saved.trim() == current_fingerprint {
                println!("[hil] Patches and overlays are already up to date.");
                return Ok(());
            }
        }
    }

    if force && !dry_run {
        println!("[hil] Force reset: resetting to upstream baseline...");
        run_cmd(&["git", "reset", "--hard", "upstream-base"], engine_path)?;
        run_cmd(&["git", "clean", "-fd"], engine_path)?;
        let _ = fs::remove_file(&state_file);
        let _ = fs::remove_file(&fingerprint_file);
    }

    if discrete_commits {
        let _ = run_cmd(&["git", "config", "user.name", "Hilal Tool"], engine_path);
        let _ = run_cmd(
            &["git", "config", "user.email", "hil-tool@hilal.browser"],
            engine_path,
        );
    }

    enum Action {
        Overlay(String),
        Patches(Vec<(String, PathBuf)>),
    }

    let mut actions: Vec<Action> = Vec::new();
    for entry in &manifest.patches {
        let src = repo_root.join("changes").join(&entry.path);
        if !src.exists() {
            bail!(
                "Path declared in manifest does not exist: changes/{}",
                entry.path
            );
        }

        if entry.path.ends_with(".patch") {
            match actions.last_mut() {
                Some(Action::Patches(ref mut list)) => {
                    list.push((entry.path.clone(), src));
                }
                _ => {
                    actions.push(Action::Patches(vec![(entry.path.clone(), src)]));
                }
            }
        } else {
            actions.push(Action::Overlay(entry.path.clone()));
        }
    }

    let mut applied = 0;
    let mut copied = 0;

    for action in actions {
        match action {
            Action::Overlay(rel_path) => {
                println!("[hil] Syncing overlay: {}", rel_path);
                if !dry_run {
                    let src = repo_root.join("changes").join(&rel_path);
                    let dst = engine_path.join(&rel_path);
                    if src.is_dir() {
                        fast_sync_dir(&src, &dst)?;
                    } else {
                        fast_sync_file(&src, &dst)?;
                    }

                    if discrete_commits && std::env::var("GITHUB_ACTIONS").is_err() {
                        run_cmd(&["git", "add", &rel_path], engine_path)?;
                        let _ = Command::new("git")
                            .args(&[
                                "commit",
                                "--allow-empty",
                                "-m",
                                &format!("Sync overlay: {}", rel_path),
                            ])
                            .current_dir(engine_path)
                            .output();
                    }
                }
                copied += 1;
            }
            Action::Patches(patch_list) => {
                for (ref p, _) in &patch_list {
                    println!("[hil] Applying patch: {}", p);
                }

                if !dry_run {
                    if patch_list.len() == 1 {
                        let (ref rel_path, ref src) = patch_list[0];
                        let out = Command::new("git")
                            .args(&["apply", "--whitespace=nowarn", src.to_str().unwrap()])
                            .current_dir(engine_path)
                            .output()?;
                        if !out.status.success() {
                            bail!(
                                "Conflict: Failed to apply patch changes/{}. Error:\n{}",
                                rel_path,
                                String::from_utf8_lossy(&out.stderr)
                            );
                        }
                        if discrete_commits && std::env::var("GITHUB_ACTIONS").is_err() {
                            let files = get_patch_files(src)?;
                            if !files.is_empty() {
                                let mut args = vec!["git", "add"];
                                for f in &files {
                                    args.push(f.as_str());
                                }
                                run_cmd(&args, engine_path)?;
                            }
                            let _ = Command::new("git")
                                .args(&[
                                    "commit",
                                    "--allow-empty",
                                    "-m",
                                    &format!("Apply patch: {}", rel_path),
                                ])
                                .current_dir(engine_path)
                                .output();
                        }
                    } else {
                        let mut git_args = vec!["apply", "--whitespace=nowarn"];
                        for (_, src) in &patch_list {
                            git_args.push(src.to_str().unwrap());
                        }
                        let batch_out = Command::new("git")
                            .args(&git_args)
                            .current_dir(engine_path)
                            .output()?;

                        if batch_out.status.success() {
                            if discrete_commits && std::env::var("GITHUB_ACTIONS").is_err() {
                                for (ref rel_path, ref src) in &patch_list {
                                    let files = get_patch_files(src)?;
                                    if !files.is_empty() {
                                        let mut args = vec!["git", "add"];
                                        for f in &files {
                                            args.push(f.as_str());
                                        }
                                        run_cmd(&args, engine_path)?;
                                    }
                                    let _ = Command::new("git")
                                        .args(&[
                                            "commit",
                                            "--allow-empty",
                                            "-m",
                                            &format!("Apply patch: {}", rel_path),
                                        ])
                                        .current_dir(engine_path)
                                        .output();
                                }
                            }
                        } else {
                            // Fallback to sequential application to pinpoint conflict
                            for (ref rel_path, ref src) in &patch_list {
                                let single_out = Command::new("git")
                                    .args(&["apply", "--whitespace=nowarn", src.to_str().unwrap()])
                                    .current_dir(engine_path)
                                    .output()?;
                                if !single_out.status.success() {
                                    bail!(
                                        "Conflict: Failed to apply patch changes/{}. Error:\n{}",
                                        rel_path,
                                        String::from_utf8_lossy(&single_out.stderr)
                                    );
                                }
                                if discrete_commits && std::env::var("GITHUB_ACTIONS").is_err() {
                                    let files = get_patch_files(src)?;
                                    if !files.is_empty() {
                                        let mut args = vec!["git", "add"];
                                        for f in &files {
                                            args.push(f.as_str());
                                        }
                                        run_cmd(&args, engine_path)?;
                                    }
                                    let _ = Command::new("git")
                                        .args(&[
                                            "commit",
                                            "--allow-empty",
                                            "-m",
                                            &format!("Apply patch: {}", rel_path),
                                        ])
                                        .current_dir(engine_path)
                                        .output();
                                }
                            }
                        }
                    }
                }
                applied += patch_list.len();
            }
        }
    }

    if !dry_run {
        if commit && !discrete_commits {
            println!("[hil] Creating single unified git commit...");
            run_cmd(&["git", "add", "-A"], engine_path)?;
            let _ = Command::new("git")
                .args(&[
                    "commit",
                    "--allow-empty",
                    "-m",
                    "Apply Hilal patches and overlays",
                ])
                .current_dir(engine_path)
                .output();
        }

        ensure_ublock(repo_root, engine_path)?;
        merge_locales(repo_root, engine_path)?;

        fs::write(&state_file, "applied")?;
        fs::write(&fingerprint_file, &current_fingerprint)?;
    }

    println!(
        "[hil] Patches/Overlays: {} applied, {} overlays synced.",
        applied, copied
    );
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

fn get_patch_files(patch_path: &Path) -> Result<Vec<String>> {
    let content = fs::read_to_string(patch_path)?;
    let mut files = Vec::new();
    for line in content.lines() {
        if line.starts_with("diff --git a/") {
            if let Some(pos) = line[11..].find(" b/") {
                let file_path = &line[pos + 14..];
                let trimmed = file_path.trim();
                let cleaned = if trimmed.starts_with('"') && trimmed.ends_with('"') {
                    trimmed[1..trimmed.len() - 1].to_string()
                } else {
                    trimmed.to_string()
                };
                files.push(cleaned);
            }
        }
    }
    Ok(files)
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

    #[test]
    fn get_patch_files_extracts_correct_paths() {
        let temp_patch = Path::new("test_temp_patch.patch");
        let content = "diff --git a/browser/confvars.sh b/browser/confvars.sh\n--- a/browser/confvars.sh\n+++ b/browser/confvars.sh\n";
        fs::write(temp_patch, content).unwrap();
        let files = get_patch_files(temp_patch).unwrap();
        let _ = fs::remove_file(temp_patch);
        assert_eq!(files, vec!["browser/confvars.sh"]);
    }

    struct TestDir {
        path: PathBuf,
    }

    impl TestDir {
        fn new(name: &str) -> Self {
            let path = std::env::temp_dir().join(format!(
                "hil_test_{}_{}_{}",
                name,
                std::process::id(),
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_nanos()
            ));
            let _ = fs::remove_dir_all(&path);
            fs::create_dir_all(&path).unwrap();
            Self { path }
        }
    }

    impl Drop for TestDir {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.path);
        }
    }

    #[test]
    fn fast_sync_file_skips_identical_and_updates_modified() {
        let test_dir = TestDir::new("fast_sync");
        let src = test_dir.path.join("src.txt");
        let dst = test_dir.path.join("dst.txt");

        fs::write(&src, "hello world").unwrap();
        let copied1 = fast_sync_file(&src, &dst).unwrap();
        assert!(copied1);
        assert_eq!(fs::read_to_string(&dst).unwrap(), "hello world");

        let copied2 = fast_sync_file(&src, &dst).unwrap();
        assert!(!copied2, "Second sync should skip identical file");

        fs::write(&src, "hello updated").unwrap();
        let copied3 = fast_sync_file(&src, &dst).unwrap();
        assert!(copied3, "Third sync should update changed file");
        assert_eq!(fs::read_to_string(&dst).unwrap(), "hello updated");
    }

    #[test]
    fn compute_changes_fingerprint_detects_patch_and_overlay_edits() {
        let test_dir = TestDir::new("fingerprint");
        let root = &test_dir.path;

        let changes = root.join("changes");
        fs::create_dir_all(&changes).unwrap();

        let manifest_path = root.join("manifest.toml");
        fs::write(
            &manifest_path,
            r#"
[[patches]]
path = "test.patch"

[[patches]]
path = "overlay.txt"
"#,
        )
        .unwrap();

        let patch_path = changes.join("test.patch");
        fs::write(&patch_path, "diff --git a/file b/file\n").unwrap();

        let overlay_path = changes.join("overlay.txt");
        fs::write(&overlay_path, "original overlay").unwrap();

        let manifest = read_manifest(root).unwrap();
        let fp1 = compute_changes_fingerprint(root, &manifest).unwrap();

        // Modifying patch must change fingerprint
        fs::write(&patch_path, "diff --git a/file b/file\n+new line\n").unwrap();
        let fp2 = compute_changes_fingerprint(root, &manifest).unwrap();
        assert_ne!(fp1, fp2, "Fingerprint must change when patch content changes");

        // Modifying overlay must change fingerprint
        fs::write(&overlay_path, "modified overlay").unwrap();
        let fp3 = compute_changes_fingerprint(root, &manifest).unwrap();
        assert_ne!(fp2, fp3, "Fingerprint must change when overlay content changes");
    }

    #[test]
    fn isolated_apply_batched_and_fast_cached() {
        let test_dir = TestDir::new("isolated_apply");
        let root = test_dir.path.join("repo");
        let engine = test_dir.path.join("engine");

        fs::create_dir_all(&root).unwrap();
        fs::create_dir_all(&engine).unwrap();

        // Initialize fake git repo in engine
        Command::new("git").args(&["init"]).current_dir(&engine).output().unwrap();
        Command::new("git").args(&["config", "user.name", "Test"]).current_dir(&engine).output().unwrap();
        Command::new("git").args(&["config", "user.email", "test@example.com"]).current_dir(&engine).output().unwrap();

        // Create base files and initial commit
        fs::write(engine.join("file1.txt"), "hello from file1\n").unwrap();
        fs::write(engine.join("file2.txt"), "hello from file2\n").unwrap();
        Command::new("git").args(&["add", "."]).current_dir(&engine).output().unwrap();
        Command::new("git").args(&["commit", "-m", "initial"]).current_dir(&engine).output().unwrap();
        Command::new("git").args(&["tag", "upstream-base"]).current_dir(&engine).output().unwrap();

        // Set up root changes/ and manifest.toml
        let changes = root.join("changes");
        fs::create_dir_all(&changes).unwrap();

        let patch1_content = "diff --git a/file1.txt b/file1.txt\n--- a/file1.txt\n+++ b/file1.txt\n@@ -1 +1 @@\n-hello from file1\n+patched file1\n";
        let patch2_content = "diff --git a/file2.txt b/file2.txt\n--- a/file2.txt\n+++ b/file2.txt\n@@ -1 +1 @@\n-hello from file2\n+patched file2\n";

        fs::write(changes.join("patch1.patch"), patch1_content).unwrap();
        fs::write(changes.join("patch2.patch"), patch2_content).unwrap();
        fs::write(changes.join("overlay.txt"), "custom overlay content\n").unwrap();

        fs::write(
            root.join("manifest.toml"),
            r#"
[[patches]]
path = "overlay.txt"

[[patches]]
path = "patch1.patch"

[[patches]]
path = "patch2.patch"
"#,
        )
        .unwrap();

        // 1. First apply: should apply patches and overlay
        apply(&root, &engine, false, false, false, false).unwrap();

        assert_eq!(fs::read_to_string(engine.join("file1.txt")).unwrap(), "patched file1\n");
        assert_eq!(fs::read_to_string(engine.join("file2.txt")).unwrap(), "patched file2\n");
        assert_eq!(fs::read_to_string(engine.join("overlay.txt")).unwrap(), "custom overlay content\n");
        assert!(engine.join(".hilal-state").exists());

        // 2. Second apply with index.lock present: MUST NOT fail because cache hits without touching git!
        let dummy_lock = engine.join(".git/index.lock");
        fs::write(&dummy_lock, "locked").unwrap();

        let start = std::time::Instant::now();
        apply(&root, &engine, false, false, false, false).unwrap();
        let elapsed = start.elapsed();

        assert!(elapsed.as_millis() < 50, "Cached apply should return in < 50ms, took {:?}", elapsed);

        // Remove dummy lock
        let _ = fs::remove_file(&dummy_lock);
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
    ).unwrap_or_default();
    let commits: Vec<&str> = commits_str.lines().filter(|s| !s.trim().is_empty()).collect();

    let use_working_tree_diff = commits.is_empty();
    let mut commit_index = 0;

    for entry in &manifest.patches {
        let src = repo_root.join("changes").join(&entry.path);
        let dst = engine_path.join(&entry.path);

        if entry.path.ends_with(".patch") {
            let diff = if use_working_tree_diff {
                let files = get_patch_files(&src)?;
                if files.is_empty() {
                    continue;
                }
                let mut diff_args = vec!["git", "diff", "upstream-base", "--"];
                for f in &files {
                    diff_args.push(f.as_str());
                }
                run_cmd(&diff_args, engine_path).unwrap_or_default()
            } else {
                if commit_index >= commits.len() {
                    println!(
                        "[hil] Warning: No commit found corresponding to patch changes/{}",
                        entry.path
                    );
                    continue;
                }
                let commit_hash = commits[commit_index];
                commit_index += 1;

                let parent = format!("{}~1", commit_hash);
                run_cmd(&["git", "diff", &parent, commit_hash], engine_path).unwrap_or_default()
            };

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
            if !use_working_tree_diff {
                commit_index += 1;
            }
            if dst.exists() {
                if dst.is_dir() {
                    fs::create_dir_all(&src)?;
                    fast_sync_dir(&dst, &src)?;
                } else {
                    if let Some(parent) = src.parent() {
                        fs::create_dir_all(parent)?;
                    }
                    fast_sync_file(&dst, &src)?;
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

fn build(
    repo_root: &Path,
    engine_path: &Path,
    platform: Option<String>,
    faster: bool,
    binaries: bool,
    run_after: bool,
    package_after: bool,
    clobber: bool,
    skip_apply: bool,
) -> Result<()> {
    let target_platform = match platform.as_deref() {
        Some("windows") => "windows",
        Some("linux") => "linux",
        Some("macos") => "macos",
        Some(other) => bail!("Unsupported platform: {}", other),
        None => {
            if cfg!(target_os = "windows") {
                "windows"
            } else if cfg!(target_os = "macos") {
                "macos"
            } else if cfg!(target_os = "linux") {
                "linux"
            } else {
                bail!("Unsupported host OS. Please specify --platform explicitly.");
            }
        }
    };

    println!("[hil] Target platform: {}", target_platform);

    // Call environment diagnostics check before starting build
    doctor(repo_root, false)?;

    if !skip_apply {
        println!("[hil] Applying patches and overlays...");
        apply(repo_root, engine_path, false, false, false, false)?;
    }

    let config_src = repo_root.join("mozconfigs").join(target_platform);
    let config_dst = engine_path.join("mozconfig");
    if config_src.exists() {
        if let Some(parent) = config_dst.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::copy(&config_src, &config_dst).context(format!(
            "Failed to copy mozconfig from {:?} to {:?}",
            config_src, config_dst
        ))?;
        println!(
            "[hil] Copied mozconfig from {:?} to {:?}",
            config_src, config_dst
        );
    } else {
        println!(
            "[hil] Warning: target mozconfig not found at {:?}. Using default.",
            config_src
        );
    }

    let mut cmd = if target_platform == "windows" {
        let script_path = repo_root.join("scripts").join("build-windows.ps1");
        let script_str = script_path
            .to_str()
            .ok_or_else(|| anyhow::anyhow!("Invalid script path"))?;
        let mut c = Command::new("powershell.exe");
        c.args(&["-ExecutionPolicy", "Bypass", "-File", script_str]);
        if faster {
            c.arg("-Faster");
        }
        if binaries {
            c.arg("-Binaries");
        }
        if run_after {
            c.arg("-Run");
        }
        if package_after {
            c.arg("-Package");
        }
        if clobber {
            c.arg("-Clobber");
        }
        c.arg("-SkipApply");
        c
    } else {
        let script_name = if target_platform == "macos" {
            "build-macos.sh"
        } else {
            "build-linux.sh"
        };
        let mut c = Command::new("bash");
        c.arg(repo_root.join("scripts").join(script_name));
        if faster {
            c.arg("faster");
        } else if binaries {
            c.arg("binaries");
        } else if run_after {
            c.arg("run");
        } else if package_after {
            c.arg("package");
        }
        c
    };

    cmd.current_dir(repo_root);
    cmd.stdout(std::process::Stdio::inherit());
    cmd.stderr(std::process::Stdio::inherit());
    cmd.stdin(std::process::Stdio::inherit());

    println!("[hil] Running build script...");
    let status = cmd
        .status()
        .context("Failed to spawn build script process")?;

    if !status.success() {
        bail!(
            "Build failed with exit code: {}",
            status.code().unwrap_or(-1)
        );
    }

    println!("[hil] Build completed successfully.");
    Ok(())
}

fn doctor(repo_root: &Path, strict: bool) -> Result<()> {
    println!("[hil] Starting build environment diagnostic check...");
    let mut errors = 0;
    let mut warnings = 0;

    // 1. Path spaces check
    let path_str = repo_root.to_string_lossy();
    if path_str.contains(' ') {
        println!("[ERROR] Repository path contains spaces: '{}'", path_str);
        println!("        Firefox build system DOES NOT support spaces in build directory paths.");
        errors += 1;
    } else {
        println!("[OK] Repository path has no spaces.");
    }

    // Windows checks
    if cfg!(target_os = "windows") {
        // 2. Windows registry LongPathsEnabled
        let reg_check = Command::new("reg")
            .args(&[
                "query",
                "HKLM\\SYSTEM\\CurrentControlSet\\Control\\FileSystem",
                "/v",
                "LongPathsEnabled",
            ])
            .output();
        match reg_check {
            Ok(output) => {
                let out_str = String::from_utf8_lossy(&output.stdout);
                if out_str.contains("0x1") || out_str.contains("1") {
                    println!("[OK] Windows Long Paths are enabled in registry.");
                } else {
                    println!("[ERROR] Windows Long Paths are NOT enabled in registry (LongPathsEnabled = 0).");
                    println!("        Firefox builds will fail midway due to deep folder structures.");
                    println!("        Enable via elevated PowerShell:");
                    println!("        New-ItemProperty -Path \"HKLM:\\SYSTEM\\CurrentControlSet\\Control\\FileSystem\" -Name \"LongPathsEnabled\" -Value 1 -PropertyType DWORD -Force");
                    errors += 1;
                }
            }
            Err(_) => {
                println!("[WARNING] Failed to query registry for LongPathsEnabled.");
                warnings += 1;
            }
        }

        // 3. Git long paths check
        let git_long = Command::new("git")
            .args(&["config", "--get", "core.longpaths"])
            .output();
        match git_long {
            Ok(output) => {
                let out_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if out_str == "true" {
                    println!("[OK] Git core.longpaths is set to true.");
                } else {
                    println!("[ERROR] Git core.longpaths is NOT enabled.");
                    println!("        Run: git config --global core.longpaths true");
                    errors += 1;
                }
            }
            Err(_) => {
                println!("[WARNING] Failed to run git config for core.longpaths.");
                warnings += 1;
            }
        }

        // 4. Git autocrlf line endings check
        let git_crlf = Command::new("git")
            .args(&["config", "--get", "core.autocrlf"])
            .output();
        match git_crlf {
            Ok(output) => {
                let out_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if out_str == "true" {
                    println!("[WARNING] Git core.autocrlf is set to true.");
                    println!("          This will checkout shell scripts with Windows CRLF endings, causing build script failures.");
                    println!("          Recommended fix: git config --global core.autocrlf false");
                    warnings += 1;
                } else {
                    println!("[OK] Git core.autocrlf is not set to true ('{}').", out_str);
                }
            }
            Err(_) => {
                println!("[WARNING] Failed to query Git core.autocrlf.");
                warnings += 1;
            }
        }

        // 5. Disk Space Check
        let disk_check = Command::new("powershell")
            .args(&[
                "-NoProfile",
                "-Command",
                "$drive = ((Get-Location).Path -split ':')[0]; $free = (Get-PSDrive -Name $drive).Free / 1GB; [Math]::Round($free, 1)"
            ])
            .output();
        match disk_check {
            Ok(output) => {
                let out_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if let Ok(free_gb) = out_str.parse::<f64>() {
                    if free_gb >= 40.0 {
                        println!("[OK] Free disk space: {} GB (requires >= 40 GB).", free_gb);
                    } else if free_gb >= 20.0 {
                        println!("[WARNING] Free disk space is low: {} GB. Build requires ~40 GB and may fail.", free_gb);
                        warnings += 1;
                    } else {
                        println!("[ERROR] Extremely low disk space: {} GB. Firefox build WILL fail due to out-of-disk-space.", free_gb);
                        errors += 1;
                    }
                } else {
                    println!("[WARNING] Failed to parse disk space output: '{}'", out_str);
                    warnings += 1;
                }
            }
            Err(_) => {
                println!("[WARNING] Failed to query disk space via PowerShell.");
                warnings += 1;
            }
        }

        // 6. Python check
        let mut py_version_ok = false;
        let mut found_py_str = String::new();
        let py_candidates = ["py", "python", "python3"];
        for candidate in &py_candidates {
            if let Ok(output) = Command::new(candidate).args(&["--version"]).output() {
                let out_str = String::from_utf8_lossy(&output.stdout);
                let err_str = String::from_utf8_lossy(&output.stderr);
                let combined = format!("{}{}", out_str, err_str);
                if combined.contains("3.11") || combined.contains("3.12") {
                    py_version_ok = true;
                    found_py_str = combined.trim().to_string();
                    break;
                }
            }
        }
        if py_version_ok {
            println!(
                "[OK] Python version: {} (requires exactly 3.11 or 3.12).",
                found_py_str
            );
        } else {
            println!("[ERROR] Python 3.11 or 3.12 was not found. Other versions (e.g. 3.10, 3.13) will fail building Firefox.");
            errors += 1;
        }

        // 7. Visual Studio 2022 VC++ Workload
        let vs_where = std::env::var("ProgramFiles(x86)")
            .map(|p| {
                PathBuf::from(p)
                    .join("Microsoft Visual Studio")
                    .join("Installer")
                    .join("vswhere.exe")
            })
            .unwrap_or_default();
        if vs_where.exists() {
            let vs_check = Command::new(&vs_where)
                .args(&[
                    "-version",
                    "[17.0,18.0)",
                    "-products",
                    "*",
                    "-requires",
                    "Microsoft.VisualStudio.Component.VC.Tools.x86.x64",
                    "-format",
                    "json",
                ])
                .output();
            match vs_check {
                Ok(output) => {
                    let out_str = String::from_utf8_lossy(&output.stdout);
                    if out_str.trim() == "[]" || out_str.trim().is_empty() {
                        println!("[ERROR] Visual Studio 2022 C++ build tools are missing.");
                        println!("        Make sure 'Desktop development with C++' workload is installed.");
                        errors += 1;
                    } else {
                        println!("[OK] Visual Studio 2022 with C++ Build Tools is installed.");
                    }
                }
                Err(_) => {
                    println!("[WARNING] Failed to run vswhere check.");
                    warnings += 1;
                }
            }
        } else {
            println!("[WARNING] vswhere.exe was not found. Cannot verify Visual Studio workload components.");
            warnings += 1;
        }

        // 8. Rust targets check
        let rust_check = Command::new("rustc")
            .args(&["--print", "target-list"])
            .output();
        match rust_check {
            Ok(output) => {
                let out_str = String::from_utf8_lossy(&output.stdout);
                if out_str.contains("x86_64-pc-windows-msvc") {
                    println!("[OK] Rust target 'x86_64-pc-windows-msvc' is installed.");
                } else {
                    println!("[ERROR] Rust target 'x86_64-pc-windows-msvc' is missing.");
                    println!("        Add via: rustup target add x86_64-pc-windows-msvc");
                    errors += 1;
                }
            }
            Err(_) => {
                println!("[WARNING] rustc compiler not found in PATH.");
                warnings += 1;
            }
        }

        // 9. MozillaBuild existence
        let mut mb_exists = false;
        let mb_paths = ["C:\\mozilla-build", "C:\\mozilla-build\\bin"];
        for p in &mb_paths {
            if Path::new(p).exists() {
                mb_exists = true;
                break;
            }
        }
        if mb_exists {
            println!("[OK] MozillaBuild is installed.");
        } else {
            println!("[ERROR] MozillaBuild is missing. Install to C:\\mozilla-build.");
            errors += 1;
        }
    } else {
        // macOS or Linux checks
        println!(
            "[OK] Platform checks: Running on non-Windows host ({}). Checking basic tools...",
            std::env::consts::OS
        );

        // Basic tools check
        let git_check = Command::new("git").arg("--version").output();
        if git_check.is_ok() && git_check.unwrap().status.success() {
            println!("[OK] Git is installed.");
        } else {
            println!("[ERROR] Git is not installed or not in PATH.");
            errors += 1;
        }

        let clang_check = Command::new("clang").arg("--version").output();
        if clang_check.is_ok() && clang_check.unwrap().status.success() {
            println!("[OK] Clang is installed.");
        } else {
            println!("[ERROR] Clang compiler is missing.");
            errors += 1;
        }

        let python_check = Command::new("python3").arg("--version").output();
        if python_check.is_ok() && python_check.unwrap().status.success() {
            println!("[OK] Python 3 is installed.");
        } else {
            println!("[ERROR] python3 is missing.");
            errors += 1;
        }
    }

    println!("\nDiagnostics Complete:");
    println!("  - Errors: {}", errors);
    println!("  - Warnings: {}", warnings);

    if strict && warnings > 0 {
        println!("  - Strict mode enabled: treating warnings as errors.");
        errors += warnings;
    }

    if errors > 0 {
        bail!(
            "Build diagnostics failed with {} error(s). Please fix the issues before building.",
            errors
        );
    }

    println!("[hil] Ready to build! No potential build blockages detected.");
    Ok(())
}


fn find_chrome() -> Option<PathBuf> {
    let candidates = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ];

    for candidate in candidates {
        let p = PathBuf::from(candidate);
        if p.exists() {
            return Some(p);
        }
    }

    for bin in ["google-chrome", "chromium", "chrome"] {
        if let Ok(output) = Command::new("which").arg(bin).output() {
            if output.status.success() {
                let s = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if !s.is_empty() {
                    return Some(PathBuf::from(s));
                }
            }
        }
    }

    None
}

fn handle_http_request(mut stream: TcpStream, repo_root: &Path) -> Result<()> {
    let mut buffer = [0u8; 4096];
    let n = match stream.read(&mut buffer) {
        Ok(read_bytes) if read_bytes > 0 => read_bytes,
        _ => return Ok(()),
    };

    let req_str = String::from_utf8_lossy(&buffer[..n]);
    let first_line = req_str.lines().next().unwrap_or("");
    let parts: Vec<&str> = first_line.split_whitespace().collect();
    if parts.len() < 2 {
        return Ok(());
    }

    let full_path = parts[1];
    let path = full_path.split('?').next().unwrap_or(full_path);

    let (status, content_type, body): (&str, &str, Vec<u8>) = match path {
        "/" | "/welcome" | "/welcome.html" | "/index.html" => {
            let html = r#"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hilal Welcome Preview</title>
  <link rel="stylesheet" href="/changes/browser/base/content/hilal/HilalWelcome.css">
  <script>
    window.Services = {
      prefs: {
        _store: {
          "hilal.privacy.level": "standard",
          "hilal.compact.enabled": true,
          "hilal.compact.hide_toolbox": true,
          "sidebar.verticalTabs": false,
          "hilal.workspaces.enabled": true,
          "hilal.workspaces.pinned.public": true,
          "hilal.welcome-screen.seen": false
        },
        getStringPref(k, def) { return this._store[k] ?? def; },
        getBoolPref(k, def) { return this._store[k] ?? def; },
        setBoolPref(k, v) { this._store[k] = v; },
        setStringPref(k, v) { this._store[k] = v; }
      },
      io: {
        newURI(url) { return new URL(url, window.location.href); }
      }
    };
    window.MozXULElement = {
      parseXULToFragment(markup) {
        return document.createRange().createContextualFragment(markup);
      }
    };
    window.ChromeUtils = {
      importESModule() {
        return {
          SearchService: {
            getVisibleEngines() {
              return Promise.resolve([
                { name: "DuckDuckGo", iconURL: "" },
                { name: "Google", iconURL: "" },
                { name: "Bing", iconURL: "" }
              ]);
            },
            setDefault() { return Promise.resolve(); },
            setDefaultPrivate() { return Promise.resolve(); }
          }
        };
      }
    };
    window.MigrationUtils = {
      showMigrationWizard() { console.log("MigrationUtils.showMigrationWizard"); }
    };
    window.gBrowser = {
      tabs: [],
      addTrustedTab(url, opts) {
        const tab = { linkedBrowser: { currentURI: { spec: url } }, pinned: false };
        this.tabs.push(tab);
        return tab;
      },
      pinTab(tab) { tab.pinned = true; },
      removeTab(tab) {
        const idx = this.tabs.indexOf(tab);
        if (idx !== -1) this.tabs.splice(idx, 1);
      }
    };
    document.l10n = {
      formatValue(id) { return Promise.resolve(id); }
    };
  </script>
  <script src="/changes/browser/base/content/hilal/HilalWelcome.js"></script>
</head>
<body class="beer dark" style="margin: 0; min-height: 100vh; background-color: var(--surface);">
  <script>
    document.addEventListener("DOMContentLoaded", async () => {
      const welcome = new window.HilalWelcome({
        activeContainerId: 0,
        ensureWorkspace(label, icon, color) {},
        create(label, icon, color) {},
        _apply() {},
        _updateUI() {}
      });
      await welcome.start();
      const params = new URLSearchParams(window.location.search);
      const stageParam = params.get("stage");
      if (stageParam !== null) {
        const st = parseInt(stageParam, 10);
        welcome._stage = st;
        welcome._initFlowShell();
        welcome._renderStage();
      }
      window._welcome = welcome;
    });
  </script>
</body>
</html>"#;
            ("200 OK", "text/html; charset=utf-8", html.as_bytes().to_vec())
        }
        "/newtab" | "/newtab.html" => {
            let p = repo_root.join("changes/browser/base/content/hilal/newtab/newtab.html");
            match fs::read(p) {
                Ok(bytes) => ("200 OK", "text/html; charset=utf-8", bytes),
                Err(_) => ("404 Not Found", "text/plain", b"Not Found".to_vec()),
            }
        }
        "/newtab.css" => {
            let p = repo_root.join("changes/browser/base/content/hilal/newtab/newtab.css");
            match fs::read(p) {
                Ok(bytes) => ("200 OK", "text/css; charset=utf-8", bytes),
                Err(_) => ("404 Not Found", "text/plain", b"Not Found".to_vec()),
            }
        }
        "/newtab.js" => {
            let p = repo_root.join("changes/browser/base/content/hilal/newtab/newtab.js");
            match fs::read(p) {
                Ok(bytes) => ("200 OK", "application/javascript; charset=utf-8", bytes),
                Err(_) => ("404 Not Found", "text/plain", b"Not Found".to_vec()),
            }
        }
        "/assets/branding/about-logo.svg" => {
            let p = repo_root.join("changes/browser/branding/hilal/content/about-logo.svg");
            match fs::read(p) {
                Ok(bytes) => ("200 OK", "image/svg+xml", bytes),
                Err(_) => ("404 Not Found", "text/plain", b"Not Found".to_vec()),
            }
        }
        p if p.starts_with("/assets/tippytop/") => {
            let file_name = &p["/assets/tippytop/".len()..];
            let target = repo_root
                .join("engine/browser/components/topsites/content/tippytop/images")
                .join(file_name);
            match fs::read(target) {
                Ok(bytes) => {
                    let mime = if file_name.ends_with(".svg") {
                        "image/svg+xml"
                    } else {
                        "image/png"
                    };
                    ("200 OK", mime, bytes)
                }
                Err(_) => ("404 Not Found", "text/plain", b"Not Found".to_vec()),
            }
        }
        p if p.starts_with("/changes/") => {
            let rel = &p[1..];
            let target = repo_root.join(rel);
            match fs::read(&target) {
                Ok(bytes) => {
                    let mime = if rel.ends_with(".css") {
                        "text/css; charset=utf-8"
                    } else if rel.ends_with(".js") {
                        "application/javascript; charset=utf-8"
                    } else if rel.ends_with(".svg") {
                        "image/svg+xml"
                    } else if rel.ends_with(".png") {
                        "image/png"
                    } else if rel.ends_with(".woff2") {
                        "font/woff2"
                    } else {
                        "application/octet-stream"
                    };
                    ("200 OK", mime, bytes)
                }
                Err(_) => ("404 Not Found", "text/plain", b"Not Found".to_vec()),
            }
        }
        _ => ("404 Not Found", "text/plain", b"Not Found".to_vec()),
    };

    let header = format!(
        "HTTP/1.1 {}\r\nContent-Type: {}\r\nContent-Length: {}\r\nConnection: close\r\nAccess-Control-Allow-Origin: *\r\n\r\n",
        status,
        content_type,
        body.len()
    );

    let _ = stream.write_all(header.as_bytes());
    let _ = stream.write_all(&body);
    let _ = stream.flush();
    Ok(())
}

fn preview(
    repo_root: &Path,
    page: &str,
    stage: Option<usize>,
    screenshot: Option<PathBuf>,
    open: bool,
    port: u16,
) -> Result<()> {
    let listener = TcpListener::bind(format!("127.0.0.1:{}", port))
        .with_context(|| format!("Failed to bind preview server to 127.0.0.1:{}", port))?;

    let root_clone = repo_root.to_path_buf();
    std::thread::spawn(move || {
        for stream in listener.incoming() {
            if let Ok(s) = stream {
                let r = root_clone.clone();
                std::thread::spawn(move || {
                    let _ = handle_http_request(s, &r);
                });
            }
        }
    });

    let target_page = match page {
        "newtab" => "newtab.html".to_string(),
        _ => match stage {
            Some(s) => format!("welcome.html?stage={}", s),
            None => "welcome.html".to_string(),
        },
    };

    let url = format!("http://127.0.0.1:{}/{}", port, target_page);

    if let Some(screenshot_path) = screenshot {
        let chrome = find_chrome().context("Google Chrome / Chromium not found. Please install Google Chrome to take headless screenshots.")?;
        println!("[hil] Taking headless screenshot via Chrome: {}", url);
        let status = Command::new(&chrome)
            .args([
                "--headless=new",
                &format!("--screenshot={}", screenshot_path.display()),
                "--window-size=1280,800",
                "--hide-scrollbars",
                "--run-all-compositor-stages-before-draw",
                "--virtual-time-budget=2000",
                &url,
            ])
            .status()
            .context("Failed to execute Google Chrome")?;

        if !status.success() {
            bail!("Chrome failed with status: {:?}", status);
        }

        println!("[hil] Screenshot successfully saved to: {}", screenshot_path.display());
        return Ok(());
    }

    if open {
        println!("[hil] Opening in Google Chrome: {}", url);
        #[cfg(target_os = "macos")]
        {
            let _ = Command::new("open").args(["-a", "Google Chrome", &url]).status();
        }
        #[cfg(target_os = "linux")]
        {
            let _ = Command::new("xdg-open").arg(&url).status();
        }
        #[cfg(target_os = "windows")]
        {
            let _ = Command::new("cmd").args(["/C", "start", &url]).status();
        }
    } else {
        println!("[hil] Preview server ready at: {}", url);
        println!("[hil] Tip: use '--screenshot <path>' for headless capture or '--open' to open in Chrome.");
    }

    println!("[hil] Press Ctrl+C to exit.");
    loop {
        std::thread::sleep(std::time::Duration::from_secs(60));
    }
}
