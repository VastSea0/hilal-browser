# Syncing with upstream Firefox

Desktop Hilal is based on Firefox ESR. Move the base to the next ESR point
release (for example from `153.5.1esr` to `153.6.0esr`) as soon as it is out,
because ESR point releases carry the security fixes. Do not move to Nightly or
Release.

## Upstream Sync Workflow

1. Edit `upstream.lock` in the repository root: set `firefox_version` and the
   `commit` of the new ESR release tag in `mozilla-firefox/firefox`.
2. Run `./bin/hil setup` to fetch the new pinned commit and reset `engine/`.
3. Run `./bin/hil apply --force` to apply patches and overlays to the new base.

If every patch applies, rebuild and verify.

## When a Patch Fails to Apply

If `./bin/hil apply` halts, use the failed path printed by the command.

### 1. Try a 3-way Merge
For line-offset conflicts, use Git's 3-way merge:
```bash
cd engine
git apply --3way ../changes/<failing-patch>.patch
```
`--3way` will leave conflict markers in the affected files. Fix them by hand, build, and verify.

When everything works, commit or amend the fix in the `engine/` tree, and regenerate the patch in this repo:
```bash
cd ..
./bin/hil refresh
```

### 2. Drop an Obsolete Patch
If a Mozilla commit replaced your change (e.g., they fixed the same bug upstream), remove the patch:
```bash
git rm changes/<obsolete>.patch
$EDITOR manifest.toml      # remove the corresponding [[patches]] entry
git commit -m "Drop <patch>: superseded by upstream"
```

### 3. Rewrite a Patch
If the surrounding code was rewritten, rebuild the change inside `engine/`,
commit it at the correct point in the history, and run `./bin/hil refresh`.

## Verifying after a Sync

Do a full build, not `faster`, because the engine itself changed:
```bash
scripts/build-macos.sh
(cd engine && ./mach run)
```
Then check the Hilal-specific parts: branding and version in `about:`, the
shell, workspaces, bangs, and the privacy profiles.
