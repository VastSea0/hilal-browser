# Syncing with upstream Firefox

Firefox moves fast. To keep Hilal viable we have to roll forward regularly.

## Upstream Sync Workflow

To sync with a new upstream Firefox release or commit:

1. **Update Pinned Commit**: Edit `upstream.lock` in the repository root and update the `commit` hash and other metadata.
2. **Pull and Reset Workspace**: Run `./bin/hil setup` to fetch the new pinned commit and reset the `engine/` directory.
3. **Re-Apply Patches**: Run `./bin/hil apply --force` to apply all patches and overlays sequentially to the new base.

If every patch applies cleanly, you're done: rebuild and verify.

## When a Patch Fails to Apply

If `./bin/hil apply` halts at a failing patch/overlay, you will see a detailed error indicating which file failed. From there:

### 1. Try a 3-way Merge
If a patch fails to apply cleanly due to minor line changes, go into the `engine/` directory and try applying it using Git's 3-way merge:
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

### 3. Rewrite a Patch from Scratch
If the surrounding code was rewritten so much that your hunks no longer make sense, just rebuild the change directly inside the `engine/` tree, commit it to the correct point in the history, and run `./bin/hil refresh` to recapture it.

## Verifying after a Sync

Run, at minimum:
```bash
scripts/build-macos.sh
(cd engine && ./mach run)
```
Then exercise any Hilal-specific surface: branding visible, vendor string in `about:` matches, etc.
