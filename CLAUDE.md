@AGENTS.md

## Claude-Specific Notes

- When the user asks you to work on Hilal Browser, you are working on **this overlay repo**, not on Firefox upstream. The `firefox/` directory is a gitignored checkout where you edit and build, but commits happen in the root repo.
- Always run `scripts/refresh.sh` after editing in `firefox/` before telling the user changes are ready. Do not leave edits only in the gitignored tree.
- When regenerating patches, review `git diff` output to ensure the patch is focused and doesn't include unrelated changes.
- If the user asks about a Firefox API or internal module, use `searchfox-cli` before guessing or grepping blindly.
