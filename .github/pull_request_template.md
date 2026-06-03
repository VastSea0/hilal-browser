## Summary

Describe what this pull request changes and why.

## Type of change

- [ ] Bug fix
- [ ] Feature
- [ ] Privacy or security behavior change
- [ ] Build, packaging, or release tooling
- [ ] Documentation
- [ ] Refactor or cleanup

## Firefox upstream target

- Firefox upstream commit/version:
- Does the patch series apply to a clean Firefox checkout? Yes / No
- Command used to verify:

```bash
./bin/hil apply --force
```

## Test plan

- [ ] The `verify-patches` workflow is green on this PR in GitHub Actions.

## Testing

List the commands you ran and the result.

```bash
# example
./bin/hil apply --force
scripts/build-macos.sh package
```

## Release artifact checks

Complete this section if the PR changes build scripts, packaging, or release artifacts.

- Artifact name:
- Platform and architecture:
- SHA256:
- [ ] The artifact was built from this branch.
- [ ] The artifact includes the expected default prefs.
- [ ] The artifact includes the expected policies.
- [ ] The artifact includes bundled extensions such as uBlock Origin when expected.

## Privacy and transparency

- [ ] This PR does not change privacy or security behavior.
- [ ] If privacy behavior changed, the user-facing wording clearly explains what is protected.
- [ ] If privacy behavior changed, the user-facing wording clearly explains what is not protected.
- [ ] No feature is described as Tor-like unless it actually provides Tor-equivalent network anonymity.

## Checklist

- [ ] I rebased this branch on the latest `main`.
- [ ] I kept changes scoped to one logical purpose.
- [ ] I updated `manifest.toml` if patches or overlays were added, removed, or renamed.
- [ ] I regenerated patches with `./bin/hil refresh` after editing inside `engine/`.
- [ ] I did not commit the `engine/` source checkout or build artifacts.
- [ ] I added or updated documentation when behavior changed.
