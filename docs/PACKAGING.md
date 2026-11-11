# Package managers

`scripts/generate-packaging.mjs` writes every package manager manifest from a
release's `SHA256SUMS`. The `packaging` job in `release.yml` runs it after each
release is published and commits the result to main. Then
`packaging-test.yml` installs that release through each manifest on its own OS
and checks that it starts.

| Manager | Manifest | Where users get it |
|---------|----------|--------------------|
| Scoop | `bucket/hilal-browser.json` | This repo is the bucket |
| Homebrew | `Casks/hilal-browser.rb` | This repo is the tap |
| AUR | `packaging/aur/hilal-browser-bin/` | `aur.archlinux.org/hilal-browser-bin` |
| winget | `packaging/winget/manifests/` | Copied into `microsoft/winget-pkgs` |
| Flathub | `io.github.VastSea0.Hilal.yml` | `flathub/io.github.VastSea0.Hilal` |

Scoop and Homebrew work as soon as the manifests reach main. The other three
are published in someone else's repository. Each needs a maintainer to submit
it once by hand.

## AUR (one time, needs an AUR account)

1. Create an account at aur.archlinux.org and add an SSH key to it.
2. `git clone ssh://aur@aur.archlinux.org/hilal-browser-bin.git`
3. Copy `PKGBUILD` and `.SRCINFO` from `packaging/aur/hilal-browser-bin/`
   into it, then commit and push.

For later releases, copy the two files again. They could also be pushed
automatically by adding the SSH key as a secret.

## winget (each release, a PR to microsoft/winget-pkgs)

Copy `packaging/winget/manifests/v/VastSea0/Hilal/<version>` to the same path
in a fork of `microsoft/winget-pkgs` and open a pull request. Alternatively,
run `wingetcreate submit <that folder>`. winget's bots validate and scan the
installer. Once the first version is merged, `wingetcreate update` can submit
later versions.

## Flathub (one time, a PR to flathub/flathub)

Follow Flathub's submission guide: open a pull request to `flathub/flathub` on
the `new-pr` branch with `io.github.VastSea0.Hilal.yml`. Its archive source
already has the real sha256 of the latest release. After Flathub accepts it,
their external data checker opens a PR for each new release by itself.
