#!/usr/bin/env python3
"""Write a copy of the Flatpak manifest that uses a local tarball and checkout.

    flatpak-test-manifest.py <manifest> <tarball> <repo dir> <output>
"""

import sys
from pathlib import Path

manifest, tarball, repo, output = sys.argv[1:5]
lines = Path(manifest).read_text().splitlines()
out, skip = [], None
for line in lines:
    stripped = line.strip()
    indent = line[: len(line) - len(line.lstrip())]
    if stripped == "# HILAL_ARCHIVE_BEGIN":
        skip = "ARCHIVE"
        out += [f"{indent}- type: archive", f"{indent}  path: {Path(tarball).resolve()}",
                f"{indent}  strip-components: 0"]
        continue
    if stripped == "# HILAL_SOURCE_BEGIN":
        skip = "SOURCE"
        out += [f"{indent}- type: dir", f"{indent}  path: {Path(repo).resolve()}",
                f"{indent}  dest: hilal-browser"]
        continue
    if skip and stripped == f"# HILAL_{skip}_END":
        skip = None
        continue
    if not skip:
        out.append(line)
Path(output).write_text("\n".join(out) + "\n")
