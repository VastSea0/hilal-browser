#!/bin/sh
# ui-smoke.py --binary target for the locally installed Flatpak. The test
# profile lives in /tmp, so share it with the sandbox.
exec flatpak run --user --filesystem=/tmp org.gkdevstudio.Hilal "$@"
