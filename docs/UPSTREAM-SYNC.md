# Syncing with upstream Firefox

Firefox moves fast. To keep Hilal viable we have to roll forward
regularly. This document covers the happy path and the recovery paths.

## TL;DR

```bash
scripts/sync-upstream.sh
```

That does:

1. `git fetch origin` in `firefox/`
2. Refuses to proceed if you have local commits on the Firefox branch (so we don't lose Hilal work-in-progress)
3. `git reset --hard origin/<branch>` to land at the new tip
4. Cleans the `branding/hilal/` overlay out of the working tree
5. Re-runs `scripts/apply.sh`

If every patch applies cleanly, you're done: rebuild and verify.

## When a patch fails to apply

`apply.sh` will halt at the first failing patch with the patch name
echoed. From there:

### 1. Try a 3-way merge

In the Firefox checkout:

```bash
cd firefox
git apply --3way ../patches/<failing-patch>.patch
```

`--3way` will leave conflict markers in the affected files. Fix them
by hand. Re-run any later patches if needed, build, verify.

When everything works, regenerate the patch in this repo:

```bash
cd ..
scripts/refresh.sh
```

If you split changes across commits in the Firefox checkout, use
`scripts/refresh.sh --from-commits <range>` instead.

### 2. Drop a patch that upstream made obsolete

If a Mozilla commit replaced your change (e.g. they fixed the same bug
upstream), remove the patch:

```bash
git rm patches/<obsolete>.patch
$EDITOR patches/series      # remove the line
git commit -m "Drop <patch>: superseded by upstream"
```

### 3. Rewrite a patch from scratch

If the surrounding code was rewritten so much that your hunks no
longer make sense, just rebuild the change directly inside the
Firefox tree, then `scripts/refresh.sh` to recapture it.

## Verifying after a sync

Run, at minimum:

```bash
scripts/build-macos.sh
(cd firefox && ./mach run --headless)   # smoke test
(cd firefox && ./mach test --auto)      # if you have time
```

Then exercise any Hilal-specific surface: branding visible, vendor
string in `about:` matches, etc.

## Picking a base ref

Until we ship a release branch, Hilal tracks `main`. If we later cut
a stable branch (e.g. `firefox-esr-128`), pin the Firefox checkout to
that branch:

```bash
cd firefox
git checkout -b esr-128 origin/esr-128
```

`scripts/sync-upstream.sh --branch esr-128` will then fast-forward
*that* branch instead of `main`.

## What about big upstream shake-ups?

Sometimes upstream reorganizes a directory you care about (e.g. moves
`browser/branding/` somewhere else, or restructures `confvars.sh`). In
that case the patches under `patches/` and the overlay path in
`scripts/apply.sh` both need adjusting. The safest path:

1. Reset Firefox to upstream HEAD
2. Manually port the Hilal change in the new location
3. `scripts/refresh.sh` to capture the new diff
4. Update `branding/hilal/` location if needed
5. Commit, document the move in the commit message

Keep the patch repository small and the changes few — every change is
a future merge conflict.
