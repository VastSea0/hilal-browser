// Generated automatically from real git repository commits and tags.
// DO NOT EDIT MANUALLY.

export interface CommitEntry {
  hash: string;
  shortHash: string;
  author: string;
  date: string;
  subject: string;
  body: string;
  category: "feature" | "fix" | "refactor" | "perf" | "docs" | "style" | "build" | "chore";
  githubUrl: string;
}

export interface ReleaseHighlights {
  added: string[];
  changed: string[];
  fixed: string[];
}

export interface ReleaseGroup {
  tag: string;
  version: string;
  isDev: boolean;
  date: string;
  commitCount: number;
  commits: CommitEntry[];
  highlights: ReleaseHighlights | null;
  githubUrl: string;
  compareUrl: string | null;
}

export const REPO_COMMITS_TOTAL = 453;
export const REPO_RELEASES_TOTAL = 11;
export const LATEST_RELEASE_TAG = "v0.3.0-alpha.6";

export const ALL_COMMITS: CommitEntry[] = [
  {
    "hash": "de4bdb4c4a96e96b4cb9c235e2680bff4c85860f",
    "shortHash": "de4bdb4",
    "author": "Egehan KAHRAMAN",
    "date": "2026-09-06T06:52:44+03:00",
    "subject": "chore: update changelog data with latest feature commit and increment commit count",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/de4bdb4c4a96e96b4cb9c235e2680bff4c85860f"
  },
  {
    "hash": "4611aae44c4ef4a5340e4ed4ab2591d13e16d995",
    "shortHash": "4611aae",
    "author": "Egehan KAHRAMAN",
    "date": "2026-09-06T06:52:27+03:00",
    "subject": "feat: implement automated changelog generation and display page for web documentation",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4611aae44c4ef4a5340e4ed4ab2591d13e16d995"
  },
  {
    "hash": "b454a46a46e4a871a66c7e33267d80983ba6f15e",
    "shortHash": "b454a46",
    "author": "Egehan KAHRAMAN",
    "date": "2026-09-06T06:42:13+03:00",
    "subject": "Update application update channels and URLs to hilal-browser.vercel.app",
    "body": "Migrate update policy URL, branding download/release endpoints, about dialog links, smoke tests, and documentation from the expired gkdevstudio.org domain to hilal-browser.vercel.app.",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b454a46a46e4a871a66c7e33267d80983ba6f15e"
  },
  {
    "hash": "936f28ac9520540e952f13129144aacc956b4ab0",
    "shortHash": "936f28a",
    "author": "Egehan KAHRAMAN",
    "date": "2026-08-30T17:02:00+03:00",
    "subject": "feat(tahoe): restore dual tabstrip for Tahoe Safari mode and mark as experimental",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/936f28ac9520540e952f13129144aacc956b4ab0"
  },
  {
    "hash": "4d3bb801eafb00acb0e4094e022c2fbc65813b1f",
    "shortHash": "4d3bb80",
    "author": "Egehan KAHRAMAN",
    "date": "2026-08-30T16:55:43+03:00",
    "subject": "chore: update hero chip text and localize key highlights section label",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4d3bb801eafb00acb0e4094e022c2fbc65813b1f"
  },
  {
    "hash": "5c0997298f857ed70631dfff01aa73f3d58bcd57",
    "shortHash": "5c09972",
    "author": "Egehan KAHRAMAN",
    "date": "2026-08-30T16:55:32+03:00",
    "subject": "fix(ui): hide tab labels in vertical pinned tab grid to display only icons",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5c0997298f857ed70631dfff01aa73f3d58bcd57"
  },
  {
    "hash": "48b9aef721ca8634c5bf97458bc588f167ee2917",
    "shortHash": "48b9aef",
    "author": "Egehan KAHRAMAN",
    "date": "2026-08-30T16:54:47+03:00",
    "subject": "refactor: migrate DownloadModal to Material Design 3 and update copy",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/48b9aef721ca8634c5bf97458bc588f167ee2917"
  },
  {
    "hash": "fc0b74367b8ab17af4eaae9bb210334a9113cbb8",
    "shortHash": "fc0b743",
    "author": "Egehan KAHRAMAN",
    "date": "2026-08-30T16:53:03+03:00",
    "subject": "refactor: overhaul landing page with modernized UI, optimized asset loading, and expanded feature documentation",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/fc0b74367b8ab17af4eaae9bb210334a9113cbb8"
  },
  {
    "hash": "c5bafe95647627369a8506854c5fb45a61d6764d",
    "shortHash": "c5bafe9",
    "author": "Egehan KAHRAMAN",
    "date": "2026-08-30T16:47:06+03:00",
    "subject": "fix(ui): disable horizontal tabs in branding prefs and enforce single-line vertical tabs",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c5bafe95647627369a8506854c5fb45a61d6764d"
  },
  {
    "hash": "e07e4ee13612f5b6d29d813cb9825b021d5f7a09",
    "shortHash": "e07e4ee",
    "author": "Egehan KAHRAMAN",
    "date": "2026-08-30T16:35:04+03:00",
    "subject": "feat: isolate Tahoe Safari shell and restore standard Hilal UI as primary",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e07e4ee13612f5b6d29d813cb9825b021d5f7a09"
  },
  {
    "hash": "fc3bacd6032f1495193e815b09421bf604bb9966",
    "shortHash": "fc3bacd",
    "author": "VastSea0",
    "date": "2026-06-24T16:09:35+03:00",
    "subject": "feat: add build and doctor commands to hil CLI and update Windows build documentation",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/fc3bacd6032f1495193e815b09421bf604bb9966"
  },
  {
    "hash": "7a6d266d6cb58875bfb61e8d3d4fae639e3a0108",
    "shortHash": "7a6d266",
    "author": "VastSea0",
    "date": "2026-06-22T16:13:14+03:00",
    "subject": "ci: optimize Windows and Linux build caching and parallelism",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7a6d266d6cb58875bfb61e8d3d4fae639e3a0108"
  },
  {
    "hash": "2b96b8f140b920ebfd1e6fea173908be6d954d2f",
    "shortHash": "2b96b8f",
    "author": "VastSea0",
    "date": "2026-06-21T22:12:52+03:00",
    "subject": "release: bump version to v0.3.0-alpha.6",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2b96b8f140b920ebfd1e6fea173908be6d954d2f"
  },
  {
    "hash": "7de60df7b6377cdd4c4f8fe3f5bf8733e6f461e7",
    "shortHash": "7de60df",
    "author": "VastSea0",
    "date": "2026-06-21T17:00:28+03:00",
    "subject": "feat: implement dynamic Tahoe scroll reflection and page background synchronization with zoom-aware updates",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7de60df7b6377cdd4c4f8fe3f5bf8733e6f461e7"
  },
  {
    "hash": "b22bed38ebf1ad24a3d700100b85d5c4b78ff502",
    "shortHash": "b22bed3",
    "author": "VastSea0",
    "date": "2026-06-20T05:56:58+03:00",
    "subject": "update readme",
    "body": "",
    "category": "docs",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b22bed38ebf1ad24a3d700100b85d5c4b78ff502"
  },
  {
    "hash": "f87050b9a23d050c08ee16d328f900dc36234ee7",
    "shortHash": "f87050b",
    "author": "VastSea0",
    "date": "2026-06-20T05:53:20+03:00",
    "subject": "Simplify README",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f87050b9a23d050c08ee16d328f900dc36234ee7"
  },
  {
    "hash": "b3d92e0b8b40ac85f44c0c5d7397ea9b698eb478",
    "shortHash": "b3d92e0",
    "author": "VastSea0",
    "date": "2026-06-20T05:51:42+03:00",
    "subject": "fix(ci): stabilize Linux and Windows builds",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b3d92e0b8b40ac85f44c0c5d7397ea9b698eb478"
  },
  {
    "hash": "d4ea95117c3e709bcfb1b73ca55d0f7136062cf2",
    "shortHash": "d4ea951",
    "author": "VastSea0",
    "date": "2026-06-18T00:29:36+03:00",
    "subject": "fix(ci): fix persistent build failures",
    "body": "- Remove engine source cache: 3-4 GB was hitting eviction limits and\n  hil setup would delete it anyway on a commit mismatch; clone is\n  now unconditional and consistent.\n\n- Fix sccache cache key: was using github.run_id (unique per run) so\n  the primary key never matched. New key is scoped to upstream.lock\n  hash so sccache restores across builds at the same Firefox revision.\n  Added v2 prefix to bust stale keys from prior failed runs.\n\n- Enable SCCACHE_GHA_ENABLED on the build step so mach build actually\n  uses the sccache server started in the setup step.\n\n- Extend Linux timeout from 180 to 360 minutes. A cold Firefox build\n  takes 180-300+ minutes; the old limit guaranteed timeouts.\n\n- Add job limit to mozconfigs/linux (-j3). Unconstrained parallelism\n  on 4-core/16 GB runners OOMs during linking.\n\n- Expand Linux disk cleanup to free an additional 5-8 GB (CodeQL,\n  Ruby, PyPy, CUDA, Miniconda, Docker images).",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d4ea95117c3e709bcfb1b73ca55d0f7136062cf2"
  },
  {
    "hash": "4523a3e88eaa60bc577203adc4bf096748614d84",
    "shortHash": "4523a3e",
    "author": "VastSea0",
    "date": "2026-06-16T22:12:27+03:00",
    "subject": "fix(release): resolve build workflow issues and bump version to v0.3.0-alpha.5",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4523a3e88eaa60bc577203adc4bf096748614d84"
  },
  {
    "hash": "24c23d360a7ec25190964f7bc3992a5660701f78",
    "shortHash": "24c23d3",
    "author": "VastSea0",
    "date": "2026-06-16T22:03:58+03:00",
    "subject": "docs: rebrand Huma Browser to Hilal Browser and overhaul README documentation",
    "body": "",
    "category": "docs",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/24c23d360a7ec25190964f7bc3992a5660701f78"
  },
  {
    "hash": "614b89a653901250e55034f79e7079b37591f1e6",
    "shortHash": "614b89a",
    "author": "VastSea0",
    "date": "2026-06-16T21:58:38+03:00",
    "subject": "refactor: standardize color picker geometry and update arc rendering to use cubic bezier curves",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/614b89a653901250e55034f79e7079b37591f1e6"
  },
  {
    "hash": "3693bf4b4d6c151994ce2507b82f83077d979c59",
    "shortHash": "3693bf4",
    "author": "VastSea0",
    "date": "2026-06-16T21:57:57+03:00",
    "subject": "feat: implement visual feedback, scroll reflection, and Oklab color blending with refactored Hilal color picker logic",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3693bf4b4d6c151994ce2507b82f83077d979c59"
  },
  {
    "hash": "dc44bc32eb25d8177c5cbe22574f5b6d7b26b2c0",
    "shortHash": "dc44bc3",
    "author": "VastSea0",
    "date": "2026-06-16T21:53:17+03:00",
    "subject": "refactor: implement advanced Oklab-based color blending for Hilal page boosts",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/dc44bc32eb25d8177c5cbe22574f5b6d7b26b2c0"
  },
  {
    "hash": "73a76e3c6a8d0f541899b8495d6ffc19bae83698",
    "shortHash": "73a76e3",
    "author": "VastSea0",
    "date": "2026-06-16T03:23:31+03:00",
    "subject": "feat: implement dynamic Tahoe page background boosting based on site accent colors",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/73a76e3c6a8d0f541899b8495d6ffc19bae83698"
  },
  {
    "hash": "f65ed7b016bc27758f0828f6670476e9b7956d0b",
    "shortHash": "f65ed7b",
    "author": "VastSea0",
    "date": "2026-06-16T02:58:02+03:00",
    "subject": "style: replace content frame rotation animation with clean scale pulse in site customizer",
    "body": "",
    "category": "style",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f65ed7b016bc27758f0828f6670476e9b7956d0b"
  },
  {
    "hash": "08040ca78754d28e766689ba57bba4fc2a362016",
    "shortHash": "08040ca",
    "author": "VastSea0",
    "date": "2026-06-16T02:51:28+03:00",
    "subject": "style: increase opacity of urlbar dropdown background for improved readability",
    "body": "",
    "category": "style",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/08040ca78754d28e766689ba57bba4fc2a362016"
  },
  {
    "hash": "3fa4dcffad3952f5bc5fa096b29f239c85c26c0a",
    "shortHash": "3fa4dcf",
    "author": "VastSea0",
    "date": "2026-06-16T02:46:09+03:00",
    "subject": "feat: hide workspace name in urlbar by default and tab colored lines globally",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3fa4dcffad3952f5bc5fa096b29f239c85c26c0a"
  },
  {
    "hash": "022cd7931e5310693bc0abf814dca3283d01cd05",
    "shortHash": "022cd79",
    "author": "VastSea0",
    "date": "2026-06-16T02:35:10+03:00",
    "subject": "Bump version to 0.3.0-alpha.4",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/022cd7931e5310693bc0abf814dca3283d01cd05"
  },
  {
    "hash": "a0d31fd6562ca4353bab8ee44bc9bc53b4e24f8d",
    "shortHash": "a0d31fd",
    "author": "Egehan KAHRAMAN",
    "date": "2026-06-16T02:21:39+03:00",
    "subject": "video file",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a0d31fd6562ca4353bab8ee44bc9bc53b4e24f8d"
  },
  {
    "hash": "915dcf624427f116a4a608b9d76e1d4775231320",
    "shortHash": "915dcf6",
    "author": "VastSea0",
    "date": "2026-06-16T02:06:28+03:00",
    "subject": "feat: implement dynamic scroll reflection background and refine Tahoe Safari UI visual styles",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/915dcf624427f116a4a608b9d76e1d4775231320"
  },
  {
    "hash": "ee251ca593659a393d179bf731e8414eb61de3e0",
    "shortHash": "ee251ca",
    "author": "VastSea0",
    "date": "2026-06-15T23:10:48+03:00",
    "subject": "refactor: constrain scroll reflection canvas to tabbox dimensions and simplify draw logic",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ee251ca593659a393d179bf731e8414eb61de3e0"
  },
  {
    "hash": "f5c9245fe7a6e66417d9c88a0adc1414ff1f4320",
    "shortHash": "f5c9245",
    "author": "VastSea0",
    "date": "2026-06-15T16:52:58+03:00",
    "subject": "revert: replace WebGL liquid glass with standard CSS frosted-glass for suggestions dropdown",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f5c9245fe7a6e66417d9c88a0adc1414ff1f4320"
  },
  {
    "hash": "fb1158ca4bebf3ce9c54ba02e1c262071c7bc7c4",
    "shortHash": "fb1158c",
    "author": "VastSea0",
    "date": "2026-06-15T15:04:39+03:00",
    "subject": "feat: WebGL-based liquid glass effect for suggestions dropdown",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/fb1158ca4bebf3ce9c54ba02e1c262071c7bc7c4"
  },
  {
    "hash": "be341e65a5f60b94cc1bfc94596ea2f9d4ed3782",
    "shortHash": "be341e6",
    "author": "VastSea0",
    "date": "2026-06-15T13:35:16+03:00",
    "subject": "style: update mask and transform properties for hilal-tahoe theme overlay",
    "body": "",
    "category": "style",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/be341e65a5f60b94cc1bfc94596ea2f9d4ed3782"
  },
  {
    "hash": "3b4b1cd8bcbee338821ad7bc16bd931d6da0e2a9",
    "shortHash": "3b4b1cd",
    "author": "VastSea0",
    "date": "2026-06-15T13:26:53+03:00",
    "subject": "feat: add support for right-aligned compact sidebar and improve scroll reflection rendering in Tahoe mode",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3b4b1cd8bcbee338821ad7bc16bd931d6da0e2a9"
  },
  {
    "hash": "1f205c2f920c1ee37f9067589db031691e910184",
    "shortHash": "1f205c2",
    "author": "VastSea0",
    "date": "2026-06-15T13:16:49+03:00",
    "subject": "feat: add blur, saturation, and scaling effects to scroll reflection for smoother visual transition",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/1f205c2f920c1ee37f9067589db031691e910184"
  },
  {
    "hash": "67254ae6a56099a748f451512411b9756d14f999",
    "shortHash": "67254ae",
    "author": "VastSea0",
    "date": "2026-06-15T13:10:07+03:00",
    "subject": "feat: implement scroll reflection for Hilal Tahoe layout using WindowActor and canvas snapshotting",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/67254ae6a56099a748f451512411b9756d14f999"
  },
  {
    "hash": "f186575b50042fca021781d328da9a954579cbba",
    "shortHash": "f186575",
    "author": "VastSea0",
    "date": "2026-06-15T10:36:10+03:00",
    "subject": "feat: use tab element as drag feedback image in Tahoe horizontal tabs",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f186575b50042fca021781d328da9a954579cbba"
  },
  {
    "hash": "e5db985080cd03c43a6f7ed9ccaba6b8adfe4c98",
    "shortHash": "e5db985",
    "author": "VastSea0",
    "date": "2026-06-15T02:41:09+03:00",
    "subject": "Fix overlay file patch conflicts in tahoe-safari-shell.patch",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e5db985080cd03c43a6f7ed9ccaba6b8adfe4c98"
  },
  {
    "hash": "e6bbd60312af55db55588a0e70d9baaebd36aafc",
    "shortHash": "e6bbd60",
    "author": "VastSea0",
    "date": "2026-06-15T02:17:30+03:00",
    "subject": "Fix Tahoe address bar suggestions dropdown background selector and overlays",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e6bbd60312af55db55588a0e70d9baaebd36aafc"
  },
  {
    "hash": "d7c4802a3e01ccb5c25f109404756936290c6362",
    "shortHash": "d7c4802",
    "author": "VastSea0",
    "date": "2026-06-15T02:00:36+03:00",
    "subject": "feat: implement liquid glass styling for horizontal tab drag and drop operations",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d7c4802a3e01ccb5c25f109404756936290c6362"
  },
  {
    "hash": "d26a79f520afbdd7f8afc3448dea348a9ab92745",
    "shortHash": "d26a79f",
    "author": "VastSea0",
    "date": "2026-06-15T01:51:36+03:00",
    "subject": "feat: implement drag-and-drop support for safari sidebar tabs with visual feedback",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d26a79f520afbdd7f8afc3448dea348a9ab92745"
  },
  {
    "hash": "b0e7d67b71d77e4ea7eb733dae7c8485b9cc4a6f",
    "shortHash": "b0e7d67",
    "author": "VastSea0",
    "date": "2026-06-15T01:34:58+03:00",
    "subject": "refactor: update hilal-tahoe theme layout for sidebar positioning and tab bar styling",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b0e7d67b71d77e4ea7eb733dae7c8485b9cc4a6f"
  },
  {
    "hash": "5488c2845bdccf13d47864940c4ef5a051f7e2e7",
    "shortHash": "5488c28",
    "author": "VastSea0",
    "date": "2026-06-15T01:18:38+03:00",
    "subject": "fix: stretch Tahoe sidebar panel to window bounds",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5488c2845bdccf13d47864940c4ef5a051f7e2e7"
  },
  {
    "hash": "98b43f970b15f37bf7e29cdd06429d44a2d4edd5",
    "shortHash": "98b43f9",
    "author": "VastSea0",
    "date": "2026-06-15T01:07:46+03:00",
    "subject": "fix: measure Tahoe content geometry dynamically",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/98b43f970b15f37bf7e29cdd06429d44a2d4edd5"
  },
  {
    "hash": "be064fe2c61ea44e52929f48743c5de1127c8e4f",
    "shortHash": "be064fe",
    "author": "VastSea0",
    "date": "2026-06-15T00:54:49+03:00",
    "subject": "fix: flatten Tahoe webview frame in sidebar mode",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/be064fe2c61ea44e52929f48743c5de1127c8e4f"
  },
  {
    "hash": "687034bcdb536e3092f41d91f4d23c9607fa34c4",
    "shortHash": "687034b",
    "author": "VastSea0",
    "date": "2026-06-15T00:39:13+03:00",
    "subject": "fix: constrain Tahoe page bleed to content area",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/687034bcdb536e3092f41d91f4d23c9607fa34c4"
  },
  {
    "hash": "78b9219acb3fa33f1b97eb165657fcd4bb13556d",
    "shortHash": "78b9219",
    "author": "VastSea0",
    "date": "2026-06-15T00:30:05+03:00",
    "subject": "fix: align Tahoe sidebar bleed with webview edge",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/78b9219acb3fa33f1b97eb165657fcd4bb13556d"
  },
  {
    "hash": "9bed404db35a5dce6425b7bb95e52d2e947cae0f",
    "shortHash": "9bed404",
    "author": "VastSea0",
    "date": "2026-06-15T00:26:57+03:00",
    "subject": "refactor: migrate HilalTahoe messaging to per-page background color updates and implement tab drag-and-drop visuals",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9bed404db35a5dce6425b7bb95e52d2e947cae0f"
  },
  {
    "hash": "af9bbd4d143154729908fcddd106d8813053cdf6",
    "shortHash": "af9bbd4",
    "author": "VastSea0",
    "date": "2026-06-14T23:37:30+03:00",
    "subject": "feat: add HilalTahoe JSWindowActor to synchronize sidebar-aware browser underlap offsets",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/af9bbd4d143154729908fcddd106d8813053cdf6"
  },
  {
    "hash": "b91e41b51bd0b1362d7a587c174aaa2f7f97fc88",
    "shortHash": "b91e41b",
    "author": "VastSea0",
    "date": "2026-06-14T17:34:38+03:00",
    "subject": "feat: implement horizontal tab strip mode in Hilal browser with dynamic toolbar widget management",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b91e41b51bd0b1362d7a587c174aaa2f7f97fc88"
  },
  {
    "hash": "a4820ffb19af7074ad97b22f14b32f1fe01779de",
    "shortHash": "a4820ff",
    "author": "VastSea0",
    "date": "2026-06-14T16:55:58+03:00",
    "subject": "feat: enhance hilal-tahoe theme styling and urlbar layout for side-sidebar mode",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a4820ffb19af7074ad97b22f14b32f1fe01779de"
  },
  {
    "hash": "993a1a5b1b6965a9c791181a27c0d9d1d00d3a76",
    "shortHash": "993a1a5",
    "author": "VastSea0",
    "date": "2026-06-14T16:36:09+03:00",
    "subject": "refactor: redesign Tahoe Safari shell with improved sidebar controls and tab layout styling",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/993a1a5b1b6965a9c791181a27c0d9d1d00d3a76"
  },
  {
    "hash": "ac98643b153e791f89989e4ff4743081328717b4",
    "shortHash": "ac98643",
    "author": "VastSea0",
    "date": "2026-06-14T16:19:49+03:00",
    "subject": "Fix tabstrip layout and observer registration when toggling horizontal tabs in vertical tabs mode",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ac98643b153e791f89989e4ff4743081328717b4"
  },
  {
    "hash": "14aaaede5136eaa8da76914316a766b5819e8fae",
    "shortHash": "14aaaed",
    "author": "VastSea0",
    "date": "2026-06-14T04:51:51+03:00",
    "subject": "style: position normal sidebar to enclose traffic lights and fix empty compact mode sidebar layout",
    "body": "",
    "category": "style",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/14aaaede5136eaa8da76914316a766b5819e8fae"
  },
  {
    "hash": "b1288f18732da0201bfd5b94ed9ae90f37741e9c",
    "shortHash": "b1288f1",
    "author": "VastSea0",
    "date": "2026-06-14T04:47:16+03:00",
    "subject": "refactor: update sidebar and navigator-toolbox to implement V2 classic slide-up layout styles",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b1288f18732da0201bfd5b94ed9ae90f37741e9c"
  },
  {
    "hash": "ef73e638de01872a84c883c10fba75aa91601679",
    "shortHash": "ef73e63",
    "author": "VastSea0",
    "date": "2026-06-14T04:34:14+03:00",
    "subject": "feat: implement compact mode toggle and adjust safari shell sidebar layout dimensions",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ef73e638de01872a84c883c10fba75aa91601679"
  },
  {
    "hash": "e89710d015b69f9e39fb554c8a26dd830b6048b9",
    "shortHash": "e89710d",
    "author": "VastSea0",
    "date": "2026-06-14T04:32:05+03:00",
    "subject": "feat: implement Safari-style sidebar shell and layout components with Tahoe theme support",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e89710d015b69f9e39fb554c8a26dd830b6048b9"
  },
  {
    "hash": "37b5578630ce0672d4cfc3276c42535144123705",
    "shortHash": "37b5578",
    "author": "VastSea0",
    "date": "2026-06-14T04:23:07+03:00",
    "subject": "feat: implement Safari-style browser shell with floating toolbar and sidebar adjustments",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/37b5578630ce0672d4cfc3276c42535144123705"
  },
  {
    "hash": "4ff38367b559beaa05ba90557fd4638f29abe84c",
    "shortHash": "4ff3836",
    "author": "VastSea0",
    "date": "2026-06-14T03:21:58+03:00",
    "subject": "Style vertical tabs sidebar to match Safari layout and neutral highlights in Tahoe mode",
    "body": "",
    "category": "style",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4ff38367b559beaa05ba90557fd4638f29abe84c"
  },
  {
    "hash": "2203592453ca94762d97a25f43b566a5fdedb6d2",
    "shortHash": "2203592",
    "author": "VastSea0",
    "date": "2026-06-14T03:15:23+03:00",
    "subject": "Fix macOS native vibrancy blur and compact toolbar overlap under Tahoe mode",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2203592453ca94762d97a25f43b566a5fdedb6d2"
  },
  {
    "hash": "4b575eb710da06a8619deb00d6cf7a4b07703c23",
    "shortHash": "4b575eb",
    "author": "VastSea0",
    "date": "2026-06-14T03:04:30+03:00",
    "subject": "Implement Tahoe Safari-inspired shell and fix glass transparency issues",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4b575eb710da06a8619deb00d6cf7a4b07703c23"
  },
  {
    "hash": "369a251356f7e363cbfa671993ff77b1c9d718dd",
    "shortHash": "369a251",
    "author": "VastSea0",
    "date": "2026-06-13T02:03:55+03:00",
    "subject": "fix compact mode layout heights and absolute traffic lights offset",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/369a251356f7e363cbfa671993ff77b1c9d718dd"
  },
  {
    "hash": "a9b93a74c318d10473497e66262d8a04da71f090",
    "shortHash": "a9b93a7",
    "author": "VastSea0",
    "date": "2026-06-13T01:53:19+03:00",
    "subject": "fix compact mode traffic lights fixed positioning and sidebar top padding spacing",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a9b93a74c318d10473497e66262d8a04da71f090"
  },
  {
    "hash": "a382d38b836a359e489fd1516bef04740f21115a",
    "shortHash": "a382d38",
    "author": "VastSea0",
    "date": "2026-06-13T01:44:51+03:00",
    "subject": "fix compact mode overlaps and traffic lights persistence",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a382d38b836a359e489fd1516bef04740f21115a"
  },
  {
    "hash": "b93699297ffaeee704ed3faf6d4f7e3a84f80cc5",
    "shortHash": "b936992",
    "author": "VastSea0",
    "date": "2026-06-13T01:34:11+03:00",
    "subject": "feat: absolute position macOS traffic lights in compact mode to ignore nav-bar padding",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b93699297ffaeee704ed3faf6d4f7e3a84f80cc5"
  },
  {
    "hash": "ee58fd366071094ba322aa2bc20a3f1b58f0c663",
    "shortHash": "ee58fd3",
    "author": "VastSea0",
    "date": "2026-06-13T01:32:22+03:00",
    "subject": "refactor: implement V2 Classic Slide-Up Toolbar with full-width layout and centered navigation controls",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ee58fd366071094ba322aa2bc20a3f1b58f0c663"
  },
  {
    "hash": "1d82647689bb5f805040b1d56d7371213100da2f",
    "shortHash": "1d82647",
    "author": "VastSea0",
    "date": "2026-06-13T00:43:38+03:00",
    "subject": "feat: refine sidebar layout with improved sizing, drag handling, and optimized toolbar interaction styling",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/1d82647689bb5f805040b1d56d7371213100da2f"
  },
  {
    "hash": "29112f0e14dc9b6706ab9de6460b15052818f95f",
    "shortHash": "29112f0",
    "author": "VastSea0",
    "date": "2026-06-13T00:28:32+03:00",
    "subject": "Merge branch 'main' of https://github.com/VastSea0/hilal-browser",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/29112f0e14dc9b6706ab9de6460b15052818f95f"
  },
  {
    "hash": "4ab1989e21f99c295d81980bcceb2fed2fb489e4",
    "shortHash": "4ab1989",
    "author": "VastSea0",
    "date": "2026-06-12T20:09:30+03:00",
    "subject": "Update sidebar layout and styling with glassmorphism and compact width",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4ab1989e21f99c295d81980bcceb2fed2fb489e4"
  },
  {
    "hash": "9c141613a81c95e45618f3b8cc9e8978bdf0fd04",
    "shortHash": "9c14161",
    "author": "VastSea0",
    "date": "2026-06-12T13:48:54+03:00",
    "subject": "Keep traffic lights visible inside compact sidebar when toolbar is hidden",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9c141613a81c95e45618f3b8cc9e8978bdf0fd04"
  },
  {
    "hash": "dff91bdddccc0807819580ebcc25ae80daeaaf93",
    "shortHash": "dff91bd",
    "author": "VastSea0",
    "date": "2026-06-12T13:48:54+03:00",
    "subject": "Keep traffic lights visible inside compact sidebar when toolbar is hidden",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/dff91bdddccc0807819580ebcc25ae80daeaaf93"
  },
  {
    "hash": "593e290ba82b8610a7a4092f30ec6248c58ff450",
    "shortHash": "593e290",
    "author": "VastSea0",
    "date": "2026-06-12T13:41:00+03:00",
    "subject": "Move traffic lights into sidebar card when both sidebar and toolbar are visible",
    "body": "When the compact toolbar is shifted right (starts after the sidebar),\n#titlebar moves right with it, placing the traffic lights in the toolbar\ncard instead of the sidebar.\n\nFix: use position:absolute on #titlebar with a negative inset-inline-start\nequal to the toolbar's shift amount. This pulls #titlebar back to window\nx=0 (inside the sidebar card area) while taking it out of the toolbar's\nflex flow so #nav-bar continues to start cleanly at the toolbar card edge.\n\n#titlebar is transparent on macOS — only the native AppKit NSView traffic\nlight buttons are visible. The toolbox has overflow:visible when shown, so\n#titlebar can paint outside the toolbar card to the left. The\n.titlebar-buttonbox-container gets pointer-events:auto so traffic lights\nremain fully clickable.",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/593e290ba82b8610a7a4092f30ec6248c58ff450"
  },
  {
    "hash": "aca430af61658536ce585dacc3b633c4df0bd9f6",
    "shortHash": "aca430a",
    "author": "VastSea0",
    "date": "2026-06-12T13:36:12+03:00",
    "subject": "Rework compact sidebar+toolbar co-existence layout",
    "body": "Previous approach: push sidebar top down by 64px when toolbar is visible.\nThis blocked the macOS traffic lights and looked unnatural.\n\nNew approach: keep sidebar at top:0 (traffic lights render naturally at the\ntop of the sidebar card on macOS), and instead shift the toolbar's left\nedge to start after the sidebar width so the two never overlap.\n\nA CSS custom property --hilal-compact-sidebar-width (52px icon-only,\n280px vertical-tabs) drives the toolbar offset calculation so there is\na single rule that works for both sidebar configurations:\n\n  left: calc(sidebar-width + 12px)\n  width: calc(100vw - sidebar-width - 24px)\n\nFor the right-side sidebar variant, only the width is reduced from the\nright; left stays at 12px.",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/aca430af61658536ce585dacc3b633c4df0bd9f6"
  },
  {
    "hash": "2047454ecf749515e89949d54f28da42f77ed913",
    "shortHash": "2047454",
    "author": "VastSea0",
    "date": "2026-06-12T13:27:54+03:00",
    "subject": "Fix URL bar ghost: target nav-bar and urlbar directly in compact hide state",
    "body": "The URL bar in Nova-mode Firefox is a <panel popover> element rendered\nin the browser top layer. Top-layer elements are completely immune to\nancestor transform, clip-path, overflow and opacity — they always render\nat their layout position, bypassing the toolbox slide entirely.\n\nclip-path: inset(0) and overflow: hidden on the toolbox ancestor have\nno effect on the URL bar for this reason.\n\nFix: use #navigator-toolbox:not(.hilal-compact-visible) to directly\nset opacity:0 and visibility:hidden on #nav-bar and .urlbar themselves.\nThe 0.15s transition is shorter than the 0.3s toolbox slide so content\nfully fades out before the toolbox finishes moving, with no ghost frame.",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2047454ecf749515e89949d54f28da42f77ed913"
  },
  {
    "hash": "82795088aa30ca0b0856d51f0273655eaad2e6ca",
    "shortHash": "8279508",
    "author": "VastSea0",
    "date": "2026-06-12T13:23:00+03:00",
    "subject": "Fix URL bar text/icon glitch during compact toolbar hide animation",
    "body": "The URL bar has  which promotes it to its own\nGPU compositing layer.  on a transformed parent cannot\nclip promoted child compositor layers - the URL bar content lingered\non screen as a ghost after the toolbox started sliding upward.\n\n creates a compositor-level mask that correctly\nclips ALL child layers including the URL bar's promoted layer, so text,\nicons and the URL bar background disappear in sync with the toolbox slide.\n\n is cleared to  in the visible state so URL bar\nautocomplete dropdowns are not cut off when the toolbar is shown.",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/82795088aa30ca0b0856d51f0273655eaad2e6ca"
  },
  {
    "hash": "9a37ca8db01268a48302b9e4329a9c8f4c0e06f4",
    "shortHash": "9a37ca8",
    "author": "VastSea0",
    "date": "2026-06-12T03:24:25+03:00",
    "subject": "Fix compact mode toolbar/sidebar overlap and URL bar content bleed",
    "body": "- overflow:hidden on the hidden toolbox clips URL bar icons and text\n  that would bleed outside the sliding element during the hide animation.\n  overflow:visible is restored when the toolbox is shown so autocomplete\n  dropdowns from the URL bar still appear normally.\n\n- CSS :has() rule offsets the compact sidebar top by 64px when the\n  floating toolbar is also visible, preventing both elements from\n  occupying the same top-corner and blocking the macOS traffic lights.\n  The top offset animates back to 0 when the toolbar hides.\n\n- Co-schedule sidebar and toolbar hides inside the same setTimeout\n  callback so both animate out in the exact same frame rather than\n  potentially staggering by one frame when the mouse leaves the\n  shared hover zone.",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9a37ca8db01268a48302b9e4329a9c8f4c0e06f4"
  },
  {
    "hash": "c018b5395310ff46fb2bc4a29a817fcfde401567",
    "shortHash": "c018b53",
    "author": "VastSea0",
    "date": "2026-06-12T03:03:53+03:00",
    "subject": "Ensure regular unpinned vertical tab backgrounds fill 100% size after layout toggling",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c018b5395310ff46fb2bc4a29a817fcfde401567"
  },
  {
    "hash": "c56a95adfcdbb8c6efa23759bb30896dc89520bf",
    "shortHash": "c56a95a",
    "author": "VastSea0",
    "date": "2026-06-12T03:00:15+03:00",
    "subject": "Ensure vertical pinned tab backgrounds fill 100% card size after layout toggling",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c56a95adfcdbb8c6efa23759bb30896dc89520bf"
  },
  {
    "hash": "bf37007ca11df52d2f342ec03b2cdc0cd713e09e",
    "shortHash": "bf37007",
    "author": "VastSea0",
    "date": "2026-06-12T02:54:42+03:00",
    "subject": "Fix duplicate pinned tab creation by checking pinned tabs cache on onboarding finish",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bf37007ca11df52d2f342ec03b2cdc0cd713e09e"
  },
  {
    "hash": "f5b9a318306702c75dafacd830ef4696087409c7",
    "shortHash": "f5b9a31",
    "author": "VastSea0",
    "date": "2026-06-12T02:54:11+03:00",
    "subject": "Fix vertical pinned tab backgrounds being vertically squished in sidebar",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f5b9a318306702c75dafacd830ef4696087409c7"
  },
  {
    "hash": "8d0e72145bcc23699ff79de03f3c54f2b517069a",
    "shortHash": "8d0e721",
    "author": "VastSea0",
    "date": "2026-06-12T02:49:39+03:00",
    "subject": "refactor: update pinned site lookup and implement sidebar compact mode logic",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8d0e72145bcc23699ff79de03f3c54f2b517069a"
  },
  {
    "hash": "200e68fdcdb7b0679f5392045eee2c4c58f98c61",
    "shortHash": "200e68f",
    "author": "VastSea0",
    "date": "2026-06-12T02:41:55+03:00",
    "subject": "feat: improve HilalWelcome UI stability, persist site pinning, and adjust compact mode logic",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/200e68fdcdb7b0679f5392045eee2c4c58f98c61"
  },
  {
    "hash": "7959f225f6bbc4164413f8bf1f9a8cc4ff60ae62",
    "shortHash": "7959f22",
    "author": "VastSea0",
    "date": "2026-06-12T02:28:13+03:00",
    "subject": "feat: persist preference selections in HilalWelcome and update UI transparency and sidebar visibility state",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7959f225f6bbc4164413f8bf1f9a8cc4ff60ae62"
  },
  {
    "hash": "991734dea99d9b30e9657f778c5ecdc4fe889b4f",
    "shortHash": "991734d",
    "author": "VastSea0",
    "date": "2026-06-12T02:16:39+03:00",
    "subject": "feat: introduce welcome stage awareness and refined compact mode toggle logic in HilalCompactMode",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/991734dea99d9b30e9657f778c5ecdc4fe889b4f"
  },
  {
    "hash": "381efba06d2389f8b76b6f9f89333b5d29ebc725",
    "shortHash": "381efba",
    "author": "VastSea0",
    "date": "2026-06-12T00:51:55+03:00",
    "subject": "refactor: remove browser chrome hiding logic and redesign HilalWelcome UI components",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/381efba06d2389f8b76b6f9f89333b5d29ebc725"
  },
  {
    "hash": "36ed74be6671114f349c693d36ac6ed347cd894d",
    "shortHash": "36ed74b",
    "author": "VastSea0",
    "date": "2026-06-11T10:11:24+03:00",
    "subject": "ci: move --enable-linker=lld to linux-only mozconfig, fixing windows build configure crash",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/36ed74be6671114f349c693d36ac6ed347cd894d"
  },
  {
    "hash": "86040b1af9807958c0ff05da0958a7289a4c4907",
    "shortHash": "86040b1",
    "author": "VastSea0",
    "date": "2026-06-10T23:55:40+03:00",
    "subject": "ci: remove sccache GHA backend and cache local sccache directories instead",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/86040b1af9807958c0ff05da0958a7289a4c4907"
  },
  {
    "hash": "ef3549b9e7182629796a9173b80386d99959f363",
    "shortHash": "ef3549b",
    "author": "VastSea0",
    "date": "2026-06-10T18:51:30+03:00",
    "subject": "ci: fix release authentication by explicitly passing GITHUB_TOKEN and add AUTOCLOBBER to base mozconfig",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ef3549b9e7182629796a9173b80386d99959f363"
  },
  {
    "hash": "92bdf9ab8203661ac253cc7f78246ee4d9200306",
    "shortHash": "92bdf9a",
    "author": "VastSea0",
    "date": "2026-06-10T17:57:55+03:00",
    "subject": "refactor: simplify pinned site rendering logic and improve code formatting in HilalWelcome.js",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/92bdf9ab8203661ac253cc7f78246ee4d9200306"
  },
  {
    "hash": "f3281bedd5267c4da40ba7e5105a8f274a741920",
    "shortHash": "f3281be",
    "author": "VastSea0",
    "date": "2026-06-10T12:14:15+03:00",
    "subject": "feat: enable pinned workspaces by default and add pinned site builder to welcome UI",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f3281bedd5267c4da40ba7e5105a8f274a741920"
  },
  {
    "hash": "03a0db57b7f2932cd4abac6042509775dc8d690f",
    "shortHash": "03a0db5",
    "author": "VastSea0",
    "date": "2026-06-10T12:03:31+03:00",
    "subject": "ci: optimize builds with lld, disable lto, enable release, and make windows sccache setup robust",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/03a0db57b7f2932cd4abac6042509775dc8d690f"
  },
  {
    "hash": "d079e03743488d8fd912c469fd3d6454d8bc9b26",
    "shortHash": "d079e03",
    "author": "VastSea0",
    "date": "2026-06-10T11:45:22+03:00",
    "subject": "ci: platform selection, proper sccache setup, resilient artifact uploads",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d079e03743488d8fd912c469fd3d6454d8bc9b26"
  },
  {
    "hash": "238ddd3c15aef1c16e28601b2cd726c52e00e80e",
    "shortHash": "238ddd3",
    "author": "VastSea0",
    "date": "2026-06-10T11:03:12+03:00",
    "subject": "ci: fix linux sccache failure, fix windows OOM, upload all binaries immediately",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/238ddd3c15aef1c16e28601b2cd726c52e00e80e"
  },
  {
    "hash": "f50bc40791d17cac20fbf54784f03e13dae08fba",
    "shortHash": "f50bc40",
    "author": "VastSea0",
    "date": "2026-06-09T16:37:02+03:00",
    "subject": "ci: fix windows artifact paths and add immediate upload for binaries",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f50bc40791d17cac20fbf54784f03e13dae08fba"
  },
  {
    "hash": "aba9af9e8a5332ae0f52e7c0fdad4463f96b7ac3",
    "shortHash": "aba9af9",
    "author": "VastSea0",
    "date": "2026-06-09T13:21:08+03:00",
    "subject": "Update documentation to include instructions for compiling hil patch manager from source",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/aba9af9e8a5332ae0f52e7c0fdad4463f96b7ac3"
  },
  {
    "hash": "52d08fcc1d017aaf38bd159e1384221e23c88a02",
    "shortHash": "52d08fc",
    "author": "VastSea0",
    "date": "2026-06-09T12:54:42+03:00",
    "subject": "Bump version to 0.3.0-alpha.3",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/52d08fcc1d017aaf38bd159e1384221e23c88a02"
  },
  {
    "hash": "71e334eaccc534ee62d198e680b6a0dd5d60948b",
    "shortHash": "71e334e",
    "author": "VastSea0",
    "date": "2026-06-09T12:28:53+03:00",
    "subject": "Fix Windows build NSIS path lookup and enable sccache caching",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/71e334eaccc534ee62d198e680b6a0dd5d60948b"
  },
  {
    "hash": "7526c9a9e4c87da03261e40cdc887f120eeb4d41",
    "shortHash": "7526c9a",
    "author": "VastSea0",
    "date": "2026-06-09T09:11:22+03:00",
    "subject": "fix: add NSIS to PATH for Windows builder",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7526c9a9e4c87da03261e40cdc887f120eeb4d41"
  },
  {
    "hash": "5be0ffcb3912fdb81103d269261cb5d69168b43c",
    "shortHash": "5be0ffc",
    "author": "VastSea0",
    "date": "2026-06-09T01:20:58+03:00",
    "subject": "release: bump version to 0.3.0-alpha.2",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5be0ffcb3912fdb81103d269261cb5d69168b43c"
  },
  {
    "hash": "99a1703df1b017b3bdeea8524fa0594d790c34e6",
    "shortHash": "99a1703",
    "author": "VastSea0",
    "date": "2026-06-08T16:17:18+03:00",
    "subject": "docs: remove AI-generated marketing language throughout",
    "body": "",
    "category": "docs",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/99a1703df1b017b3bdeea8524fa0594d790c34e6"
  },
  {
    "hash": "da3d4d6e6a278287ce487c1c9f721f819e0a9495",
    "shortHash": "da3d4d6",
    "author": "VastSea0",
    "date": "2026-06-08T05:45:46+03:00",
    "subject": "test: add integration test for theme-color extraction and auto accent",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/da3d4d6e6a278287ce487c1c9f721f819e0a9495"
  },
  {
    "hash": "709a6b7bc55a64a3f3a69a389b9dab917cf5b58e",
    "shortHash": "709a6b7",
    "author": "VastSea0",
    "date": "2026-06-08T04:50:39+03:00",
    "subject": "fix: harden HilalBoosts state handling",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/709a6b7bc55a64a3f3a69a389b9dab917cf5b58e"
  },
  {
    "hash": "b09534d39b5b5d77539842edbacde16efd3fdfb6",
    "shortHash": "b09534d",
    "author": "VastSea0",
    "date": "2026-06-08T02:45:25+03:00",
    "subject": "refactor: update patches for automated color extraction and preference controls",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b09534d39b5b5d77539842edbacde16efd3fdfb6"
  },
  {
    "hash": "ed7f47b608e02a4ac4e4a9a5844671bc34465b23",
    "shortHash": "ed7f47b",
    "author": "VastSea0",
    "date": "2026-06-08T02:13:08+03:00",
    "subject": "feat: implement automated theme color extraction and UI palette generation for HilalBoosts",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ed7f47b608e02a4ac4e4a9a5844671bc34465b23"
  },
  {
    "hash": "8dc25c33cc8028fa704dc95d3c69f4501200d02e",
    "shortHash": "8dc25c3",
    "author": "VastSea0",
    "date": "2026-06-08T02:07:45+03:00",
    "subject": "feat: add preferences and UI checkboxes for site customizer and dynamic tinting features",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8dc25c33cc8028fa704dc95d3c69f4501200d02e"
  },
  {
    "hash": "c20dbdb4ebefc407e069c99d703727254e14b8ab",
    "shortHash": "c20dbdb",
    "author": "VastSea0",
    "date": "2026-06-08T00:10:41+03:00",
    "subject": "fix: remove background styling for toolbars on macOS when in custom window mode",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c20dbdb4ebefc407e069c99d703727254e14b8ab"
  },
  {
    "hash": "ce7369adbb96831a3972716f925aa91799f8ef85",
    "shortHash": "ce7369a",
    "author": "VastSea0",
    "date": "2026-06-08T00:05:00+03:00",
    "subject": "refactor: migrate color-mix color space to oklch and add URL bar styling to Hilal UI overrides",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ce7369adbb96831a3972716f925aa91799f8ef85"
  },
  {
    "hash": "7b546e4c92cfdc9c0e6dfd37e988a192620df82e",
    "shortHash": "7b546e4",
    "author": "VastSea0",
    "date": "2026-06-07T23:56:03+03:00",
    "subject": "feat: implement dynamic browser UI coloring and add toggle controls to Hilal Boosts interface",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7b546e4c92cfdc9c0e6dfd37e988a192620df82e"
  },
  {
    "hash": "c4971188ceec1a48bce881fd7a779eb25e691ca2",
    "shortHash": "c497118",
    "author": "VastSea0",
    "date": "2026-06-07T23:43:10+03:00",
    "subject": "feat: overhaul HilalBoosts UI with custom color picker panel and integrate domain-based host retrieval",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c4971188ceec1a48bce881fd7a779eb25e691ca2"
  },
  {
    "hash": "912239b8afc9727f55b80c40cbbec8b0c89dc33a",
    "shortHash": "912239b",
    "author": "VastSea0",
    "date": "2026-06-07T23:22:21+03:00",
    "subject": "feat: register actor events and implement document-based initialization throttling for HilalBoosts",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/912239b8afc9727f55b80c40cbbec8b0c89dc33a"
  },
  {
    "hash": "2c686249e64ac64fb347f51e503e589c50b88512",
    "shortHash": "2c68624",
    "author": "VastSea0",
    "date": "2026-06-07T23:17:31+03:00",
    "subject": "refactor: simplify domain resolution logic in HilalBoosts by traversing parent documents instead of browsing contexts",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2c686249e64ac64fb347f51e503e589c50b88512"
  },
  {
    "hash": "c9e7849b4fc230d47c7856f2e35510aadff01ec3",
    "shortHash": "c9e7849",
    "author": "VastSea0",
    "date": "2026-06-07T23:09:47+03:00",
    "subject": "refactor: key Hilal boosts by domain instead of browsing context ID for cross-tab persistence",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c9e7849b4fc230d47c7856f2e35510aadff01ec3"
  },
  {
    "hash": "8f946bf94c60b1ec10d65b1e2b99f470e71d22fe",
    "shortHash": "8f946bf",
    "author": "VastSea0",
    "date": "2026-06-07T23:04:56+03:00",
    "subject": "refactor: replace CSS filter-based boosts with backend-driven layout-level color processing via messaging actors",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8f946bf94c60b1ec10d65b1e2b99f470e71d22fe"
  },
  {
    "hash": "23918968a979820c50e269898f1fbcf490cfa69c",
    "shortHash": "2391896",
    "author": "VastSea0",
    "date": "2026-06-07T22:34:03+03:00",
    "subject": "refactor: implement GPU-accelerated CSS filter-based page styling and enhance color picker interactivity with dynamic arc overlays",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/23918968a979820c50e269898f1fbcf490cfa69c"
  },
  {
    "hash": "bf13c9837ddf9e079c4e4efc046311f9cc68d6ea",
    "shortHash": "bf13c98",
    "author": "VastSea0",
    "date": "2026-06-07T22:04:18+03:00",
    "subject": "feat: implement enhanced site customizer panel for Hilal Boosts with advanced color selection and gradient controls",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bf13c9837ddf9e079c4e4efc046311f9cc68d6ea"
  },
  {
    "hash": "0fe2ebd0730a47d379bffea9dfd25533aca37f0e",
    "shortHash": "0fe2ebd",
    "author": "VastSea0",
    "date": "2026-06-07T19:45:07+03:00",
    "subject": "Enhance HilalBoosts initialization and preferences reading safety",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0fe2ebd0730a47d379bffea9dfd25533aca37f0e"
  },
  {
    "hash": "5f222d7e28413b94c882e25771c8266605058653",
    "shortHash": "5f222d7",
    "author": "VastSea0",
    "date": "2026-06-07T19:43:14+03:00",
    "subject": "Fix JSWindowActor event listener registration in HilalBoosts.js",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5f222d7e28413b94c882e25771c8266605058653"
  },
  {
    "hash": "11bbe45f55b1c7d69276f877e4fbe86ae24d6f4a",
    "shortHash": "11bbe45",
    "author": "VastSea0",
    "date": "2026-06-07T19:41:44+03:00",
    "subject": "Implement Hilal Boosts (Site Customizer and Element Zapper)",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/11bbe45f55b1c7d69276f877e4fbe86ae24d6f4a"
  },
  {
    "hash": "31d4df2e51bbf04b3d8c77b0e8647f3f426b273c",
    "shortHash": "31d4df2",
    "author": "VastSea0",
    "date": "2026-06-07T19:20:06+03:00",
    "subject": "Add workspace drag-and-drop sorting and tab-to-workspace drop support in redesigned sidebar",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/31d4df2e51bbf04b3d8c77b0e8647f3f426b273c"
  },
  {
    "hash": "2bd38b198a064beed0d14e04a5050301fec24a8f",
    "shortHash": "2bd38b1",
    "author": "VastSea0",
    "date": "2026-06-07T19:14:44+03:00",
    "subject": "Implement drag-and-drop and context menu reordering for workspaces",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2bd38b198a064beed0d14e04a5050301fec24a8f"
  },
  {
    "hash": "6bbf2525214bf4a21cb3e1038404bc63129ac113",
    "shortHash": "6bbf252",
    "author": "VastSea0",
    "date": "2026-06-07T19:10:52+03:00",
    "subject": "feat: prevent compact mode elements from auto-hiding while popups are active",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6bbf2525214bf4a21cb3e1038404bc63129ac113"
  },
  {
    "hash": "4df2deb8c37fe008b7b1fa43d2e5f5b91c481334",
    "shortHash": "4df2deb",
    "author": "VastSea0",
    "date": "2026-06-07T17:36:46+03:00",
    "subject": "refactor: modernize keyboard shortcut preferences UI and update default modifier keys to alt",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4df2deb8c37fe008b7b1fa43d2e5f5b91c481334"
  },
  {
    "hash": "063c4e489be2901b6c595c6779400900d953ecf8",
    "shortHash": "063c4e4",
    "author": "VastSea0",
    "date": "2026-06-07T01:57:17+03:00",
    "subject": "feat: replace JSON file-based shortcut overrides with preference-based storage and expand workspace-related keyboard commands",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/063c4e489be2901b6c595c6779400900d953ecf8"
  },
  {
    "hash": "26d16fa3261eac4a79354529145aa189563f568c",
    "shortHash": "26d16fa",
    "author": "VastSea0",
    "date": "2026-06-07T01:42:11+03:00",
    "subject": "refactor: rename shortcut reset button and structure shortcut list with a table element",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/26d16fa3261eac4a79354529145aa189563f568c"
  },
  {
    "hash": "106d50f2c34f605d5e6ad86a00417239df9275b3",
    "shortHash": "106d50f",
    "author": "VastSea0",
    "date": "2026-06-07T01:11:02+03:00",
    "subject": "docs: add star history chart to README",
    "body": "",
    "category": "docs",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/106d50f2c34f605d5e6ad86a00417239df9275b3"
  },
  {
    "hash": "31770a907588224a7979d1646ad168dbded1ad5f",
    "shortHash": "31770a9",
    "author": "VastSea0",
    "date": "2026-06-07T01:08:33+03:00",
    "subject": "feat: implement customizable keyboard shortcuts management and UI integration",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/31770a907588224a7979d1646ad168dbded1ad5f"
  },
  {
    "hash": "cc50fd1c4c544781519f4f9b0e864f3af479ab8d",
    "shortHash": "cc50fd1",
    "author": "VastSea0",
    "date": "2026-06-07T00:32:57+03:00",
    "subject": "feat: implement custom keyboard shortcuts management system with preferences UI",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/cc50fd1c4c544781519f4f9b0e864f3af479ab8d"
  },
  {
    "hash": "b30fdcae6940b02a14a1432024e438082ab8ddcc",
    "shortHash": "b30fdca",
    "author": "VastSea0",
    "date": "2026-06-06T23:18:22+03:00",
    "subject": "feat: add browser chrome test scenarios for Hilal workspace and compact mode functionality",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b30fdcae6940b02a14a1432024e438082ab8ddcc"
  },
  {
    "hash": "9824da07b3780cfdc505e7bbb236441f5cc7070d",
    "shortHash": "9824da0",
    "author": "VastSea0",
    "date": "2026-06-06T22:47:02+03:00",
    "subject": "feat: implement keyboard-navigable command palette style download modal with improved UX",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9824da07b3780cfdc505e7bbb236441f5cc7070d"
  },
  {
    "hash": "4743e650b1ffd48e20e25a8330e1c2c61e019f6b",
    "shortHash": "4743e65",
    "author": "VastSea0",
    "date": "2026-06-06T22:35:26+03:00",
    "subject": "feat: enable multi-locale support and add localization management utilities",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4743e650b1ffd48e20e25a8330e1c2c61e019f6b"
  },
  {
    "hash": "7d586701f3c5f8549deacee457c56b7bba0b1272",
    "shortHash": "7d58670",
    "author": "VastSea0",
    "date": "2026-06-06T22:32:14+03:00",
    "subject": "Rewrite download modal from scratch to enforce single-trigger download",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7d586701f3c5f8549deacee457c56b7bba0b1272"
  },
  {
    "hash": "539ede22fa18e6b6eb53272e29f5f1e862956636",
    "shortHash": "539ede2",
    "author": "VastSea0",
    "date": "2026-06-06T22:30:36+03:00",
    "subject": "Redesign download modal with premium glassmorphism and animated progress flows",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/539ede22fa18e6b6eb53272e29f5f1e862956636"
  },
  {
    "hash": "57a4546f9e0501c66f415671d89a334d722004b3",
    "shortHash": "57a4546",
    "author": "VastSea0",
    "date": "2026-06-06T22:28:49+03:00",
    "subject": "Change navbar wrapper to fixed positioning to always track scrolling",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/57a4546f9e0501c66f415671d89a334d722004b3"
  },
  {
    "hash": "b0450346cbee15fa5c1df5612675cd5732bdaca6",
    "shortHash": "b045034",
    "author": "VastSea0",
    "date": "2026-06-06T22:27:24+03:00",
    "subject": "Make navbar dynamically float on scroll and add card stagger animations",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b0450346cbee15fa5c1df5612675cd5732bdaca6"
  },
  {
    "hash": "b672ef3c269ff46c073cd598225d54d4356b144c",
    "shortHash": "b672ef3",
    "author": "VastSea0",
    "date": "2026-06-06T22:24:43+03:00",
    "subject": "Redesign website landing page matching Arc visual language guidelines",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b672ef3c269ff46c073cd598225d54d4356b144c"
  },
  {
    "hash": "0ce44f8d15eb966321de3a3296cba55cf844e61d",
    "shortHash": "0ce44f8",
    "author": "VastSea0",
    "date": "2026-06-06T22:05:52+03:00",
    "subject": "feat: implement floating capsule navigation bar and add mesh/noise background visual styles",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0ce44f8d15eb966321de3a3296cba55cf844e61d"
  },
  {
    "hash": "4de79d10fd35540a5f8bf4eee3256760f89dee18",
    "shortHash": "4de79d1",
    "author": "VastSea0",
    "date": "2026-06-06T21:54:59+03:00",
    "subject": "feat: add support for tarball/zip build artifacts and implement mesh backgrounds with noise overlays",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4de79d10fd35540a5f8bf4eee3256760f89dee18"
  },
  {
    "hash": "c3aa4f82cfd368d729b3ac2f8af6f9b81e87885c",
    "shortHash": "c3aa4f8",
    "author": "VastSea0",
    "date": "2026-06-05T13:16:20+03:00",
    "subject": "Fix branding icon search path in build-appimage.sh",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c3aa4f82cfd368d729b3ac2f8af6f9b81e87885c"
  },
  {
    "hash": "53325cb548edc74254b3254ae92b68932e1c01d8",
    "shortHash": "53325cb",
    "author": "VastSea0",
    "date": "2026-06-05T10:38:10+03:00",
    "subject": "Free up disk space on Linux runner before compilation",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/53325cb548edc74254b3254ae92b68932e1c01d8"
  },
  {
    "hash": "624fc8b0a007ea2bf318a7618e49c730088c0142",
    "shortHash": "624fc8b",
    "author": "VastSea0",
    "date": "2026-06-05T10:09:03+03:00",
    "subject": "Fix Linux build job to trigger full build before packaging",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/624fc8b0a007ea2bf318a7618e49c730088c0142"
  },
  {
    "hash": "0da197dce5fcb1b5569fd08b0b5cf11bf69ec11d",
    "shortHash": "0da197d",
    "author": "VastSea0",
    "date": "2026-06-05T01:10:09+03:00",
    "subject": "Optimize patch manager performance and release workflow caching",
    "body": "",
    "category": "perf",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0da197dce5fcb1b5569fd08b0b5cf11bf69ec11d"
  },
  {
    "hash": "f78784102aa934f22a704ba5b5792cb016a52804",
    "shortHash": "f787841",
    "author": "VastSea0",
    "date": "2026-06-05T00:33:36+03:00",
    "subject": "fix: update MozillaBuild setup link to Latest",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f78784102aa934f22a704ba5b5792cb016a52804"
  },
  {
    "hash": "2d42ef3a22280ea913e33224d025a69ab62a3ec8",
    "shortHash": "2d42ef3",
    "author": "VastSea0",
    "date": "2026-06-05T00:29:30+03:00",
    "subject": "fix: update MozillaBuild setup to download and install silently in Windows job",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2d42ef3a22280ea913e33224d025a69ab62a3ec8"
  },
  {
    "hash": "069fe89e4c82221e00e2c442ed8623f3a252a6c5",
    "shortHash": "069fe89",
    "author": "VastSea0",
    "date": "2026-06-05T00:13:37+03:00",
    "subject": "release: update Flatpak source tag to v0.3.0-alpha.1",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/069fe89e4c82221e00e2c442ed8623f3a252a6c5"
  },
  {
    "hash": "005fa2acece00fd4686ec7f621289952c70e04cd",
    "shortHash": "005fa2a",
    "author": "VastSea0",
    "date": "2026-06-05T00:10:13+03:00",
    "subject": "release: bump version to 0.3.0-alpha.1",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/005fa2acece00fd4686ec7f621289952c70e04cd"
  },
  {
    "hash": "7e0cc1ed6ec6065e9f27de6fd72f8a198ce81152",
    "shortHash": "7e0cc1e",
    "author": "VastSea0",
    "date": "2026-06-05T00:06:24+03:00",
    "subject": "feat: add Linux and Windows release build workflows to GitHub Actions and remove obsolete audit documentation",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7e0cc1ed6ec6065e9f27de6fd72f8a198ce81152"
  },
  {
    "hash": "b866b52117e91487790db73380d5f72b33806902",
    "shortHash": "b866b52",
    "author": "VastSea0",
    "date": "2026-06-04T22:57:37+03:00",
    "subject": "feat: update language selection logic to use Services.locale and add macOS distribution documentation",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b866b52117e91487790db73380d5f72b33806902"
  },
  {
    "hash": "f1fe8cd10cea3eb5a6b2b4ddbf8cb52a15b18b21",
    "shortHash": "f1fe8cd",
    "author": "VastSea0",
    "date": "2026-06-04T21:29:03+03:00",
    "subject": "fix: clarify development readiness checks",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f1fe8cd10cea3eb5a6b2b4ddbf8cb52a15b18b21"
  },
  {
    "hash": "9671f2b940549ce106380b9ec1a3a18e90e53962",
    "shortHash": "9671f2b",
    "author": "VastSea0",
    "date": "2026-06-04T20:38:18+03:00",
    "subject": "feat: replace browser preview component with interactive screenshot cards in HilalWelcome",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9671f2b940549ce106380b9ec1a3a18e90e53962"
  },
  {
    "hash": "6988a274269ac0b201dbf43aaab2debe3a9db238",
    "shortHash": "6988a27",
    "author": "VastSea0",
    "date": "2026-06-04T20:04:39+03:00",
    "subject": "fix: enforce release metadata chain",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6988a274269ac0b201dbf43aaab2debe3a9db238"
  },
  {
    "hash": "8fe1a8e4fbc63bead481db5da50fc3fb56690f82",
    "shortHash": "8fe1a8e",
    "author": "VastSea0",
    "date": "2026-06-04T15:04:35+03:00",
    "subject": "fix: update hil setup comment after removing legacy fallback",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8fe1a8e4fbc63bead481db5da50fc3fb56690f82"
  },
  {
    "hash": "b6bb7a7587f2b80f29d17a2361429de2c02ec64b",
    "shortHash": "b6bb7a7",
    "author": "VastSea0",
    "date": "2026-06-04T15:02:29+03:00",
    "subject": "test: update smoke test to use custom HTML, set window size, and improve screenshot validation",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b6bb7a7587f2b80f29d17a2361429de2c02ec64b"
  },
  {
    "hash": "5f7045fbee2a3c11abfe86fd9ce5d16cc300f922",
    "shortHash": "5f7045f",
    "author": "VastSea0",
    "date": "2026-06-04T15:02:10+03:00",
    "subject": "feat: add validate command to hil to check manifest integrity and update release metadata checks",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5f7045fbee2a3c11abfe86fd9ce5d16cc300f922"
  },
  {
    "hash": "c12a2e7492f0e423eedd14a37bfd7abe9d0d8f0a",
    "shortHash": "c12a2e7",
    "author": "VastSea0",
    "date": "2026-06-04T15:00:29+03:00",
    "subject": "feat: add smoke test script for browser release verification and introduce stable readiness documentation",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c12a2e7492f0e423eedd14a37bfd7abe9d0d8f0a"
  },
  {
    "hash": "03a3ff6c5859b393f5446453d4615014baaff298",
    "shortHash": "03a3ff6",
    "author": "VastSea0",
    "date": "2026-06-04T14:56:47+03:00",
    "subject": "docs: add reference screenshots for compact layout mode configurations",
    "body": "",
    "category": "docs",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/03a3ff6c5859b393f5446453d4615014baaff298"
  },
  {
    "hash": "bf74d3d26620f2ee05bf4a6cda6ecec4b19b3dd9",
    "shortHash": "bf74d3d",
    "author": "VastSea0",
    "date": "2026-06-04T13:34:46+03:00",
    "subject": "fix: make welcome layout previews realistic",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bf74d3d26620f2ee05bf4a6cda6ecec4b19b3dd9"
  },
  {
    "hash": "431230f2bedd25b844be03f3974ff9d95cbff40a",
    "shortHash": "431230f",
    "author": "VastSea0",
    "date": "2026-06-04T13:24:20+03:00",
    "subject": "feat: add welcome layout personalization",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/431230f2bedd25b844be03f3974ff9d95cbff40a"
  },
  {
    "hash": "c1a2c77a5bd0bf4a121d65110922d1d7676f4752",
    "shortHash": "c1a2c77",
    "author": "VastSea0",
    "date": "2026-06-04T02:26:44+03:00",
    "subject": "fix: enable aboutwelcome page in browser branding preferences",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c1a2c77a5bd0bf4a121d65110922d1d7676f4752"
  },
  {
    "hash": "3bd81ae0f96f5671ae1e87123e7a5f4f60637bd3",
    "shortHash": "3bd81ae",
    "author": "VastSea0",
    "date": "2026-06-04T02:20:56+03:00",
    "subject": "Update compact-mode-preferences.patch to default-enable compact mode",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3bd81ae0f96f5671ae1e87123e7a5f4f60637bd3"
  },
  {
    "hash": "6b32531a0da444feaf06a386533984648094e0c8",
    "shortHash": "6b32531",
    "author": "VastSea0",
    "date": "2026-06-04T02:12:48+03:00",
    "subject": "feat: implement auto-hiding floating top toolbar and refine compact sidebar tab aesthetics.",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6b32531a0da444feaf06a386533984648094e0c8"
  },
  {
    "hash": "1bf0cce5509cc74693e37297d1584910ead09bfa",
    "shortHash": "1bf0cce",
    "author": "VastSea0",
    "date": "2026-06-04T01:42:07+03:00",
    "subject": "Update l10n strings and compact-mode defaults",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/1bf0cce5509cc74693e37297d1584910ead09bfa"
  },
  {
    "hash": "8c90e7352d99f85f30dcb19243fe8071d1383c04",
    "shortHash": "8c90e73",
    "author": "VastSea0",
    "date": "2026-06-04T01:40:32+03:00",
    "subject": "feat: enable compact mode by default and hide toolbox in preferences",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8c90e7352d99f85f30dcb19243fe8071d1383c04"
  },
  {
    "hash": "91967caeb437a8836bacd94a7c6d094d9dde26d1",
    "shortHash": "91967ca",
    "author": "VastSea0",
    "date": "2026-06-04T01:36:45+03:00",
    "subject": "feat: add uBlock Origin extension and update certificate configuration for release channels",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/91967caeb437a8836bacd94a7c6d094d9dde26d1"
  },
  {
    "hash": "761b5dfe71264b482a54abd4ff0e7fd857e92167",
    "shortHash": "761b5df",
    "author": "VastSea0",
    "date": "2026-06-04T01:36:34+03:00",
    "subject": "feat: include uBlock Origin and update update channel certificate logic",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/761b5dfe71264b482a54abd4ff0e7fd857e92167"
  },
  {
    "hash": "0d62345ed4998e04046f8f937385503649f176bf",
    "shortHash": "0d62345",
    "author": "VastSea0",
    "date": "2026-06-04T01:28:58+03:00",
    "subject": "Refresh patches: fix sidebar redesign context, reset-toolbar fix, l10n strings",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0d62345ed4998e04046f8f937385503649f176bf"
  },
  {
    "hash": "7b49d772df452e2fb2617b5aabbd59fd49325325",
    "shortHash": "7b49d77",
    "author": "VastSea0",
    "date": "2026-06-04T01:22:16+03:00",
    "subject": "Fix sidebar redesign: apply patch inline, add missing compact/language l10n strings",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7b49d772df452e2fb2617b5aabbd59fd49325325"
  },
  {
    "hash": "7dbe84fa107f256a29d868a2126bc46b93e396d7",
    "shortHash": "7dbe84f",
    "author": "VastSea0",
    "date": "2026-06-04T01:22:00+03:00",
    "subject": "feat: add sidebar configuration prefs",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7dbe84fa107f256a29d868a2126bc46b93e396d7"
  },
  {
    "hash": "d9018e5cd403cf75d899fbe2d67f1cb17ccba06c",
    "shortHash": "d9018e5",
    "author": "VastSea0",
    "date": "2026-06-04T01:10:53+03:00",
    "subject": "refactor: update welcome flow copy and terminology across English and Turkish locales",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d9018e5cd403cf75d899fbe2d67f1cb17ccba06c"
  },
  {
    "hash": "59050d10e1a6c0f219f03a7901b320658ce8b9b5",
    "shortHash": "59050d1",
    "author": "VastSea0",
    "date": "2026-06-04T01:10:53+03:00",
    "subject": "refactor: update welcome flow copy and terminology across English and Turkish locales",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/59050d10e1a6c0f219f03a7901b320658ce8b9b5"
  },
  {
    "hash": "ef9d607c33079d4160a7990c368a6298d542c4ce",
    "shortHash": "ef9d607",
    "author": "VastSea0",
    "date": "2026-06-04T01:10:45+03:00",
    "subject": "feat: add shared theme assets and icons for browser UI components and app marketplace",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ef9d607c33079d4160a7990c368a6298d542c4ce"
  },
  {
    "hash": "eb41353730f9e2e08be5fba2268010044f47229c",
    "shortHash": "eb41353",
    "author": "VastSea0",
    "date": "2026-06-04T01:10:02+03:00",
    "subject": "feat: update HilalWelcome integration",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/eb41353730f9e2e08be5fba2268010044f47229c"
  },
  {
    "hash": "fb3222361e9a3d7f864c1797e62c00ab1bb5be07",
    "shortHash": "fb32223",
    "author": "VastSea0",
    "date": "2026-06-04T01:04:03+03:00",
    "subject": "feat: add UI assets, styling tokens, and core themes for browser redesign",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/fb3222361e9a3d7f864c1797e62c00ab1bb5be07"
  },
  {
    "hash": "d014d04ad23b6a0256396b4dda038dce8aab862d",
    "shortHash": "d014d04",
    "author": "VastSea0",
    "date": "2026-06-04T01:03:54+03:00",
    "subject": "feat: add comprehensive browser theme assets, CSS styles, and icon resources",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d014d04ad23b6a0256396b4dda038dce8aab862d"
  },
  {
    "hash": "ab399b605d0f8265387fb82cdaf690ec11ebbcd9",
    "shortHash": "ab399b6",
    "author": "VastSea0",
    "date": "2026-06-04T00:44:58+03:00",
    "subject": "Fix toolbar reset: move initialization before async addon callback",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ab399b605d0f8265387fb82cdaf690ec11ebbcd9"
  },
  {
    "hash": "ef1c80fbfab18c547f40374e963f9bb18f248370",
    "shortHash": "ef1c80f",
    "author": "VastSea0",
    "date": "2026-06-04T00:38:43+03:00",
    "subject": "fix(toolbar): defer toolbar reset until theme database is ready",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ef1c80fbfab18c547f40374e963f9bb18f248370"
  },
  {
    "hash": "727fa2c79c8e0e9f1f15e4eb1b3b7776eeade457",
    "shortHash": "727fa2c",
    "author": "VastSea0",
    "date": "2026-06-04T00:32:46+03:00",
    "subject": "Fix AsyncTabSwitcher and Tabbrowser errors during tab switching",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/727fa2c79c8e0e9f1f15e4eb1b3b7776eeade457"
  },
  {
    "hash": "bae098c6d2c11745b81ab602634b713193072205",
    "shortHash": "bae098c",
    "author": "VastSea0",
    "date": "2026-06-04T00:24:21+03:00",
    "subject": "Reset toolbar layout to defaults on first run",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bae098c6d2c11745b81ab602634b713193072205"
  },
  {
    "hash": "43c70c00a207900d7817e70580af5a429d0f4989",
    "shortHash": "43c70c0",
    "author": "VastSea0",
    "date": "2026-06-03T23:41:54+03:00",
    "subject": "Add browser/components/preferences/hilal.inc.xhtml to manifest.toml",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/43c70c00a207900d7817e70580af5a429d0f4989"
  },
  {
    "hash": "c6e410d145f6c0222e6884d8117b3536081ce2b6",
    "shortHash": "c6e410d",
    "author": "VastSea0",
    "date": "2026-06-03T22:48:05+03:00",
    "subject": "ci: add release metadata guardrails",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c6e410d145f6c0222e6884d8117b3536081ce2b6"
  },
  {
    "hash": "478aab8539a0f405431a63fafd1d484a19c81f20",
    "shortHash": "478aab8",
    "author": "VastSea0",
    "date": "2026-06-03T22:48:01+03:00",
    "subject": "docs: refresh Hilal browser audit report",
    "body": "",
    "category": "docs",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/478aab8539a0f405431a63fafd1d484a19c81f20"
  },
  {
    "hash": "9340bd7bb12fcf8afed22edb4649505b363a5d29",
    "shortHash": "9340bd7",
    "author": "VastSea0",
    "date": "2026-06-03T22:30:15+03:00",
    "subject": "chore: register Hilal distribution components and UI overrides in manifest.toml and update audit report",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9340bd7bb12fcf8afed22edb4649505b363a5d29"
  },
  {
    "hash": "e8d9074a5d5fa2bb94028ccf164d4d62ac1ed7aa",
    "shortHash": "e8d9074",
    "author": "VastSea0",
    "date": "2026-06-03T22:21:28+03:00",
    "subject": "Merge branch 'main' of github.com:VastSea0/hilal-browser",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e8d9074a5d5fa2bb94028ccf164d4d62ac1ed7aa"
  },
  {
    "hash": "c539f40106fff87161b0122eafe9a4ef0f4a77e6",
    "shortHash": "c539f40",
    "author": "VastSea0",
    "date": "2026-06-03T22:17:13+03:00",
    "subject": "feat: add state tracking to prevent redundant patch application unless forced",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c539f40106fff87161b0122eafe9a4ef0f4a77e6"
  },
  {
    "hash": "d8779258921e2fce8b11e69372599005831a1ab9",
    "shortHash": "d877925",
    "author": "VastSea0",
    "date": "2026-06-03T22:17:07+03:00",
    "subject": "chore: update CSS dependencies and refine localization documentation",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d8779258921e2fce8b11e69372599005831a1ab9"
  },
  {
    "hash": "57a8769f510ee293d5003843c54ea653b71f6784",
    "shortHash": "57a8769",
    "author": "Egehan KAHRAMAN",
    "date": "2026-06-03T22:05:38+03:00",
    "subject": "Merge pull request #33 from VastSea0/feat/rust-patch-manager",
    "body": "Implement Rust-based hil Patch Manager CLI",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/57a8769f510ee293d5003843c54ea653b71f6784"
  },
  {
    "hash": "5df096a001b955721f5973a806b20ef841fe46fd",
    "shortHash": "5df096a",
    "author": "VastSea0",
    "date": "2026-06-03T22:04:40+03:00",
    "subject": "Update documentation and PR template for the new hil patch manager architecture",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5df096a001b955721f5973a806b20ef841fe46fd"
  },
  {
    "hash": "df76843740073941fdbd84d23d874b977fc0d069",
    "shortHash": "df76843",
    "author": "VastSea0",
    "date": "2026-06-03T21:41:24+03:00",
    "subject": "Update gitignore rules and include architectural report to finalize hil patch manager workflow (closes #32)",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/df76843740073941fdbd84d23d874b977fc0d069"
  },
  {
    "hash": "d73a83b5540a6f168d18ca8e4f213111e074685e",
    "shortHash": "d73a83b",
    "author": "VastSea0",
    "date": "2026-06-03T21:41:21+03:00",
    "subject": "Update workspace developer documentation for the hil tool workflow",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d73a83b5540a6f168d18ca8e4f213111e074685e"
  },
  {
    "hash": "4362a60e6f56c445ce6bd76c972cb61ba424bcfa",
    "shortHash": "4362a60",
    "author": "VastSea0",
    "date": "2026-06-03T21:41:18+03:00",
    "subject": "Update CI workflows to compile and execute the hil patch manager",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4362a60e6f56c445ce6bd76c972cb61ba424bcfa"
  },
  {
    "hash": "b41ad7e2526b4752b89507d88c142045dd0a86a5",
    "shortHash": "b41ad7e",
    "author": "VastSea0",
    "date": "2026-06-03T21:41:16+03:00",
    "subject": "Update platform build and helper scripts to use the hil tool",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b41ad7e2526b4752b89507d88c142045dd0a86a5"
  },
  {
    "hash": "49cc50aeef363e680d1fc29522602b7e8ed49b3e",
    "shortHash": "49cc50a",
    "author": "VastSea0",
    "date": "2026-06-03T21:40:51+03:00",
    "subject": "Deprecate and remove legacy shell scripts",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/49cc50aeef363e680d1fc29522602b7e8ed49b3e"
  },
  {
    "hash": "c290d6d3d26760511da3cd7e5128a5b7c4087bd5",
    "shortHash": "c290d6d",
    "author": "VastSea0",
    "date": "2026-06-03T21:40:47+03:00",
    "subject": "Implement Rust-based hil patch manager CLI",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c290d6d3d26760511da3cd7e5128a5b7c4087bd5"
  },
  {
    "hash": "871be22d9bdb9ea951c0adf6a746b36a0de8a848",
    "shortHash": "871be22",
    "author": "VastSea0",
    "date": "2026-06-03T21:40:44+03:00",
    "subject": "Migrate all patches, branding, and preference assets to unified changes/ tree",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/871be22d9bdb9ea951c0adf6a746b36a0de8a848"
  },
  {
    "hash": "163682ad8cbf51225bf341893674897737aeb804",
    "shortHash": "163682a",
    "author": "VastSea0",
    "date": "2026-06-03T21:40:29+03:00",
    "subject": "Add declarative manifest.toml and upstream.lock configurations",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/163682ad8cbf51225bf341893674897737aeb804"
  },
  {
    "hash": "64e4bec146af4b864ea189c0218e807146778132",
    "shortHash": "64e4bec",
    "author": "VastSea0",
    "date": "2026-06-03T00:43:18+03:00",
    "subject": "fix compact mode sidebar spacing and visibility logic",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/64e4bec146af4b864ea189c0218e807146778132"
  },
  {
    "hash": "572642a940982073bdd9f3f891f9c7ebb59a0045",
    "shortHash": "572642a",
    "author": "VastSea0",
    "date": "2026-06-03T00:40:28+03:00",
    "subject": "feat: enhance compact sidebar functionality, update release workflow with SBOM and checksum generation",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/572642a940982073bdd9f3f891f9c7ebb59a0045"
  },
  {
    "hash": "7cf587ce0a0e013cc6fda11d30745defdb438502",
    "shortHash": "7cf587c",
    "author": "Egehan KAHRAMAN",
    "date": "2026-06-03T00:38:43+03:00",
    "subject": "Merge pull request #15 from mmapro12/main",
    "body": "Enhance Firefox setup script with fast clone option",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7cf587ce0a0e013cc6fda11d30745defdb438502"
  },
  {
    "hash": "e1d512868131891e1a119aaefb4ef9978a73a9da",
    "shortHash": "e1d5128",
    "author": "Egehan KAHRAMAN",
    "date": "2026-06-03T00:37:33+03:00",
    "subject": "Merge branch 'main' into main",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e1d512868131891e1a119aaefb4ef9978a73a9da"
  },
  {
    "hash": "5550fc57594eeec56194fa911ca1ad14c8c3a201",
    "shortHash": "5550fc5",
    "author": "VastSea0",
    "date": "2026-06-03T00:23:59+03:00",
    "subject": "Merge branch 'main' of https://github.com/VastSea0/hilal-browser",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5550fc57594eeec56194fa911ca1ad14c8c3a201"
  },
  {
    "hash": "f16a09b731adb07df0c27e6f09e177e5dbef697b",
    "shortHash": "f16a09b",
    "author": "VastSea0",
    "date": "2026-06-03T00:23:11+03:00",
    "subject": "fix: regenerate high-resolution Windows icon assets",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f16a09b731adb07df0c27e6f09e177e5dbef697b"
  },
  {
    "hash": "a5d048a4e10e102735c77ec4698bca21e3817f61",
    "shortHash": "a5d048a",
    "author": "VastSea0",
    "date": "2026-06-03T00:21:49+03:00",
    "subject": "refactor: update Hilal source patches and refresh asset generation script",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a5d048a4e10e102735c77ec4698bca21e3817f61"
  },
  {
    "hash": "1b06353b1406e875cc23c007ebecff172f7edff9",
    "shortHash": "1b06353",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-31T22:17:54+03:00",
    "subject": "Merge pull request #31 from GreenKod/feature/packaging-pipeline",
    "body": "Feature/packaging pipeline",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/1b06353b1406e875cc23c007ebecff172f7edff9"
  },
  {
    "hash": "2399d58b9656ab3ef6ec38e9cb8a812d5c2ef47b",
    "shortHash": "2399d58",
    "author": "greenkod",
    "date": "2026-05-31T20:09:09+03:00",
    "subject": "refactor: update build-flatpak.sh script comments and error messages to English",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2399d58b9656ab3ef6ec38e9cb8a812d5c2ef47b"
  },
  {
    "hash": "ff24cc01257cc2aaa1fab4fe7e525312226fd925",
    "shortHash": "ff24cc0",
    "author": "greenkod",
    "date": "2026-05-31T19:59:47+03:00",
    "subject": "fix: update metadata license to MPL-2.0 in metainfo.xml",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ff24cc01257cc2aaa1fab4fe7e525312226fd925"
  },
  {
    "hash": "500f939a23dcaa2754b6e41e7a220014faa6e385",
    "shortHash": "500f939",
    "author": "GreenKod",
    "date": "2026-05-31T19:55:02+03:00",
    "subject": "Add secrets check to release workflow",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/500f939a23dcaa2754b6e41e7a220014faa6e385"
  },
  {
    "hash": "449aad67813c28a7ff5f957dbb2daa079700534e",
    "shortHash": "449aad6",
    "author": "GreenKod",
    "date": "2026-05-31T19:53:04+03:00",
    "subject": "Refactor code signing secrets checks in release.yml",
    "body": "Updated the conditional checks for code signing secrets in the release workflow.",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/449aad67813c28a7ff5f957dbb2daa079700534e"
  },
  {
    "hash": "e38d6186f8e1ea699e20755517261b833340779b",
    "shortHash": "e38d618",
    "author": "GreenKod",
    "date": "2026-05-31T19:50:14+03:00",
    "subject": "Refactor macOS signing workflow in release.yml",
    "body": "Refactor macOS signing workflow to use environment variables for secrets and streamline steps.",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e38d6186f8e1ea699e20755517261b833340779b"
  },
  {
    "hash": "8c5589091c35686e32c40e28d2524c63952e8627",
    "shortHash": "8c55890",
    "author": "GreenKod",
    "date": "2026-05-31T19:46:53+03:00",
    "subject": "ci(release): introduce draft-based multi-stage release pipeline",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8c5589091c35686e32c40e28d2524c63952e8627"
  },
  {
    "hash": "da9426034b9d34b055d7d66ef95fa4a89f28b903",
    "shortHash": "da94260",
    "author": "GreenKod",
    "date": "2026-05-31T19:32:47+03:00",
    "subject": "Merge branch 'VastSea0:main' into feature/packaging-pipeline",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/da9426034b9d34b055d7d66ef95fa4a89f28b903"
  },
  {
    "hash": "226eabcac220a0ed4d529ff22048684023bac273",
    "shortHash": "226eabc",
    "author": "greenkod",
    "date": "2026-05-31T19:29:43+03:00",
    "subject": "feat: add unified packaging pipeline for Flatpak and AppImage",
    "body": "Introduce a unified and automated packaging workflow for Hilal, supporting both Flatpak and AppImage distributions.\n\n- Extend build-linux.sh with dedicated commands for Flatpak and AppImage build/install workflows.\n- Add AppImage automation script (build-appimage.sh) for reproducible portable packaging.\n- Introduce Flatpak manifest (org.gkdevstudio.Hilal.json) to enable sandboxed desktop distribution.\n- Add config.yml for persistent build state tracking (build counter).\n- Add test.sh to validate packaging pipeline and improve build reliability.\n- Improve validation and user feedback across build scripts to reduce silent failures.\n\nThis improves consistency between packaging formats and simplifies release automation.",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/226eabcac220a0ed4d529ff22048684023bac273"
  },
  {
    "hash": "bd5045df2458fbdae63334b1722fdff404ea7018",
    "shortHash": "bd5045d",
    "author": "VastSea0",
    "date": "2026-05-31T01:21:56+03:00",
    "subject": "Add gif",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bd5045df2458fbdae63334b1722fdff404ea7018"
  },
  {
    "hash": "aada7336a8a8c37165dad73d8c63ede76f24985f",
    "shortHash": "aada733",
    "author": "VastSea0",
    "date": "2026-05-31T00:07:23+03:00",
    "subject": "fix: restore sidebar background to system color on macOS, revert Gemini AI integration",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/aada7336a8a8c37165dad73d8c63ede76f24985f"
  },
  {
    "hash": "119f8ac946f801164fe96903d5c6810913536027",
    "shortHash": "119f8ac",
    "author": "VastSea0",
    "date": "2026-05-30T23:42:52+03:00",
    "subject": "fix: deobfuscate host mapping at runtime in autocomplete muxer (Issue #23)",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/119f8ac946f801164fe96903d5c6810913536027"
  },
  {
    "hash": "8d24cb58d7d1d1c7a9930df40284f9d5223060ff",
    "shortHash": "8d24cb5",
    "author": "VastSea0",
    "date": "2026-05-30T23:42:46+03:00",
    "subject": "fix: initialize clean new tabs in active workspace container (Issue #26)",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8d24cb58d7d1d1c7a9930df40284f9d5223060ff"
  },
  {
    "hash": "6d38816d8dacaf761994fcc1b186448c2a318417",
    "shortHash": "6d38816",
    "author": "VastSea0",
    "date": "2026-05-30T23:42:41+03:00",
    "subject": "fix: prevent search intent leak on unknown bangs (Issue #25)",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6d38816d8dacaf761994fcc1b186448c2a318417"
  },
  {
    "hash": "09da01a71da6f6f8918c7fa35b51cd336b206c34",
    "shortHash": "09da01a",
    "author": "VastSea0",
    "date": "2026-05-30T23:26:08+03:00",
    "subject": "fix: resolve UI layout issues and insecure content warnings in Hilal UI overrides",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/09da01a71da6f6f8918c7fa35b51cd336b206c34"
  },
  {
    "hash": "2c8265afb03e69d205686d906d05e73b91e0818b",
    "shortHash": "2c8265a",
    "author": "greenkod",
    "date": "2026-05-30T19:26:17+03:00",
    "subject": "refactor: improve script documentation and enhance parameter handling in build-linux.sh",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2c8265afb03e69d205686d906d05e73b91e0818b"
  },
  {
    "hash": "3b121b229c44f161fb20676b10a2efd545fd5a28",
    "shortHash": "3b121b2",
    "author": "greenkod",
    "date": "2026-05-30T17:33:19+03:00",
    "subject": "feat: add no-lag option to build script for optimized CPU usage",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3b121b229c44f161fb20676b10a2efd545fd5a28"
  },
  {
    "hash": "07dc6f22eb7d083221b1b2406df587e2ddbc178f",
    "shortHash": "07dc6f2",
    "author": "greenkod",
    "date": "2026-05-30T16:40:20+03:00",
    "subject": "feat: enable sccache for compiler caching in Linux mozconfigs",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/07dc6f22eb7d083221b1b2406df587e2ddbc178f"
  },
  {
    "hash": "8c0abbe034b94e5d919c6e4408e27419dcda421f",
    "shortHash": "8c0abbe",
    "author": "VastSea0",
    "date": "2026-05-29T17:26:36+03:00",
    "subject": "Merge branch 'main' of https://github.com/VastSea0/hilal-browser",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8c0abbe034b94e5d919c6e4408e27419dcda421f"
  },
  {
    "hash": "d47b78522ff521f8a0eb604799191cbbf6255445",
    "shortHash": "d47b785",
    "author": "VastSea0",
    "date": "2026-05-29T17:26:26+03:00",
    "subject": "chore: initialize local git repository and update flathub configuration files",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d47b78522ff521f8a0eb604799191cbbf6255445"
  },
  {
    "hash": "740499b9918dc5ef041e0b4865d2ad4682db4d4d",
    "shortHash": "740499b",
    "author": "VastSea0",
    "date": "2026-05-29T17:26:00+03:00",
    "subject": "chore: project screenshots",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/740499b9918dc5ef041e0b4865d2ad4682db4d4d"
  },
  {
    "hash": "10664a717478854d06b768d471bf4137d10ef49a",
    "shortHash": "10664a7",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-29T12:28:56Z",
    "subject": "fix: install taskcluster Python package for Flatpak build",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/10664a717478854d06b768d471bf4137d10ef49a"
  },
  {
    "hash": "7eeb837c93f40f8365c9d4efdc00d14a74e0d1e1",
    "shortHash": "7eeb837",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-29T12:24:57Z",
    "subject": "fix: add --enable-bootstrap=no-update for Flatpak builds",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7eeb837c93f40f8365c9d4efdc00d14a74e0d1e1"
  },
  {
    "hash": "aa92fb23ece965a2c9636dcceee6594d5eb56f5b",
    "shortHash": "aa92fb2",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-29T12:20:37Z",
    "subject": "fix: chain Flatpak build commands to persist BUILD_DIR env",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/aa92fb23ece965a2c9636dcceee6594d5eb56f5b"
  },
  {
    "hash": "aca673dec4097c6f817a6a5e4962b9c364529c69",
    "shortHash": "aca673d",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-29T12:20:16Z",
    "subject": "fix: install cbindgen to writable D:\\hilal-browser/.cargo in Flatpak",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/aca673dec4097c6f817a6a5e4962b9c364529c69"
  },
  {
    "hash": "95b9d739f7b5c1554e12b011e47ddb1bb384f28f",
    "shortHash": "95b9d73",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-29T12:18:43Z",
    "subject": "fix: add cbindgen and network access for Flatpak build",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/95b9d739f7b5c1554e12b011e47ddb1bb384f28f"
  },
  {
    "hash": "0ff478870ba9a3a9480d8e321183ed48afe4ed96",
    "shortHash": "0ff4788",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-29T11:55:19Z",
    "subject": "fix: correct YAML indentation and tag commit in Flatpak manifest",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0ff478870ba9a3a9480d8e321183ed48afe4ed96"
  },
  {
    "hash": "b497cad592030a25ee4a659d008f4b794b970b75",
    "shortHash": "b497cad",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-29T11:50:31Z",
    "subject": "chore: update Flatpak manifest to v0.2.0-alpha.5 tag and Firefox commit",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b497cad592030a25ee4a659d008f4b794b970b75"
  },
  {
    "hash": "5cd04b8a3a0ecfec057e4e2327e3421b2a921a5c",
    "shortHash": "5cd04b8",
    "author": "VastSea0",
    "date": "2026-05-29T04:37:30+03:00",
    "subject": "Merge branch 'main' of https://github.com/VastSea0/hilal-browser",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5cd04b8a3a0ecfec057e4e2327e3421b2a921a5c"
  },
  {
    "hash": "13cf4b2ff009cc5fdc73821816b862161d5dc77a",
    "shortHash": "13cf4b2",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-29T01:23:38Z",
    "subject": "chore: bump version to v0.2.0-alpha.5 and update changelog",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/13cf4b2ff009cc5fdc73821816b862161d5dc77a"
  },
  {
    "hash": "877e7793ccf08113d6a1b360e5756cf1c6f70a7a",
    "shortHash": "877e779",
    "author": "VastSea0",
    "date": "2026-05-29T03:30:21+03:00",
    "subject": "feat: harden privacy features, implement workspace host obfuscation, improve sidebar UI initialization, and add automated MAR signing for release builds.",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/877e7793ccf08113d6a1b360e5756cf1c6f70a7a"
  },
  {
    "hash": "29d66380e90a6ed0f25fe001a9633936896c44e6",
    "shortHash": "29d6638",
    "author": "VastSea0",
    "date": "2026-05-29T03:17:56+03:00",
    "subject": "feat: customize Help and Feedback dialog links and preferences for Hilal Browser",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/29d66380e90a6ed0f25fe001a9633936896c44e6"
  },
  {
    "hash": "42e5d50c72074d579f3cae93a2c13ee6b8a299bc",
    "shortHash": "42e5d50",
    "author": "VastSea0",
    "date": "2026-05-29T03:11:08+03:00",
    "subject": "feat: update About Dialog links to point to Hilal project resources",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/42e5d50c72074d579f3cae93a2c13ee6b8a299bc"
  },
  {
    "hash": "0a1c3b494bece136b0ef7989d64160522a4cbf8e",
    "shortHash": "0a1c3b4",
    "author": "VastSea0",
    "date": "2026-05-29T03:06:47+03:00",
    "subject": "docs: update production signing documentation with detailed NSS setup, key rotation, and CI secret integration procedures",
    "body": "",
    "category": "docs",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0a1c3b494bece136b0ef7989d64160522a4cbf8e"
  },
  {
    "hash": "933966afe37f4159b3eaa8937d5ce3d9f1f7aa13",
    "shortHash": "933966a",
    "author": "VastSea0",
    "date": "2026-05-29T03:05:35+03:00",
    "subject": "feat: implement secure update signature verification for Hilal channels and allow unsigned MARs for development",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/933966afe37f4159b3eaa8937d5ce3d9f1f7aa13"
  },
  {
    "hash": "797fa99edbfaf2333f95dd826a378373cf695abe",
    "shortHash": "797fa99",
    "author": "VastSea0",
    "date": "2026-05-29T00:48:27+03:00",
    "subject": "Add macOS code signing, notarization, and CI integration",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/797fa99edbfaf2333f95dd826a378373cf695abe"
  },
  {
    "hash": "214bfd51f53d6163ba6dfef071c1c561f1ead64e",
    "shortHash": "214bfd5",
    "author": "VastSea0",
    "date": "2026-05-29T00:38:15+03:00",
    "subject": "feat: implement sidebar footer and custom shortcut preferences for Hilal Browser",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/214bfd51f53d6163ba6dfef071c1c561f1ead64e"
  },
  {
    "hash": "3df0d4c692d521f2fdf4470b14d6626489c3f3fb",
    "shortHash": "3df0d4c",
    "author": "VastSea0",
    "date": "2026-05-29T00:27:56+03:00",
    "subject": "ci: align verify-patches workflow with README badge and PR template",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3df0d4c692d521f2fdf4470b14d6626489c3f3fb"
  },
  {
    "hash": "37855f0c8c47b35c7e38fff6454df62393fd97aa",
    "shortHash": "37855f0",
    "author": "VastSea0",
    "date": "2026-05-29T00:19:58+03:00",
    "subject": "feat: integrate external Firefox UI fixes with management scripts and CSS overrides",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/37855f0c8c47b35c7e38fff6454df62393fd97aa"
  },
  {
    "hash": "d68db2f12187d4598897f494b86e692ce837d5ba",
    "shortHash": "d68db2f",
    "author": "VastSea0",
    "date": "2026-05-29T00:06:49+03:00",
    "subject": "ci: add workflow to verify patch application against Firefox source tree",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d68db2f12187d4598897f494b86e692ce837d5ba"
  },
  {
    "hash": "06fb55e5f08f10874d592768f3731a7a6d824c5f",
    "shortHash": "06fb55e",
    "author": "VastSea0",
    "date": "2026-05-28T23:41:58+03:00",
    "subject": "refactor: optimize workspace initial page handling and add compact mode support for sidebar footer items",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/06fb55e5f08f10874d592768f3731a7a6d824c5f"
  },
  {
    "hash": "8c2601ab2e621df939cb218c1986b36467cdb437",
    "shortHash": "8c2601a",
    "author": "VastSea0",
    "date": "2026-05-28T22:48:51+03:00",
    "subject": "style: refine vertical pinned tabs to 3x3 perfect-square grid layout with 22px icons",
    "body": "",
    "category": "style",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8c2601ab2e621df939cb218c1986b36467cdb437"
  },
  {
    "hash": "f89fc007d00765065e6588aa12280eddc34df065",
    "shortHash": "f89fc00",
    "author": "VastSea0",
    "date": "2026-05-28T22:10:35+03:00",
    "subject": "refactor: improve sanitization, robust state handling, and add interactive confirmation for force-apply scripts",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f89fc007d00765065e6588aa12280eddc34df065"
  },
  {
    "hash": "42bf2cadd3e769667d6c7d8a34876aedd9bfad17",
    "shortHash": "42bf2ca",
    "author": "VastSea0",
    "date": "2026-05-28T21:35:00+03:00",
    "subject": "refactor: improve workspace tab state synchronization by updating or appending entries instead of overwriting them",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/42bf2cadd3e769667d6c7d8a34876aedd9bfad17"
  },
  {
    "hash": "d847f038cef988bf04b018b206162baba4a3f977",
    "shortHash": "d847f03",
    "author": "VastSea0",
    "date": "2026-05-28T21:16:47+03:00",
    "subject": "style: refine compact sidebar tab sizing, spacing, and border-radius metrics",
    "body": "",
    "category": "style",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d847f038cef988bf04b018b206162baba4a3f977"
  },
  {
    "hash": "39df002fe3b57bac3c692c0bde440dfb8e9401a9",
    "shortHash": "39df002",
    "author": "VastSea0",
    "date": "2026-05-28T21:09:54+03:00",
    "subject": "refactor: update container retargeting to support URI context and adjust sidebar tab aspect ratio and constraints",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/39df002fe3b57bac3c692c0bde440dfb8e9401a9"
  },
  {
    "hash": "6b330748d65f595d993d9ab220154af8cdb08dc8",
    "shortHash": "6b33074",
    "author": "VastSea0",
    "date": "2026-05-28T20:59:10+03:00",
    "subject": "style: update compact sidebar pinned tabs grid layout and sizing for improved visibility",
    "body": "",
    "category": "style",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6b330748d65f595d993d9ab220154af8cdb08dc8"
  },
  {
    "hash": "607dc72be03e5ce04d207a82e45e65e2e13b0d69",
    "shortHash": "607dc72",
    "author": "VastSea0",
    "date": "2026-05-28T20:54:49+03:00",
    "subject": "refactor: update vertical pinned tab grid layout and reset default UI preference settings",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/607dc72be03e5ce04d207a82e45e65e2e13b0d69"
  },
  {
    "hash": "bc0fb5091cc01b0311bcaf86897adbb2b4d2dac2",
    "shortHash": "bc0fb50",
    "author": "VastSea0",
    "date": "2026-05-28T20:47:29+03:00",
    "subject": "style: overhaul vertical sidebar UI with improved tab styling, grid-based pinned tabs, and refined session state handling for real URL loading",
    "body": "",
    "category": "style",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bc0fb5091cc01b0311bcaf86897adbb2b4d2dac2"
  },
  {
    "hash": "8c538ed816defd5af76067f0a52f249f687c2c64",
    "shortHash": "8c538ed",
    "author": "VastSea0",
    "date": "2026-05-28T17:06:22+03:00",
    "subject": "style: override vertical tab styles to match hilal premium theme",
    "body": "",
    "category": "style",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8c538ed816defd5af76067f0a52f249f687c2c64"
  },
  {
    "hash": "a2a33a515a2930c57864fca6a93f4ac3f275ca61",
    "shortHash": "a2a33a5",
    "author": "VastSea0",
    "date": "2026-05-28T16:54:44+03:00",
    "subject": "refactor: integrate native slotted tabstrip inside workspaces sidebar panel",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a2a33a515a2930c57864fca6a93f4ac3f275ca61"
  },
  {
    "hash": "e40862a7dcbff849dd6a36565db6ba2d9feb51c2",
    "shortHash": "e40862a",
    "author": "VastSea0",
    "date": "2026-05-28T16:41:19+03:00",
    "subject": "fix: enforce CSS visibility and transform properties for compact mode toolbar transitions",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e40862a7dcbff849dd6a36565db6ba2d9feb51c2"
  },
  {
    "hash": "655104250072defa0d5a4b36aefb5c2f53c40e6e",
    "shortHash": "6551042",
    "author": "VastSea0",
    "date": "2026-05-28T15:56:35+03:00",
    "subject": "feat: add preference to auto-hide top toolbar in compact mode with glassmorphic hover reveal animation",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/655104250072defa0d5a4b36aefb5c2f53c40e6e"
  },
  {
    "hash": "77f7c17c4ac8bfd4b957a21828904fe01419ba1d",
    "shortHash": "77f7c17",
    "author": "VastSea0",
    "date": "2026-05-28T15:47:34+03:00",
    "subject": "refactor: update compact mode hover zone height and refine sidebar overlay transform logic",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/77f7c17c4ac8bfd4b957a21828904fe01419ba1d"
  },
  {
    "hash": "601a659c843093ca25c215ac7a47943429736223",
    "shortHash": "601a659",
    "author": "VastSea0",
    "date": "2026-05-28T15:38:02+03:00",
    "subject": "feat: add compact mode preference to control sidebar and toolbox visibility behavior",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/601a659c843093ca25c215ac7a47943429736223"
  },
  {
    "hash": "b2373c1005de743e04a478ee1c1216c84eb31a47",
    "shortHash": "b2373c1",
    "author": "VastSea0",
    "date": "2026-05-28T03:54:16+03:00",
    "subject": "fix(sidebar): resolve compact mode button opening history panel",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b2373c1005de743e04a478ee1c1216c84eb31a47"
  },
  {
    "hash": "1db3f4ce0ef862fb4451985ea3713807d4f6bf2b",
    "shortHash": "1db3f4c",
    "author": "VastSea0",
    "date": "2026-05-28T03:46:10+03:00",
    "subject": "feat: implement compact sidebar mode with auto-hide functionality and support for workspaces",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/1db3f4ce0ef862fb4451985ea3713807d4f6bf2b"
  },
  {
    "hash": "2e2ea0038ca70422c62f3025af39f69f4658830a",
    "shortHash": "2e2ea00",
    "author": "VastSea0",
    "date": "2026-05-28T03:27:39+03:00",
    "subject": "feat: implement compact hover-triggered sidebar with floating overlay support for left and right positions",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2e2ea0038ca70422c62f3025af39f69f4658830a"
  },
  {
    "hash": "2107481c84670f4403066389d06521bc97e8c163",
    "shortHash": "2107481",
    "author": "VastSea0",
    "date": "2026-05-28T03:27:30+03:00",
    "subject": "feat: integrate Hilal browser configuration, workspace bookmarks, and UI customization preferences",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2107481c84670f4403066389d06521bc97e8c163"
  },
  {
    "hash": "13ddfa7e9c7aca1ac44aa995f3c5f6aeacb80333",
    "shortHash": "13ddfa7",
    "author": "VastSea0",
    "date": "2026-05-28T03:14:10+03:00",
    "subject": "Refine sidebar hover behavior: adjust hover zone dimensions and delay timings",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/13ddfa7e9c7aca1ac44aa995f3c5f6aeacb80333"
  },
  {
    "hash": "dfb8bb5ff56daf8d31f8c7c3144ad22e447c1a28",
    "shortHash": "dfb8bb5",
    "author": "VastSea0",
    "date": "2026-05-28T02:50:44+03:00",
    "subject": "Implement hover-triggered sidebar visibility for Hilal compact mode",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/dfb8bb5ff56daf8d31f8c7c3144ad22e447c1a28"
  },
  {
    "hash": "cd6b4855169e5a472d2454461dbd352948c4a803",
    "shortHash": "cd6b485",
    "author": "VastSea0",
    "date": "2026-05-28T02:11:06+03:00",
    "subject": "Add language selection feature: enable dynamic UI localization and prompt for restart",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/cd6b4855169e5a472d2454461dbd352948c4a803"
  },
  {
    "hash": "a89295498d0761251d649e0dfea873425941c576",
    "shortHash": "a892954",
    "author": "VastSea0",
    "date": "2026-05-28T00:51:03+03:00",
    "subject": "Enhance Hilal compact mode: improve sidebar visibility and hover behavior",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a89295498d0761251d649e0dfea873425941c576"
  },
  {
    "hash": "559d54e64c3c7a1b8cd09aa6ab0407748828cd9d",
    "shortHash": "559d54e",
    "author": "VastSea0",
    "date": "2026-05-28T00:17:43+03:00",
    "subject": "Add Hilal compact mode: toolbar button hides sidebar, hover to reveal",
    "body": "The toolbar sidebar button now toggles compact mode (hilal.compact.enabled\npref). In compact mode the sidebar slides off-screen and web content\nexpands to full width. Hovering near the left edge slides the sidebar\nback in as a floating overlay, matching Zen Browser compact mode UX.\n\n- Add HilalCompactMode controller to browser-sidebar.js: manages the\n  hilal-compact-mode attribute on <html>, syncs toolbar button checked\n  state, and persists via pref observer.\n- Call HilalCompactMode.init() at end of SidebarController.init().\n- CustomizableWidgets: sidebar-button onCommand now calls\n  HilalCompactMode.toggle() instead of SidebarController internals.\n- browser-sets.js: toggleSidebarKb shortcut calls HilalCompactMode.toggle().\n- sidebar.css: compact mode CSS - fixed position sidebar slides off-screen,\n  hover reveals it with opacity + transform transition and drop shadow.\n  Splitter hidden, tabbox gets full width.\n- firefox.js: add hilal.compact.enabled default pref (false).",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/559d54e64c3c7a1b8cd09aa6ab0407748828cd9d"
  },
  {
    "hash": "a243ed466a304d5be25ec030844d83cc18eb33b1",
    "shortHash": "a243ed4",
    "author": "VastSea0",
    "date": "2026-05-28T00:02:35+03:00",
    "subject": "Fix toolbar sidebar button and keyboard shortcut for Hilal sidebar",
    "body": "When sidebar.revamp is false but hilal.workspaces.enabled or\nsidebar.verticalTabs is true, SidebarState launcherVisible and\nlauncherExpanded setters were bailing out early, leaving the toolbar\nbutton and keyboard shortcut inoperative.\n\nAdd hilalWorkspacesEnabled lazy pref getter to SidebarState.sys.mjs.\nAdd #hilalEnabled getter; broaden early-return guards to only bail\nwhen neither revampEnabled nor hilalEnabled is true.\n\nExtend browser-sidebar.js init block condition to also fire when\nhilalEnabled is true so sidebar-main is imported and initializeState\nis called. Extend updateToolbarButton to use revamp UI branch for\nHilal so the button shows correct labels and expanded state.",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a243ed466a304d5be25ec030844d83cc18eb33b1"
  },
  {
    "hash": "bb93580ce43505b712d8f1f060f4a1d31ebe8c30",
    "shortHash": "bb93580",
    "author": "VastSea0",
    "date": "2026-05-27T23:51:22+03:00",
    "subject": "Update sidebar layout redesign patch to make toolbar button and shortcut compatible with redesigned sidebar",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bb93580ce43505b712d8f1f060f4a1d31ebe8c30"
  },
  {
    "hash": "565b925cab0dd00cbd337fae100c1d9b328b1fcd",
    "shortHash": "565b925",
    "author": "VastSea0",
    "date": "2026-05-27T23:47:32+03:00",
    "subject": "Update sidebar layout redesign patch to adaptively hide workspaces switcher when disabled",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/565b925cab0dd00cbd337fae100c1d9b328b1fcd"
  },
  {
    "hash": "4a068bfc938e704c4928de8fe31b18114ad514a9",
    "shortHash": "4a068bf",
    "author": "VastSea0",
    "date": "2026-05-27T23:32:49+03:00",
    "subject": "fix workspace pinned and group tab visibility in new sidebar",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4a068bfc938e704c4928de8fe31b18114ad514a9"
  },
  {
    "hash": "b20f88a27816df19421f9e645cb2944d7072179c",
    "shortHash": "b20f88a",
    "author": "VastSea0",
    "date": "2026-05-27T17:20:23+03:00",
    "subject": "Refactor workspace retargeting logic: remove redundant scheduling in tab open handler and improve handling for transient initial pages.",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b20f88a27816df19421f9e645cb2944d7072179c"
  },
  {
    "hash": "c07f763694e88dcee247b1494727532cc1314d04",
    "shortHash": "c07f763",
    "author": "VastSea0",
    "date": "2026-05-27T16:44:44+03:00",
    "subject": "Fix new tab button icon: remove data-l10n-id, use formatValueSync for title/aria-label",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c07f763694e88dcee247b1494727532cc1314d04"
  },
  {
    "hash": "0b29b2d04e4d333d117a0362dfc1def2ba5f67e1",
    "shortHash": "0b29b2d",
    "author": "VastSea0",
    "date": "2026-05-27T16:35:20+03:00",
    "subject": "Fix sidebar header new tab icon, remove PINLENEN heading, increase pinned favicon to 36px",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0b29b2d04e4d333d117a0362dfc1def2ba5f67e1"
  },
  {
    "hash": "17d52097c69e907f4ce0e6e97b7dc0059431b868",
    "shortHash": "17d5209",
    "author": "VastSea0",
    "date": "2026-05-27T16:27:14+03:00",
    "subject": "feat: add sidebar configuration preferences and UI logic for Hilal workspaces and custom theme settings",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/17d52097c69e907f4ce0e6e97b7dc0059431b868"
  },
  {
    "hash": "91fc2a58a2ccdd03760b907825e8656f8bd47e3c",
    "shortHash": "91fc2a5",
    "author": "VastSea0",
    "date": "2026-05-27T15:52:17+03:00",
    "subject": "merge",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/91fc2a58a2ccdd03760b907825e8656f8bd47e3c"
  },
  {
    "hash": "793000c614489372756a0c3b51ae910b73d69449",
    "shortHash": "793000c",
    "author": "VastSea0",
    "date": "2026-05-27T15:32:54+03:00",
    "subject": "Implement robust dynamic built-in localization model",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/793000c614489372756a0c3b51ae910b73d69449"
  },
  {
    "hash": "8fdf433234f46c815097ca48ab371d87e86829ca",
    "shortHash": "8fdf433",
    "author": "VastSea0",
    "date": "2026-05-27T15:32:54+03:00",
    "subject": "Implement robust dynamic built-in localization model",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8fdf433234f46c815097ca48ab371d87e86829ca"
  },
  {
    "hash": "e57e748924fcb80ac82fbdae8036f867dd8fac6f",
    "shortHash": "e57e748",
    "author": "VastSea0",
    "date": "2026-05-27T14:58:08+03:00",
    "subject": "docs: update localization documentation with user language selection preference details",
    "body": "",
    "category": "docs",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e57e748924fcb80ac82fbdae8036f867dd8fac6f"
  },
  {
    "hash": "7aa61e33ab6e3cd74045c058c1180d061e6da5f7",
    "shortHash": "7aa61e3",
    "author": "VastSea0",
    "date": "2026-05-27T14:57:28+03:00",
    "subject": "feat: add UI for dynamic language selection and application restart in Hilal preferences",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7aa61e33ab6e3cd74045c058c1180d061e6da5f7"
  },
  {
    "hash": "d53b7e98504c1ffc8ed8b615d84e848e562e4ccf",
    "shortHash": "d53b7e9",
    "author": "VastSea0",
    "date": "2026-05-27T14:55:19+03:00",
    "subject": "feat: implement language selection interface and update main preferences logic",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d53b7e98504c1ffc8ed8b615d84e848e562e4ccf"
  },
  {
    "hash": "59579138f5ef9577356ef290829020c36e87418b",
    "shortHash": "5957913",
    "author": "VastSea0",
    "date": "2026-05-27T14:24:28+03:00",
    "subject": "refactor: overhaul langpack patching script to support automated branding and localization overlays for all bundled languages",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/59579138f5ef9577356ef290829020c36e87418b"
  },
  {
    "hash": "288f93355e1ac0480f0b405376bf9d2a7bf36b08",
    "shortHash": "288f933",
    "author": "VastSea0",
    "date": "2026-05-27T14:24:22+03:00",
    "subject": "refactor: implement generalized langpack patching script to support arbitrary localizations and branding overlays",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/288f93355e1ac0480f0b405376bf9d2a7bf36b08"
  },
  {
    "hash": "132a706c5fd6f4087ed31caff76721d464a8a660",
    "shortHash": "132a706",
    "author": "VastSea0",
    "date": "2026-05-27T14:24:17+03:00",
    "subject": "feat: enable multi-locale support and system locale default for Hilal browser",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/132a706c5fd6f4087ed31caff76721d464a8a660"
  },
  {
    "hash": "2fbf98afdc1e7de7a41282cdeb40b41fb1df4a6c",
    "shortHash": "2fbf98a",
    "author": "VastSea0",
    "date": "2026-05-27T03:49:55+03:00",
    "subject": "feat: enable sccache for compiler caching in macOS mozconfig",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2fbf98afdc1e7de7a41282cdeb40b41fb1df4a6c"
  },
  {
    "hash": "973f7ec3f39403771be7eb7cc0b96ca6ac1f8784",
    "shortHash": "973f7ec",
    "author": "VastSea0",
    "date": "2026-05-27T03:49:43+03:00",
    "subject": "chore: enable sccache in macos build config and update turkish language pack",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/973f7ec3f39403771be7eb7cc0b96ca6ac1f8784"
  },
  {
    "hash": "d0a628980a9faab26f7c03047c29598af81449b8",
    "shortHash": "d0a6289",
    "author": "VastSea0",
    "date": "2026-05-27T03:40:39+03:00",
    "subject": "feat: add automated Turkish language pack patching to build script",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d0a628980a9faab26f7c03047c29598af81449b8"
  },
  {
    "hash": "761bdf497b4bc2244800a3f64ad036931526601c",
    "shortHash": "761bdf4",
    "author": "VastSea0",
    "date": "2026-05-27T03:40:35+03:00",
    "subject": "feat: implement patch-langpack script to inject custom strings into Turkish locale and update apply.sh to execute it",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/761bdf497b4bc2244800a3f64ad036931526601c"
  },
  {
    "hash": "3f3949a7d00ffa62f36d5d54d5f9c06c1dd146a9",
    "shortHash": "3f3949a",
    "author": "VastSea0",
    "date": "2026-05-27T03:40:29+03:00",
    "subject": "feat: add automated Turkish language pack patching for Hilal sidebar strings",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3f3949a7d00ffa62f36d5d54d5f9c06c1dd146a9"
  },
  {
    "hash": "0c70a412d40e6f2172736834ed804d54bcc1cf44",
    "shortHash": "0c70a41",
    "author": "VastSea0",
    "date": "2026-05-27T03:40:25+03:00",
    "subject": "feat: add Turkish localization support for Hilal welcome screen and sidebar via automated language pack patching",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0c70a412d40e6f2172736834ed804d54bcc1cf44"
  },
  {
    "hash": "c84ac2f569ba9007057db14b56e9b9df28582908",
    "shortHash": "c84ac2f",
    "author": "VastSea0",
    "date": "2026-05-27T03:40:17+03:00",
    "subject": "feat: add Turkish language support for browser preferences, welcome screen, and sidebar via automated patching script",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c84ac2f569ba9007057db14b56e9b9df28582908"
  },
  {
    "hash": "5291221ff26d5c3a0c39e3f9bbcf011aa8e0c217",
    "shortHash": "5291221",
    "author": "VastSea0",
    "date": "2026-05-27T03:38:20+03:00",
    "subject": "chore: update Turkish language pack extension to latest version",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5291221ff26d5c3a0c39e3f9bbcf011aa8e0c217"
  },
  {
    "hash": "c46876b7880e453acc437898628d92bc0b08a13d",
    "shortHash": "c46876b",
    "author": "VastSea0",
    "date": "2026-05-27T03:30:27+03:00",
    "subject": "refactor: improve formatting and readablity of workspace preference fetching in UrlbarMuxerStandard",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c46876b7880e453acc437898628d92bc0b08a13d"
  },
  {
    "hash": "29731585768d0ad0c0826a0acfc878fa7c89584a",
    "shortHash": "2973158",
    "author": "VastSea0",
    "date": "2026-05-27T03:29:27+03:00",
    "subject": "fix: update line offset in workspace context isolation patch for UrlbarMuxerStandard.sys.mjs",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/29731585768d0ad0c0826a0acfc878fa7c89584a"
  },
  {
    "hash": "3565552d0aeed7c4eaba2e685b02ead26062205c",
    "shortHash": "3565552",
    "author": "VastSea0",
    "date": "2026-05-27T03:29:18+03:00",
    "subject": "chore: update workspace isolation and sidebar layout patch files",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3565552d0aeed7c4eaba2e685b02ead26062205c"
  },
  {
    "hash": "9408102d4881288ade2f484598bc4f3257f2cb23",
    "shortHash": "9408102",
    "author": "VastSea0",
    "date": "2026-05-27T03:16:25+03:00",
    "subject": "fix: validate URI schemes for HilalBangs and sidebar navigation, and optimize workspace state caching",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9408102d4881288ade2f484598bc4f3257f2cb23"
  },
  {
    "hash": "98a80e657231d14799f5439bf95dbb8fb2bcbe64",
    "shortHash": "98a80e6",
    "author": "VastSea0",
    "date": "2026-05-27T03:05:23+03:00",
    "subject": "feat: add dedicated releases archive page with navigation state",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/98a80e657231d14799f5439bf95dbb8fb2bcbe64"
  },
  {
    "hash": "c2969807704f4260112767301bbbe895d9a7e254",
    "shortHash": "c296980",
    "author": "VastSea0",
    "date": "2026-05-27T03:00:25+03:00",
    "subject": "refactor: simplify App component by removing static FAQ data and cleaning up UI strings and logic",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c2969807704f4260112767301bbbe895d9a7e254"
  },
  {
    "hash": "6f55eabceffe0be19d816509276284a1deef5a80",
    "shortHash": "6f55eab",
    "author": "VastSea0",
    "date": "2026-05-27T02:57:47+03:00",
    "subject": "feat: add privacy initialization and custom bang preference flags",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6f55eabceffe0be19d816509276284a1deef5a80"
  },
  {
    "hash": "9b5e6463876fc91023569a0efb5d4a31dc9ddd70",
    "shortHash": "9b5e646",
    "author": "VastSea0",
    "date": "2026-05-27T02:57:43+03:00",
    "subject": "feat: add hilal privacy initialization and bang customization prefs while updating extension scan scopes",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9b5e6463876fc91023569a0efb5d4a31dc9ddd70"
  },
  {
    "hash": "40e064cc24318764280aa434cd44831c242d223d",
    "shortHash": "40e064c",
    "author": "VastSea0",
    "date": "2026-05-27T02:57:39+03:00",
    "subject": "refactor: update browser patches to remove redundant URL loading logic and initialize new Hilal privacy and bang configuration preferences",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/40e064cc24318764280aa434cd44831c242d223d"
  },
  {
    "hash": "40184ec7038c89d6b076a12e4629d3b5d31325b7",
    "shortHash": "40184ec",
    "author": "VastSea0",
    "date": "2026-05-27T02:57:34+03:00",
    "subject": "refactor: update browser preferences, configure opaque backdrop fallback, and add initialization flags for Hilal features",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/40184ec7038c89d6b076a12e4629d3b5d31325b7"
  },
  {
    "hash": "0d796372ac3140eb81ffbee93307776a24efdca7",
    "shortHash": "0d79637",
    "author": "VastSea0",
    "date": "2026-05-27T02:57:30+03:00",
    "subject": "feat: implement privacy initialization, refine workspace state handling, and update browser configuration patches",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0d796372ac3140eb81ffbee93307776a24efdca7"
  },
  {
    "hash": "c282ff1635f80eb95b4455c98693fd096ce3ef1c",
    "shortHash": "c282ff1",
    "author": "VastSea0",
    "date": "2026-05-27T02:56:57+03:00",
    "subject": "refactor: implement one-time privacy initialization, improve workspace state management, add transparency fallback conditions, and refine type imports in App.tsx",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c282ff1635f80eb95b4455c98693fd096ce3ef1c"
  },
  {
    "hash": "0a0985671ab92b21e06bc92e75a18f079763e623",
    "shortHash": "0a09856",
    "author": "VastSea0",
    "date": "2026-05-27T02:40:53+03:00",
    "subject": "fix: correct line number in uBlock Origin patch for consistency",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0a0985671ab92b21e06bc92e75a18f079763e623"
  },
  {
    "hash": "eb543f6ce8ccdc83497e13081966cd9f5e799c6e",
    "shortHash": "eb543f6",
    "author": "VastSea0",
    "date": "2026-05-27T02:40:15+03:00",
    "subject": "fix: remove unnecessary whitespace in workspace context isolation logic",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/eb543f6ce8ccdc83497e13081966cd9f5e799c6e"
  },
  {
    "hash": "3fdc15bce24c0365dcc85c92a3cf4e058bcf32e3",
    "shortHash": "3fdc15b",
    "author": "VastSea0",
    "date": "2026-05-27T02:40:09+03:00",
    "subject": "feat: redesign sidebar layout for improved workspace management",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3fdc15bce24c0365dcc85c92a3cf4e058bcf32e3"
  },
  {
    "hash": "4d1862610c193e689f034d0792e6e7dd3467a4bd",
    "shortHash": "4d18626",
    "author": "VastSea0",
    "date": "2026-05-27T02:40:03+03:00",
    "subject": "feat: add custom bang preferences UI to Hilal Browser",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4d1862610c193e689f034d0792e6e7dd3467a4bd"
  },
  {
    "hash": "c67f3986500d07f3ec3b7fcce39f271f5b4a0a50",
    "shortHash": "c67f398",
    "author": "VastSea0",
    "date": "2026-05-27T02:39:58+03:00",
    "subject": "fix: remove unnecessary newline in uBlock Origin patch",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c67f3986500d07f3ec3b7fcce39f271f5b4a0a50"
  },
  {
    "hash": "a60c4e94bffa206f4b77bdf882cc8f4f67e71df2",
    "shortHash": "a60c4e9",
    "author": "VastSea0",
    "date": "2026-05-27T02:39:52+03:00",
    "subject": "feat: integrate Firefox-UI-Fix with dynamic settings UI",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a60c4e94bffa206f4b77bdf882cc8f4f67e71df2"
  },
  {
    "hash": "2a62a003f2ca486eca2aa5c01d9ada7c9a1ef924",
    "shortHash": "2a62a00",
    "author": "VastSea0",
    "date": "2026-05-27T02:39:46+03:00",
    "subject": "fix: update user-facing version to 0.2.0-alpha.4",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2a62a003f2ca486eca2aa5c01d9ada7c9a1ef924"
  },
  {
    "hash": "0b1d20ff7a071311d35ce9ecb380bc94458f4c09",
    "shortHash": "0b1d20f",
    "author": "VastSea0",
    "date": "2026-05-27T02:39:39+03:00",
    "subject": "feat: add dedicated Hilal settings category to preferences",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0b1d20ff7a071311d35ce9ecb380bc94458f4c09"
  },
  {
    "hash": "35d53d7b7f87d0a4d129eefbd9fa18c9c8964d2a",
    "shortHash": "35d53d7",
    "author": "VastSea0",
    "date": "2026-05-27T02:39:32+03:00",
    "subject": "fix: implement native blurred macOS chrome surfaces for Hilal Browser",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/35d53d7b7f87d0a4d129eefbd9fa18c9c8964d2a"
  },
  {
    "hash": "e1bd817fe93da17b243d909a683b6c0617f17fbe",
    "shortHash": "e1bd817",
    "author": "VastSea0",
    "date": "2026-05-27T02:29:56+03:00",
    "subject": "patches: split combined patch back into focused per-feature patches",
    "body": "Drop 0000-hilal-combined.patch (which included ~551 unrelated\nthird_party/rust Cargo.toml.orig entries) and restore the 18\nindividual focused patches from the pre-merge local branch.\n\nAlso restores the series file with proper ordering and comments.",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e1bd817fe93da17b243d909a683b6c0617f17fbe"
  },
  {
    "hash": "abc8b432fb43e4f43a59b4a1224ca54835b1bb97",
    "shortHash": "abc8b43",
    "author": "VastSea0",
    "date": "2026-05-27T02:20:36+03:00",
    "subject": "Merge branch 'main' of https://github.com/VastSea0/hilal-browser",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/abc8b432fb43e4f43a59b4a1224ca54835b1bb97"
  },
  {
    "hash": "65b98019115bea96e139a890b5ba71d9aeb52b09",
    "shortHash": "65b9801",
    "author": "VastSea0",
    "date": "2026-05-27T02:15:33+03:00",
    "subject": "fix: stop auto-creating workspace bookmark folders",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/65b98019115bea96e139a890b5ba71d9aeb52b09"
  },
  {
    "hash": "32a5cce9298c7bed99cc39a5fbbfaa8523718b7a",
    "shortHash": "32a5cce",
    "author": "VastSea0",
    "date": "2026-05-27T02:14:35+03:00",
    "subject": "fix: pin Firefox checkout before applying patches",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/32a5cce9298c7bed99cc39a5fbbfaa8523718b7a"
  },
  {
    "hash": "b8b799f9b06dceeace80d44a0935a526827fd2be",
    "shortHash": "b8b799f",
    "author": "VastSea0",
    "date": "2026-05-27T02:14:32+03:00",
    "subject": "fix: show Firefox base version in About Hilal",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b8b799f9b06dceeace80d44a0935a526827fd2be"
  },
  {
    "hash": "2836a3bff08936fb35cb8bfadbec2506e9eee835",
    "shortHash": "2836a3b",
    "author": "VastSea0",
    "date": "2026-05-27T02:14:29+03:00",
    "subject": "fix: separate Hilal and Firefox update versions",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2836a3bff08936fb35cb8bfadbec2506e9eee835"
  },
  {
    "hash": "23b34d70341500a005c7faa98a27940593026b56",
    "shortHash": "23b34d7",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-26T22:30:13Z",
    "subject": "docs: update changelog with Firefox upstream sync to 153.0a1",
    "body": "",
    "category": "docs",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/23b34d70341500a005c7faa98a27940593026b56"
  },
  {
    "hash": "b136fd90fa54694c5e6fb65906b2b9c86a7c82da",
    "shortHash": "b136fd9",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-25T23:57:52Z",
    "subject": "fix: regenerate patches from current firefox tree state",
    "body": "Replaces all 18 individual patches with a single combined patch\ngenerated via scripts/refresh.sh (git diff HEAD against upstream).\n\nIncludes all Hilal changes: preferences pane, UI fix integration,\nTurkish locale, privacy levels, bang customization, sidebar redesign,\nand workspace context isolation.",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b136fd90fa54694c5e6fb65906b2b9c86a7c82da"
  },
  {
    "hash": "bae24848178dc888461b2bb8d95bdb5609e0c6fc",
    "shortHash": "bae2484",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-26T12:39:42Z",
    "subject": "Merge pull request #16 from VastSea0/codex/flatpak-flathub-prep",
    "body": "flatpak: add Flathub-ready packaging scaffold",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bae24848178dc888461b2bb8d95bdb5609e0c6fc"
  },
  {
    "hash": "4972376c21fc7ad0fe9d684bc768c3862dc599b1",
    "shortHash": "4972376",
    "author": "VastSea0",
    "date": "2026-05-26T15:37:30+03:00",
    "subject": "flatpak: add Flathub-ready packaging scaffold",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4972376c21fc7ad0fe9d684bc768c3862dc599b1"
  },
  {
    "hash": "42ee9b330c18e95bd80d7993267e09713dd5730f",
    "shortHash": "42ee9b3",
    "author": "Muhammed Beshir",
    "date": "2026-05-26T13:21:18+03:00",
    "subject": "Enhance Firefox setup script with fast clone option",
    "body": "",
    "category": "perf",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/42ee9b330c18e95bd80d7993267e09713dd5730f"
  },
  {
    "hash": "7c45ab1738e8375f22679bfca2324a1084956317",
    "shortHash": "7c45ab1",
    "author": "VastSea0",
    "date": "2026-05-26T01:42:11+03:00",
    "subject": "release: bump version to 0.2.0-alpha.4 and update changelog",
    "body": "",
    "category": "build",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7c45ab1738e8375f22679bfca2324a1084956317"
  },
  {
    "hash": "a67cc2c9453332166eb661f486c9d3df74cfb9fc",
    "shortHash": "a67cc2c",
    "author": "VastSea0",
    "date": "2026-05-26T01:41:37+03:00",
    "subject": "chore: bump user-facing version to 0.2.0-alpha.4",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a67cc2c9453332166eb661f486c9d3df74cfb9fc"
  },
  {
    "hash": "a67d70f41b5cd9a0ba8d2c80eb14360324eae5c1",
    "shortHash": "a67d70f",
    "author": "VastSea0",
    "date": "2026-05-26T01:33:44+03:00",
    "subject": "fix(www): import React namespace in App.tsx to resolve typescript compilation errors",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a67d70f41b5cd9a0ba8d2c80eb14360324eae5c1"
  },
  {
    "hash": "cb82747ceb5f6cc393bcc86f80dbbe224b4bc621",
    "shortHash": "cb82747",
    "author": "VastSea0",
    "date": "2026-05-26T01:33:40+03:00",
    "subject": "fix: adjust patch 0016 to target the correct end of preferences.ftl",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/cb82747ceb5f6cc393bcc86f80dbbe224b4bc621"
  },
  {
    "hash": "4dda001fee2b14b66632ecb9fa2a5ec80cd1b534",
    "shortHash": "4dda001",
    "author": "VastSea0",
    "date": "2026-05-26T01:29:46+03:00",
    "subject": "docs: update audit report to version 2.0 with current release readiness assessment",
    "body": "",
    "category": "docs",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4dda001fee2b14b66632ecb9fa2a5ec80cd1b534"
  },
  {
    "hash": "465862a36a06ee9a63cbcc481904568206ba5acf",
    "shortHash": "465862a",
    "author": "VastSea0",
    "date": "2026-05-26T01:25:20+03:00",
    "subject": "docs: simplify and update audit report structure for improved clarity and release readiness assessment",
    "body": "",
    "category": "docs",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/465862a36a06ee9a63cbcc481904568206ba5acf"
  },
  {
    "hash": "2d08316bd09a726747c63e6f8cea83cc52382abf",
    "shortHash": "2d08316",
    "author": "VastSea0",
    "date": "2026-05-26T00:47:06+03:00",
    "subject": "Add smart bang fallback",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2d08316bd09a726747c63e6f8cea83cc52382abf"
  },
  {
    "hash": "4e3fcf64c4587d5dae35010e67c801775112a73d",
    "shortHash": "4e3fcf6",
    "author": "VastSea0",
    "date": "2026-05-26T00:43:22+03:00",
    "subject": "Add dynamic sidebar shortcut favicons",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4e3fcf64c4587d5dae35010e67c801775112a73d"
  },
  {
    "hash": "7c3f24616d8c0a66e4f78b42e7b0086093955dee",
    "shortHash": "7c3f246",
    "author": "VastSea0",
    "date": "2026-05-26T00:16:59+03:00",
    "subject": "feat: localize all hardcoded strings in preferences panel and welcome screen (#9)",
    "body": "- Replace all hardcoded label= attributes in hilal.inc.xhtml with data-l10n-id\n- Add data-l10n-id to privacy level cards in HilalWelcome.js\n- Add comprehensive FTL strings to preferences.ftl: workspace options,\n  sidebar settings, custom shortcuts form, privacy level radios, UI\n  enhancement checkboxes\n- Add privacy level FTL strings to browser.ftl for the welcome screen\n- Regenerate 0005-hilal-l10n.patch to capture all new Fluent definitions",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7c3f24616d8c0a66e4f78b42e7b0086093955dee"
  },
  {
    "hash": "d353ba1dc6ba90e173cc5d709cc45633569ff86d",
    "shortHash": "d353ba1",
    "author": "VastSea0",
    "date": "2026-05-25T23:53:43+03:00",
    "subject": "fix: prevent workspace tab operations while in customization mode (#14)",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d353ba1dc6ba90e173cc5d709cc45633569ff86d"
  },
  {
    "hash": "5fddd1c0d807cc05d00a668ca171c49543ccdb56",
    "shortHash": "5fddd1c",
    "author": "VastSea0",
    "date": "2026-05-25T23:47:53+03:00",
    "subject": "feat: add workspace-specific bookmark folders and context-isolated URL filtering (#8)",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5fddd1c0d807cc05d00a668ca171c49543ccdb56"
  },
  {
    "hash": "8e6226257be069a21b990a184a3d4022855a818a",
    "shortHash": "8e62262",
    "author": "VastSea0",
    "date": "2026-05-25T23:15:36+03:00",
    "subject": "fix: use standard .js extension for relative server imports in ESM",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8e6226257be069a21b990a184a3d4022855a818a"
  },
  {
    "hash": "63ad3c98edabf0d7a8b904a0974714378628d902",
    "shortHash": "63ad3c9",
    "author": "VastSea0",
    "date": "2026-05-25T23:10:43+03:00",
    "subject": "fix: resolve Vercel ERR_MODULE_NOT_FOUND error by adding .ts extensions to relative server imports",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/63ad3c98edabf0d7a8b904a0974714378628d902"
  },
  {
    "hash": "1bd151bf94de4f270c67dce3c3a83f39984f9bb9",
    "shortHash": "1bd151b",
    "author": "VastSea0",
    "date": "2026-05-25T22:52:29+03:00",
    "subject": "feat: implement patch checksum validation in build script and reorganize Hilal preferences UI modules",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/1bd151bf94de4f270c67dce3c3a83f39984f9bb9"
  },
  {
    "hash": "9848dc55cbc0a2eede8cd1e6b9015b7c5e63ad8c",
    "shortHash": "9848dc5",
    "author": "VastSea0",
    "date": "2026-05-25T20:48:29+03:00",
    "subject": "docs: add split theme preview to README.md and add interactive comparison slider to website",
    "body": "",
    "category": "docs",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9848dc55cbc0a2eede8cd1e6b9015b7c5e63ad8c"
  },
  {
    "hash": "8863ee90b599ddac7b50861532f4bbf491a438a0",
    "shortHash": "8863ee9",
    "author": "VastSea0",
    "date": "2026-05-25T20:45:55+03:00",
    "subject": "feat: add new Hilal branding assets for welcome screen preview",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8863ee90b599ddac7b50861532f4bbf491a438a0"
  },
  {
    "hash": "00e29c3edd0dc2c9cdd1833553e2ab6c950c767d",
    "shortHash": "00e29c3",
    "author": "VastSea0",
    "date": "2026-05-25T17:21:19+03:00",
    "subject": "docs: redesign README with badges, core features and centered logo",
    "body": "",
    "category": "docs",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/00e29c3edd0dc2c9cdd1833553e2ab6c950c767d"
  },
  {
    "hash": "44064b07a8a4d4fd46ebc910e8b030f223bee8b1",
    "shortHash": "44064b0",
    "author": "VastSea0",
    "date": "2026-05-25T17:03:19+03:00",
    "subject": "feat: update welcome-home-preview screenshot to reflect recent UI changes",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/44064b07a8a4d4fd46ebc910e8b030f223bee8b1"
  },
  {
    "hash": "bce11f1e4115a43a701767eda55128d4a8cc9e13",
    "shortHash": "bce11f1",
    "author": "VastSea0",
    "date": "2026-05-25T15:10:28+03:00",
    "subject": "refactor: remove legacy www-old directory and migrate backend update logic to the main www app",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bce11f1e4115a43a701767eda55128d4a8cc9e13"
  },
  {
    "hash": "1d8abc77038c13751e49c36d51bdf7b7061b81c4",
    "shortHash": "1d8abc7",
    "author": "VastSea0",
    "date": "2026-05-25T14:35:35+03:00",
    "subject": "feat: add GitHub issue templates and pull request template",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/1d8abc77038c13751e49c36d51bdf7b7061b81c4"
  },
  {
    "hash": "f0ee8a49c3a713faefb8f32deab95f6a4ed75e9c",
    "shortHash": "f0ee8a4",
    "author": "VastSea0",
    "date": "2026-05-25T14:27:03+03:00",
    "subject": "feat: use standardized SiDiscord icon from react-icons/si library",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f0ee8a49c3a713faefb8f32deab95f6a4ed75e9c"
  },
  {
    "hash": "42ea8b036767482dc189818cb3ace18069ecf112",
    "shortHash": "42ea8b0",
    "author": "VastSea0",
    "date": "2026-05-25T14:21:54+03:00",
    "subject": "feat: add Discord server link to landing page website",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/42ea8b036767482dc189818cb3ace18069ecf112"
  },
  {
    "hash": "a01b99cd6cbd3af243733e43115a91c070ff25b5",
    "shortHash": "a01b99c",
    "author": "VastSea0",
    "date": "2026-05-25T00:46:01+03:00",
    "subject": "fix: adjust macOS window margins and eliminate stacked paddings",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a01b99cd6cbd3af243733e43115a91c070ff25b5"
  },
  {
    "hash": "3749eb1badabf5526d07818d2e03cdc5afcd3dc4",
    "shortHash": "3749eb1",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-24T21:10:44Z",
    "subject": "feat: add Vercel deployment config for www landing page",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3749eb1badabf5526d07818d2e03cdc5afcd3dc4"
  },
  {
    "hash": "b9990e94d3d0be431497d34844db410eea166a1c",
    "shortHash": "b9990e9",
    "author": "VastSea0",
    "date": "2026-05-24T23:05:18+03:00",
    "subject": "feat: add privacy level selection to welcome flow",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b9990e94d3d0be431497d34844db410eea166a1c"
  },
  {
    "hash": "7358e4ef875e0b5390ce3738f1efcaa88916a588",
    "shortHash": "7358e4e",
    "author": "VastSea0",
    "date": "2026-05-24T20:24:38+03:00",
    "subject": "feat: implement LibreWolf-aligned privacy levels and add documentation",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7358e4ef875e0b5390ce3738f1efcaa88916a588"
  },
  {
    "hash": "33b3f0a3693b22494188b97f6b4b894df32ca759",
    "shortHash": "33b3f0a",
    "author": "VastSea0",
    "date": "2026-05-24T20:18:17+03:00",
    "subject": "refactor: integrate privacy presets and implement sidebar footer customization features",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/33b3f0a3693b22494188b97f6b4b894df32ca759"
  },
  {
    "hash": "04e7e9243324f48620e1b80acc249578ebeb3590",
    "shortHash": "04e7e92",
    "author": "VastSea0",
    "date": "2026-05-24T19:43:54+03:00",
    "subject": "fix: ensure DownloadsButton anchor exists before showing downloads panel in sidebar layout",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/04e7e9243324f48620e1b80acc249578ebeb3590"
  },
  {
    "hash": "deb3ced702a876e3b0f9afe5f02cfcdfe541e83f",
    "shortHash": "deb3ced",
    "author": "VastSea0",
    "date": "2026-05-24T19:39:21+03:00",
    "subject": "fix: set sidebar background to transparent in macOS transparent chrome patch",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/deb3ced702a876e3b0f9afe5f02cfcdfe541e83f"
  },
  {
    "hash": "5a31df3fc49faebb1c9180356cc415defe788530",
    "shortHash": "5a31df3",
    "author": "VastSea0",
    "date": "2026-05-24T19:36:15+03:00",
    "subject": "refactor: set sidebar workspace rail background to transparent in layout patch",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5a31df3fc49faebb1c9180356cc415defe788530"
  },
  {
    "hash": "6d4e89f27375547439dc879afae2a5251833f179",
    "shortHash": "6d4e89f",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-24T15:49:58Z",
    "subject": "feat: control sidebar width via JS-toggled vertical-tabs attribute, guard SidebarManager visibility in workspace mode",
    "body": "- vertical-tabs attribute set on both <sidebar-main> and #sidebar-main\n- Panel content removed from DOM via when() when vertical tabs off\n- SidebarManager skips visibility change when workspaces enabled",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6d4e89f27375547439dc879afae2a5251833f179"
  },
  {
    "hash": "0845e4fbe4747030a0fd45c9861489ad9c9c77f3",
    "shortHash": "0845e4f",
    "author": "VastSea0",
    "date": "2026-05-24T17:49:56+03:00",
    "subject": "www old",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0845e4fbe4747030a0fd45c9861489ad9c9c77f3"
  },
  {
    "hash": "9f3ba94e4fbe804edccdb4a7f5a52a6f3671f4f1",
    "shortHash": "9f3ba94",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-24T14:44:56Z",
    "subject": "fix: ensure vertical tabs context menu loads FTL and translates lazy l10n items",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9f3ba94e4fbe804edccdb4a7f5a52a6f3671f4f1"
  },
  {
    "hash": "7c8e780e302141f98153643ca76aa2409f605378",
    "shortHash": "7c8e780",
    "author": "VastSea0",
    "date": "2026-05-24T17:19:27+03:00",
    "subject": "chore: update dependencies and regenerate build artifacts in node_modules",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7c8e780e302141f98153643ca76aa2409f605378"
  },
  {
    "hash": "b666c5dcef2ec9398f18e28d139cdd1a90eb2f15",
    "shortHash": "b666c5d",
    "author": "VastSea0",
    "date": "2026-05-24T17:09:57+03:00",
    "subject": "feat: update glass UI styling for macOS and add tab context localization support",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b666c5dcef2ec9398f18e28d139cdd1a90eb2f15"
  },
  {
    "hash": "d3b884e376c28a83dea96de51effe3dd507352d3",
    "shortHash": "d3b884e",
    "author": "VastSea0",
    "date": "2026-05-24T16:52:12+03:00",
    "subject": "fix: tolerate missing update service in browser components and update icon assets to official browser styling",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d3b884e376c28a83dea96de51effe3dd507352d3"
  },
  {
    "hash": "7913095ad9601c30d365d7e23a3c51fdf0fd97ac",
    "shortHash": "7913095",
    "author": "VastSea0",
    "date": "2026-05-24T15:32:03+03:00",
    "subject": "Hilal Browser: fix regressions in redesigned sidebar layout",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7913095ad9601c30d365d7e23a3c51fdf0fd97ac"
  },
  {
    "hash": "9e7cf906e1543080eae27d3ac3b69496aff83cbc",
    "shortHash": "9e7cf90",
    "author": "VastSea0",
    "date": "2026-05-24T15:00:56+03:00",
    "subject": "Add Hilal sidebar layout redesign patch",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9e7cf906e1543080eae27d3ac3b69496aff83cbc"
  },
  {
    "hash": "c4a4be26b15783b71fbab95a091e025a1f756071",
    "shortHash": "c4a4be2",
    "author": "VastSea0",
    "date": "2026-05-24T14:38:10+03:00",
    "subject": "refactor: simplify customization attribute selectors from [customizing=\"true\"] to [customizing]",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c4a4be26b15783b71fbab95a091e025a1f756071"
  },
  {
    "hash": "6295ad9a8b672c8fcfbada18117c497b0e8089a7",
    "shortHash": "6295ad9",
    "author": "VastSea0",
    "date": "2026-05-24T14:06:57+03:00",
    "subject": "Fix JavaScript resource error by removing redundant Services imports in HilalBangs",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6295ad9a8b672c8fcfbada18117c497b0e8089a7"
  },
  {
    "hash": "cc323256c9f79dffa395410dd42d8e276362ef85",
    "shortHash": "cc32325",
    "author": "VastSea0",
    "date": "2026-05-24T14:04:41+03:00",
    "subject": "Implement missing UI and logic for Bangs customization settings page",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/cc323256c9f79dffa395410dd42d8e276362ef85"
  },
  {
    "hash": "9a7752ff30ea78cd5eda54ef1c2a10f977052810",
    "shortHash": "9a7752f",
    "author": "VastSea0",
    "date": "2026-05-24T03:39:05+03:00",
    "subject": "Fix sorting order of HilalBangs in moz.build to satisfy build system",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9a7752ff30ea78cd5eda54ef1c2a10f977052810"
  },
  {
    "hash": "2ff1154c8fbae7600845faa0f4fbc8c6316e0cb3",
    "shortHash": "2ff1154",
    "author": "VastSea0",
    "date": "2026-05-24T03:37:14+03:00",
    "subject": "Fix patch application issues for privacy levels and bang customization",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2ff1154c8fbae7600845faa0f4fbc8c6316e0cb3"
  },
  {
    "hash": "2a59976dbe21b8ec710ad571f7eede645c57d215",
    "shortHash": "2a59976",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-24T00:14:43Z",
    "subject": "feat: add Hilal Browser settings category to preferences with workspace controls",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2a59976dbe21b8ec710ad571f7eede645c57d215"
  },
  {
    "hash": "04bac0c3c03026e23473aa1f8ae986a0e4aa6d1a",
    "shortHash": "04bac0c",
    "author": "Egehan KAHRAMAN",
    "date": "2026-05-24T00:13:14Z",
    "subject": "feat: add bang customization settings UI and shared HilalBangs module",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/04bac0c3c03026e23473aa1f8ae986a0e4aa6d1a"
  },
  {
    "hash": "0c3930e9209d4f62134046b06b153e2b6f61a58e",
    "shortHash": "0c3930e",
    "author": "VastSea0",
    "date": "2026-05-24T02:11:20+03:00",
    "subject": "fix: prevent preferences from crashing when application update services are missing",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0c3930e9209d4f62134046b06b153e2b6f61a58e"
  },
  {
    "hash": "acb50c61c8feecc291c697f0b33522636277a769",
    "shortHash": "acb50c6",
    "author": "VastSea0",
    "date": "2026-05-24T02:10:00+03:00",
    "subject": "feat: implement browser update infrastructure with XML endpoint, release UI, and platform-specific data handling",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/acb50c61c8feecc291c697f0b33522636277a769"
  },
  {
    "hash": "78b386903df6a560ed0e04c2e1e6d593a08b696d",
    "shortHash": "78b3869",
    "author": "VastSea0",
    "date": "2026-05-24T02:06:05+03:00",
    "subject": "chore: upgrade to Next.js 16 and React 19, update TypeScript configuration, and implement async params for next-intl",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/78b386903df6a560ed0e04c2e1e6d593a08b696d"
  },
  {
    "hash": "26bdd5c9168a62a01a7eed88a9f43e196984407e",
    "shortHash": "26bdd5c",
    "author": "VastSea0",
    "date": "2026-05-24T02:05:53+03:00",
    "subject": "chore: upgrade website to Next.js 16/React 19, refactor middleware, and enhance browser UI transparency patches",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/26bdd5c9168a62a01a7eed88a9f43e196984407e"
  },
  {
    "hash": "83f2f0c3f7c9ec9f1877a89b1ae6afc2dc79b343",
    "shortHash": "83f2f0c",
    "author": "VastSea0",
    "date": "2026-05-24T02:00:56+03:00",
    "subject": "update pathces",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/83f2f0c3f7c9ec9f1877a89b1ae6afc2dc79b343"
  },
  {
    "hash": "5c4a26a2c7a3cbde332cfbc643980de995995796",
    "shortHash": "5c4a26a",
    "author": "VastSea0",
    "date": "2026-05-24T01:55:59+03:00",
    "subject": "feat: enable desktop application updater with custom policy and MAR build script",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5c4a26a2c7a3cbde332cfbc643980de995995796"
  },
  {
    "hash": "4bd5d430c9274d7d6e1fe64cdcf02a28b94d8720",
    "shortHash": "4bd5d43",
    "author": "VastSea0",
    "date": "2026-05-24T01:50:52+03:00",
    "subject": "docs: update hilal browser audit report findings",
    "body": "",
    "category": "docs",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4bd5d430c9274d7d6e1fe64cdcf02a28b94d8720"
  },
  {
    "hash": "e91a73637dd999febd40c9962016041f0db2d706",
    "shortHash": "e91a736",
    "author": "VastSea0",
    "date": "2026-05-24T01:42:43+03:00",
    "subject": "feat: add configurable privacy levels to preferences with workspace-specific enforcement",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e91a73637dd999febd40c9962016041f0db2d706"
  },
  {
    "hash": "d807f2a4b4315ba20f34e723cc10622206e6eaaf",
    "shortHash": "d807f2a",
    "author": "VastSea0",
    "date": "2026-05-24T01:42:36+03:00",
    "subject": "update report",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d807f2a4b4315ba20f34e723cc10622206e6eaaf"
  },
  {
    "hash": "bbc99a93c1931e1f9afe6c6a37df9985cd6ab7e6",
    "shortHash": "bbc99a9",
    "author": "VastSea0",
    "date": "2026-05-24T01:10:27+03:00",
    "subject": "fix(patches): correct line count in 0008 uBlock patch hunk header",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bbc99a93c1931e1f9afe6c6a37df9985cd6ab7e6"
  },
  {
    "hash": "d866552661c9af6c61aac04bd0ee46dc68e1dd61",
    "shortHash": "d866552",
    "author": "VastSea0",
    "date": "2026-05-24T01:08:41+03:00",
    "subject": "feat: set version to 0.2.0-alpha.3 and update changelog",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d866552661c9af6c61aac04bd0ee46dc68e1dd61"
  },
  {
    "hash": "d143f3241b8a58ba3a52a54ffe2e2ed6efe65866",
    "shortHash": "d143f32",
    "author": "VastSea0",
    "date": "2026-05-23T23:16:21+03:00",
    "subject": "chore: initialize test profile and add preference reorganization scripts",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d143f3241b8a58ba3a52a54ffe2e2ed6efe65866"
  },
  {
    "hash": "17a4b9fc097b894b6063a5291cf3165b021e4080",
    "shortHash": "17a4b9f",
    "author": "VastSea0",
    "date": "2026-05-23T23:03:23+03:00",
    "subject": "feat: initialize browser test profile and add preferences reorganization scaffold",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/17a4b9fc097b894b6063a5291cf3165b021e4080"
  },
  {
    "hash": "8546df1fce94f6de6cdc92789e3fb38b5c19c605",
    "shortHash": "8546df1",
    "author": "VastSea0",
    "date": "2026-05-23T22:50:50+03:00",
    "subject": "refactor: update Hilal workspace preferences and UI patches with associated test profile artifacts",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8546df1fce94f6de6cdc92789e3fb38b5c19c605"
  },
  {
    "hash": "23a798adda2b180aadce5e30082fed22a231d053",
    "shortHash": "23a798a",
    "author": "VastSea0",
    "date": "2026-05-23T22:11:39+03:00",
    "subject": "feat: initialize browser test profile and add audit report with workspace patch updates",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/23a798adda2b180aadce5e30082fed22a231d053"
  },
  {
    "hash": "78b7c6e2060fd29948e59a9f8699713211e89bfa",
    "shortHash": "78b7c6e",
    "author": "VastSea0",
    "date": "2026-05-22T22:09:27+03:00",
    "subject": "fix(welcome): resolve layout rendering and branding logo in welcome screen",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/78b7c6e2060fd29948e59a9f8699713211e89bfa"
  },
  {
    "hash": "e729e652b2e35a0b58fc3f8a308feb188371714e",
    "shortHash": "e729e65",
    "author": "VastSea0",
    "date": "2026-05-22T21:53:48+03:00",
    "subject": "Revert \"ui: center Awesomebar on New Tab, add copy-url button with feedback, hide empty tab groups\"",
    "body": "This reverts commit e57d18e1a9a04afd8b2bcf3ecb24bc8cb9fb8428.",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e729e652b2e35a0b58fc3f8a308feb188371714e"
  },
  {
    "hash": "e57d18e1a9a04afd8b2bcf3ecb24bc8cb9fb8428",
    "shortHash": "e57d18e",
    "author": "VastSea0",
    "date": "2026-05-22T21:25:31+03:00",
    "subject": "ui: center Awesomebar on New Tab, add copy-url button with feedback, hide empty tab groups",
    "body": "- HilalWorkspaces.js: add initNewTabCentering() to set/remove has-newtab-open\n  on the root element on tab select and navigation events; add gHilalBrowser\n  with copyCurrentURL() that uses nsIClipboardHelper and shows ConfirmationHint\n- hilal-ui-fix.css: position #urlbar-container fixed at 35vh when has-newtab-open\n  is set; shift center right by half sidebar width when navbar.as_sidebar is on;\n  style #urlbar with rounded corners and shadow; fade non-urlbar toolbar items;\n  hide tab-group[hidden=true]; style copy-url button and its copied state\n- patches/0001: add copy-url-button-box hbox after star-button-box in XUL",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e57d18e1a9a04afd8b2bcf3ecb24bc8cb9fb8428"
  },
  {
    "hash": "afe30dc6f584640f7ba05161a4cf4948fabd8206",
    "shortHash": "afe30dc",
    "author": "VastSea0",
    "date": "2026-05-22T21:01:42+03:00",
    "subject": "welcome: rewrite overlay to cover full chrome, redesign UI",
    "body": "",
    "category": "style",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/afe30dc6f584640f7ba05161a4cf4948fabd8206"
  },
  {
    "hash": "80562ac2f39b78c3985d023c3f034c13fcf982b1",
    "shortHash": "80562ac",
    "author": "VastSea0",
    "date": "2026-05-22T20:41:58+03:00",
    "subject": "fix startup sessionstore crash and SVG icon path issues",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/80562ac2f39b78c3985d023c3f034c13fcf982b1"
  },
  {
    "hash": "965e57ce4ad0e05bf3d8d586324efaf0b542119b",
    "shortHash": "965e57c",
    "author": "VastSea0",
    "date": "2026-05-22T20:35:27+03:00",
    "subject": "modularize workspaces code and add premium onboarding welcome screen",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/965e57ce4ad0e05bf3d8d586324efaf0b542119b"
  },
  {
    "hash": "67b671f13353839f77325b50dea0b05cdb62fc79",
    "shortHash": "67b671f",
    "author": "VastSea0",
    "date": "2026-05-22T20:22:09+03:00",
    "subject": "feat: implement premium onboarding welcome screen overlay for first run",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/67b671f13353839f77325b50dea0b05cdb62fc79"
  },
  {
    "hash": "b0c8f83c470d8daed342ff10ad6921f5b142838a",
    "shortHash": "b0c8f83",
    "author": "VastSea0",
    "date": "2026-05-22T20:09:19+03:00",
    "subject": "patches: Prevent unknown bangs from redirecting to DuckDuckGo",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b0c8f83c470d8daed342ff10ad6921f5b142838a"
  },
  {
    "hash": "0e51908a372dc15fad905cd1cfbb173af5864741",
    "shortHash": "0e51908",
    "author": "VastSea0",
    "date": "2026-05-22T20:09:17+03:00",
    "subject": "workspaces: Harden deletion by explicitly purging container site data",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0e51908a372dc15fad905cd1cfbb173af5864741"
  },
  {
    "hash": "689fe898956c37c35bd46ef2b3ef9f7e0ea2b9e9",
    "shortHash": "689fe89",
    "author": "VastSea0",
    "date": "2026-05-22T20:09:16+03:00",
    "subject": "scripts: Pin uBlock Origin to 1.57.2 and add checksum verification",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/689fe898956c37c35bd46ef2b3ef9f7e0ea2b9e9"
  },
  {
    "hash": "b3536a297a2ded965f56d966500a78aeda250802",
    "shortHash": "b3536a2",
    "author": "VastSea0",
    "date": "2026-05-22T20:09:13+03:00",
    "subject": "www: Update Next.js, next-intl, and postcss to resolve security vulnerabilities",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b3536a297a2ded965f56d966500a78aeda250802"
  },
  {
    "hash": "da068a9caadfb85137109c9b502644522521b664",
    "shortHash": "da068a9",
    "author": "VastSea0",
    "date": "2026-05-22T19:42:56+03:00",
    "subject": "Revert \"feat(ui): center and auto-focus Awesomebar on New Tab page (closes #5)\"",
    "body": "This reverts commit a54903c9b34b30b832daf6b36dbf97d989991168.",
    "category": "style",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/da068a9caadfb85137109c9b502644522521b664"
  },
  {
    "hash": "96a3b57791d9bb290b8098c4bea24837ea849b5f",
    "shortHash": "96a3b57",
    "author": "VastSea0",
    "date": "2026-05-22T19:42:56+03:00",
    "subject": "Revert \"feat(ui): add dedicated Copy URL button in URL bar (closes #6)\"",
    "body": "This reverts commit a4aad20ba2fe251922e9fcbc41bd131e2d507e41.",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/96a3b57791d9bb290b8098c4bea24837ea849b5f"
  },
  {
    "hash": "a4aad20ba2fe251922e9fcbc41bd131e2d507e41",
    "shortHash": "a4aad20",
    "author": "VastSea0",
    "date": "2026-05-20T22:12:44+03:00",
    "subject": "feat(ui): add dedicated Copy URL button in URL bar (closes #6)",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a4aad20ba2fe251922e9fcbc41bd131e2d507e41"
  },
  {
    "hash": "a54903c9b34b30b832daf6b36dbf97d989991168",
    "shortHash": "a54903c",
    "author": "VastSea0",
    "date": "2026-05-20T22:09:25+03:00",
    "subject": "feat(ui): center and auto-focus Awesomebar on New Tab page (closes #5)",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a54903c9b34b30b832daf6b36dbf97d989991168"
  },
  {
    "hash": "d18a2116f228c0297c2cba445fe9a850a9a4e96a",
    "shortHash": "d18a211",
    "author": "VastSea0",
    "date": "2026-05-20T22:06:56+03:00",
    "subject": "fix(workspaces): collapse empty tab groups in workspace view (closes #4)",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d18a2116f228c0297c2cba445fe9a850a9a4e96a"
  },
  {
    "hash": "b20703e004fcb278b2013e4ca1c741d48c8bebb9",
    "shortHash": "b20703e",
    "author": "VastSea0",
    "date": "2026-05-20T21:04:39+03:00",
    "subject": "fix(uifix): use native media query pref syntax to prevent CSS discard (closes #3)",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b20703e004fcb278b2013e4ca1c741d48c8bebb9"
  },
  {
    "hash": "354c214cc6b38e5f7e6fc669fa83907813e5ed9b",
    "shortHash": "354c214",
    "author": "VastSea0",
    "date": "2026-05-20T16:50:21+03:00",
    "subject": "fix(ublock): enable automatic startup scanning and loading for pre-installed extensions (closes #2)",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/354c214cc6b38e5f7e6fc669fa83907813e5ed9b"
  },
  {
    "hash": "b99a468a0f1762069e81bc48b43639899efb8f4e",
    "shortHash": "b99a468",
    "author": "VastSea0",
    "date": "2026-05-20T14:12:19+03:00",
    "subject": "fix(workspaces): prevent retargeting privileged browser schemes (closes #1)",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b99a468a0f1762069e81bc48b43639899efb8f4e"
  },
  {
    "hash": "8e6e2d0034bc62561f002d8cbf4a43dfea82779c",
    "shortHash": "8e6e2d0",
    "author": "VastSea0",
    "date": "2026-05-20T12:55:10+03:00",
    "subject": "feat: integrate Firefox-UI-Fix with dynamic settings UI",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8e6e2d0034bc62561f002d8cbf4a43dfea82779c"
  },
  {
    "hash": "7867c7f03c85f35d2c69bee9876e24e352f59404",
    "shortHash": "7867c7f",
    "author": "VastSea0",
    "date": "2026-05-19T23:46:00+03:00",
    "subject": "Add missing dsstore to Hilal branding overlay",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7867c7f03c85f35d2c69bee9876e24e352f59404"
  },
  {
    "hash": "2e20966b2f8a88bc302afabc4a61470c40a3ae2a",
    "shortHash": "2e20966",
    "author": "VastSea0",
    "date": "2026-05-19T23:44:51+03:00",
    "subject": "Fix macOS packaging openrsync dylib copy issue",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2e20966b2f8a88bc302afabc4a61470c40a3ae2a"
  },
  {
    "hash": "4385d0b998b31f32ed1900f80655fd6a9f8b5ec6",
    "shortHash": "4385d0b",
    "author": "VastSea0",
    "date": "2026-05-19T23:01:11+03:00",
    "subject": "feat: add Android build configuration files, automation script, and documentation",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4385d0b998b31f32ed1900f80655fd6a9f8b5ec6"
  },
  {
    "hash": "55ad1ec20c040c3356905aa5bf9472c9c300822d",
    "shortHash": "55ad1ec",
    "author": "VastSea0",
    "date": "2026-05-19T22:25:14+03:00",
    "subject": "feat: move build/package workflows to local build scripts",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/55ad1ec20c040c3356905aa5bf9472c9c300822d"
  },
  {
    "hash": "c9111ebe3a60cd97d8ff0287c4b9a242ef50dd3c",
    "shortHash": "c9111eb",
    "author": "VastSea0",
    "date": "2026-05-19T22:22:28+03:00",
    "subject": "feat: set version to 0.2.0-alpha.2 and add changelog",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c9111ebe3a60cd97d8ff0287c4b9a242ef50dd3c"
  },
  {
    "hash": "89c4dc87b07a60f4b38d9684bd77abe3685ed609",
    "shortHash": "89c4dc8",
    "author": "VastSea0",
    "date": "2026-05-19T22:15:06+03:00",
    "subject": "feat: pre-install uBlock Origin by default",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/89c4dc87b07a60f4b38d9684bd77abe3685ed609"
  },
  {
    "hash": "c81914464d4b258c8594922012734b2f6895b93c",
    "shortHash": "c819144",
    "author": "VastSea0",
    "date": "2026-05-19T22:07:40+03:00",
    "subject": "feat: add browser-wide Bangs! support",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c81914464d4b258c8594922012734b2f6895b93c"
  },
  {
    "hash": "73951333f348014a9e5d1e37066ef4f4ac31006f",
    "shortHash": "7395133",
    "author": "VastSea0",
    "date": "2026-05-19T22:03:45+03:00",
    "subject": "Hide workspace names in the sidebar under all conditions",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/73951333f348014a9e5d1e37066ef4f4ac31006f"
  },
  {
    "hash": "945a7e7c1413d4bd70e42498992afa6e7e228e70",
    "shortHash": "945a7e7",
    "author": "VastSea0",
    "date": "2026-05-19T22:01:33+03:00",
    "subject": "Add setting to toggle public tab groups visibility in workspaces",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/945a7e7c1413d4bd70e42498992afa6e7e228e70"
  },
  {
    "hash": "148e4a683b1130a081e5492e2ec5a567192a40af",
    "shortHash": "148e4a6",
    "author": "VastSea0",
    "date": "2026-05-19T21:45:50+03:00",
    "subject": "Add preference for public vs workspace-specific pinned tabs",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/148e4a683b1130a081e5492e2ec5a567192a40af"
  },
  {
    "hash": "bb9f73f5d6baf1e51fad93526af30136287627ce",
    "shortHash": "bb9f73f",
    "author": "VastSea0",
    "date": "2026-05-19T21:36:49+03:00",
    "subject": "fix(workspaces): load about:newtab directly for new empty tabs when container retargeting",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bb9f73f5d6baf1e51fad93526af30136287627ce"
  },
  {
    "hash": "7d25c067ca55af214e452b12bc7927a0022d8583",
    "shortHash": "7d25c06",
    "author": "VastSea0",
    "date": "2026-05-19T21:30:37+03:00",
    "subject": "feat(workspaces): remove tab count badge indicator from active workspace",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7d25c067ca55af214e452b12bc7927a0022d8583"
  },
  {
    "hash": "5cc9f481ccd8f6a53bbe24f61c90b5c73c85b31e",
    "shortHash": "5cc9f48",
    "author": "VastSea0",
    "date": "2026-05-19T21:28:38+03:00",
    "subject": "feat(workspaces): restrict workspace bar to single horizontal row with fading scrollable layout",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5cc9f481ccd8f6a53bbe24f61c90b5c73c85b31e"
  },
  {
    "hash": "df746f715d188cd326d534dd8cdd56468638f05f",
    "shortHash": "df746f7",
    "author": "VastSea0",
    "date": "2026-05-19T21:20:54+03:00",
    "subject": "feat(workspaces): switch to emoji picker and hide label for inactive workspaces",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/df746f715d188cd326d534dd8cdd56468638f05f"
  },
  {
    "hash": "72d7884b032d283e142b74c2daacffc51276a14e",
    "shortHash": "72d7884",
    "author": "VastSea0",
    "date": "2026-05-19T19:51:18+03:00",
    "subject": "feat: extract logo into component and apply new visual styling across website components",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/72d7884b032d283e142b74c2daacffc51276a14e"
  },
  {
    "hash": "ddec1246099452b227280fc59bd98fe1fd2ab103",
    "shortHash": "ddec124",
    "author": "VastSea0",
    "date": "2026-05-19T19:46:32+03:00",
    "subject": "feat: initialize project structure with Next.js, Tailwind CSS, and internationalization support",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ddec1246099452b227280fc59bd98fe1fd2ab103"
  },
  {
    "hash": "67b12ca5cef43e256fe2e6cbc47e9292f3225015",
    "shortHash": "67b12ca",
    "author": "VastSea0",
    "date": "2026-05-19T19:13:42+03:00",
    "subject": "refactor: improve Hilal workspace data management with structured validation and container integration",
    "body": "",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/67b12ca5cef43e256fe2e6cbc47e9292f3225015"
  },
  {
    "hash": "2ca927d11c3382a8ddf5391d81e5a8451bded934",
    "shortHash": "2ca927d",
    "author": "VastSea0",
    "date": "2026-05-15T19:46:53+03:00",
    "subject": "Drop BrandShortName/BrandProductName from hilal NSIS branding",
    "body": "These are defined by Mozilla's defines.nsi.in (BrandShortName from\nMOZ_APP_DISPLAYNAME, BrandProductName hardcoded). Defining them in\nbranding.nsi as well causes the Windows installer build to abort with:\n\n  !define: \"BrandProductName\" already defined!\n  !include: error in script: \"defines.nsi\" on line 26\n\nuninstaller.nsi/installer.nsi/stub.nsh include branding.nsi before\ndefines.nsi, so the redefinition is fatal. BrandShortName ends up as\n\"Hilal Browser\" via MOZ_APP_DISPLAYNAME; BrandProductName falls back\nto the upstream \"Firefox\" string in the stub installer dialog and\nwill be polished separately if needed.",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2ca927d11c3382a8ddf5391d81e5a8451bded934"
  },
  {
    "hash": "af2994275ee2172b6427799d14459c269b40abb6",
    "shortHash": "af29942",
    "author": "VastSea0",
    "date": "2026-05-15T19:40:36+03:00",
    "subject": "Add stubinstaller assets to hilal branding overlay",
    "body": "The Windows stub installer (helper.exe) needs bgstub.jpg and the two\ninstaller-page CSS files. Mirror them from the official branding so the\nNSIS-driven installer build can complete on Windows.",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/af2994275ee2172b6427799d14459c269b40abb6"
  },
  {
    "hash": "b122b99915ae2eb49ac07deac2419b53d44b28a8",
    "shortHash": "b122b99",
    "author": "VastSea0",
    "date": "2026-05-15T19:37:22+03:00",
    "subject": "Drop hilal-workspaces.css from workspaces patch",
    "body": "The HilalWorkspaces.js component injects its own styles into a Shadow\nDOM via _getCSS(), so no separate stylesheet ever needed to be\nregistered in jar.mn. The reference to a non-existent\ncontent/hilal/hilal-workspaces.css broke the misc tier of the build\nwith:\n\n  RuntimeError: File 'content/hilal/hilal-workspaces.css' not found in\n  .../browser/base, .../obj-.../browser/base",
    "category": "style",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b122b99915ae2eb49ac07deac2419b53d44b28a8"
  },
  {
    "hash": "73353efeb6b4aa53e0180cdd8a5e8a21445d73bc",
    "shortHash": "73353ef",
    "author": "VastSea0",
    "date": "2026-05-15T19:28:25+03:00",
    "subject": "Replace libwebrtc unified-prefix patch with full goog_cc_scream removal",
    "body": "The previous FILES_PER_UNIFIED_FILE=1 workaround did not fix the\nunderlying mozmake-on-Windows issue: even with a non-unified .obj name,\nmozmake still cannot resolve the obj path during xul.dll link, despite\nthe .obj existing on disk and the path being well under MAX_PATH.\n\nDrop the gn directory from libwebrtc DIRS and stop using\nGoogCcScreamNetworkController in goog_cc_factory.cc; the default\nGoogCcNetworkController fallback handles the affected experimental\nmodes.",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/73353efeb6b4aa53e0180cdd8a5e8a21445d73bc"
  },
  {
    "hash": "4a2939ccbf7d237e7d5cd1c6ab4a63550afd616d",
    "shortHash": "4a2939c",
    "author": "VastSea0",
    "date": "2026-05-15T18:03:52+03:00",
    "subject": "Add patch to avoid libwebrtc unified-prefix collision on Windows",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4a2939ccbf7d237e7d5cd1c6ab4a63550afd616d"
  },
  {
    "hash": "447517f681986a997e84217c4219ef11a0e7f822",
    "shortHash": "447517f",
    "author": "VastSea0",
    "date": "2026-05-14T14:57:51+03:00",
    "subject": "Add MozillaBuild and Python 3.11/3.12 detection to Windows scripts",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/447517f681986a997e84217c4219ef11a0e7f822"
  },
  {
    "hash": "f550fb47493a1ef607e4eeebe078421f39b83788",
    "shortHash": "f550fb4",
    "author": "VastSea0",
    "date": "2026-05-14T14:52:21+03:00",
    "subject": "Fix Join-Path and Resolve-Path for PowerShell 5.1 compatibility",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f550fb47493a1ef607e4eeebe078421f39b83788"
  },
  {
    "hash": "25ddfb25cf9bc6ab80a48f4e62184ab9fdbcb6aa",
    "shortHash": "25ddfb2",
    "author": "VastSea0",
    "date": "2026-05-14T14:50:54+03:00",
    "subject": "Use manual argument parsing and fix python mach invocation in build-windows.ps1",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/25ddfb25cf9bc6ab80a48f4e62184ab9fdbcb6aa"
  },
  {
    "hash": "30e7d3d22a9cb2df27626b0388a956b9cf0d7936",
    "shortHash": "30e7d3d",
    "author": "VastSea0",
    "date": "2026-05-14T14:47:41+03:00",
    "subject": "Add catch-all parameter to build-windows.ps1 for stray args from npm/cmd",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/30e7d3d22a9cb2df27626b0388a956b9cf0d7936"
  },
  {
    "hash": "172cda75b8c61d38775e17e49358e7c2c2a5cb09",
    "shortHash": "172cda7",
    "author": "VastSea0",
    "date": "2026-05-14T14:42:10+03:00",
    "subject": "Pass --no-symlinks to apply.sh on Windows to avoid python3 dependency",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/172cda75b8c61d38775e17e49358e7c2c2a5cb09"
  },
  {
    "hash": "f69efadebccabb215b911fcf615467a9a2242122",
    "shortHash": "f69efad",
    "author": "VastSea0",
    "date": "2026-05-14T14:40:06+03:00",
    "subject": "Add .gitattributes to force LF line endings on patches and shell scripts",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f69efadebccabb215b911fcf615467a9a2242122"
  },
  {
    "hash": "08d8292b2eda2c38dbd486ef945cbc6bb7963649",
    "shortHash": "08d8292",
    "author": "VastSea0",
    "date": "2026-05-14T14:36:07+03:00",
    "subject": "Make apply.sh and refresh.sh work without rsync on Windows",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/08d8292b2eda2c38dbd486ef945cbc6bb7963649"
  },
  {
    "hash": "8517839019a5d1e6718fc6dc884f4f0e78395470",
    "shortHash": "8517839",
    "author": "VastSea0",
    "date": "2026-05-14T14:34:53+03:00",
    "subject": "Fix path handling in Windows build script for Git Bash compatibility",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8517839019a5d1e6718fc6dc884f4f0e78395470"
  },
  {
    "hash": "ce68b73eb628fa70e53f8a2e1309adbeb9d7acad",
    "shortHash": "ce68b73",
    "author": "VastSea0",
    "date": "2026-05-14T14:15:39+03:00",
    "subject": "Add Windows PowerShell build scripts and npm entry points",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ce68b73eb628fa70e53f8a2e1309adbeb9d7acad"
  },
  {
    "hash": "b4497ebd44c3006847c72a7ef71112e4c6000b01",
    "shortHash": "b4497eb",
    "author": "VastSea0",
    "date": "2026-05-14T13:57:25+03:00",
    "subject": "Add Windows build documentation",
    "body": "Adds docs/BUILD-WINDOWS.md with prerequisites, build steps, packaging,\nand common issues for building Hilal Browser on Windows. Also updates\nREADME.md to reference the new doc.",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b4497ebd44c3006847c72a7ef71112e4c6000b01"
  },
  {
    "hash": "6518bec1ca9a45265a61c814a6b028339d805c2a",
    "shortHash": "6518bec",
    "author": "VastSea0",
    "date": "2026-05-14T13:57:15+03:00",
    "subject": "Fix corrupted 0004-hilal-preferences.patch",
    "body": "Regenerate from the actual Firefox tree to fix the malformed diff\nthat caused 'corrupt patch at line 36' during apply.",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6518bec1ca9a45265a61c814a6b028339d805c2a"
  },
  {
    "hash": "3c8c7f0492bba294fcf9644f5275349b61f031f7",
    "shortHash": "3c8c7f0",
    "author": "VastSea0",
    "date": "2026-05-14T10:29:44+03:00",
    "subject": "Add Windows build to release CI workflow",
    "body": "Include windows-latest in the build matrix with the correct artifact\nglob for .zip packages, and add the bootstrap step.",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3c8c7f0492bba294fcf9644f5275349b61f031f7"
  },
  {
    "hash": "bd0ca4d8560e7d30b42fae8c5fe527048a478ba9",
    "shortHash": "bd0ca4d",
    "author": "VastSea0",
    "date": "2026-05-14T00:37:18+03:00",
    "subject": "Add agent workflow documentation",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bd0ca4d8560e7d30b42fae8c5fe527048a478ba9"
  },
  {
    "hash": "dc16f888476731289ac01c3da25e7c6957003b70",
    "shortHash": "dc16f88",
    "author": "VastSea0",
    "date": "2026-05-14T00:35:49+03:00",
    "subject": "Add CI/CD build pipeline and cross-platform mozconfigs",
    "body": "- GitHub Actions workflow for Linux and macOS release builds\n- Pinned Firefox commit (FIREFOX_COMMIT) for reproducible builds\n- Base + per-platform mozconfigs with Hilal branding\n- Add --no-symlinks flag to apply.sh for Windows CI compatibility",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/dc16f888476731289ac01c3da25e7c6957003b70"
  },
  {
    "hash": "0f43be7cbba3d08c1c152ece4c3ea144bcc0c941",
    "shortHash": "0f43be7",
    "author": "VastSea0",
    "date": "2026-05-14T00:35:41+03:00",
    "subject": "Workspace fixes and cleanup",
    "body": "- Remove unused hilal-workspaces.css and its patch references\n- Localize preferences UI with Fluent strings (hilal-l10n.patch)\n- Add data-l10n-id attributes and async l10n formatting in preferences\n- Update HilalWorkspaces.js with improvements",
    "category": "refactor",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0f43be7cbba3d08c1c152ece4c3ea144bcc0c941"
  },
  {
    "hash": "dda9dbad24b0269cf467b37a613414e30a552f5c",
    "shortHash": "dda9dba",
    "author": "VastSea0",
    "date": "2026-05-14T00:10:44+03:00",
    "subject": "Add Hilal workspace system with emoji support",
    "body": "Implements a workspace switcher injected into the sidebar-main shadow DOM,\nsitting above the tools row. Workspaces use Firefox native tab hide/show API.\n\n- Icon-only buttons matching moz-button ghost style (size, tokens, hover/active)\n- Collapsed sidebar: single column; expanded: horizontal wrapping row\n- Right-click any workspace to edit name/emoji or delete\n- + button to create new workspaces\n- Creation/edit dialog using native panel tokens and moz-button elements\n- 50-emoji picker grid with name input and keyboard shortcuts\n- Workspace data persisted via hilal.workspaces.data pref\n- Tab assignment tracked via SessionStore custom values\n- Hilal Browser section in about:preferences with enable toggle and reset\n- apply.sh now symlinks prefs/ files so edits are live without re-running it",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/dda9dbad24b0269cf467b37a613414e30a552f5c"
  },
  {
    "hash": "8b87a9f5945f189a7886f8a309bc0f189d69d912",
    "shortHash": "8b87a9f",
    "author": "VastSea0",
    "date": "2026-05-13T21:18:43+03:00",
    "subject": "Refine Hilal native macOS vibrancy implementation",
    "body": "Update patch to use proper NSVisualEffectView blur instead of CSS backdrop-filter fallbacks, improve glass opacity values, and add WebRender opaque-backdrop fallback for better rendering.",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8b87a9f5945f189a7886f8a309bc0f189d69d912"
  },
  {
    "hash": "897016d3c9f329b9e5ae7317953db26acb2cb88e",
    "shortHash": "897016d",
    "author": "VastSea0",
    "date": "2026-05-13T18:01:28+03:00",
    "subject": "Add native blur layer for Hilal glass",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/897016d3c9f329b9e5ae7317953db26acb2cb88e"
  },
  {
    "hash": "e146874b421d6472c3f8f00748abd569387fc6cf",
    "shortHash": "e146874",
    "author": "VastSea0",
    "date": "2026-05-13T17:53:54+03:00",
    "subject": "Tune Hilal macOS glass readability",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e146874b421d6472c3f8f00748abd569387fc6cf"
  },
  {
    "hash": "70b3ae86deb3624f6e69a95ad068632f512cfd3c",
    "shortHash": "70b3ae8",
    "author": "VastSea0",
    "date": "2026-05-13T17:48:01+03:00",
    "subject": "Use native macOS vibrancy for Hilal chrome",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/70b3ae86deb3624f6e69a95ad068632f512cfd3c"
  },
  {
    "hash": "083100aceb3fc5ecae7195e0ee47a30993b22ec9",
    "shortHash": "083100a",
    "author": "VastSea0",
    "date": "2026-05-13T17:18:16+03:00",
    "subject": "Fix macOS transparent chrome surfaces",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/083100aceb3fc5ecae7195e0ee47a30993b22ec9"
  },
  {
    "hash": "49f65f67a67db3c771790b789ac4cab7bbc25998",
    "shortHash": "49f65f6",
    "author": "VastSea0",
    "date": "2026-05-13T13:59:32+03:00",
    "subject": "Add transparent macOS chrome for Hilal",
    "body": "",
    "category": "feature",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/49f65f67a67db3c771790b789ac4cab7bbc25998"
  },
  {
    "hash": "e3e73ef891a538c157c1f5281e9ce7d643c14ae7",
    "shortHash": "e3e73ef",
    "author": "VastSea0",
    "date": "2026-05-13T13:44:42+03:00",
    "subject": "Show full Hilal Browser wordmark",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e3e73ef891a538c157c1f5281e9ce7d643c14ae7"
  },
  {
    "hash": "720f6811166733c321f5bb8346a155f5894d6767",
    "shortHash": "720f681",
    "author": "VastSea0",
    "date": "2026-05-13T13:17:00+03:00",
    "subject": "Enable sidebar and vertical tabs by default",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/720f6811166733c321f5bb8346a155f5894d6767"
  },
  {
    "hash": "bf7d9e80a714114f1b34ce6d5f2d6b59b1fdd86d",
    "shortHash": "bf7d9e8",
    "author": "VastSea0",
    "date": "2026-05-13T12:50:43+03:00",
    "subject": "Harden Hilal default privacy prefs",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bf7d9e80a714114f1b34ce6d5f2d6b59b1fdd86d"
  },
  {
    "hash": "d6f33c88e7853e9c9c5e29d7b9cca49851b29694",
    "shortHash": "d6f33c8",
    "author": "VastSea0",
    "date": "2026-05-13T11:25:15+03:00",
    "subject": "Fix Hilal logo transparency",
    "body": "",
    "category": "fix",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d6f33c88e7853e9c9c5e29d7b9cca49851b29694"
  },
  {
    "hash": "d76e3f831da72d7fd7b61019663ff88b5b1f4b34",
    "shortHash": "d76e3f8",
    "author": "VastSea0",
    "date": "2026-05-13T11:12:19+03:00",
    "subject": "Rebrand browser as Hilal",
    "body": "",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d76e3f831da72d7fd7b61019663ff88b5b1f4b34"
  },
  {
    "hash": "870e4ab6bfc483635b4dd1a0decf6bc13d4a780b",
    "shortHash": "870e4ab",
    "author": "VastSea0",
    "date": "2026-05-13T00:30:01+03:00",
    "subject": "Initial Hüma Browser patch-layer",
    "body": "Set up this repository as a lightweight patch and overlay layer on top\nof upstream mozilla-firefox/firefox. The Firefox source tree is never\ncommitted; it lives in a gitignored ./firefox/ subdirectory and is\nmanaged entirely by Mozilla's standard tooling (./mach).\n\nContents:\n\n* patches/series + patches/0001-huma-branding-defaults.patch\n  Repoints MOZ_BRANDING_DIRECTORY at browser/branding/huma, sets\n  MOZ_APP_VENDOR=Huma, and pins distribution-id=org.huma so macOS\n  CFBundleIdentifier and helper-process bundle ids reflect the product.\n\n* branding/huma/\n  Full Hüma branding asset directory (53 files). rsync'd into\n  firefox/browser/branding/huma/ by scripts/apply.sh on every apply,\n  so binary assets stay as files instead of base64-inflated patches.\n\n* prefs/\n  Placeholder for future preference/config overlays. Files dropped\n  here are copied to the matching path in the Firefox tree on apply.\n\n* scripts/\n  - setup-firefox.sh : clone Firefox into ./firefox (or fetch if present)\n  - apply.sh         : copy overlays + apply patches in series order\n  - refresh.sh       : regenerate patches from current Firefox tree\n  - sync-upstream.sh : fetch upstream, reset, re-apply Hüma changes\n  - build-macos.sh   : thin wrapper around ./mach build\n  - lib.sh           : shared helpers\n\n* docs/\n  - WORKFLOW.md      : day-to-day workflow + conflict resolution\n  - BUILD-MACOS.md   : macOS build notes\n  - UPSTREAM-SYNC.md : how to roll Hüma forward to a newer Firefox\n\nThe apply/refresh round-trip was verified to be byte-identical against\na clean upstream Firefox checkout.",
    "category": "chore",
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/870e4ab6bfc483635b4dd1a0decf6bc13d4a780b"
  }
];

export const RELEASES_DATA: ReleaseGroup[] = [
  {
    "tag": "main",
    "version": "Geliştirme / Unreleased",
    "isDev": true,
    "date": "2026-09-06T06:52:44+03:00",
    "commitCount": 12,
    "commits": [
      {
        "hash": "de4bdb4c4a96e96b4cb9c235e2680bff4c85860f",
        "shortHash": "de4bdb4",
        "author": "Egehan KAHRAMAN",
        "date": "2026-09-06T06:52:44+03:00",
        "subject": "chore: update changelog data with latest feature commit and increment commit count",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/de4bdb4c4a96e96b4cb9c235e2680bff4c85860f"
      },
      {
        "hash": "4611aae44c4ef4a5340e4ed4ab2591d13e16d995",
        "shortHash": "4611aae",
        "author": "Egehan KAHRAMAN",
        "date": "2026-09-06T06:52:27+03:00",
        "subject": "feat: implement automated changelog generation and display page for web documentation",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4611aae44c4ef4a5340e4ed4ab2591d13e16d995"
      },
      {
        "hash": "b454a46a46e4a871a66c7e33267d80983ba6f15e",
        "shortHash": "b454a46",
        "author": "Egehan KAHRAMAN",
        "date": "2026-09-06T06:42:13+03:00",
        "subject": "Update application update channels and URLs to hilal-browser.vercel.app",
        "body": "Migrate update policy URL, branding download/release endpoints, about dialog links, smoke tests, and documentation from the expired gkdevstudio.org domain to hilal-browser.vercel.app.",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b454a46a46e4a871a66c7e33267d80983ba6f15e"
      },
      {
        "hash": "936f28ac9520540e952f13129144aacc956b4ab0",
        "shortHash": "936f28a",
        "author": "Egehan KAHRAMAN",
        "date": "2026-08-30T17:02:00+03:00",
        "subject": "feat(tahoe): restore dual tabstrip for Tahoe Safari mode and mark as experimental",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/936f28ac9520540e952f13129144aacc956b4ab0"
      },
      {
        "hash": "4d3bb801eafb00acb0e4094e022c2fbc65813b1f",
        "shortHash": "4d3bb80",
        "author": "Egehan KAHRAMAN",
        "date": "2026-08-30T16:55:43+03:00",
        "subject": "chore: update hero chip text and localize key highlights section label",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4d3bb801eafb00acb0e4094e022c2fbc65813b1f"
      },
      {
        "hash": "5c0997298f857ed70631dfff01aa73f3d58bcd57",
        "shortHash": "5c09972",
        "author": "Egehan KAHRAMAN",
        "date": "2026-08-30T16:55:32+03:00",
        "subject": "fix(ui): hide tab labels in vertical pinned tab grid to display only icons",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5c0997298f857ed70631dfff01aa73f3d58bcd57"
      },
      {
        "hash": "48b9aef721ca8634c5bf97458bc588f167ee2917",
        "shortHash": "48b9aef",
        "author": "Egehan KAHRAMAN",
        "date": "2026-08-30T16:54:47+03:00",
        "subject": "refactor: migrate DownloadModal to Material Design 3 and update copy",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/48b9aef721ca8634c5bf97458bc588f167ee2917"
      },
      {
        "hash": "fc0b74367b8ab17af4eaae9bb210334a9113cbb8",
        "shortHash": "fc0b743",
        "author": "Egehan KAHRAMAN",
        "date": "2026-08-30T16:53:03+03:00",
        "subject": "refactor: overhaul landing page with modernized UI, optimized asset loading, and expanded feature documentation",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/fc0b74367b8ab17af4eaae9bb210334a9113cbb8"
      },
      {
        "hash": "c5bafe95647627369a8506854c5fb45a61d6764d",
        "shortHash": "c5bafe9",
        "author": "Egehan KAHRAMAN",
        "date": "2026-08-30T16:47:06+03:00",
        "subject": "fix(ui): disable horizontal tabs in branding prefs and enforce single-line vertical tabs",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c5bafe95647627369a8506854c5fb45a61d6764d"
      },
      {
        "hash": "e07e4ee13612f5b6d29d813cb9825b021d5f7a09",
        "shortHash": "e07e4ee",
        "author": "Egehan KAHRAMAN",
        "date": "2026-08-30T16:35:04+03:00",
        "subject": "feat: isolate Tahoe Safari shell and restore standard Hilal UI as primary",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e07e4ee13612f5b6d29d813cb9825b021d5f7a09"
      },
      {
        "hash": "fc3bacd6032f1495193e815b09421bf604bb9966",
        "shortHash": "fc3bacd",
        "author": "VastSea0",
        "date": "2026-06-24T16:09:35+03:00",
        "subject": "feat: add build and doctor commands to hil CLI and update Windows build documentation",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/fc3bacd6032f1495193e815b09421bf604bb9966"
      },
      {
        "hash": "7a6d266d6cb58875bfb61e8d3d4fae639e3a0108",
        "shortHash": "7a6d266",
        "author": "VastSea0",
        "date": "2026-06-22T16:13:14+03:00",
        "subject": "ci: optimize Windows and Linux build caching and parallelism",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7a6d266d6cb58875bfb61e8d3d4fae639e3a0108"
      }
    ],
    "highlights": null,
    "githubUrl": "https://github.com/VastSea0/hilal-browser/commits/main",
    "compareUrl": "https://github.com/VastSea0/hilal-browser/compare/v0.3.0-alpha.6...main"
  },
  {
    "tag": "v0.3.0-alpha.6",
    "version": "0.3.0-alpha.6",
    "isDev": false,
    "date": "2026-06-21T22:12:52+03:00",
    "commitCount": 6,
    "commits": [
      {
        "hash": "2b96b8f140b920ebfd1e6fea173908be6d954d2f",
        "shortHash": "2b96b8f",
        "author": "VastSea0",
        "date": "2026-06-21T22:12:52+03:00",
        "subject": "release: bump version to v0.3.0-alpha.6",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2b96b8f140b920ebfd1e6fea173908be6d954d2f"
      },
      {
        "hash": "7de60df7b6377cdd4c4f8fe3f5bf8733e6f461e7",
        "shortHash": "7de60df",
        "author": "VastSea0",
        "date": "2026-06-21T17:00:28+03:00",
        "subject": "feat: implement dynamic Tahoe scroll reflection and page background synchronization with zoom-aware updates",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7de60df7b6377cdd4c4f8fe3f5bf8733e6f461e7"
      },
      {
        "hash": "b22bed38ebf1ad24a3d700100b85d5c4b78ff502",
        "shortHash": "b22bed3",
        "author": "VastSea0",
        "date": "2026-06-20T05:56:58+03:00",
        "subject": "update readme",
        "body": "",
        "category": "docs",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b22bed38ebf1ad24a3d700100b85d5c4b78ff502"
      },
      {
        "hash": "f87050b9a23d050c08ee16d328f900dc36234ee7",
        "shortHash": "f87050b",
        "author": "VastSea0",
        "date": "2026-06-20T05:53:20+03:00",
        "subject": "Simplify README",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f87050b9a23d050c08ee16d328f900dc36234ee7"
      },
      {
        "hash": "b3d92e0b8b40ac85f44c0c5d7397ea9b698eb478",
        "shortHash": "b3d92e0",
        "author": "VastSea0",
        "date": "2026-06-20T05:51:42+03:00",
        "subject": "fix(ci): stabilize Linux and Windows builds",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b3d92e0b8b40ac85f44c0c5d7397ea9b698eb478"
      },
      {
        "hash": "d4ea95117c3e709bcfb1b73ca55d0f7136062cf2",
        "shortHash": "d4ea951",
        "author": "VastSea0",
        "date": "2026-06-18T00:29:36+03:00",
        "subject": "fix(ci): fix persistent build failures",
        "body": "- Remove engine source cache: 3-4 GB was hitting eviction limits and\n  hil setup would delete it anyway on a commit mismatch; clone is\n  now unconditional and consistent.\n\n- Fix sccache cache key: was using github.run_id (unique per run) so\n  the primary key never matched. New key is scoped to upstream.lock\n  hash so sccache restores across builds at the same Firefox revision.\n  Added v2 prefix to bust stale keys from prior failed runs.\n\n- Enable SCCACHE_GHA_ENABLED on the build step so mach build actually\n  uses the sccache server started in the setup step.\n\n- Extend Linux timeout from 180 to 360 minutes. A cold Firefox build\n  takes 180-300+ minutes; the old limit guaranteed timeouts.\n\n- Add job limit to mozconfigs/linux (-j3). Unconstrained parallelism\n  on 4-core/16 GB runners OOMs during linking.\n\n- Expand Linux disk cleanup to free an additional 5-8 GB (CodeQL,\n  Ruby, PyPy, CUDA, Miniconda, Docker images).",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d4ea95117c3e709bcfb1b73ca55d0f7136062cf2"
      }
    ],
    "highlights": {
      "added": [
        "Integrated zoom-aware scroll reflection and automatic background synchronization updates for Tahoe mode."
      ],
      "changed": [],
      "fixed": []
    },
    "githubUrl": "https://github.com/VastSea0/hilal-browser/releases/tag/v0.3.0-alpha.6",
    "compareUrl": "https://github.com/VastSea0/hilal-browser/compare/v0.3.0-alpha.5...v0.3.0-alpha.6"
  },
  {
    "tag": "v0.3.0-alpha.5",
    "version": "0.3.0-alpha.5",
    "isDev": false,
    "date": "2026-06-16T22:12:27+03:00",
    "commitCount": 9,
    "commits": [
      {
        "hash": "4523a3e88eaa60bc577203adc4bf096748614d84",
        "shortHash": "4523a3e",
        "author": "VastSea0",
        "date": "2026-06-16T22:12:27+03:00",
        "subject": "fix(release): resolve build workflow issues and bump version to v0.3.0-alpha.5",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4523a3e88eaa60bc577203adc4bf096748614d84"
      },
      {
        "hash": "24c23d360a7ec25190964f7bc3992a5660701f78",
        "shortHash": "24c23d3",
        "author": "VastSea0",
        "date": "2026-06-16T22:03:58+03:00",
        "subject": "docs: rebrand Huma Browser to Hilal Browser and overhaul README documentation",
        "body": "",
        "category": "docs",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/24c23d360a7ec25190964f7bc3992a5660701f78"
      },
      {
        "hash": "614b89a653901250e55034f79e7079b37591f1e6",
        "shortHash": "614b89a",
        "author": "VastSea0",
        "date": "2026-06-16T21:58:38+03:00",
        "subject": "refactor: standardize color picker geometry and update arc rendering to use cubic bezier curves",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/614b89a653901250e55034f79e7079b37591f1e6"
      },
      {
        "hash": "3693bf4b4d6c151994ce2507b82f83077d979c59",
        "shortHash": "3693bf4",
        "author": "VastSea0",
        "date": "2026-06-16T21:57:57+03:00",
        "subject": "feat: implement visual feedback, scroll reflection, and Oklab color blending with refactored Hilal color picker logic",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3693bf4b4d6c151994ce2507b82f83077d979c59"
      },
      {
        "hash": "dc44bc32eb25d8177c5cbe22574f5b6d7b26b2c0",
        "shortHash": "dc44bc3",
        "author": "VastSea0",
        "date": "2026-06-16T21:53:17+03:00",
        "subject": "refactor: implement advanced Oklab-based color blending for Hilal page boosts",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/dc44bc32eb25d8177c5cbe22574f5b6d7b26b2c0"
      },
      {
        "hash": "73a76e3c6a8d0f541899b8495d6ffc19bae83698",
        "shortHash": "73a76e3",
        "author": "VastSea0",
        "date": "2026-06-16T03:23:31+03:00",
        "subject": "feat: implement dynamic Tahoe page background boosting based on site accent colors",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/73a76e3c6a8d0f541899b8495d6ffc19bae83698"
      },
      {
        "hash": "f65ed7b016bc27758f0828f6670476e9b7956d0b",
        "shortHash": "f65ed7b",
        "author": "VastSea0",
        "date": "2026-06-16T02:58:02+03:00",
        "subject": "style: replace content frame rotation animation with clean scale pulse in site customizer",
        "body": "",
        "category": "style",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f65ed7b016bc27758f0828f6670476e9b7956d0b"
      },
      {
        "hash": "08040ca78754d28e766689ba57bba4fc2a362016",
        "shortHash": "08040ca",
        "author": "VastSea0",
        "date": "2026-06-16T02:51:28+03:00",
        "subject": "style: increase opacity of urlbar dropdown background for improved readability",
        "body": "",
        "category": "style",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/08040ca78754d28e766689ba57bba4fc2a362016"
      },
      {
        "hash": "3fa4dcffad3952f5bc5fa096b29f239c85c26c0a",
        "shortHash": "3fa4dcf",
        "author": "VastSea0",
        "date": "2026-06-16T02:46:09+03:00",
        "subject": "feat: hide workspace name in urlbar by default and tab colored lines globally",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3fa4dcffad3952f5bc5fa096b29f239c85c26c0a"
      }
    ],
    "highlights": {
      "added": [],
      "changed": [],
      "fixed": [
        "Fixed release workflow build and packaging configurations for Linux (AppImage dependency resolution) and Windows (MozillaBuild Python execution pathway)."
      ]
    },
    "githubUrl": "https://github.com/VastSea0/hilal-browser/releases/tag/v0.3.0-alpha.5",
    "compareUrl": "https://github.com/VastSea0/hilal-browser/compare/v0.3.0-alpha.4...v0.3.0-alpha.5"
  },
  {
    "tag": "v0.3.0-alpha.4",
    "version": "0.3.0-alpha.4",
    "isDev": false,
    "date": "2026-06-16T02:35:10+03:00",
    "commitCount": 59,
    "commits": [
      {
        "hash": "022cd7931e5310693bc0abf814dca3283d01cd05",
        "shortHash": "022cd79",
        "author": "VastSea0",
        "date": "2026-06-16T02:35:10+03:00",
        "subject": "Bump version to 0.3.0-alpha.4",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/022cd7931e5310693bc0abf814dca3283d01cd05"
      },
      {
        "hash": "a0d31fd6562ca4353bab8ee44bc9bc53b4e24f8d",
        "shortHash": "a0d31fd",
        "author": "Egehan KAHRAMAN",
        "date": "2026-06-16T02:21:39+03:00",
        "subject": "video file",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a0d31fd6562ca4353bab8ee44bc9bc53b4e24f8d"
      },
      {
        "hash": "915dcf624427f116a4a608b9d76e1d4775231320",
        "shortHash": "915dcf6",
        "author": "VastSea0",
        "date": "2026-06-16T02:06:28+03:00",
        "subject": "feat: implement dynamic scroll reflection background and refine Tahoe Safari UI visual styles",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/915dcf624427f116a4a608b9d76e1d4775231320"
      },
      {
        "hash": "ee251ca593659a393d179bf731e8414eb61de3e0",
        "shortHash": "ee251ca",
        "author": "VastSea0",
        "date": "2026-06-15T23:10:48+03:00",
        "subject": "refactor: constrain scroll reflection canvas to tabbox dimensions and simplify draw logic",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ee251ca593659a393d179bf731e8414eb61de3e0"
      },
      {
        "hash": "f5c9245fe7a6e66417d9c88a0adc1414ff1f4320",
        "shortHash": "f5c9245",
        "author": "VastSea0",
        "date": "2026-06-15T16:52:58+03:00",
        "subject": "revert: replace WebGL liquid glass with standard CSS frosted-glass for suggestions dropdown",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f5c9245fe7a6e66417d9c88a0adc1414ff1f4320"
      },
      {
        "hash": "fb1158ca4bebf3ce9c54ba02e1c262071c7bc7c4",
        "shortHash": "fb1158c",
        "author": "VastSea0",
        "date": "2026-06-15T15:04:39+03:00",
        "subject": "feat: WebGL-based liquid glass effect for suggestions dropdown",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/fb1158ca4bebf3ce9c54ba02e1c262071c7bc7c4"
      },
      {
        "hash": "be341e65a5f60b94cc1bfc94596ea2f9d4ed3782",
        "shortHash": "be341e6",
        "author": "VastSea0",
        "date": "2026-06-15T13:35:16+03:00",
        "subject": "style: update mask and transform properties for hilal-tahoe theme overlay",
        "body": "",
        "category": "style",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/be341e65a5f60b94cc1bfc94596ea2f9d4ed3782"
      },
      {
        "hash": "3b4b1cd8bcbee338821ad7bc16bd931d6da0e2a9",
        "shortHash": "3b4b1cd",
        "author": "VastSea0",
        "date": "2026-06-15T13:26:53+03:00",
        "subject": "feat: add support for right-aligned compact sidebar and improve scroll reflection rendering in Tahoe mode",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3b4b1cd8bcbee338821ad7bc16bd931d6da0e2a9"
      },
      {
        "hash": "1f205c2f920c1ee37f9067589db031691e910184",
        "shortHash": "1f205c2",
        "author": "VastSea0",
        "date": "2026-06-15T13:16:49+03:00",
        "subject": "feat: add blur, saturation, and scaling effects to scroll reflection for smoother visual transition",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/1f205c2f920c1ee37f9067589db031691e910184"
      },
      {
        "hash": "67254ae6a56099a748f451512411b9756d14f999",
        "shortHash": "67254ae",
        "author": "VastSea0",
        "date": "2026-06-15T13:10:07+03:00",
        "subject": "feat: implement scroll reflection for Hilal Tahoe layout using WindowActor and canvas snapshotting",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/67254ae6a56099a748f451512411b9756d14f999"
      },
      {
        "hash": "f186575b50042fca021781d328da9a954579cbba",
        "shortHash": "f186575",
        "author": "VastSea0",
        "date": "2026-06-15T10:36:10+03:00",
        "subject": "feat: use tab element as drag feedback image in Tahoe horizontal tabs",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f186575b50042fca021781d328da9a954579cbba"
      },
      {
        "hash": "e5db985080cd03c43a6f7ed9ccaba6b8adfe4c98",
        "shortHash": "e5db985",
        "author": "VastSea0",
        "date": "2026-06-15T02:41:09+03:00",
        "subject": "Fix overlay file patch conflicts in tahoe-safari-shell.patch",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e5db985080cd03c43a6f7ed9ccaba6b8adfe4c98"
      },
      {
        "hash": "e6bbd60312af55db55588a0e70d9baaebd36aafc",
        "shortHash": "e6bbd60",
        "author": "VastSea0",
        "date": "2026-06-15T02:17:30+03:00",
        "subject": "Fix Tahoe address bar suggestions dropdown background selector and overlays",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e6bbd60312af55db55588a0e70d9baaebd36aafc"
      },
      {
        "hash": "d7c4802a3e01ccb5c25f109404756936290c6362",
        "shortHash": "d7c4802",
        "author": "VastSea0",
        "date": "2026-06-15T02:00:36+03:00",
        "subject": "feat: implement liquid glass styling for horizontal tab drag and drop operations",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d7c4802a3e01ccb5c25f109404756936290c6362"
      },
      {
        "hash": "d26a79f520afbdd7f8afc3448dea348a9ab92745",
        "shortHash": "d26a79f",
        "author": "VastSea0",
        "date": "2026-06-15T01:51:36+03:00",
        "subject": "feat: implement drag-and-drop support for safari sidebar tabs with visual feedback",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d26a79f520afbdd7f8afc3448dea348a9ab92745"
      },
      {
        "hash": "b0e7d67b71d77e4ea7eb733dae7c8485b9cc4a6f",
        "shortHash": "b0e7d67",
        "author": "VastSea0",
        "date": "2026-06-15T01:34:58+03:00",
        "subject": "refactor: update hilal-tahoe theme layout for sidebar positioning and tab bar styling",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b0e7d67b71d77e4ea7eb733dae7c8485b9cc4a6f"
      },
      {
        "hash": "5488c2845bdccf13d47864940c4ef5a051f7e2e7",
        "shortHash": "5488c28",
        "author": "VastSea0",
        "date": "2026-06-15T01:18:38+03:00",
        "subject": "fix: stretch Tahoe sidebar panel to window bounds",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5488c2845bdccf13d47864940c4ef5a051f7e2e7"
      },
      {
        "hash": "98b43f970b15f37bf7e29cdd06429d44a2d4edd5",
        "shortHash": "98b43f9",
        "author": "VastSea0",
        "date": "2026-06-15T01:07:46+03:00",
        "subject": "fix: measure Tahoe content geometry dynamically",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/98b43f970b15f37bf7e29cdd06429d44a2d4edd5"
      },
      {
        "hash": "be064fe2c61ea44e52929f48743c5de1127c8e4f",
        "shortHash": "be064fe",
        "author": "VastSea0",
        "date": "2026-06-15T00:54:49+03:00",
        "subject": "fix: flatten Tahoe webview frame in sidebar mode",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/be064fe2c61ea44e52929f48743c5de1127c8e4f"
      },
      {
        "hash": "687034bcdb536e3092f41d91f4d23c9607fa34c4",
        "shortHash": "687034b",
        "author": "VastSea0",
        "date": "2026-06-15T00:39:13+03:00",
        "subject": "fix: constrain Tahoe page bleed to content area",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/687034bcdb536e3092f41d91f4d23c9607fa34c4"
      },
      {
        "hash": "78b9219acb3fa33f1b97eb165657fcd4bb13556d",
        "shortHash": "78b9219",
        "author": "VastSea0",
        "date": "2026-06-15T00:30:05+03:00",
        "subject": "fix: align Tahoe sidebar bleed with webview edge",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/78b9219acb3fa33f1b97eb165657fcd4bb13556d"
      },
      {
        "hash": "9bed404db35a5dce6425b7bb95e52d2e947cae0f",
        "shortHash": "9bed404",
        "author": "VastSea0",
        "date": "2026-06-15T00:26:57+03:00",
        "subject": "refactor: migrate HilalTahoe messaging to per-page background color updates and implement tab drag-and-drop visuals",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9bed404db35a5dce6425b7bb95e52d2e947cae0f"
      },
      {
        "hash": "af9bbd4d143154729908fcddd106d8813053cdf6",
        "shortHash": "af9bbd4",
        "author": "VastSea0",
        "date": "2026-06-14T23:37:30+03:00",
        "subject": "feat: add HilalTahoe JSWindowActor to synchronize sidebar-aware browser underlap offsets",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/af9bbd4d143154729908fcddd106d8813053cdf6"
      },
      {
        "hash": "b91e41b51bd0b1362d7a587c174aaa2f7f97fc88",
        "shortHash": "b91e41b",
        "author": "VastSea0",
        "date": "2026-06-14T17:34:38+03:00",
        "subject": "feat: implement horizontal tab strip mode in Hilal browser with dynamic toolbar widget management",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b91e41b51bd0b1362d7a587c174aaa2f7f97fc88"
      },
      {
        "hash": "a4820ffb19af7074ad97b22f14b32f1fe01779de",
        "shortHash": "a4820ff",
        "author": "VastSea0",
        "date": "2026-06-14T16:55:58+03:00",
        "subject": "feat: enhance hilal-tahoe theme styling and urlbar layout for side-sidebar mode",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a4820ffb19af7074ad97b22f14b32f1fe01779de"
      },
      {
        "hash": "993a1a5b1b6965a9c791181a27c0d9d1d00d3a76",
        "shortHash": "993a1a5",
        "author": "VastSea0",
        "date": "2026-06-14T16:36:09+03:00",
        "subject": "refactor: redesign Tahoe Safari shell with improved sidebar controls and tab layout styling",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/993a1a5b1b6965a9c791181a27c0d9d1d00d3a76"
      },
      {
        "hash": "ac98643b153e791f89989e4ff4743081328717b4",
        "shortHash": "ac98643",
        "author": "VastSea0",
        "date": "2026-06-14T16:19:49+03:00",
        "subject": "Fix tabstrip layout and observer registration when toggling horizontal tabs in vertical tabs mode",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ac98643b153e791f89989e4ff4743081328717b4"
      },
      {
        "hash": "14aaaede5136eaa8da76914316a766b5819e8fae",
        "shortHash": "14aaaed",
        "author": "VastSea0",
        "date": "2026-06-14T04:51:51+03:00",
        "subject": "style: position normal sidebar to enclose traffic lights and fix empty compact mode sidebar layout",
        "body": "",
        "category": "style",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/14aaaede5136eaa8da76914316a766b5819e8fae"
      },
      {
        "hash": "b1288f18732da0201bfd5b94ed9ae90f37741e9c",
        "shortHash": "b1288f1",
        "author": "VastSea0",
        "date": "2026-06-14T04:47:16+03:00",
        "subject": "refactor: update sidebar and navigator-toolbox to implement V2 classic slide-up layout styles",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b1288f18732da0201bfd5b94ed9ae90f37741e9c"
      },
      {
        "hash": "ef73e638de01872a84c883c10fba75aa91601679",
        "shortHash": "ef73e63",
        "author": "VastSea0",
        "date": "2026-06-14T04:34:14+03:00",
        "subject": "feat: implement compact mode toggle and adjust safari shell sidebar layout dimensions",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ef73e638de01872a84c883c10fba75aa91601679"
      },
      {
        "hash": "e89710d015b69f9e39fb554c8a26dd830b6048b9",
        "shortHash": "e89710d",
        "author": "VastSea0",
        "date": "2026-06-14T04:32:05+03:00",
        "subject": "feat: implement Safari-style sidebar shell and layout components with Tahoe theme support",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e89710d015b69f9e39fb554c8a26dd830b6048b9"
      },
      {
        "hash": "37b5578630ce0672d4cfc3276c42535144123705",
        "shortHash": "37b5578",
        "author": "VastSea0",
        "date": "2026-06-14T04:23:07+03:00",
        "subject": "feat: implement Safari-style browser shell with floating toolbar and sidebar adjustments",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/37b5578630ce0672d4cfc3276c42535144123705"
      },
      {
        "hash": "4ff38367b559beaa05ba90557fd4638f29abe84c",
        "shortHash": "4ff3836",
        "author": "VastSea0",
        "date": "2026-06-14T03:21:58+03:00",
        "subject": "Style vertical tabs sidebar to match Safari layout and neutral highlights in Tahoe mode",
        "body": "",
        "category": "style",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4ff38367b559beaa05ba90557fd4638f29abe84c"
      },
      {
        "hash": "2203592453ca94762d97a25f43b566a5fdedb6d2",
        "shortHash": "2203592",
        "author": "VastSea0",
        "date": "2026-06-14T03:15:23+03:00",
        "subject": "Fix macOS native vibrancy blur and compact toolbar overlap under Tahoe mode",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2203592453ca94762d97a25f43b566a5fdedb6d2"
      },
      {
        "hash": "4b575eb710da06a8619deb00d6cf7a4b07703c23",
        "shortHash": "4b575eb",
        "author": "VastSea0",
        "date": "2026-06-14T03:04:30+03:00",
        "subject": "Implement Tahoe Safari-inspired shell and fix glass transparency issues",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4b575eb710da06a8619deb00d6cf7a4b07703c23"
      },
      {
        "hash": "369a251356f7e363cbfa671993ff77b1c9d718dd",
        "shortHash": "369a251",
        "author": "VastSea0",
        "date": "2026-06-13T02:03:55+03:00",
        "subject": "fix compact mode layout heights and absolute traffic lights offset",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/369a251356f7e363cbfa671993ff77b1c9d718dd"
      },
      {
        "hash": "a9b93a74c318d10473497e66262d8a04da71f090",
        "shortHash": "a9b93a7",
        "author": "VastSea0",
        "date": "2026-06-13T01:53:19+03:00",
        "subject": "fix compact mode traffic lights fixed positioning and sidebar top padding spacing",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a9b93a74c318d10473497e66262d8a04da71f090"
      },
      {
        "hash": "a382d38b836a359e489fd1516bef04740f21115a",
        "shortHash": "a382d38",
        "author": "VastSea0",
        "date": "2026-06-13T01:44:51+03:00",
        "subject": "fix compact mode overlaps and traffic lights persistence",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a382d38b836a359e489fd1516bef04740f21115a"
      },
      {
        "hash": "b93699297ffaeee704ed3faf6d4f7e3a84f80cc5",
        "shortHash": "b936992",
        "author": "VastSea0",
        "date": "2026-06-13T01:34:11+03:00",
        "subject": "feat: absolute position macOS traffic lights in compact mode to ignore nav-bar padding",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b93699297ffaeee704ed3faf6d4f7e3a84f80cc5"
      },
      {
        "hash": "ee58fd366071094ba322aa2bc20a3f1b58f0c663",
        "shortHash": "ee58fd3",
        "author": "VastSea0",
        "date": "2026-06-13T01:32:22+03:00",
        "subject": "refactor: implement V2 Classic Slide-Up Toolbar with full-width layout and centered navigation controls",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ee58fd366071094ba322aa2bc20a3f1b58f0c663"
      },
      {
        "hash": "1d82647689bb5f805040b1d56d7371213100da2f",
        "shortHash": "1d82647",
        "author": "VastSea0",
        "date": "2026-06-13T00:43:38+03:00",
        "subject": "feat: refine sidebar layout with improved sizing, drag handling, and optimized toolbar interaction styling",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/1d82647689bb5f805040b1d56d7371213100da2f"
      },
      {
        "hash": "29112f0e14dc9b6706ab9de6460b15052818f95f",
        "shortHash": "29112f0",
        "author": "VastSea0",
        "date": "2026-06-13T00:28:32+03:00",
        "subject": "Merge branch 'main' of https://github.com/VastSea0/hilal-browser",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/29112f0e14dc9b6706ab9de6460b15052818f95f"
      },
      {
        "hash": "4ab1989e21f99c295d81980bcceb2fed2fb489e4",
        "shortHash": "4ab1989",
        "author": "VastSea0",
        "date": "2026-06-12T20:09:30+03:00",
        "subject": "Update sidebar layout and styling with glassmorphism and compact width",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4ab1989e21f99c295d81980bcceb2fed2fb489e4"
      },
      {
        "hash": "9c141613a81c95e45618f3b8cc9e8978bdf0fd04",
        "shortHash": "9c14161",
        "author": "VastSea0",
        "date": "2026-06-12T13:48:54+03:00",
        "subject": "Keep traffic lights visible inside compact sidebar when toolbar is hidden",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9c141613a81c95e45618f3b8cc9e8978bdf0fd04"
      },
      {
        "hash": "dff91bdddccc0807819580ebcc25ae80daeaaf93",
        "shortHash": "dff91bd",
        "author": "VastSea0",
        "date": "2026-06-12T13:48:54+03:00",
        "subject": "Keep traffic lights visible inside compact sidebar when toolbar is hidden",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/dff91bdddccc0807819580ebcc25ae80daeaaf93"
      },
      {
        "hash": "593e290ba82b8610a7a4092f30ec6248c58ff450",
        "shortHash": "593e290",
        "author": "VastSea0",
        "date": "2026-06-12T13:41:00+03:00",
        "subject": "Move traffic lights into sidebar card when both sidebar and toolbar are visible",
        "body": "When the compact toolbar is shifted right (starts after the sidebar),\n#titlebar moves right with it, placing the traffic lights in the toolbar\ncard instead of the sidebar.\n\nFix: use position:absolute on #titlebar with a negative inset-inline-start\nequal to the toolbar's shift amount. This pulls #titlebar back to window\nx=0 (inside the sidebar card area) while taking it out of the toolbar's\nflex flow so #nav-bar continues to start cleanly at the toolbar card edge.\n\n#titlebar is transparent on macOS — only the native AppKit NSView traffic\nlight buttons are visible. The toolbox has overflow:visible when shown, so\n#titlebar can paint outside the toolbar card to the left. The\n.titlebar-buttonbox-container gets pointer-events:auto so traffic lights\nremain fully clickable.",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/593e290ba82b8610a7a4092f30ec6248c58ff450"
      },
      {
        "hash": "aca430af61658536ce585dacc3b633c4df0bd9f6",
        "shortHash": "aca430a",
        "author": "VastSea0",
        "date": "2026-06-12T13:36:12+03:00",
        "subject": "Rework compact sidebar+toolbar co-existence layout",
        "body": "Previous approach: push sidebar top down by 64px when toolbar is visible.\nThis blocked the macOS traffic lights and looked unnatural.\n\nNew approach: keep sidebar at top:0 (traffic lights render naturally at the\ntop of the sidebar card on macOS), and instead shift the toolbar's left\nedge to start after the sidebar width so the two never overlap.\n\nA CSS custom property --hilal-compact-sidebar-width (52px icon-only,\n280px vertical-tabs) drives the toolbar offset calculation so there is\na single rule that works for both sidebar configurations:\n\n  left: calc(sidebar-width + 12px)\n  width: calc(100vw - sidebar-width - 24px)\n\nFor the right-side sidebar variant, only the width is reduced from the\nright; left stays at 12px.",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/aca430af61658536ce585dacc3b633c4df0bd9f6"
      },
      {
        "hash": "2047454ecf749515e89949d54f28da42f77ed913",
        "shortHash": "2047454",
        "author": "VastSea0",
        "date": "2026-06-12T13:27:54+03:00",
        "subject": "Fix URL bar ghost: target nav-bar and urlbar directly in compact hide state",
        "body": "The URL bar in Nova-mode Firefox is a <panel popover> element rendered\nin the browser top layer. Top-layer elements are completely immune to\nancestor transform, clip-path, overflow and opacity — they always render\nat their layout position, bypassing the toolbox slide entirely.\n\nclip-path: inset(0) and overflow: hidden on the toolbox ancestor have\nno effect on the URL bar for this reason.\n\nFix: use #navigator-toolbox:not(.hilal-compact-visible) to directly\nset opacity:0 and visibility:hidden on #nav-bar and .urlbar themselves.\nThe 0.15s transition is shorter than the 0.3s toolbox slide so content\nfully fades out before the toolbox finishes moving, with no ghost frame.",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2047454ecf749515e89949d54f28da42f77ed913"
      },
      {
        "hash": "82795088aa30ca0b0856d51f0273655eaad2e6ca",
        "shortHash": "8279508",
        "author": "VastSea0",
        "date": "2026-06-12T13:23:00+03:00",
        "subject": "Fix URL bar text/icon glitch during compact toolbar hide animation",
        "body": "The URL bar has  which promotes it to its own\nGPU compositing layer.  on a transformed parent cannot\nclip promoted child compositor layers - the URL bar content lingered\non screen as a ghost after the toolbox started sliding upward.\n\n creates a compositor-level mask that correctly\nclips ALL child layers including the URL bar's promoted layer, so text,\nicons and the URL bar background disappear in sync with the toolbox slide.\n\n is cleared to  in the visible state so URL bar\nautocomplete dropdowns are not cut off when the toolbar is shown.",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/82795088aa30ca0b0856d51f0273655eaad2e6ca"
      },
      {
        "hash": "9a37ca8db01268a48302b9e4329a9c8f4c0e06f4",
        "shortHash": "9a37ca8",
        "author": "VastSea0",
        "date": "2026-06-12T03:24:25+03:00",
        "subject": "Fix compact mode toolbar/sidebar overlap and URL bar content bleed",
        "body": "- overflow:hidden on the hidden toolbox clips URL bar icons and text\n  that would bleed outside the sliding element during the hide animation.\n  overflow:visible is restored when the toolbox is shown so autocomplete\n  dropdowns from the URL bar still appear normally.\n\n- CSS :has() rule offsets the compact sidebar top by 64px when the\n  floating toolbar is also visible, preventing both elements from\n  occupying the same top-corner and blocking the macOS traffic lights.\n  The top offset animates back to 0 when the toolbar hides.\n\n- Co-schedule sidebar and toolbar hides inside the same setTimeout\n  callback so both animate out in the exact same frame rather than\n  potentially staggering by one frame when the mouse leaves the\n  shared hover zone.",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9a37ca8db01268a48302b9e4329a9c8f4c0e06f4"
      },
      {
        "hash": "c018b5395310ff46fb2bc4a29a817fcfde401567",
        "shortHash": "c018b53",
        "author": "VastSea0",
        "date": "2026-06-12T03:03:53+03:00",
        "subject": "Ensure regular unpinned vertical tab backgrounds fill 100% size after layout toggling",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c018b5395310ff46fb2bc4a29a817fcfde401567"
      },
      {
        "hash": "c56a95adfcdbb8c6efa23759bb30896dc89520bf",
        "shortHash": "c56a95a",
        "author": "VastSea0",
        "date": "2026-06-12T03:00:15+03:00",
        "subject": "Ensure vertical pinned tab backgrounds fill 100% card size after layout toggling",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c56a95adfcdbb8c6efa23759bb30896dc89520bf"
      },
      {
        "hash": "bf37007ca11df52d2f342ec03b2cdc0cd713e09e",
        "shortHash": "bf37007",
        "author": "VastSea0",
        "date": "2026-06-12T02:54:42+03:00",
        "subject": "Fix duplicate pinned tab creation by checking pinned tabs cache on onboarding finish",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bf37007ca11df52d2f342ec03b2cdc0cd713e09e"
      },
      {
        "hash": "f5b9a318306702c75dafacd830ef4696087409c7",
        "shortHash": "f5b9a31",
        "author": "VastSea0",
        "date": "2026-06-12T02:54:11+03:00",
        "subject": "Fix vertical pinned tab backgrounds being vertically squished in sidebar",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f5b9a318306702c75dafacd830ef4696087409c7"
      },
      {
        "hash": "8d0e72145bcc23699ff79de03f3c54f2b517069a",
        "shortHash": "8d0e721",
        "author": "VastSea0",
        "date": "2026-06-12T02:49:39+03:00",
        "subject": "refactor: update pinned site lookup and implement sidebar compact mode logic",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8d0e72145bcc23699ff79de03f3c54f2b517069a"
      },
      {
        "hash": "200e68fdcdb7b0679f5392045eee2c4c58f98c61",
        "shortHash": "200e68f",
        "author": "VastSea0",
        "date": "2026-06-12T02:41:55+03:00",
        "subject": "feat: improve HilalWelcome UI stability, persist site pinning, and adjust compact mode logic",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/200e68fdcdb7b0679f5392045eee2c4c58f98c61"
      },
      {
        "hash": "7959f225f6bbc4164413f8bf1f9a8cc4ff60ae62",
        "shortHash": "7959f22",
        "author": "VastSea0",
        "date": "2026-06-12T02:28:13+03:00",
        "subject": "feat: persist preference selections in HilalWelcome and update UI transparency and sidebar visibility state",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7959f225f6bbc4164413f8bf1f9a8cc4ff60ae62"
      },
      {
        "hash": "991734dea99d9b30e9657f778c5ecdc4fe889b4f",
        "shortHash": "991734d",
        "author": "VastSea0",
        "date": "2026-06-12T02:16:39+03:00",
        "subject": "feat: introduce welcome stage awareness and refined compact mode toggle logic in HilalCompactMode",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/991734dea99d9b30e9657f778c5ecdc4fe889b4f"
      },
      {
        "hash": "381efba06d2389f8b76b6f9f89333b5d29ebc725",
        "shortHash": "381efba",
        "author": "VastSea0",
        "date": "2026-06-12T00:51:55+03:00",
        "subject": "refactor: remove browser chrome hiding logic and redesign HilalWelcome UI components",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/381efba06d2389f8b76b6f9f89333b5d29ebc725"
      }
    ],
    "highlights": {
      "added": [
        "**Tahoe Safari-Inspired Shell**: Introduced Safari-style vertical and horizontal sidebar layout options, custom page-bleed parameters, and synchronized underlap offsets.",
        "**Dynamic Scroll Reflection**: Added content scroll reflection backgrounds for Tahoe mode using WindowActor signaling and canvas snapshotting.",
        "**Hilal Boosts (Site Customizer & Element Zapper)**: Integrated interactive tools for custom website style customizers and dynamic element removal.",
        "**Workspace Reordering**: Added drag-and-drop workspace sorting, tab-to-workspace drop support, and workspace context-menus.",
        "**Custom Keyboard Shortcuts Table**: Replaced static JSON override files with preference-based shortcut storage and built a settings UI panel.",
        "**Onboarding Personalization**: Rewrote onboarding welcome stages, persistent container configuration, and welcome layout presets."
      ],
      "changed": [
        "**V2 Classic Slide-Up Toolbar**: Switched compact toolbar hide behaviors to slide-up layout animations with centered browser chrome controls.",
        "**macOS Window Integration**: Constrained native traffic lights layout positioning in compact sidebar/toolbar modes to prevent control overlaps."
      ],
      "fixed": [
        "**Compact Layout Transitions**: Fixed URL bar ghosting, layout heights, and icon flickering during transitions.",
        "**Onboarding Duplicate Pins**: Prevented duplicate pinned site creation when finalizing the onboarding flow."
      ]
    },
    "githubUrl": "https://github.com/VastSea0/hilal-browser/releases/tag/v0.3.0-alpha.4",
    "compareUrl": "https://github.com/VastSea0/hilal-browser/compare/v0.3.0-alpha.3...v0.3.0-alpha.4"
  },
  {
    "tag": "v0.3.0-alpha.3",
    "version": "0.3.0-alpha.3",
    "isDev": false,
    "date": "2026-06-11T10:11:24+03:00",
    "commitCount": 12,
    "commits": [
      {
        "hash": "36ed74be6671114f349c693d36ac6ed347cd894d",
        "shortHash": "36ed74b",
        "author": "VastSea0",
        "date": "2026-06-11T10:11:24+03:00",
        "subject": "ci: move --enable-linker=lld to linux-only mozconfig, fixing windows build configure crash",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/36ed74be6671114f349c693d36ac6ed347cd894d"
      },
      {
        "hash": "86040b1af9807958c0ff05da0958a7289a4c4907",
        "shortHash": "86040b1",
        "author": "VastSea0",
        "date": "2026-06-10T23:55:40+03:00",
        "subject": "ci: remove sccache GHA backend and cache local sccache directories instead",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/86040b1af9807958c0ff05da0958a7289a4c4907"
      },
      {
        "hash": "ef3549b9e7182629796a9173b80386d99959f363",
        "shortHash": "ef3549b",
        "author": "VastSea0",
        "date": "2026-06-10T18:51:30+03:00",
        "subject": "ci: fix release authentication by explicitly passing GITHUB_TOKEN and add AUTOCLOBBER to base mozconfig",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ef3549b9e7182629796a9173b80386d99959f363"
      },
      {
        "hash": "92bdf9ab8203661ac253cc7f78246ee4d9200306",
        "shortHash": "92bdf9a",
        "author": "VastSea0",
        "date": "2026-06-10T17:57:55+03:00",
        "subject": "refactor: simplify pinned site rendering logic and improve code formatting in HilalWelcome.js",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/92bdf9ab8203661ac253cc7f78246ee4d9200306"
      },
      {
        "hash": "f3281bedd5267c4da40ba7e5105a8f274a741920",
        "shortHash": "f3281be",
        "author": "VastSea0",
        "date": "2026-06-10T12:14:15+03:00",
        "subject": "feat: enable pinned workspaces by default and add pinned site builder to welcome UI",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f3281bedd5267c4da40ba7e5105a8f274a741920"
      },
      {
        "hash": "03a0db57b7f2932cd4abac6042509775dc8d690f",
        "shortHash": "03a0db5",
        "author": "VastSea0",
        "date": "2026-06-10T12:03:31+03:00",
        "subject": "ci: optimize builds with lld, disable lto, enable release, and make windows sccache setup robust",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/03a0db57b7f2932cd4abac6042509775dc8d690f"
      },
      {
        "hash": "d079e03743488d8fd912c469fd3d6454d8bc9b26",
        "shortHash": "d079e03",
        "author": "VastSea0",
        "date": "2026-06-10T11:45:22+03:00",
        "subject": "ci: platform selection, proper sccache setup, resilient artifact uploads",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d079e03743488d8fd912c469fd3d6454d8bc9b26"
      },
      {
        "hash": "238ddd3c15aef1c16e28601b2cd726c52e00e80e",
        "shortHash": "238ddd3",
        "author": "VastSea0",
        "date": "2026-06-10T11:03:12+03:00",
        "subject": "ci: fix linux sccache failure, fix windows OOM, upload all binaries immediately",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/238ddd3c15aef1c16e28601b2cd726c52e00e80e"
      },
      {
        "hash": "f50bc40791d17cac20fbf54784f03e13dae08fba",
        "shortHash": "f50bc40",
        "author": "VastSea0",
        "date": "2026-06-09T16:37:02+03:00",
        "subject": "ci: fix windows artifact paths and add immediate upload for binaries",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f50bc40791d17cac20fbf54784f03e13dae08fba"
      },
      {
        "hash": "aba9af9e8a5332ae0f52e7c0fdad4463f96b7ac3",
        "shortHash": "aba9af9",
        "author": "VastSea0",
        "date": "2026-06-09T13:21:08+03:00",
        "subject": "Update documentation to include instructions for compiling hil patch manager from source",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/aba9af9e8a5332ae0f52e7c0fdad4463f96b7ac3"
      },
      {
        "hash": "52d08fcc1d017aaf38bd159e1384221e23c88a02",
        "shortHash": "52d08fc",
        "author": "VastSea0",
        "date": "2026-06-09T12:54:42+03:00",
        "subject": "Bump version to 0.3.0-alpha.3",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/52d08fcc1d017aaf38bd159e1384221e23c88a02"
      },
      {
        "hash": "71e334eaccc534ee62d198e680b6a0dd5d60948b",
        "shortHash": "71e334e",
        "author": "VastSea0",
        "date": "2026-06-09T12:28:53+03:00",
        "subject": "Fix Windows build NSIS path lookup and enable sccache caching",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/71e334eaccc534ee62d198e680b6a0dd5d60948b"
      }
    ],
    "highlights": null,
    "githubUrl": "https://github.com/VastSea0/hilal-browser/releases/tag/v0.3.0-alpha.3",
    "compareUrl": "https://github.com/VastSea0/hilal-browser/compare/v0.3.0-alpha.2...v0.3.0-alpha.3"
  },
  {
    "tag": "v0.3.0-alpha.2",
    "version": "0.3.0-alpha.2",
    "isDev": false,
    "date": "2026-06-09T09:11:22+03:00",
    "commitCount": 40,
    "commits": [
      {
        "hash": "7526c9a9e4c87da03261e40cdc887f120eeb4d41",
        "shortHash": "7526c9a",
        "author": "VastSea0",
        "date": "2026-06-09T09:11:22+03:00",
        "subject": "fix: add NSIS to PATH for Windows builder",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7526c9a9e4c87da03261e40cdc887f120eeb4d41"
      },
      {
        "hash": "5be0ffcb3912fdb81103d269261cb5d69168b43c",
        "shortHash": "5be0ffc",
        "author": "VastSea0",
        "date": "2026-06-09T01:20:58+03:00",
        "subject": "release: bump version to 0.3.0-alpha.2",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5be0ffcb3912fdb81103d269261cb5d69168b43c"
      },
      {
        "hash": "99a1703df1b017b3bdeea8524fa0594d790c34e6",
        "shortHash": "99a1703",
        "author": "VastSea0",
        "date": "2026-06-08T16:17:18+03:00",
        "subject": "docs: remove AI-generated marketing language throughout",
        "body": "",
        "category": "docs",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/99a1703df1b017b3bdeea8524fa0594d790c34e6"
      },
      {
        "hash": "da3d4d6e6a278287ce487c1c9f721f819e0a9495",
        "shortHash": "da3d4d6",
        "author": "VastSea0",
        "date": "2026-06-08T05:45:46+03:00",
        "subject": "test: add integration test for theme-color extraction and auto accent",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/da3d4d6e6a278287ce487c1c9f721f819e0a9495"
      },
      {
        "hash": "709a6b7bc55a64a3f3a69a389b9dab917cf5b58e",
        "shortHash": "709a6b7",
        "author": "VastSea0",
        "date": "2026-06-08T04:50:39+03:00",
        "subject": "fix: harden HilalBoosts state handling",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/709a6b7bc55a64a3f3a69a389b9dab917cf5b58e"
      },
      {
        "hash": "b09534d39b5b5d77539842edbacde16efd3fdfb6",
        "shortHash": "b09534d",
        "author": "VastSea0",
        "date": "2026-06-08T02:45:25+03:00",
        "subject": "refactor: update patches for automated color extraction and preference controls",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b09534d39b5b5d77539842edbacde16efd3fdfb6"
      },
      {
        "hash": "ed7f47b608e02a4ac4e4a9a5844671bc34465b23",
        "shortHash": "ed7f47b",
        "author": "VastSea0",
        "date": "2026-06-08T02:13:08+03:00",
        "subject": "feat: implement automated theme color extraction and UI palette generation for HilalBoosts",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ed7f47b608e02a4ac4e4a9a5844671bc34465b23"
      },
      {
        "hash": "8dc25c33cc8028fa704dc95d3c69f4501200d02e",
        "shortHash": "8dc25c3",
        "author": "VastSea0",
        "date": "2026-06-08T02:07:45+03:00",
        "subject": "feat: add preferences and UI checkboxes for site customizer and dynamic tinting features",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8dc25c33cc8028fa704dc95d3c69f4501200d02e"
      },
      {
        "hash": "c20dbdb4ebefc407e069c99d703727254e14b8ab",
        "shortHash": "c20dbdb",
        "author": "VastSea0",
        "date": "2026-06-08T00:10:41+03:00",
        "subject": "fix: remove background styling for toolbars on macOS when in custom window mode",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c20dbdb4ebefc407e069c99d703727254e14b8ab"
      },
      {
        "hash": "ce7369adbb96831a3972716f925aa91799f8ef85",
        "shortHash": "ce7369a",
        "author": "VastSea0",
        "date": "2026-06-08T00:05:00+03:00",
        "subject": "refactor: migrate color-mix color space to oklch and add URL bar styling to Hilal UI overrides",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ce7369adbb96831a3972716f925aa91799f8ef85"
      },
      {
        "hash": "7b546e4c92cfdc9c0e6dfd37e988a192620df82e",
        "shortHash": "7b546e4",
        "author": "VastSea0",
        "date": "2026-06-07T23:56:03+03:00",
        "subject": "feat: implement dynamic browser UI coloring and add toggle controls to Hilal Boosts interface",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7b546e4c92cfdc9c0e6dfd37e988a192620df82e"
      },
      {
        "hash": "c4971188ceec1a48bce881fd7a779eb25e691ca2",
        "shortHash": "c497118",
        "author": "VastSea0",
        "date": "2026-06-07T23:43:10+03:00",
        "subject": "feat: overhaul HilalBoosts UI with custom color picker panel and integrate domain-based host retrieval",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c4971188ceec1a48bce881fd7a779eb25e691ca2"
      },
      {
        "hash": "912239b8afc9727f55b80c40cbbec8b0c89dc33a",
        "shortHash": "912239b",
        "author": "VastSea0",
        "date": "2026-06-07T23:22:21+03:00",
        "subject": "feat: register actor events and implement document-based initialization throttling for HilalBoosts",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/912239b8afc9727f55b80c40cbbec8b0c89dc33a"
      },
      {
        "hash": "2c686249e64ac64fb347f51e503e589c50b88512",
        "shortHash": "2c68624",
        "author": "VastSea0",
        "date": "2026-06-07T23:17:31+03:00",
        "subject": "refactor: simplify domain resolution logic in HilalBoosts by traversing parent documents instead of browsing contexts",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2c686249e64ac64fb347f51e503e589c50b88512"
      },
      {
        "hash": "c9e7849b4fc230d47c7856f2e35510aadff01ec3",
        "shortHash": "c9e7849",
        "author": "VastSea0",
        "date": "2026-06-07T23:09:47+03:00",
        "subject": "refactor: key Hilal boosts by domain instead of browsing context ID for cross-tab persistence",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c9e7849b4fc230d47c7856f2e35510aadff01ec3"
      },
      {
        "hash": "8f946bf94c60b1ec10d65b1e2b99f470e71d22fe",
        "shortHash": "8f946bf",
        "author": "VastSea0",
        "date": "2026-06-07T23:04:56+03:00",
        "subject": "refactor: replace CSS filter-based boosts with backend-driven layout-level color processing via messaging actors",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8f946bf94c60b1ec10d65b1e2b99f470e71d22fe"
      },
      {
        "hash": "23918968a979820c50e269898f1fbcf490cfa69c",
        "shortHash": "2391896",
        "author": "VastSea0",
        "date": "2026-06-07T22:34:03+03:00",
        "subject": "refactor: implement GPU-accelerated CSS filter-based page styling and enhance color picker interactivity with dynamic arc overlays",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/23918968a979820c50e269898f1fbcf490cfa69c"
      },
      {
        "hash": "bf13c9837ddf9e079c4e4efc046311f9cc68d6ea",
        "shortHash": "bf13c98",
        "author": "VastSea0",
        "date": "2026-06-07T22:04:18+03:00",
        "subject": "feat: implement enhanced site customizer panel for Hilal Boosts with advanced color selection and gradient controls",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bf13c9837ddf9e079c4e4efc046311f9cc68d6ea"
      },
      {
        "hash": "0fe2ebd0730a47d379bffea9dfd25533aca37f0e",
        "shortHash": "0fe2ebd",
        "author": "VastSea0",
        "date": "2026-06-07T19:45:07+03:00",
        "subject": "Enhance HilalBoosts initialization and preferences reading safety",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0fe2ebd0730a47d379bffea9dfd25533aca37f0e"
      },
      {
        "hash": "5f222d7e28413b94c882e25771c8266605058653",
        "shortHash": "5f222d7",
        "author": "VastSea0",
        "date": "2026-06-07T19:43:14+03:00",
        "subject": "Fix JSWindowActor event listener registration in HilalBoosts.js",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5f222d7e28413b94c882e25771c8266605058653"
      },
      {
        "hash": "11bbe45f55b1c7d69276f877e4fbe86ae24d6f4a",
        "shortHash": "11bbe45",
        "author": "VastSea0",
        "date": "2026-06-07T19:41:44+03:00",
        "subject": "Implement Hilal Boosts (Site Customizer and Element Zapper)",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/11bbe45f55b1c7d69276f877e4fbe86ae24d6f4a"
      },
      {
        "hash": "31d4df2e51bbf04b3d8c77b0e8647f3f426b273c",
        "shortHash": "31d4df2",
        "author": "VastSea0",
        "date": "2026-06-07T19:20:06+03:00",
        "subject": "Add workspace drag-and-drop sorting and tab-to-workspace drop support in redesigned sidebar",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/31d4df2e51bbf04b3d8c77b0e8647f3f426b273c"
      },
      {
        "hash": "2bd38b198a064beed0d14e04a5050301fec24a8f",
        "shortHash": "2bd38b1",
        "author": "VastSea0",
        "date": "2026-06-07T19:14:44+03:00",
        "subject": "Implement drag-and-drop and context menu reordering for workspaces",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2bd38b198a064beed0d14e04a5050301fec24a8f"
      },
      {
        "hash": "6bbf2525214bf4a21cb3e1038404bc63129ac113",
        "shortHash": "6bbf252",
        "author": "VastSea0",
        "date": "2026-06-07T19:10:52+03:00",
        "subject": "feat: prevent compact mode elements from auto-hiding while popups are active",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6bbf2525214bf4a21cb3e1038404bc63129ac113"
      },
      {
        "hash": "4df2deb8c37fe008b7b1fa43d2e5f5b91c481334",
        "shortHash": "4df2deb",
        "author": "VastSea0",
        "date": "2026-06-07T17:36:46+03:00",
        "subject": "refactor: modernize keyboard shortcut preferences UI and update default modifier keys to alt",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4df2deb8c37fe008b7b1fa43d2e5f5b91c481334"
      },
      {
        "hash": "063c4e489be2901b6c595c6779400900d953ecf8",
        "shortHash": "063c4e4",
        "author": "VastSea0",
        "date": "2026-06-07T01:57:17+03:00",
        "subject": "feat: replace JSON file-based shortcut overrides with preference-based storage and expand workspace-related keyboard commands",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/063c4e489be2901b6c595c6779400900d953ecf8"
      },
      {
        "hash": "26d16fa3261eac4a79354529145aa189563f568c",
        "shortHash": "26d16fa",
        "author": "VastSea0",
        "date": "2026-06-07T01:42:11+03:00",
        "subject": "refactor: rename shortcut reset button and structure shortcut list with a table element",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/26d16fa3261eac4a79354529145aa189563f568c"
      },
      {
        "hash": "106d50f2c34f605d5e6ad86a00417239df9275b3",
        "shortHash": "106d50f",
        "author": "VastSea0",
        "date": "2026-06-07T01:11:02+03:00",
        "subject": "docs: add star history chart to README",
        "body": "",
        "category": "docs",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/106d50f2c34f605d5e6ad86a00417239df9275b3"
      },
      {
        "hash": "31770a907588224a7979d1646ad168dbded1ad5f",
        "shortHash": "31770a9",
        "author": "VastSea0",
        "date": "2026-06-07T01:08:33+03:00",
        "subject": "feat: implement customizable keyboard shortcuts management and UI integration",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/31770a907588224a7979d1646ad168dbded1ad5f"
      },
      {
        "hash": "cc50fd1c4c544781519f4f9b0e864f3af479ab8d",
        "shortHash": "cc50fd1",
        "author": "VastSea0",
        "date": "2026-06-07T00:32:57+03:00",
        "subject": "feat: implement custom keyboard shortcuts management system with preferences UI",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/cc50fd1c4c544781519f4f9b0e864f3af479ab8d"
      },
      {
        "hash": "b30fdcae6940b02a14a1432024e438082ab8ddcc",
        "shortHash": "b30fdca",
        "author": "VastSea0",
        "date": "2026-06-06T23:18:22+03:00",
        "subject": "feat: add browser chrome test scenarios for Hilal workspace and compact mode functionality",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b30fdcae6940b02a14a1432024e438082ab8ddcc"
      },
      {
        "hash": "9824da07b3780cfdc505e7bbb236441f5cc7070d",
        "shortHash": "9824da0",
        "author": "VastSea0",
        "date": "2026-06-06T22:47:02+03:00",
        "subject": "feat: implement keyboard-navigable command palette style download modal with improved UX",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9824da07b3780cfdc505e7bbb236441f5cc7070d"
      },
      {
        "hash": "4743e650b1ffd48e20e25a8330e1c2c61e019f6b",
        "shortHash": "4743e65",
        "author": "VastSea0",
        "date": "2026-06-06T22:35:26+03:00",
        "subject": "feat: enable multi-locale support and add localization management utilities",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4743e650b1ffd48e20e25a8330e1c2c61e019f6b"
      },
      {
        "hash": "7d586701f3c5f8549deacee457c56b7bba0b1272",
        "shortHash": "7d58670",
        "author": "VastSea0",
        "date": "2026-06-06T22:32:14+03:00",
        "subject": "Rewrite download modal from scratch to enforce single-trigger download",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7d586701f3c5f8549deacee457c56b7bba0b1272"
      },
      {
        "hash": "539ede22fa18e6b6eb53272e29f5f1e862956636",
        "shortHash": "539ede2",
        "author": "VastSea0",
        "date": "2026-06-06T22:30:36+03:00",
        "subject": "Redesign download modal with premium glassmorphism and animated progress flows",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/539ede22fa18e6b6eb53272e29f5f1e862956636"
      },
      {
        "hash": "57a4546f9e0501c66f415671d89a334d722004b3",
        "shortHash": "57a4546",
        "author": "VastSea0",
        "date": "2026-06-06T22:28:49+03:00",
        "subject": "Change navbar wrapper to fixed positioning to always track scrolling",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/57a4546f9e0501c66f415671d89a334d722004b3"
      },
      {
        "hash": "b0450346cbee15fa5c1df5612675cd5732bdaca6",
        "shortHash": "b045034",
        "author": "VastSea0",
        "date": "2026-06-06T22:27:24+03:00",
        "subject": "Make navbar dynamically float on scroll and add card stagger animations",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b0450346cbee15fa5c1df5612675cd5732bdaca6"
      },
      {
        "hash": "b672ef3c269ff46c073cd598225d54d4356b144c",
        "shortHash": "b672ef3",
        "author": "VastSea0",
        "date": "2026-06-06T22:24:43+03:00",
        "subject": "Redesign website landing page matching Arc visual language guidelines",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b672ef3c269ff46c073cd598225d54d4356b144c"
      },
      {
        "hash": "0ce44f8d15eb966321de3a3296cba55cf844e61d",
        "shortHash": "0ce44f8",
        "author": "VastSea0",
        "date": "2026-06-06T22:05:52+03:00",
        "subject": "feat: implement floating capsule navigation bar and add mesh/noise background visual styles",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0ce44f8d15eb966321de3a3296cba55cf844e61d"
      },
      {
        "hash": "4de79d10fd35540a5f8bf4eee3256760f89dee18",
        "shortHash": "4de79d1",
        "author": "VastSea0",
        "date": "2026-06-06T21:54:59+03:00",
        "subject": "feat: add support for tarball/zip build artifacts and implement mesh backgrounds with noise overlays",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4de79d10fd35540a5f8bf4eee3256760f89dee18"
      }
    ],
    "highlights": null,
    "githubUrl": "https://github.com/VastSea0/hilal-browser/releases/tag/v0.3.0-alpha.2",
    "compareUrl": "https://github.com/VastSea0/hilal-browser/compare/v0.3.0-alpha.1...v0.3.0-alpha.2"
  },
  {
    "tag": "v0.3.0-alpha.1",
    "version": "0.3.0-alpha.1",
    "isDev": false,
    "date": "2026-06-05T13:16:20+03:00",
    "commitCount": 86,
    "commits": [
      {
        "hash": "c3aa4f82cfd368d729b3ac2f8af6f9b81e87885c",
        "shortHash": "c3aa4f8",
        "author": "VastSea0",
        "date": "2026-06-05T13:16:20+03:00",
        "subject": "Fix branding icon search path in build-appimage.sh",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c3aa4f82cfd368d729b3ac2f8af6f9b81e87885c"
      },
      {
        "hash": "53325cb548edc74254b3254ae92b68932e1c01d8",
        "shortHash": "53325cb",
        "author": "VastSea0",
        "date": "2026-06-05T10:38:10+03:00",
        "subject": "Free up disk space on Linux runner before compilation",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/53325cb548edc74254b3254ae92b68932e1c01d8"
      },
      {
        "hash": "624fc8b0a007ea2bf318a7618e49c730088c0142",
        "shortHash": "624fc8b",
        "author": "VastSea0",
        "date": "2026-06-05T10:09:03+03:00",
        "subject": "Fix Linux build job to trigger full build before packaging",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/624fc8b0a007ea2bf318a7618e49c730088c0142"
      },
      {
        "hash": "0da197dce5fcb1b5569fd08b0b5cf11bf69ec11d",
        "shortHash": "0da197d",
        "author": "VastSea0",
        "date": "2026-06-05T01:10:09+03:00",
        "subject": "Optimize patch manager performance and release workflow caching",
        "body": "",
        "category": "perf",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0da197dce5fcb1b5569fd08b0b5cf11bf69ec11d"
      },
      {
        "hash": "f78784102aa934f22a704ba5b5792cb016a52804",
        "shortHash": "f787841",
        "author": "VastSea0",
        "date": "2026-06-05T00:33:36+03:00",
        "subject": "fix: update MozillaBuild setup link to Latest",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f78784102aa934f22a704ba5b5792cb016a52804"
      },
      {
        "hash": "2d42ef3a22280ea913e33224d025a69ab62a3ec8",
        "shortHash": "2d42ef3",
        "author": "VastSea0",
        "date": "2026-06-05T00:29:30+03:00",
        "subject": "fix: update MozillaBuild setup to download and install silently in Windows job",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2d42ef3a22280ea913e33224d025a69ab62a3ec8"
      },
      {
        "hash": "069fe89e4c82221e00e2c442ed8623f3a252a6c5",
        "shortHash": "069fe89",
        "author": "VastSea0",
        "date": "2026-06-05T00:13:37+03:00",
        "subject": "release: update Flatpak source tag to v0.3.0-alpha.1",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/069fe89e4c82221e00e2c442ed8623f3a252a6c5"
      },
      {
        "hash": "005fa2acece00fd4686ec7f621289952c70e04cd",
        "shortHash": "005fa2a",
        "author": "VastSea0",
        "date": "2026-06-05T00:10:13+03:00",
        "subject": "release: bump version to 0.3.0-alpha.1",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/005fa2acece00fd4686ec7f621289952c70e04cd"
      },
      {
        "hash": "7e0cc1ed6ec6065e9f27de6fd72f8a198ce81152",
        "shortHash": "7e0cc1e",
        "author": "VastSea0",
        "date": "2026-06-05T00:06:24+03:00",
        "subject": "feat: add Linux and Windows release build workflows to GitHub Actions and remove obsolete audit documentation",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7e0cc1ed6ec6065e9f27de6fd72f8a198ce81152"
      },
      {
        "hash": "b866b52117e91487790db73380d5f72b33806902",
        "shortHash": "b866b52",
        "author": "VastSea0",
        "date": "2026-06-04T22:57:37+03:00",
        "subject": "feat: update language selection logic to use Services.locale and add macOS distribution documentation",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b866b52117e91487790db73380d5f72b33806902"
      },
      {
        "hash": "f1fe8cd10cea3eb5a6b2b4ddbf8cb52a15b18b21",
        "shortHash": "f1fe8cd",
        "author": "VastSea0",
        "date": "2026-06-04T21:29:03+03:00",
        "subject": "fix: clarify development readiness checks",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f1fe8cd10cea3eb5a6b2b4ddbf8cb52a15b18b21"
      },
      {
        "hash": "9671f2b940549ce106380b9ec1a3a18e90e53962",
        "shortHash": "9671f2b",
        "author": "VastSea0",
        "date": "2026-06-04T20:38:18+03:00",
        "subject": "feat: replace browser preview component with interactive screenshot cards in HilalWelcome",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9671f2b940549ce106380b9ec1a3a18e90e53962"
      },
      {
        "hash": "6988a274269ac0b201dbf43aaab2debe3a9db238",
        "shortHash": "6988a27",
        "author": "VastSea0",
        "date": "2026-06-04T20:04:39+03:00",
        "subject": "fix: enforce release metadata chain",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6988a274269ac0b201dbf43aaab2debe3a9db238"
      },
      {
        "hash": "8fe1a8e4fbc63bead481db5da50fc3fb56690f82",
        "shortHash": "8fe1a8e",
        "author": "VastSea0",
        "date": "2026-06-04T15:04:35+03:00",
        "subject": "fix: update hil setup comment after removing legacy fallback",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8fe1a8e4fbc63bead481db5da50fc3fb56690f82"
      },
      {
        "hash": "b6bb7a7587f2b80f29d17a2361429de2c02ec64b",
        "shortHash": "b6bb7a7",
        "author": "VastSea0",
        "date": "2026-06-04T15:02:29+03:00",
        "subject": "test: update smoke test to use custom HTML, set window size, and improve screenshot validation",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b6bb7a7587f2b80f29d17a2361429de2c02ec64b"
      },
      {
        "hash": "5f7045fbee2a3c11abfe86fd9ce5d16cc300f922",
        "shortHash": "5f7045f",
        "author": "VastSea0",
        "date": "2026-06-04T15:02:10+03:00",
        "subject": "feat: add validate command to hil to check manifest integrity and update release metadata checks",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5f7045fbee2a3c11abfe86fd9ce5d16cc300f922"
      },
      {
        "hash": "c12a2e7492f0e423eedd14a37bfd7abe9d0d8f0a",
        "shortHash": "c12a2e7",
        "author": "VastSea0",
        "date": "2026-06-04T15:00:29+03:00",
        "subject": "feat: add smoke test script for browser release verification and introduce stable readiness documentation",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c12a2e7492f0e423eedd14a37bfd7abe9d0d8f0a"
      },
      {
        "hash": "03a3ff6c5859b393f5446453d4615014baaff298",
        "shortHash": "03a3ff6",
        "author": "VastSea0",
        "date": "2026-06-04T14:56:47+03:00",
        "subject": "docs: add reference screenshots for compact layout mode configurations",
        "body": "",
        "category": "docs",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/03a3ff6c5859b393f5446453d4615014baaff298"
      },
      {
        "hash": "bf74d3d26620f2ee05bf4a6cda6ecec4b19b3dd9",
        "shortHash": "bf74d3d",
        "author": "VastSea0",
        "date": "2026-06-04T13:34:46+03:00",
        "subject": "fix: make welcome layout previews realistic",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bf74d3d26620f2ee05bf4a6cda6ecec4b19b3dd9"
      },
      {
        "hash": "431230f2bedd25b844be03f3974ff9d95cbff40a",
        "shortHash": "431230f",
        "author": "VastSea0",
        "date": "2026-06-04T13:24:20+03:00",
        "subject": "feat: add welcome layout personalization",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/431230f2bedd25b844be03f3974ff9d95cbff40a"
      },
      {
        "hash": "c1a2c77a5bd0bf4a121d65110922d1d7676f4752",
        "shortHash": "c1a2c77",
        "author": "VastSea0",
        "date": "2026-06-04T02:26:44+03:00",
        "subject": "fix: enable aboutwelcome page in browser branding preferences",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c1a2c77a5bd0bf4a121d65110922d1d7676f4752"
      },
      {
        "hash": "3bd81ae0f96f5671ae1e87123e7a5f4f60637bd3",
        "shortHash": "3bd81ae",
        "author": "VastSea0",
        "date": "2026-06-04T02:20:56+03:00",
        "subject": "Update compact-mode-preferences.patch to default-enable compact mode",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3bd81ae0f96f5671ae1e87123e7a5f4f60637bd3"
      },
      {
        "hash": "6b32531a0da444feaf06a386533984648094e0c8",
        "shortHash": "6b32531",
        "author": "VastSea0",
        "date": "2026-06-04T02:12:48+03:00",
        "subject": "feat: implement auto-hiding floating top toolbar and refine compact sidebar tab aesthetics.",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6b32531a0da444feaf06a386533984648094e0c8"
      },
      {
        "hash": "1bf0cce5509cc74693e37297d1584910ead09bfa",
        "shortHash": "1bf0cce",
        "author": "VastSea0",
        "date": "2026-06-04T01:42:07+03:00",
        "subject": "Update l10n strings and compact-mode defaults",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/1bf0cce5509cc74693e37297d1584910ead09bfa"
      },
      {
        "hash": "8c90e7352d99f85f30dcb19243fe8071d1383c04",
        "shortHash": "8c90e73",
        "author": "VastSea0",
        "date": "2026-06-04T01:40:32+03:00",
        "subject": "feat: enable compact mode by default and hide toolbox in preferences",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8c90e7352d99f85f30dcb19243fe8071d1383c04"
      },
      {
        "hash": "91967caeb437a8836bacd94a7c6d094d9dde26d1",
        "shortHash": "91967ca",
        "author": "VastSea0",
        "date": "2026-06-04T01:36:45+03:00",
        "subject": "feat: add uBlock Origin extension and update certificate configuration for release channels",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/91967caeb437a8836bacd94a7c6d094d9dde26d1"
      },
      {
        "hash": "761b5dfe71264b482a54abd4ff0e7fd857e92167",
        "shortHash": "761b5df",
        "author": "VastSea0",
        "date": "2026-06-04T01:36:34+03:00",
        "subject": "feat: include uBlock Origin and update update channel certificate logic",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/761b5dfe71264b482a54abd4ff0e7fd857e92167"
      },
      {
        "hash": "0d62345ed4998e04046f8f937385503649f176bf",
        "shortHash": "0d62345",
        "author": "VastSea0",
        "date": "2026-06-04T01:28:58+03:00",
        "subject": "Refresh patches: fix sidebar redesign context, reset-toolbar fix, l10n strings",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0d62345ed4998e04046f8f937385503649f176bf"
      },
      {
        "hash": "7b49d772df452e2fb2617b5aabbd59fd49325325",
        "shortHash": "7b49d77",
        "author": "VastSea0",
        "date": "2026-06-04T01:22:16+03:00",
        "subject": "Fix sidebar redesign: apply patch inline, add missing compact/language l10n strings",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7b49d772df452e2fb2617b5aabbd59fd49325325"
      },
      {
        "hash": "7dbe84fa107f256a29d868a2126bc46b93e396d7",
        "shortHash": "7dbe84f",
        "author": "VastSea0",
        "date": "2026-06-04T01:22:00+03:00",
        "subject": "feat: add sidebar configuration prefs",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7dbe84fa107f256a29d868a2126bc46b93e396d7"
      },
      {
        "hash": "d9018e5cd403cf75d899fbe2d67f1cb17ccba06c",
        "shortHash": "d9018e5",
        "author": "VastSea0",
        "date": "2026-06-04T01:10:53+03:00",
        "subject": "refactor: update welcome flow copy and terminology across English and Turkish locales",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d9018e5cd403cf75d899fbe2d67f1cb17ccba06c"
      },
      {
        "hash": "59050d10e1a6c0f219f03a7901b320658ce8b9b5",
        "shortHash": "59050d1",
        "author": "VastSea0",
        "date": "2026-06-04T01:10:53+03:00",
        "subject": "refactor: update welcome flow copy and terminology across English and Turkish locales",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/59050d10e1a6c0f219f03a7901b320658ce8b9b5"
      },
      {
        "hash": "ef9d607c33079d4160a7990c368a6298d542c4ce",
        "shortHash": "ef9d607",
        "author": "VastSea0",
        "date": "2026-06-04T01:10:45+03:00",
        "subject": "feat: add shared theme assets and icons for browser UI components and app marketplace",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ef9d607c33079d4160a7990c368a6298d542c4ce"
      },
      {
        "hash": "eb41353730f9e2e08be5fba2268010044f47229c",
        "shortHash": "eb41353",
        "author": "VastSea0",
        "date": "2026-06-04T01:10:02+03:00",
        "subject": "feat: update HilalWelcome integration",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/eb41353730f9e2e08be5fba2268010044f47229c"
      },
      {
        "hash": "fb3222361e9a3d7f864c1797e62c00ab1bb5be07",
        "shortHash": "fb32223",
        "author": "VastSea0",
        "date": "2026-06-04T01:04:03+03:00",
        "subject": "feat: add UI assets, styling tokens, and core themes for browser redesign",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/fb3222361e9a3d7f864c1797e62c00ab1bb5be07"
      },
      {
        "hash": "d014d04ad23b6a0256396b4dda038dce8aab862d",
        "shortHash": "d014d04",
        "author": "VastSea0",
        "date": "2026-06-04T01:03:54+03:00",
        "subject": "feat: add comprehensive browser theme assets, CSS styles, and icon resources",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d014d04ad23b6a0256396b4dda038dce8aab862d"
      },
      {
        "hash": "ab399b605d0f8265387fb82cdaf690ec11ebbcd9",
        "shortHash": "ab399b6",
        "author": "VastSea0",
        "date": "2026-06-04T00:44:58+03:00",
        "subject": "Fix toolbar reset: move initialization before async addon callback",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ab399b605d0f8265387fb82cdaf690ec11ebbcd9"
      },
      {
        "hash": "ef1c80fbfab18c547f40374e963f9bb18f248370",
        "shortHash": "ef1c80f",
        "author": "VastSea0",
        "date": "2026-06-04T00:38:43+03:00",
        "subject": "fix(toolbar): defer toolbar reset until theme database is ready",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ef1c80fbfab18c547f40374e963f9bb18f248370"
      },
      {
        "hash": "727fa2c79c8e0e9f1f15e4eb1b3b7776eeade457",
        "shortHash": "727fa2c",
        "author": "VastSea0",
        "date": "2026-06-04T00:32:46+03:00",
        "subject": "Fix AsyncTabSwitcher and Tabbrowser errors during tab switching",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/727fa2c79c8e0e9f1f15e4eb1b3b7776eeade457"
      },
      {
        "hash": "bae098c6d2c11745b81ab602634b713193072205",
        "shortHash": "bae098c",
        "author": "VastSea0",
        "date": "2026-06-04T00:24:21+03:00",
        "subject": "Reset toolbar layout to defaults on first run",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bae098c6d2c11745b81ab602634b713193072205"
      },
      {
        "hash": "43c70c00a207900d7817e70580af5a429d0f4989",
        "shortHash": "43c70c0",
        "author": "VastSea0",
        "date": "2026-06-03T23:41:54+03:00",
        "subject": "Add browser/components/preferences/hilal.inc.xhtml to manifest.toml",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/43c70c00a207900d7817e70580af5a429d0f4989"
      },
      {
        "hash": "c6e410d145f6c0222e6884d8117b3536081ce2b6",
        "shortHash": "c6e410d",
        "author": "VastSea0",
        "date": "2026-06-03T22:48:05+03:00",
        "subject": "ci: add release metadata guardrails",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c6e410d145f6c0222e6884d8117b3536081ce2b6"
      },
      {
        "hash": "478aab8539a0f405431a63fafd1d484a19c81f20",
        "shortHash": "478aab8",
        "author": "VastSea0",
        "date": "2026-06-03T22:48:01+03:00",
        "subject": "docs: refresh Hilal browser audit report",
        "body": "",
        "category": "docs",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/478aab8539a0f405431a63fafd1d484a19c81f20"
      },
      {
        "hash": "9340bd7bb12fcf8afed22edb4649505b363a5d29",
        "shortHash": "9340bd7",
        "author": "VastSea0",
        "date": "2026-06-03T22:30:15+03:00",
        "subject": "chore: register Hilal distribution components and UI overrides in manifest.toml and update audit report",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9340bd7bb12fcf8afed22edb4649505b363a5d29"
      },
      {
        "hash": "e8d9074a5d5fa2bb94028ccf164d4d62ac1ed7aa",
        "shortHash": "e8d9074",
        "author": "VastSea0",
        "date": "2026-06-03T22:21:28+03:00",
        "subject": "Merge branch 'main' of github.com:VastSea0/hilal-browser",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e8d9074a5d5fa2bb94028ccf164d4d62ac1ed7aa"
      },
      {
        "hash": "c539f40106fff87161b0122eafe9a4ef0f4a77e6",
        "shortHash": "c539f40",
        "author": "VastSea0",
        "date": "2026-06-03T22:17:13+03:00",
        "subject": "feat: add state tracking to prevent redundant patch application unless forced",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c539f40106fff87161b0122eafe9a4ef0f4a77e6"
      },
      {
        "hash": "d8779258921e2fce8b11e69372599005831a1ab9",
        "shortHash": "d877925",
        "author": "VastSea0",
        "date": "2026-06-03T22:17:07+03:00",
        "subject": "chore: update CSS dependencies and refine localization documentation",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d8779258921e2fce8b11e69372599005831a1ab9"
      },
      {
        "hash": "57a8769f510ee293d5003843c54ea653b71f6784",
        "shortHash": "57a8769",
        "author": "Egehan KAHRAMAN",
        "date": "2026-06-03T22:05:38+03:00",
        "subject": "Merge pull request #33 from VastSea0/feat/rust-patch-manager",
        "body": "Implement Rust-based hil Patch Manager CLI",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/57a8769f510ee293d5003843c54ea653b71f6784"
      },
      {
        "hash": "5df096a001b955721f5973a806b20ef841fe46fd",
        "shortHash": "5df096a",
        "author": "VastSea0",
        "date": "2026-06-03T22:04:40+03:00",
        "subject": "Update documentation and PR template for the new hil patch manager architecture",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5df096a001b955721f5973a806b20ef841fe46fd"
      },
      {
        "hash": "df76843740073941fdbd84d23d874b977fc0d069",
        "shortHash": "df76843",
        "author": "VastSea0",
        "date": "2026-06-03T21:41:24+03:00",
        "subject": "Update gitignore rules and include architectural report to finalize hil patch manager workflow (closes #32)",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/df76843740073941fdbd84d23d874b977fc0d069"
      },
      {
        "hash": "d73a83b5540a6f168d18ca8e4f213111e074685e",
        "shortHash": "d73a83b",
        "author": "VastSea0",
        "date": "2026-06-03T21:41:21+03:00",
        "subject": "Update workspace developer documentation for the hil tool workflow",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d73a83b5540a6f168d18ca8e4f213111e074685e"
      },
      {
        "hash": "4362a60e6f56c445ce6bd76c972cb61ba424bcfa",
        "shortHash": "4362a60",
        "author": "VastSea0",
        "date": "2026-06-03T21:41:18+03:00",
        "subject": "Update CI workflows to compile and execute the hil patch manager",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4362a60e6f56c445ce6bd76c972cb61ba424bcfa"
      },
      {
        "hash": "b41ad7e2526b4752b89507d88c142045dd0a86a5",
        "shortHash": "b41ad7e",
        "author": "VastSea0",
        "date": "2026-06-03T21:41:16+03:00",
        "subject": "Update platform build and helper scripts to use the hil tool",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b41ad7e2526b4752b89507d88c142045dd0a86a5"
      },
      {
        "hash": "49cc50aeef363e680d1fc29522602b7e8ed49b3e",
        "shortHash": "49cc50a",
        "author": "VastSea0",
        "date": "2026-06-03T21:40:51+03:00",
        "subject": "Deprecate and remove legacy shell scripts",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/49cc50aeef363e680d1fc29522602b7e8ed49b3e"
      },
      {
        "hash": "c290d6d3d26760511da3cd7e5128a5b7c4087bd5",
        "shortHash": "c290d6d",
        "author": "VastSea0",
        "date": "2026-06-03T21:40:47+03:00",
        "subject": "Implement Rust-based hil patch manager CLI",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c290d6d3d26760511da3cd7e5128a5b7c4087bd5"
      },
      {
        "hash": "871be22d9bdb9ea951c0adf6a746b36a0de8a848",
        "shortHash": "871be22",
        "author": "VastSea0",
        "date": "2026-06-03T21:40:44+03:00",
        "subject": "Migrate all patches, branding, and preference assets to unified changes/ tree",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/871be22d9bdb9ea951c0adf6a746b36a0de8a848"
      },
      {
        "hash": "163682ad8cbf51225bf341893674897737aeb804",
        "shortHash": "163682a",
        "author": "VastSea0",
        "date": "2026-06-03T21:40:29+03:00",
        "subject": "Add declarative manifest.toml and upstream.lock configurations",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/163682ad8cbf51225bf341893674897737aeb804"
      },
      {
        "hash": "64e4bec146af4b864ea189c0218e807146778132",
        "shortHash": "64e4bec",
        "author": "VastSea0",
        "date": "2026-06-03T00:43:18+03:00",
        "subject": "fix compact mode sidebar spacing and visibility logic",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/64e4bec146af4b864ea189c0218e807146778132"
      },
      {
        "hash": "572642a940982073bdd9f3f891f9c7ebb59a0045",
        "shortHash": "572642a",
        "author": "VastSea0",
        "date": "2026-06-03T00:40:28+03:00",
        "subject": "feat: enhance compact sidebar functionality, update release workflow with SBOM and checksum generation",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/572642a940982073bdd9f3f891f9c7ebb59a0045"
      },
      {
        "hash": "7cf587ce0a0e013cc6fda11d30745defdb438502",
        "shortHash": "7cf587c",
        "author": "Egehan KAHRAMAN",
        "date": "2026-06-03T00:38:43+03:00",
        "subject": "Merge pull request #15 from mmapro12/main",
        "body": "Enhance Firefox setup script with fast clone option",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7cf587ce0a0e013cc6fda11d30745defdb438502"
      },
      {
        "hash": "e1d512868131891e1a119aaefb4ef9978a73a9da",
        "shortHash": "e1d5128",
        "author": "Egehan KAHRAMAN",
        "date": "2026-06-03T00:37:33+03:00",
        "subject": "Merge branch 'main' into main",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e1d512868131891e1a119aaefb4ef9978a73a9da"
      },
      {
        "hash": "5550fc57594eeec56194fa911ca1ad14c8c3a201",
        "shortHash": "5550fc5",
        "author": "VastSea0",
        "date": "2026-06-03T00:23:59+03:00",
        "subject": "Merge branch 'main' of https://github.com/VastSea0/hilal-browser",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5550fc57594eeec56194fa911ca1ad14c8c3a201"
      },
      {
        "hash": "f16a09b731adb07df0c27e6f09e177e5dbef697b",
        "shortHash": "f16a09b",
        "author": "VastSea0",
        "date": "2026-06-03T00:23:11+03:00",
        "subject": "fix: regenerate high-resolution Windows icon assets",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f16a09b731adb07df0c27e6f09e177e5dbef697b"
      },
      {
        "hash": "a5d048a4e10e102735c77ec4698bca21e3817f61",
        "shortHash": "a5d048a",
        "author": "VastSea0",
        "date": "2026-06-03T00:21:49+03:00",
        "subject": "refactor: update Hilal source patches and refresh asset generation script",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a5d048a4e10e102735c77ec4698bca21e3817f61"
      },
      {
        "hash": "1b06353b1406e875cc23c007ebecff172f7edff9",
        "shortHash": "1b06353",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-31T22:17:54+03:00",
        "subject": "Merge pull request #31 from GreenKod/feature/packaging-pipeline",
        "body": "Feature/packaging pipeline",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/1b06353b1406e875cc23c007ebecff172f7edff9"
      },
      {
        "hash": "2399d58b9656ab3ef6ec38e9cb8a812d5c2ef47b",
        "shortHash": "2399d58",
        "author": "greenkod",
        "date": "2026-05-31T20:09:09+03:00",
        "subject": "refactor: update build-flatpak.sh script comments and error messages to English",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2399d58b9656ab3ef6ec38e9cb8a812d5c2ef47b"
      },
      {
        "hash": "ff24cc01257cc2aaa1fab4fe7e525312226fd925",
        "shortHash": "ff24cc0",
        "author": "greenkod",
        "date": "2026-05-31T19:59:47+03:00",
        "subject": "fix: update metadata license to MPL-2.0 in metainfo.xml",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ff24cc01257cc2aaa1fab4fe7e525312226fd925"
      },
      {
        "hash": "500f939a23dcaa2754b6e41e7a220014faa6e385",
        "shortHash": "500f939",
        "author": "GreenKod",
        "date": "2026-05-31T19:55:02+03:00",
        "subject": "Add secrets check to release workflow",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/500f939a23dcaa2754b6e41e7a220014faa6e385"
      },
      {
        "hash": "449aad67813c28a7ff5f957dbb2daa079700534e",
        "shortHash": "449aad6",
        "author": "GreenKod",
        "date": "2026-05-31T19:53:04+03:00",
        "subject": "Refactor code signing secrets checks in release.yml",
        "body": "Updated the conditional checks for code signing secrets in the release workflow.",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/449aad67813c28a7ff5f957dbb2daa079700534e"
      },
      {
        "hash": "e38d6186f8e1ea699e20755517261b833340779b",
        "shortHash": "e38d618",
        "author": "GreenKod",
        "date": "2026-05-31T19:50:14+03:00",
        "subject": "Refactor macOS signing workflow in release.yml",
        "body": "Refactor macOS signing workflow to use environment variables for secrets and streamline steps.",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e38d6186f8e1ea699e20755517261b833340779b"
      },
      {
        "hash": "8c5589091c35686e32c40e28d2524c63952e8627",
        "shortHash": "8c55890",
        "author": "GreenKod",
        "date": "2026-05-31T19:46:53+03:00",
        "subject": "ci(release): introduce draft-based multi-stage release pipeline",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8c5589091c35686e32c40e28d2524c63952e8627"
      },
      {
        "hash": "da9426034b9d34b055d7d66ef95fa4a89f28b903",
        "shortHash": "da94260",
        "author": "GreenKod",
        "date": "2026-05-31T19:32:47+03:00",
        "subject": "Merge branch 'VastSea0:main' into feature/packaging-pipeline",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/da9426034b9d34b055d7d66ef95fa4a89f28b903"
      },
      {
        "hash": "226eabcac220a0ed4d529ff22048684023bac273",
        "shortHash": "226eabc",
        "author": "greenkod",
        "date": "2026-05-31T19:29:43+03:00",
        "subject": "feat: add unified packaging pipeline for Flatpak and AppImage",
        "body": "Introduce a unified and automated packaging workflow for Hilal, supporting both Flatpak and AppImage distributions.\n\n- Extend build-linux.sh with dedicated commands for Flatpak and AppImage build/install workflows.\n- Add AppImage automation script (build-appimage.sh) for reproducible portable packaging.\n- Introduce Flatpak manifest (org.gkdevstudio.Hilal.json) to enable sandboxed desktop distribution.\n- Add config.yml for persistent build state tracking (build counter).\n- Add test.sh to validate packaging pipeline and improve build reliability.\n- Improve validation and user feedback across build scripts to reduce silent failures.\n\nThis improves consistency between packaging formats and simplifies release automation.",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/226eabcac220a0ed4d529ff22048684023bac273"
      },
      {
        "hash": "bd5045df2458fbdae63334b1722fdff404ea7018",
        "shortHash": "bd5045d",
        "author": "VastSea0",
        "date": "2026-05-31T01:21:56+03:00",
        "subject": "Add gif",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bd5045df2458fbdae63334b1722fdff404ea7018"
      },
      {
        "hash": "aada7336a8a8c37165dad73d8c63ede76f24985f",
        "shortHash": "aada733",
        "author": "VastSea0",
        "date": "2026-05-31T00:07:23+03:00",
        "subject": "fix: restore sidebar background to system color on macOS, revert Gemini AI integration",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/aada7336a8a8c37165dad73d8c63ede76f24985f"
      },
      {
        "hash": "119f8ac946f801164fe96903d5c6810913536027",
        "shortHash": "119f8ac",
        "author": "VastSea0",
        "date": "2026-05-30T23:42:52+03:00",
        "subject": "fix: deobfuscate host mapping at runtime in autocomplete muxer (Issue #23)",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/119f8ac946f801164fe96903d5c6810913536027"
      },
      {
        "hash": "8d24cb58d7d1d1c7a9930df40284f9d5223060ff",
        "shortHash": "8d24cb5",
        "author": "VastSea0",
        "date": "2026-05-30T23:42:46+03:00",
        "subject": "fix: initialize clean new tabs in active workspace container (Issue #26)",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8d24cb58d7d1d1c7a9930df40284f9d5223060ff"
      },
      {
        "hash": "6d38816d8dacaf761994fcc1b186448c2a318417",
        "shortHash": "6d38816",
        "author": "VastSea0",
        "date": "2026-05-30T23:42:41+03:00",
        "subject": "fix: prevent search intent leak on unknown bangs (Issue #25)",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6d38816d8dacaf761994fcc1b186448c2a318417"
      },
      {
        "hash": "09da01a71da6f6f8918c7fa35b51cd336b206c34",
        "shortHash": "09da01a",
        "author": "VastSea0",
        "date": "2026-05-30T23:26:08+03:00",
        "subject": "fix: resolve UI layout issues and insecure content warnings in Hilal UI overrides",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/09da01a71da6f6f8918c7fa35b51cd336b206c34"
      },
      {
        "hash": "2c8265afb03e69d205686d906d05e73b91e0818b",
        "shortHash": "2c8265a",
        "author": "greenkod",
        "date": "2026-05-30T19:26:17+03:00",
        "subject": "refactor: improve script documentation and enhance parameter handling in build-linux.sh",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2c8265afb03e69d205686d906d05e73b91e0818b"
      },
      {
        "hash": "3b121b229c44f161fb20676b10a2efd545fd5a28",
        "shortHash": "3b121b2",
        "author": "greenkod",
        "date": "2026-05-30T17:33:19+03:00",
        "subject": "feat: add no-lag option to build script for optimized CPU usage",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3b121b229c44f161fb20676b10a2efd545fd5a28"
      },
      {
        "hash": "07dc6f22eb7d083221b1b2406df587e2ddbc178f",
        "shortHash": "07dc6f2",
        "author": "greenkod",
        "date": "2026-05-30T16:40:20+03:00",
        "subject": "feat: enable sccache for compiler caching in Linux mozconfigs",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/07dc6f22eb7d083221b1b2406df587e2ddbc178f"
      },
      {
        "hash": "8c0abbe034b94e5d919c6e4408e27419dcda421f",
        "shortHash": "8c0abbe",
        "author": "VastSea0",
        "date": "2026-05-29T17:26:36+03:00",
        "subject": "Merge branch 'main' of https://github.com/VastSea0/hilal-browser",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8c0abbe034b94e5d919c6e4408e27419dcda421f"
      },
      {
        "hash": "d47b78522ff521f8a0eb604799191cbbf6255445",
        "shortHash": "d47b785",
        "author": "VastSea0",
        "date": "2026-05-29T17:26:26+03:00",
        "subject": "chore: initialize local git repository and update flathub configuration files",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d47b78522ff521f8a0eb604799191cbbf6255445"
      },
      {
        "hash": "740499b9918dc5ef041e0b4865d2ad4682db4d4d",
        "shortHash": "740499b",
        "author": "VastSea0",
        "date": "2026-05-29T17:26:00+03:00",
        "subject": "chore: project screenshots",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/740499b9918dc5ef041e0b4865d2ad4682db4d4d"
      },
      {
        "hash": "42ee9b330c18e95bd80d7993267e09713dd5730f",
        "shortHash": "42ee9b3",
        "author": "Muhammed Beshir",
        "date": "2026-05-26T13:21:18+03:00",
        "subject": "Enhance Firefox setup script with fast clone option",
        "body": "",
        "category": "perf",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/42ee9b330c18e95bd80d7993267e09713dd5730f"
      }
    ],
    "highlights": null,
    "githubUrl": "https://github.com/VastSea0/hilal-browser/releases/tag/v0.3.0-alpha.1",
    "compareUrl": "https://github.com/VastSea0/hilal-browser/compare/v0.2.0-alpha.5...v0.3.0-alpha.1"
  },
  {
    "tag": "v0.2.0-alpha.5",
    "version": "0.2.0-alpha.5",
    "isDev": false,
    "date": "2026-05-29T12:28:56Z",
    "commitCount": 99,
    "commits": [
      {
        "hash": "10664a717478854d06b768d471bf4137d10ef49a",
        "shortHash": "10664a7",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-29T12:28:56Z",
        "subject": "fix: install taskcluster Python package for Flatpak build",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/10664a717478854d06b768d471bf4137d10ef49a"
      },
      {
        "hash": "7eeb837c93f40f8365c9d4efdc00d14a74e0d1e1",
        "shortHash": "7eeb837",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-29T12:24:57Z",
        "subject": "fix: add --enable-bootstrap=no-update for Flatpak builds",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7eeb837c93f40f8365c9d4efdc00d14a74e0d1e1"
      },
      {
        "hash": "aa92fb23ece965a2c9636dcceee6594d5eb56f5b",
        "shortHash": "aa92fb2",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-29T12:20:37Z",
        "subject": "fix: chain Flatpak build commands to persist BUILD_DIR env",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/aa92fb23ece965a2c9636dcceee6594d5eb56f5b"
      },
      {
        "hash": "aca673dec4097c6f817a6a5e4962b9c364529c69",
        "shortHash": "aca673d",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-29T12:20:16Z",
        "subject": "fix: install cbindgen to writable D:\\hilal-browser/.cargo in Flatpak",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/aca673dec4097c6f817a6a5e4962b9c364529c69"
      },
      {
        "hash": "95b9d739f7b5c1554e12b011e47ddb1bb384f28f",
        "shortHash": "95b9d73",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-29T12:18:43Z",
        "subject": "fix: add cbindgen and network access for Flatpak build",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/95b9d739f7b5c1554e12b011e47ddb1bb384f28f"
      },
      {
        "hash": "0ff478870ba9a3a9480d8e321183ed48afe4ed96",
        "shortHash": "0ff4788",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-29T11:55:19Z",
        "subject": "fix: correct YAML indentation and tag commit in Flatpak manifest",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0ff478870ba9a3a9480d8e321183ed48afe4ed96"
      },
      {
        "hash": "b497cad592030a25ee4a659d008f4b794b970b75",
        "shortHash": "b497cad",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-29T11:50:31Z",
        "subject": "chore: update Flatpak manifest to v0.2.0-alpha.5 tag and Firefox commit",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b497cad592030a25ee4a659d008f4b794b970b75"
      },
      {
        "hash": "5cd04b8a3a0ecfec057e4e2327e3421b2a921a5c",
        "shortHash": "5cd04b8",
        "author": "VastSea0",
        "date": "2026-05-29T04:37:30+03:00",
        "subject": "Merge branch 'main' of https://github.com/VastSea0/hilal-browser",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5cd04b8a3a0ecfec057e4e2327e3421b2a921a5c"
      },
      {
        "hash": "13cf4b2ff009cc5fdc73821816b862161d5dc77a",
        "shortHash": "13cf4b2",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-29T01:23:38Z",
        "subject": "chore: bump version to v0.2.0-alpha.5 and update changelog",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/13cf4b2ff009cc5fdc73821816b862161d5dc77a"
      },
      {
        "hash": "877e7793ccf08113d6a1b360e5756cf1c6f70a7a",
        "shortHash": "877e779",
        "author": "VastSea0",
        "date": "2026-05-29T03:30:21+03:00",
        "subject": "feat: harden privacy features, implement workspace host obfuscation, improve sidebar UI initialization, and add automated MAR signing for release builds.",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/877e7793ccf08113d6a1b360e5756cf1c6f70a7a"
      },
      {
        "hash": "29d66380e90a6ed0f25fe001a9633936896c44e6",
        "shortHash": "29d6638",
        "author": "VastSea0",
        "date": "2026-05-29T03:17:56+03:00",
        "subject": "feat: customize Help and Feedback dialog links and preferences for Hilal Browser",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/29d66380e90a6ed0f25fe001a9633936896c44e6"
      },
      {
        "hash": "42e5d50c72074d579f3cae93a2c13ee6b8a299bc",
        "shortHash": "42e5d50",
        "author": "VastSea0",
        "date": "2026-05-29T03:11:08+03:00",
        "subject": "feat: update About Dialog links to point to Hilal project resources",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/42e5d50c72074d579f3cae93a2c13ee6b8a299bc"
      },
      {
        "hash": "0a1c3b494bece136b0ef7989d64160522a4cbf8e",
        "shortHash": "0a1c3b4",
        "author": "VastSea0",
        "date": "2026-05-29T03:06:47+03:00",
        "subject": "docs: update production signing documentation with detailed NSS setup, key rotation, and CI secret integration procedures",
        "body": "",
        "category": "docs",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0a1c3b494bece136b0ef7989d64160522a4cbf8e"
      },
      {
        "hash": "933966afe37f4159b3eaa8937d5ce3d9f1f7aa13",
        "shortHash": "933966a",
        "author": "VastSea0",
        "date": "2026-05-29T03:05:35+03:00",
        "subject": "feat: implement secure update signature verification for Hilal channels and allow unsigned MARs for development",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/933966afe37f4159b3eaa8937d5ce3d9f1f7aa13"
      },
      {
        "hash": "797fa99edbfaf2333f95dd826a378373cf695abe",
        "shortHash": "797fa99",
        "author": "VastSea0",
        "date": "2026-05-29T00:48:27+03:00",
        "subject": "Add macOS code signing, notarization, and CI integration",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/797fa99edbfaf2333f95dd826a378373cf695abe"
      },
      {
        "hash": "214bfd51f53d6163ba6dfef071c1c561f1ead64e",
        "shortHash": "214bfd5",
        "author": "VastSea0",
        "date": "2026-05-29T00:38:15+03:00",
        "subject": "feat: implement sidebar footer and custom shortcut preferences for Hilal Browser",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/214bfd51f53d6163ba6dfef071c1c561f1ead64e"
      },
      {
        "hash": "3df0d4c692d521f2fdf4470b14d6626489c3f3fb",
        "shortHash": "3df0d4c",
        "author": "VastSea0",
        "date": "2026-05-29T00:27:56+03:00",
        "subject": "ci: align verify-patches workflow with README badge and PR template",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3df0d4c692d521f2fdf4470b14d6626489c3f3fb"
      },
      {
        "hash": "37855f0c8c47b35c7e38fff6454df62393fd97aa",
        "shortHash": "37855f0",
        "author": "VastSea0",
        "date": "2026-05-29T00:19:58+03:00",
        "subject": "feat: integrate external Firefox UI fixes with management scripts and CSS overrides",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/37855f0c8c47b35c7e38fff6454df62393fd97aa"
      },
      {
        "hash": "d68db2f12187d4598897f494b86e692ce837d5ba",
        "shortHash": "d68db2f",
        "author": "VastSea0",
        "date": "2026-05-29T00:06:49+03:00",
        "subject": "ci: add workflow to verify patch application against Firefox source tree",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d68db2f12187d4598897f494b86e692ce837d5ba"
      },
      {
        "hash": "06fb55e5f08f10874d592768f3731a7a6d824c5f",
        "shortHash": "06fb55e",
        "author": "VastSea0",
        "date": "2026-05-28T23:41:58+03:00",
        "subject": "refactor: optimize workspace initial page handling and add compact mode support for sidebar footer items",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/06fb55e5f08f10874d592768f3731a7a6d824c5f"
      },
      {
        "hash": "8c2601ab2e621df939cb218c1986b36467cdb437",
        "shortHash": "8c2601a",
        "author": "VastSea0",
        "date": "2026-05-28T22:48:51+03:00",
        "subject": "style: refine vertical pinned tabs to 3x3 perfect-square grid layout with 22px icons",
        "body": "",
        "category": "style",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8c2601ab2e621df939cb218c1986b36467cdb437"
      },
      {
        "hash": "f89fc007d00765065e6588aa12280eddc34df065",
        "shortHash": "f89fc00",
        "author": "VastSea0",
        "date": "2026-05-28T22:10:35+03:00",
        "subject": "refactor: improve sanitization, robust state handling, and add interactive confirmation for force-apply scripts",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f89fc007d00765065e6588aa12280eddc34df065"
      },
      {
        "hash": "42bf2cadd3e769667d6c7d8a34876aedd9bfad17",
        "shortHash": "42bf2ca",
        "author": "VastSea0",
        "date": "2026-05-28T21:35:00+03:00",
        "subject": "refactor: improve workspace tab state synchronization by updating or appending entries instead of overwriting them",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/42bf2cadd3e769667d6c7d8a34876aedd9bfad17"
      },
      {
        "hash": "d847f038cef988bf04b018b206162baba4a3f977",
        "shortHash": "d847f03",
        "author": "VastSea0",
        "date": "2026-05-28T21:16:47+03:00",
        "subject": "style: refine compact sidebar tab sizing, spacing, and border-radius metrics",
        "body": "",
        "category": "style",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d847f038cef988bf04b018b206162baba4a3f977"
      },
      {
        "hash": "39df002fe3b57bac3c692c0bde440dfb8e9401a9",
        "shortHash": "39df002",
        "author": "VastSea0",
        "date": "2026-05-28T21:09:54+03:00",
        "subject": "refactor: update container retargeting to support URI context and adjust sidebar tab aspect ratio and constraints",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/39df002fe3b57bac3c692c0bde440dfb8e9401a9"
      },
      {
        "hash": "6b330748d65f595d993d9ab220154af8cdb08dc8",
        "shortHash": "6b33074",
        "author": "VastSea0",
        "date": "2026-05-28T20:59:10+03:00",
        "subject": "style: update compact sidebar pinned tabs grid layout and sizing for improved visibility",
        "body": "",
        "category": "style",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6b330748d65f595d993d9ab220154af8cdb08dc8"
      },
      {
        "hash": "607dc72be03e5ce04d207a82e45e65e2e13b0d69",
        "shortHash": "607dc72",
        "author": "VastSea0",
        "date": "2026-05-28T20:54:49+03:00",
        "subject": "refactor: update vertical pinned tab grid layout and reset default UI preference settings",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/607dc72be03e5ce04d207a82e45e65e2e13b0d69"
      },
      {
        "hash": "bc0fb5091cc01b0311bcaf86897adbb2b4d2dac2",
        "shortHash": "bc0fb50",
        "author": "VastSea0",
        "date": "2026-05-28T20:47:29+03:00",
        "subject": "style: overhaul vertical sidebar UI with improved tab styling, grid-based pinned tabs, and refined session state handling for real URL loading",
        "body": "",
        "category": "style",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bc0fb5091cc01b0311bcaf86897adbb2b4d2dac2"
      },
      {
        "hash": "8c538ed816defd5af76067f0a52f249f687c2c64",
        "shortHash": "8c538ed",
        "author": "VastSea0",
        "date": "2026-05-28T17:06:22+03:00",
        "subject": "style: override vertical tab styles to match hilal premium theme",
        "body": "",
        "category": "style",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8c538ed816defd5af76067f0a52f249f687c2c64"
      },
      {
        "hash": "a2a33a515a2930c57864fca6a93f4ac3f275ca61",
        "shortHash": "a2a33a5",
        "author": "VastSea0",
        "date": "2026-05-28T16:54:44+03:00",
        "subject": "refactor: integrate native slotted tabstrip inside workspaces sidebar panel",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a2a33a515a2930c57864fca6a93f4ac3f275ca61"
      },
      {
        "hash": "e40862a7dcbff849dd6a36565db6ba2d9feb51c2",
        "shortHash": "e40862a",
        "author": "VastSea0",
        "date": "2026-05-28T16:41:19+03:00",
        "subject": "fix: enforce CSS visibility and transform properties for compact mode toolbar transitions",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e40862a7dcbff849dd6a36565db6ba2d9feb51c2"
      },
      {
        "hash": "655104250072defa0d5a4b36aefb5c2f53c40e6e",
        "shortHash": "6551042",
        "author": "VastSea0",
        "date": "2026-05-28T15:56:35+03:00",
        "subject": "feat: add preference to auto-hide top toolbar in compact mode with glassmorphic hover reveal animation",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/655104250072defa0d5a4b36aefb5c2f53c40e6e"
      },
      {
        "hash": "77f7c17c4ac8bfd4b957a21828904fe01419ba1d",
        "shortHash": "77f7c17",
        "author": "VastSea0",
        "date": "2026-05-28T15:47:34+03:00",
        "subject": "refactor: update compact mode hover zone height and refine sidebar overlay transform logic",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/77f7c17c4ac8bfd4b957a21828904fe01419ba1d"
      },
      {
        "hash": "601a659c843093ca25c215ac7a47943429736223",
        "shortHash": "601a659",
        "author": "VastSea0",
        "date": "2026-05-28T15:38:02+03:00",
        "subject": "feat: add compact mode preference to control sidebar and toolbox visibility behavior",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/601a659c843093ca25c215ac7a47943429736223"
      },
      {
        "hash": "b2373c1005de743e04a478ee1c1216c84eb31a47",
        "shortHash": "b2373c1",
        "author": "VastSea0",
        "date": "2026-05-28T03:54:16+03:00",
        "subject": "fix(sidebar): resolve compact mode button opening history panel",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b2373c1005de743e04a478ee1c1216c84eb31a47"
      },
      {
        "hash": "1db3f4ce0ef862fb4451985ea3713807d4f6bf2b",
        "shortHash": "1db3f4c",
        "author": "VastSea0",
        "date": "2026-05-28T03:46:10+03:00",
        "subject": "feat: implement compact sidebar mode with auto-hide functionality and support for workspaces",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/1db3f4ce0ef862fb4451985ea3713807d4f6bf2b"
      },
      {
        "hash": "2e2ea0038ca70422c62f3025af39f69f4658830a",
        "shortHash": "2e2ea00",
        "author": "VastSea0",
        "date": "2026-05-28T03:27:39+03:00",
        "subject": "feat: implement compact hover-triggered sidebar with floating overlay support for left and right positions",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2e2ea0038ca70422c62f3025af39f69f4658830a"
      },
      {
        "hash": "2107481c84670f4403066389d06521bc97e8c163",
        "shortHash": "2107481",
        "author": "VastSea0",
        "date": "2026-05-28T03:27:30+03:00",
        "subject": "feat: integrate Hilal browser configuration, workspace bookmarks, and UI customization preferences",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2107481c84670f4403066389d06521bc97e8c163"
      },
      {
        "hash": "13ddfa7e9c7aca1ac44aa995f3c5f6aeacb80333",
        "shortHash": "13ddfa7",
        "author": "VastSea0",
        "date": "2026-05-28T03:14:10+03:00",
        "subject": "Refine sidebar hover behavior: adjust hover zone dimensions and delay timings",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/13ddfa7e9c7aca1ac44aa995f3c5f6aeacb80333"
      },
      {
        "hash": "dfb8bb5ff56daf8d31f8c7c3144ad22e447c1a28",
        "shortHash": "dfb8bb5",
        "author": "VastSea0",
        "date": "2026-05-28T02:50:44+03:00",
        "subject": "Implement hover-triggered sidebar visibility for Hilal compact mode",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/dfb8bb5ff56daf8d31f8c7c3144ad22e447c1a28"
      },
      {
        "hash": "cd6b4855169e5a472d2454461dbd352948c4a803",
        "shortHash": "cd6b485",
        "author": "VastSea0",
        "date": "2026-05-28T02:11:06+03:00",
        "subject": "Add language selection feature: enable dynamic UI localization and prompt for restart",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/cd6b4855169e5a472d2454461dbd352948c4a803"
      },
      {
        "hash": "a89295498d0761251d649e0dfea873425941c576",
        "shortHash": "a892954",
        "author": "VastSea0",
        "date": "2026-05-28T00:51:03+03:00",
        "subject": "Enhance Hilal compact mode: improve sidebar visibility and hover behavior",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a89295498d0761251d649e0dfea873425941c576"
      },
      {
        "hash": "559d54e64c3c7a1b8cd09aa6ab0407748828cd9d",
        "shortHash": "559d54e",
        "author": "VastSea0",
        "date": "2026-05-28T00:17:43+03:00",
        "subject": "Add Hilal compact mode: toolbar button hides sidebar, hover to reveal",
        "body": "The toolbar sidebar button now toggles compact mode (hilal.compact.enabled\npref). In compact mode the sidebar slides off-screen and web content\nexpands to full width. Hovering near the left edge slides the sidebar\nback in as a floating overlay, matching Zen Browser compact mode UX.\n\n- Add HilalCompactMode controller to browser-sidebar.js: manages the\n  hilal-compact-mode attribute on <html>, syncs toolbar button checked\n  state, and persists via pref observer.\n- Call HilalCompactMode.init() at end of SidebarController.init().\n- CustomizableWidgets: sidebar-button onCommand now calls\n  HilalCompactMode.toggle() instead of SidebarController internals.\n- browser-sets.js: toggleSidebarKb shortcut calls HilalCompactMode.toggle().\n- sidebar.css: compact mode CSS - fixed position sidebar slides off-screen,\n  hover reveals it with opacity + transform transition and drop shadow.\n  Splitter hidden, tabbox gets full width.\n- firefox.js: add hilal.compact.enabled default pref (false).",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/559d54e64c3c7a1b8cd09aa6ab0407748828cd9d"
      },
      {
        "hash": "a243ed466a304d5be25ec030844d83cc18eb33b1",
        "shortHash": "a243ed4",
        "author": "VastSea0",
        "date": "2026-05-28T00:02:35+03:00",
        "subject": "Fix toolbar sidebar button and keyboard shortcut for Hilal sidebar",
        "body": "When sidebar.revamp is false but hilal.workspaces.enabled or\nsidebar.verticalTabs is true, SidebarState launcherVisible and\nlauncherExpanded setters were bailing out early, leaving the toolbar\nbutton and keyboard shortcut inoperative.\n\nAdd hilalWorkspacesEnabled lazy pref getter to SidebarState.sys.mjs.\nAdd #hilalEnabled getter; broaden early-return guards to only bail\nwhen neither revampEnabled nor hilalEnabled is true.\n\nExtend browser-sidebar.js init block condition to also fire when\nhilalEnabled is true so sidebar-main is imported and initializeState\nis called. Extend updateToolbarButton to use revamp UI branch for\nHilal so the button shows correct labels and expanded state.",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a243ed466a304d5be25ec030844d83cc18eb33b1"
      },
      {
        "hash": "bb93580ce43505b712d8f1f060f4a1d31ebe8c30",
        "shortHash": "bb93580",
        "author": "VastSea0",
        "date": "2026-05-27T23:51:22+03:00",
        "subject": "Update sidebar layout redesign patch to make toolbar button and shortcut compatible with redesigned sidebar",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bb93580ce43505b712d8f1f060f4a1d31ebe8c30"
      },
      {
        "hash": "565b925cab0dd00cbd337fae100c1d9b328b1fcd",
        "shortHash": "565b925",
        "author": "VastSea0",
        "date": "2026-05-27T23:47:32+03:00",
        "subject": "Update sidebar layout redesign patch to adaptively hide workspaces switcher when disabled",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/565b925cab0dd00cbd337fae100c1d9b328b1fcd"
      },
      {
        "hash": "4a068bfc938e704c4928de8fe31b18114ad514a9",
        "shortHash": "4a068bf",
        "author": "VastSea0",
        "date": "2026-05-27T23:32:49+03:00",
        "subject": "fix workspace pinned and group tab visibility in new sidebar",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4a068bfc938e704c4928de8fe31b18114ad514a9"
      },
      {
        "hash": "b20f88a27816df19421f9e645cb2944d7072179c",
        "shortHash": "b20f88a",
        "author": "VastSea0",
        "date": "2026-05-27T17:20:23+03:00",
        "subject": "Refactor workspace retargeting logic: remove redundant scheduling in tab open handler and improve handling for transient initial pages.",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b20f88a27816df19421f9e645cb2944d7072179c"
      },
      {
        "hash": "c07f763694e88dcee247b1494727532cc1314d04",
        "shortHash": "c07f763",
        "author": "VastSea0",
        "date": "2026-05-27T16:44:44+03:00",
        "subject": "Fix new tab button icon: remove data-l10n-id, use formatValueSync for title/aria-label",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c07f763694e88dcee247b1494727532cc1314d04"
      },
      {
        "hash": "0b29b2d04e4d333d117a0362dfc1def2ba5f67e1",
        "shortHash": "0b29b2d",
        "author": "VastSea0",
        "date": "2026-05-27T16:35:20+03:00",
        "subject": "Fix sidebar header new tab icon, remove PINLENEN heading, increase pinned favicon to 36px",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0b29b2d04e4d333d117a0362dfc1def2ba5f67e1"
      },
      {
        "hash": "17d52097c69e907f4ce0e6e97b7dc0059431b868",
        "shortHash": "17d5209",
        "author": "VastSea0",
        "date": "2026-05-27T16:27:14+03:00",
        "subject": "feat: add sidebar configuration preferences and UI logic for Hilal workspaces and custom theme settings",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/17d52097c69e907f4ce0e6e97b7dc0059431b868"
      },
      {
        "hash": "91fc2a58a2ccdd03760b907825e8656f8bd47e3c",
        "shortHash": "91fc2a5",
        "author": "VastSea0",
        "date": "2026-05-27T15:52:17+03:00",
        "subject": "merge",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/91fc2a58a2ccdd03760b907825e8656f8bd47e3c"
      },
      {
        "hash": "793000c614489372756a0c3b51ae910b73d69449",
        "shortHash": "793000c",
        "author": "VastSea0",
        "date": "2026-05-27T15:32:54+03:00",
        "subject": "Implement robust dynamic built-in localization model",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/793000c614489372756a0c3b51ae910b73d69449"
      },
      {
        "hash": "8fdf433234f46c815097ca48ab371d87e86829ca",
        "shortHash": "8fdf433",
        "author": "VastSea0",
        "date": "2026-05-27T15:32:54+03:00",
        "subject": "Implement robust dynamic built-in localization model",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8fdf433234f46c815097ca48ab371d87e86829ca"
      },
      {
        "hash": "e57e748924fcb80ac82fbdae8036f867dd8fac6f",
        "shortHash": "e57e748",
        "author": "VastSea0",
        "date": "2026-05-27T14:58:08+03:00",
        "subject": "docs: update localization documentation with user language selection preference details",
        "body": "",
        "category": "docs",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e57e748924fcb80ac82fbdae8036f867dd8fac6f"
      },
      {
        "hash": "7aa61e33ab6e3cd74045c058c1180d061e6da5f7",
        "shortHash": "7aa61e3",
        "author": "VastSea0",
        "date": "2026-05-27T14:57:28+03:00",
        "subject": "feat: add UI for dynamic language selection and application restart in Hilal preferences",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7aa61e33ab6e3cd74045c058c1180d061e6da5f7"
      },
      {
        "hash": "d53b7e98504c1ffc8ed8b615d84e848e562e4ccf",
        "shortHash": "d53b7e9",
        "author": "VastSea0",
        "date": "2026-05-27T14:55:19+03:00",
        "subject": "feat: implement language selection interface and update main preferences logic",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d53b7e98504c1ffc8ed8b615d84e848e562e4ccf"
      },
      {
        "hash": "59579138f5ef9577356ef290829020c36e87418b",
        "shortHash": "5957913",
        "author": "VastSea0",
        "date": "2026-05-27T14:24:28+03:00",
        "subject": "refactor: overhaul langpack patching script to support automated branding and localization overlays for all bundled languages",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/59579138f5ef9577356ef290829020c36e87418b"
      },
      {
        "hash": "288f93355e1ac0480f0b405376bf9d2a7bf36b08",
        "shortHash": "288f933",
        "author": "VastSea0",
        "date": "2026-05-27T14:24:22+03:00",
        "subject": "refactor: implement generalized langpack patching script to support arbitrary localizations and branding overlays",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/288f93355e1ac0480f0b405376bf9d2a7bf36b08"
      },
      {
        "hash": "132a706c5fd6f4087ed31caff76721d464a8a660",
        "shortHash": "132a706",
        "author": "VastSea0",
        "date": "2026-05-27T14:24:17+03:00",
        "subject": "feat: enable multi-locale support and system locale default for Hilal browser",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/132a706c5fd6f4087ed31caff76721d464a8a660"
      },
      {
        "hash": "2fbf98afdc1e7de7a41282cdeb40b41fb1df4a6c",
        "shortHash": "2fbf98a",
        "author": "VastSea0",
        "date": "2026-05-27T03:49:55+03:00",
        "subject": "feat: enable sccache for compiler caching in macOS mozconfig",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2fbf98afdc1e7de7a41282cdeb40b41fb1df4a6c"
      },
      {
        "hash": "973f7ec3f39403771be7eb7cc0b96ca6ac1f8784",
        "shortHash": "973f7ec",
        "author": "VastSea0",
        "date": "2026-05-27T03:49:43+03:00",
        "subject": "chore: enable sccache in macos build config and update turkish language pack",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/973f7ec3f39403771be7eb7cc0b96ca6ac1f8784"
      },
      {
        "hash": "d0a628980a9faab26f7c03047c29598af81449b8",
        "shortHash": "d0a6289",
        "author": "VastSea0",
        "date": "2026-05-27T03:40:39+03:00",
        "subject": "feat: add automated Turkish language pack patching to build script",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d0a628980a9faab26f7c03047c29598af81449b8"
      },
      {
        "hash": "761bdf497b4bc2244800a3f64ad036931526601c",
        "shortHash": "761bdf4",
        "author": "VastSea0",
        "date": "2026-05-27T03:40:35+03:00",
        "subject": "feat: implement patch-langpack script to inject custom strings into Turkish locale and update apply.sh to execute it",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/761bdf497b4bc2244800a3f64ad036931526601c"
      },
      {
        "hash": "3f3949a7d00ffa62f36d5d54d5f9c06c1dd146a9",
        "shortHash": "3f3949a",
        "author": "VastSea0",
        "date": "2026-05-27T03:40:29+03:00",
        "subject": "feat: add automated Turkish language pack patching for Hilal sidebar strings",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3f3949a7d00ffa62f36d5d54d5f9c06c1dd146a9"
      },
      {
        "hash": "0c70a412d40e6f2172736834ed804d54bcc1cf44",
        "shortHash": "0c70a41",
        "author": "VastSea0",
        "date": "2026-05-27T03:40:25+03:00",
        "subject": "feat: add Turkish localization support for Hilal welcome screen and sidebar via automated language pack patching",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0c70a412d40e6f2172736834ed804d54bcc1cf44"
      },
      {
        "hash": "c84ac2f569ba9007057db14b56e9b9df28582908",
        "shortHash": "c84ac2f",
        "author": "VastSea0",
        "date": "2026-05-27T03:40:17+03:00",
        "subject": "feat: add Turkish language support for browser preferences, welcome screen, and sidebar via automated patching script",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c84ac2f569ba9007057db14b56e9b9df28582908"
      },
      {
        "hash": "5291221ff26d5c3a0c39e3f9bbcf011aa8e0c217",
        "shortHash": "5291221",
        "author": "VastSea0",
        "date": "2026-05-27T03:38:20+03:00",
        "subject": "chore: update Turkish language pack extension to latest version",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5291221ff26d5c3a0c39e3f9bbcf011aa8e0c217"
      },
      {
        "hash": "c46876b7880e453acc437898628d92bc0b08a13d",
        "shortHash": "c46876b",
        "author": "VastSea0",
        "date": "2026-05-27T03:30:27+03:00",
        "subject": "refactor: improve formatting and readablity of workspace preference fetching in UrlbarMuxerStandard",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c46876b7880e453acc437898628d92bc0b08a13d"
      },
      {
        "hash": "29731585768d0ad0c0826a0acfc878fa7c89584a",
        "shortHash": "2973158",
        "author": "VastSea0",
        "date": "2026-05-27T03:29:27+03:00",
        "subject": "fix: update line offset in workspace context isolation patch for UrlbarMuxerStandard.sys.mjs",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/29731585768d0ad0c0826a0acfc878fa7c89584a"
      },
      {
        "hash": "3565552d0aeed7c4eaba2e685b02ead26062205c",
        "shortHash": "3565552",
        "author": "VastSea0",
        "date": "2026-05-27T03:29:18+03:00",
        "subject": "chore: update workspace isolation and sidebar layout patch files",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3565552d0aeed7c4eaba2e685b02ead26062205c"
      },
      {
        "hash": "9408102d4881288ade2f484598bc4f3257f2cb23",
        "shortHash": "9408102",
        "author": "VastSea0",
        "date": "2026-05-27T03:16:25+03:00",
        "subject": "fix: validate URI schemes for HilalBangs and sidebar navigation, and optimize workspace state caching",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9408102d4881288ade2f484598bc4f3257f2cb23"
      },
      {
        "hash": "98a80e657231d14799f5439bf95dbb8fb2bcbe64",
        "shortHash": "98a80e6",
        "author": "VastSea0",
        "date": "2026-05-27T03:05:23+03:00",
        "subject": "feat: add dedicated releases archive page with navigation state",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/98a80e657231d14799f5439bf95dbb8fb2bcbe64"
      },
      {
        "hash": "c2969807704f4260112767301bbbe895d9a7e254",
        "shortHash": "c296980",
        "author": "VastSea0",
        "date": "2026-05-27T03:00:25+03:00",
        "subject": "refactor: simplify App component by removing static FAQ data and cleaning up UI strings and logic",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c2969807704f4260112767301bbbe895d9a7e254"
      },
      {
        "hash": "6f55eabceffe0be19d816509276284a1deef5a80",
        "shortHash": "6f55eab",
        "author": "VastSea0",
        "date": "2026-05-27T02:57:47+03:00",
        "subject": "feat: add privacy initialization and custom bang preference flags",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6f55eabceffe0be19d816509276284a1deef5a80"
      },
      {
        "hash": "9b5e6463876fc91023569a0efb5d4a31dc9ddd70",
        "shortHash": "9b5e646",
        "author": "VastSea0",
        "date": "2026-05-27T02:57:43+03:00",
        "subject": "feat: add hilal privacy initialization and bang customization prefs while updating extension scan scopes",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9b5e6463876fc91023569a0efb5d4a31dc9ddd70"
      },
      {
        "hash": "40e064cc24318764280aa434cd44831c242d223d",
        "shortHash": "40e064c",
        "author": "VastSea0",
        "date": "2026-05-27T02:57:39+03:00",
        "subject": "refactor: update browser patches to remove redundant URL loading logic and initialize new Hilal privacy and bang configuration preferences",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/40e064cc24318764280aa434cd44831c242d223d"
      },
      {
        "hash": "40184ec7038c89d6b076a12e4629d3b5d31325b7",
        "shortHash": "40184ec",
        "author": "VastSea0",
        "date": "2026-05-27T02:57:34+03:00",
        "subject": "refactor: update browser preferences, configure opaque backdrop fallback, and add initialization flags for Hilal features",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/40184ec7038c89d6b076a12e4629d3b5d31325b7"
      },
      {
        "hash": "0d796372ac3140eb81ffbee93307776a24efdca7",
        "shortHash": "0d79637",
        "author": "VastSea0",
        "date": "2026-05-27T02:57:30+03:00",
        "subject": "feat: implement privacy initialization, refine workspace state handling, and update browser configuration patches",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0d796372ac3140eb81ffbee93307776a24efdca7"
      },
      {
        "hash": "c282ff1635f80eb95b4455c98693fd096ce3ef1c",
        "shortHash": "c282ff1",
        "author": "VastSea0",
        "date": "2026-05-27T02:56:57+03:00",
        "subject": "refactor: implement one-time privacy initialization, improve workspace state management, add transparency fallback conditions, and refine type imports in App.tsx",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c282ff1635f80eb95b4455c98693fd096ce3ef1c"
      },
      {
        "hash": "0a0985671ab92b21e06bc92e75a18f079763e623",
        "shortHash": "0a09856",
        "author": "VastSea0",
        "date": "2026-05-27T02:40:53+03:00",
        "subject": "fix: correct line number in uBlock Origin patch for consistency",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0a0985671ab92b21e06bc92e75a18f079763e623"
      },
      {
        "hash": "eb543f6ce8ccdc83497e13081966cd9f5e799c6e",
        "shortHash": "eb543f6",
        "author": "VastSea0",
        "date": "2026-05-27T02:40:15+03:00",
        "subject": "fix: remove unnecessary whitespace in workspace context isolation logic",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/eb543f6ce8ccdc83497e13081966cd9f5e799c6e"
      },
      {
        "hash": "3fdc15bce24c0365dcc85c92a3cf4e058bcf32e3",
        "shortHash": "3fdc15b",
        "author": "VastSea0",
        "date": "2026-05-27T02:40:09+03:00",
        "subject": "feat: redesign sidebar layout for improved workspace management",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3fdc15bce24c0365dcc85c92a3cf4e058bcf32e3"
      },
      {
        "hash": "4d1862610c193e689f034d0792e6e7dd3467a4bd",
        "shortHash": "4d18626",
        "author": "VastSea0",
        "date": "2026-05-27T02:40:03+03:00",
        "subject": "feat: add custom bang preferences UI to Hilal Browser",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4d1862610c193e689f034d0792e6e7dd3467a4bd"
      },
      {
        "hash": "c67f3986500d07f3ec3b7fcce39f271f5b4a0a50",
        "shortHash": "c67f398",
        "author": "VastSea0",
        "date": "2026-05-27T02:39:58+03:00",
        "subject": "fix: remove unnecessary newline in uBlock Origin patch",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c67f3986500d07f3ec3b7fcce39f271f5b4a0a50"
      },
      {
        "hash": "a60c4e94bffa206f4b77bdf882cc8f4f67e71df2",
        "shortHash": "a60c4e9",
        "author": "VastSea0",
        "date": "2026-05-27T02:39:52+03:00",
        "subject": "feat: integrate Firefox-UI-Fix with dynamic settings UI",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a60c4e94bffa206f4b77bdf882cc8f4f67e71df2"
      },
      {
        "hash": "2a62a003f2ca486eca2aa5c01d9ada7c9a1ef924",
        "shortHash": "2a62a00",
        "author": "VastSea0",
        "date": "2026-05-27T02:39:46+03:00",
        "subject": "fix: update user-facing version to 0.2.0-alpha.4",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2a62a003f2ca486eca2aa5c01d9ada7c9a1ef924"
      },
      {
        "hash": "0b1d20ff7a071311d35ce9ecb380bc94458f4c09",
        "shortHash": "0b1d20f",
        "author": "VastSea0",
        "date": "2026-05-27T02:39:39+03:00",
        "subject": "feat: add dedicated Hilal settings category to preferences",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0b1d20ff7a071311d35ce9ecb380bc94458f4c09"
      },
      {
        "hash": "35d53d7b7f87d0a4d129eefbd9fa18c9c8964d2a",
        "shortHash": "35d53d7",
        "author": "VastSea0",
        "date": "2026-05-27T02:39:32+03:00",
        "subject": "fix: implement native blurred macOS chrome surfaces for Hilal Browser",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/35d53d7b7f87d0a4d129eefbd9fa18c9c8964d2a"
      },
      {
        "hash": "e1bd817fe93da17b243d909a683b6c0617f17fbe",
        "shortHash": "e1bd817",
        "author": "VastSea0",
        "date": "2026-05-27T02:29:56+03:00",
        "subject": "patches: split combined patch back into focused per-feature patches",
        "body": "Drop 0000-hilal-combined.patch (which included ~551 unrelated\nthird_party/rust Cargo.toml.orig entries) and restore the 18\nindividual focused patches from the pre-merge local branch.\n\nAlso restores the series file with proper ordering and comments.",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e1bd817fe93da17b243d909a683b6c0617f17fbe"
      },
      {
        "hash": "abc8b432fb43e4f43a59b4a1224ca54835b1bb97",
        "shortHash": "abc8b43",
        "author": "VastSea0",
        "date": "2026-05-27T02:20:36+03:00",
        "subject": "Merge branch 'main' of https://github.com/VastSea0/hilal-browser",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/abc8b432fb43e4f43a59b4a1224ca54835b1bb97"
      },
      {
        "hash": "65b98019115bea96e139a890b5ba71d9aeb52b09",
        "shortHash": "65b9801",
        "author": "VastSea0",
        "date": "2026-05-27T02:15:33+03:00",
        "subject": "fix: stop auto-creating workspace bookmark folders",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/65b98019115bea96e139a890b5ba71d9aeb52b09"
      },
      {
        "hash": "32a5cce9298c7bed99cc39a5fbbfaa8523718b7a",
        "shortHash": "32a5cce",
        "author": "VastSea0",
        "date": "2026-05-27T02:14:35+03:00",
        "subject": "fix: pin Firefox checkout before applying patches",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/32a5cce9298c7bed99cc39a5fbbfaa8523718b7a"
      },
      {
        "hash": "b8b799f9b06dceeace80d44a0935a526827fd2be",
        "shortHash": "b8b799f",
        "author": "VastSea0",
        "date": "2026-05-27T02:14:32+03:00",
        "subject": "fix: show Firefox base version in About Hilal",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b8b799f9b06dceeace80d44a0935a526827fd2be"
      },
      {
        "hash": "2836a3bff08936fb35cb8bfadbec2506e9eee835",
        "shortHash": "2836a3b",
        "author": "VastSea0",
        "date": "2026-05-27T02:14:29+03:00",
        "subject": "fix: separate Hilal and Firefox update versions",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2836a3bff08936fb35cb8bfadbec2506e9eee835"
      },
      {
        "hash": "23b34d70341500a005c7faa98a27940593026b56",
        "shortHash": "23b34d7",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-26T22:30:13Z",
        "subject": "docs: update changelog with Firefox upstream sync to 153.0a1",
        "body": "",
        "category": "docs",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/23b34d70341500a005c7faa98a27940593026b56"
      },
      {
        "hash": "b136fd90fa54694c5e6fb65906b2b9c86a7c82da",
        "shortHash": "b136fd9",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-25T23:57:52Z",
        "subject": "fix: regenerate patches from current firefox tree state",
        "body": "Replaces all 18 individual patches with a single combined patch\ngenerated via scripts/refresh.sh (git diff HEAD against upstream).\n\nIncludes all Hilal changes: preferences pane, UI fix integration,\nTurkish locale, privacy levels, bang customization, sidebar redesign,\nand workspace context isolation.",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b136fd90fa54694c5e6fb65906b2b9c86a7c82da"
      },
      {
        "hash": "bae24848178dc888461b2bb8d95bdb5609e0c6fc",
        "shortHash": "bae2484",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-26T12:39:42Z",
        "subject": "Merge pull request #16 from VastSea0/codex/flatpak-flathub-prep",
        "body": "flatpak: add Flathub-ready packaging scaffold",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bae24848178dc888461b2bb8d95bdb5609e0c6fc"
      },
      {
        "hash": "4972376c21fc7ad0fe9d684bc768c3862dc599b1",
        "shortHash": "4972376",
        "author": "VastSea0",
        "date": "2026-05-26T15:37:30+03:00",
        "subject": "flatpak: add Flathub-ready packaging scaffold",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4972376c21fc7ad0fe9d684bc768c3862dc599b1"
      }
    ],
    "highlights": {
      "added": [
        "**Compact Mode with Auto-Hide Sidebar**: Added a hover-triggered compact sidebar, floating overlay mode, auto-hide controls, and workspace preference bindings.",
        "**Firefox-UI-Fix Integration**: Added Firefox-UI-Fix CSS, sync scripts, Hilal overrides, and preference toggles.",
        "**Sidebar Layout Redesign**: Changed tab sizing, pinned-tab grid layout, sidebar theme rules, and slotted tabstrip integration.",
        "**Language Selection Support**: Added `0020-hilal-language-selection.patch` for browser language preferences and Turkish language pack integration.",
        "**Update Signature Checks**: Added update signature verification and channel handling for unsigned MARs in development builds.",
        "**Custom About Dialog Links**: Updated the About dialog with Hilal project resource links and custom Help/Feedback dialog link integration.",
        "**Sidebar Footer & Custom Shortcuts**: Added sidebar footer and custom shortcut preferences with favicon support from Firefox's page-icon cache.",
        "**Production Signing Scripts**: Added macOS code signing, notarization scripts with NSS setup, key rotation, and CI secret integration.",
        "**Flatpak Build Support**: Added Flatpak build scripts, manifest, and desktop integration files."
      ],
      "changed": [
        "**Compact Mode Workspace Handling**: Changed initial page handling, sidebar item state, and session state logic for compact mode.",
        "**Privacy & Workspace Handling**: Added container site-data cleanup on deletion, workspace tab group collapsing, and state synchronization changes.",
        "**Patch System Refinements**: Refactored workspace context isolation, bang customization, and localization patches."
      ],
      "fixed": [
        "**Compact Mode Toolbar Transitions**: Enforced CSS visibility and transform properties for compact mode toolbar transitions.",
        "**Sidebar Button Behavior**: Resolved compact mode button opening history panel instead of sidebar toggle.",
        "**First-run Crashes & Layout**: Fixed startup sessionstore crashes and incorrect welcome screen rendering."
      ]
    },
    "githubUrl": "https://github.com/VastSea0/hilal-browser/releases/tag/v0.2.0-alpha.5",
    "compareUrl": "https://github.com/VastSea0/hilal-browser/compare/v0.2.0-alpha.4...v0.2.0-alpha.5"
  },
  {
    "tag": "v0.2.0-alpha.4",
    "version": "0.2.0-alpha.4",
    "isDev": false,
    "date": "2026-05-26T01:42:11+03:00",
    "commitCount": 24,
    "commits": [
      {
        "hash": "7c45ab1738e8375f22679bfca2324a1084956317",
        "shortHash": "7c45ab1",
        "author": "VastSea0",
        "date": "2026-05-26T01:42:11+03:00",
        "subject": "release: bump version to 0.2.0-alpha.4 and update changelog",
        "body": "",
        "category": "build",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7c45ab1738e8375f22679bfca2324a1084956317"
      },
      {
        "hash": "a67cc2c9453332166eb661f486c9d3df74cfb9fc",
        "shortHash": "a67cc2c",
        "author": "VastSea0",
        "date": "2026-05-26T01:41:37+03:00",
        "subject": "chore: bump user-facing version to 0.2.0-alpha.4",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a67cc2c9453332166eb661f486c9d3df74cfb9fc"
      },
      {
        "hash": "a67d70f41b5cd9a0ba8d2c80eb14360324eae5c1",
        "shortHash": "a67d70f",
        "author": "VastSea0",
        "date": "2026-05-26T01:33:44+03:00",
        "subject": "fix(www): import React namespace in App.tsx to resolve typescript compilation errors",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a67d70f41b5cd9a0ba8d2c80eb14360324eae5c1"
      },
      {
        "hash": "cb82747ceb5f6cc393bcc86f80dbbe224b4bc621",
        "shortHash": "cb82747",
        "author": "VastSea0",
        "date": "2026-05-26T01:33:40+03:00",
        "subject": "fix: adjust patch 0016 to target the correct end of preferences.ftl",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/cb82747ceb5f6cc393bcc86f80dbbe224b4bc621"
      },
      {
        "hash": "4dda001fee2b14b66632ecb9fa2a5ec80cd1b534",
        "shortHash": "4dda001",
        "author": "VastSea0",
        "date": "2026-05-26T01:29:46+03:00",
        "subject": "docs: update audit report to version 2.0 with current release readiness assessment",
        "body": "",
        "category": "docs",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4dda001fee2b14b66632ecb9fa2a5ec80cd1b534"
      },
      {
        "hash": "465862a36a06ee9a63cbcc481904568206ba5acf",
        "shortHash": "465862a",
        "author": "VastSea0",
        "date": "2026-05-26T01:25:20+03:00",
        "subject": "docs: simplify and update audit report structure for improved clarity and release readiness assessment",
        "body": "",
        "category": "docs",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/465862a36a06ee9a63cbcc481904568206ba5acf"
      },
      {
        "hash": "2d08316bd09a726747c63e6f8cea83cc52382abf",
        "shortHash": "2d08316",
        "author": "VastSea0",
        "date": "2026-05-26T00:47:06+03:00",
        "subject": "Add smart bang fallback",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2d08316bd09a726747c63e6f8cea83cc52382abf"
      },
      {
        "hash": "4e3fcf64c4587d5dae35010e67c801775112a73d",
        "shortHash": "4e3fcf6",
        "author": "VastSea0",
        "date": "2026-05-26T00:43:22+03:00",
        "subject": "Add dynamic sidebar shortcut favicons",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4e3fcf64c4587d5dae35010e67c801775112a73d"
      },
      {
        "hash": "7c3f24616d8c0a66e4f78b42e7b0086093955dee",
        "shortHash": "7c3f246",
        "author": "VastSea0",
        "date": "2026-05-26T00:16:59+03:00",
        "subject": "feat: localize all hardcoded strings in preferences panel and welcome screen (#9)",
        "body": "- Replace all hardcoded label= attributes in hilal.inc.xhtml with data-l10n-id\n- Add data-l10n-id to privacy level cards in HilalWelcome.js\n- Add comprehensive FTL strings to preferences.ftl: workspace options,\n  sidebar settings, custom shortcuts form, privacy level radios, UI\n  enhancement checkboxes\n- Add privacy level FTL strings to browser.ftl for the welcome screen\n- Regenerate 0005-hilal-l10n.patch to capture all new Fluent definitions",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7c3f24616d8c0a66e4f78b42e7b0086093955dee"
      },
      {
        "hash": "d353ba1dc6ba90e173cc5d709cc45633569ff86d",
        "shortHash": "d353ba1",
        "author": "VastSea0",
        "date": "2026-05-25T23:53:43+03:00",
        "subject": "fix: prevent workspace tab operations while in customization mode (#14)",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d353ba1dc6ba90e173cc5d709cc45633569ff86d"
      },
      {
        "hash": "5fddd1c0d807cc05d00a668ca171c49543ccdb56",
        "shortHash": "5fddd1c",
        "author": "VastSea0",
        "date": "2026-05-25T23:47:53+03:00",
        "subject": "feat: add workspace-specific bookmark folders and context-isolated URL filtering (#8)",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5fddd1c0d807cc05d00a668ca171c49543ccdb56"
      },
      {
        "hash": "8e6226257be069a21b990a184a3d4022855a818a",
        "shortHash": "8e62262",
        "author": "VastSea0",
        "date": "2026-05-25T23:15:36+03:00",
        "subject": "fix: use standard .js extension for relative server imports in ESM",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8e6226257be069a21b990a184a3d4022855a818a"
      },
      {
        "hash": "63ad3c98edabf0d7a8b904a0974714378628d902",
        "shortHash": "63ad3c9",
        "author": "VastSea0",
        "date": "2026-05-25T23:10:43+03:00",
        "subject": "fix: resolve Vercel ERR_MODULE_NOT_FOUND error by adding .ts extensions to relative server imports",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/63ad3c98edabf0d7a8b904a0974714378628d902"
      },
      {
        "hash": "1bd151bf94de4f270c67dce3c3a83f39984f9bb9",
        "shortHash": "1bd151b",
        "author": "VastSea0",
        "date": "2026-05-25T22:52:29+03:00",
        "subject": "feat: implement patch checksum validation in build script and reorganize Hilal preferences UI modules",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/1bd151bf94de4f270c67dce3c3a83f39984f9bb9"
      },
      {
        "hash": "9848dc55cbc0a2eede8cd1e6b9015b7c5e63ad8c",
        "shortHash": "9848dc5",
        "author": "VastSea0",
        "date": "2026-05-25T20:48:29+03:00",
        "subject": "docs: add split theme preview to README.md and add interactive comparison slider to website",
        "body": "",
        "category": "docs",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9848dc55cbc0a2eede8cd1e6b9015b7c5e63ad8c"
      },
      {
        "hash": "8863ee90b599ddac7b50861532f4bbf491a438a0",
        "shortHash": "8863ee9",
        "author": "VastSea0",
        "date": "2026-05-25T20:45:55+03:00",
        "subject": "feat: add new Hilal branding assets for welcome screen preview",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8863ee90b599ddac7b50861532f4bbf491a438a0"
      },
      {
        "hash": "00e29c3edd0dc2c9cdd1833553e2ab6c950c767d",
        "shortHash": "00e29c3",
        "author": "VastSea0",
        "date": "2026-05-25T17:21:19+03:00",
        "subject": "docs: redesign README with badges, core features and centered logo",
        "body": "",
        "category": "docs",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/00e29c3edd0dc2c9cdd1833553e2ab6c950c767d"
      },
      {
        "hash": "44064b07a8a4d4fd46ebc910e8b030f223bee8b1",
        "shortHash": "44064b0",
        "author": "VastSea0",
        "date": "2026-05-25T17:03:19+03:00",
        "subject": "feat: update welcome-home-preview screenshot to reflect recent UI changes",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/44064b07a8a4d4fd46ebc910e8b030f223bee8b1"
      },
      {
        "hash": "bce11f1e4115a43a701767eda55128d4a8cc9e13",
        "shortHash": "bce11f1",
        "author": "VastSea0",
        "date": "2026-05-25T15:10:28+03:00",
        "subject": "refactor: remove legacy www-old directory and migrate backend update logic to the main www app",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bce11f1e4115a43a701767eda55128d4a8cc9e13"
      },
      {
        "hash": "1d8abc77038c13751e49c36d51bdf7b7061b81c4",
        "shortHash": "1d8abc7",
        "author": "VastSea0",
        "date": "2026-05-25T14:35:35+03:00",
        "subject": "feat: add GitHub issue templates and pull request template",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/1d8abc77038c13751e49c36d51bdf7b7061b81c4"
      },
      {
        "hash": "f0ee8a49c3a713faefb8f32deab95f6a4ed75e9c",
        "shortHash": "f0ee8a4",
        "author": "VastSea0",
        "date": "2026-05-25T14:27:03+03:00",
        "subject": "feat: use standardized SiDiscord icon from react-icons/si library",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f0ee8a49c3a713faefb8f32deab95f6a4ed75e9c"
      },
      {
        "hash": "42ea8b036767482dc189818cb3ace18069ecf112",
        "shortHash": "42ea8b0",
        "author": "VastSea0",
        "date": "2026-05-25T14:21:54+03:00",
        "subject": "feat: add Discord server link to landing page website",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/42ea8b036767482dc189818cb3ace18069ecf112"
      },
      {
        "hash": "a01b99cd6cbd3af243733e43115a91c070ff25b5",
        "shortHash": "a01b99c",
        "author": "VastSea0",
        "date": "2026-05-25T00:46:01+03:00",
        "subject": "fix: adjust macOS window margins and eliminate stacked paddings",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a01b99cd6cbd3af243733e43115a91c070ff25b5"
      },
      {
        "hash": "3749eb1badabf5526d07818d2e03cdc5afcd3dc4",
        "shortHash": "3749eb1",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-24T21:10:44Z",
        "subject": "feat: add Vercel deployment config for www landing page",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3749eb1badabf5526d07818d2e03cdc5afcd3dc4"
      }
    ],
    "highlights": {
      "added": [
        "**Workspace-Specific Bookmark Folders**: Each workspace now has a dedicated bookmark folder for context-isolated bookmarking, with URL filtering tied to the active workspace.",
        "**Bang Customization UI**: Added a Bangs settings panel in Hilal Preferences for default bangs and custom trigger, search URL, and home URL entries.",
        "**Bang Fallback**: Routed unknown bangs to DuckDuckGo's bang handler (`https://duckduckgo.com/?q=!bang+query`).",
        "**Dynamic Sidebar Shortcut Favicons**: Custom sidebar shortcuts now display favicons fetched from Firefox's `page-icon:` cache instead of performing a live web request, preserving privacy.",
        "**Full Localization of Preferences and Welcome Screen**: All hardcoded label strings in the preferences panel and welcome screen have been replaced with Fluent `data-l10n-id` bindings and new FTL definitions."
      ],
      "changed": [
        "**Firefox Upstream Sync**: Updated the Firefox base to version `153.0a1` (upstream commit `f596fa5fe90d`).",
        "**Patch Apply Checksum Validation**: `scripts/apply.sh` now computes a content hash of the entire patch series and skips re-applying patches if nothing has changed, speeding up incremental builds.",
        "**Hilal Preferences UI Reorganization**: Sidebar, workspace, privacy, and UI fix preference modules have been refactored into separate, focused blocks within `hilal.inc.xhtml`."
      ],
      "fixed": [
        "**Workspace Tab Operations in Customization Mode**: Prevented workspace tab move/retarget operations from running while the browser is in sidebar customization mode, which could corrupt tab state.",
        "**Patch Apply Conflicts**: Fixed a line-offset conflict in `0016-hilal-bang-customization.patch` caused by duplicate Fluent string definitions already introduced by `0005-hilal-l10n.patch`.",
        "**Website TypeScript Compilation**: Fixed a `Cannot find namespace 'React'` TypeScript compiler error in `www/src/App.tsx` by adding the React namespace import.",
        "**macOS Window Margins**: Adjusted macOS window margins and eliminated stacked paddings that were causing visual misalignment."
      ]
    },
    "githubUrl": "https://github.com/VastSea0/hilal-browser/releases/tag/v0.2.0-alpha.4",
    "compareUrl": "https://github.com/VastSea0/hilal-browser/compare/v0.2.0-alpha.3...v0.2.0-alpha.4"
  },
  {
    "tag": "v0.2.0-alpha.3",
    "version": "0.2.0-alpha.3",
    "isDev": false,
    "date": "2026-05-24T23:05:18+03:00",
    "commitCount": 56,
    "commits": [
      {
        "hash": "b9990e94d3d0be431497d34844db410eea166a1c",
        "shortHash": "b9990e9",
        "author": "VastSea0",
        "date": "2026-05-24T23:05:18+03:00",
        "subject": "feat: add privacy level selection to welcome flow",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b9990e94d3d0be431497d34844db410eea166a1c"
      },
      {
        "hash": "7358e4ef875e0b5390ce3738f1efcaa88916a588",
        "shortHash": "7358e4e",
        "author": "VastSea0",
        "date": "2026-05-24T20:24:38+03:00",
        "subject": "feat: implement LibreWolf-aligned privacy levels and add documentation",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7358e4ef875e0b5390ce3738f1efcaa88916a588"
      },
      {
        "hash": "33b3f0a3693b22494188b97f6b4b894df32ca759",
        "shortHash": "33b3f0a",
        "author": "VastSea0",
        "date": "2026-05-24T20:18:17+03:00",
        "subject": "refactor: integrate privacy presets and implement sidebar footer customization features",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/33b3f0a3693b22494188b97f6b4b894df32ca759"
      },
      {
        "hash": "04e7e9243324f48620e1b80acc249578ebeb3590",
        "shortHash": "04e7e92",
        "author": "VastSea0",
        "date": "2026-05-24T19:43:54+03:00",
        "subject": "fix: ensure DownloadsButton anchor exists before showing downloads panel in sidebar layout",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/04e7e9243324f48620e1b80acc249578ebeb3590"
      },
      {
        "hash": "deb3ced702a876e3b0f9afe5f02cfcdfe541e83f",
        "shortHash": "deb3ced",
        "author": "VastSea0",
        "date": "2026-05-24T19:39:21+03:00",
        "subject": "fix: set sidebar background to transparent in macOS transparent chrome patch",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/deb3ced702a876e3b0f9afe5f02cfcdfe541e83f"
      },
      {
        "hash": "5a31df3fc49faebb1c9180356cc415defe788530",
        "shortHash": "5a31df3",
        "author": "VastSea0",
        "date": "2026-05-24T19:36:15+03:00",
        "subject": "refactor: set sidebar workspace rail background to transparent in layout patch",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5a31df3fc49faebb1c9180356cc415defe788530"
      },
      {
        "hash": "6d4e89f27375547439dc879afae2a5251833f179",
        "shortHash": "6d4e89f",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-24T15:49:58Z",
        "subject": "feat: control sidebar width via JS-toggled vertical-tabs attribute, guard SidebarManager visibility in workspace mode",
        "body": "- vertical-tabs attribute set on both <sidebar-main> and #sidebar-main\n- Panel content removed from DOM via when() when vertical tabs off\n- SidebarManager skips visibility change when workspaces enabled",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6d4e89f27375547439dc879afae2a5251833f179"
      },
      {
        "hash": "0845e4fbe4747030a0fd45c9861489ad9c9c77f3",
        "shortHash": "0845e4f",
        "author": "VastSea0",
        "date": "2026-05-24T17:49:56+03:00",
        "subject": "www old",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0845e4fbe4747030a0fd45c9861489ad9c9c77f3"
      },
      {
        "hash": "9f3ba94e4fbe804edccdb4a7f5a52a6f3671f4f1",
        "shortHash": "9f3ba94",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-24T14:44:56Z",
        "subject": "fix: ensure vertical tabs context menu loads FTL and translates lazy l10n items",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9f3ba94e4fbe804edccdb4a7f5a52a6f3671f4f1"
      },
      {
        "hash": "7c8e780e302141f98153643ca76aa2409f605378",
        "shortHash": "7c8e780",
        "author": "VastSea0",
        "date": "2026-05-24T17:19:27+03:00",
        "subject": "chore: update dependencies and regenerate build artifacts in node_modules",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7c8e780e302141f98153643ca76aa2409f605378"
      },
      {
        "hash": "b666c5dcef2ec9398f18e28d139cdd1a90eb2f15",
        "shortHash": "b666c5d",
        "author": "VastSea0",
        "date": "2026-05-24T17:09:57+03:00",
        "subject": "feat: update glass UI styling for macOS and add tab context localization support",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b666c5dcef2ec9398f18e28d139cdd1a90eb2f15"
      },
      {
        "hash": "d3b884e376c28a83dea96de51effe3dd507352d3",
        "shortHash": "d3b884e",
        "author": "VastSea0",
        "date": "2026-05-24T16:52:12+03:00",
        "subject": "fix: tolerate missing update service in browser components and update icon assets to official browser styling",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d3b884e376c28a83dea96de51effe3dd507352d3"
      },
      {
        "hash": "7913095ad9601c30d365d7e23a3c51fdf0fd97ac",
        "shortHash": "7913095",
        "author": "VastSea0",
        "date": "2026-05-24T15:32:03+03:00",
        "subject": "Hilal Browser: fix regressions in redesigned sidebar layout",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7913095ad9601c30d365d7e23a3c51fdf0fd97ac"
      },
      {
        "hash": "9e7cf906e1543080eae27d3ac3b69496aff83cbc",
        "shortHash": "9e7cf90",
        "author": "VastSea0",
        "date": "2026-05-24T15:00:56+03:00",
        "subject": "Add Hilal sidebar layout redesign patch",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9e7cf906e1543080eae27d3ac3b69496aff83cbc"
      },
      {
        "hash": "c4a4be26b15783b71fbab95a091e025a1f756071",
        "shortHash": "c4a4be2",
        "author": "VastSea0",
        "date": "2026-05-24T14:38:10+03:00",
        "subject": "refactor: simplify customization attribute selectors from [customizing=\"true\"] to [customizing]",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c4a4be26b15783b71fbab95a091e025a1f756071"
      },
      {
        "hash": "6295ad9a8b672c8fcfbada18117c497b0e8089a7",
        "shortHash": "6295ad9",
        "author": "VastSea0",
        "date": "2026-05-24T14:06:57+03:00",
        "subject": "Fix JavaScript resource error by removing redundant Services imports in HilalBangs",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6295ad9a8b672c8fcfbada18117c497b0e8089a7"
      },
      {
        "hash": "cc323256c9f79dffa395410dd42d8e276362ef85",
        "shortHash": "cc32325",
        "author": "VastSea0",
        "date": "2026-05-24T14:04:41+03:00",
        "subject": "Implement missing UI and logic for Bangs customization settings page",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/cc323256c9f79dffa395410dd42d8e276362ef85"
      },
      {
        "hash": "9a7752ff30ea78cd5eda54ef1c2a10f977052810",
        "shortHash": "9a7752f",
        "author": "VastSea0",
        "date": "2026-05-24T03:39:05+03:00",
        "subject": "Fix sorting order of HilalBangs in moz.build to satisfy build system",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/9a7752ff30ea78cd5eda54ef1c2a10f977052810"
      },
      {
        "hash": "2ff1154c8fbae7600845faa0f4fbc8c6316e0cb3",
        "shortHash": "2ff1154",
        "author": "VastSea0",
        "date": "2026-05-24T03:37:14+03:00",
        "subject": "Fix patch application issues for privacy levels and bang customization",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2ff1154c8fbae7600845faa0f4fbc8c6316e0cb3"
      },
      {
        "hash": "2a59976dbe21b8ec710ad571f7eede645c57d215",
        "shortHash": "2a59976",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-24T00:14:43Z",
        "subject": "feat: add Hilal Browser settings category to preferences with workspace controls",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2a59976dbe21b8ec710ad571f7eede645c57d215"
      },
      {
        "hash": "04bac0c3c03026e23473aa1f8ae986a0e4aa6d1a",
        "shortHash": "04bac0c",
        "author": "Egehan KAHRAMAN",
        "date": "2026-05-24T00:13:14Z",
        "subject": "feat: add bang customization settings UI and shared HilalBangs module",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/04bac0c3c03026e23473aa1f8ae986a0e4aa6d1a"
      },
      {
        "hash": "0c3930e9209d4f62134046b06b153e2b6f61a58e",
        "shortHash": "0c3930e",
        "author": "VastSea0",
        "date": "2026-05-24T02:11:20+03:00",
        "subject": "fix: prevent preferences from crashing when application update services are missing",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0c3930e9209d4f62134046b06b153e2b6f61a58e"
      },
      {
        "hash": "acb50c61c8feecc291c697f0b33522636277a769",
        "shortHash": "acb50c6",
        "author": "VastSea0",
        "date": "2026-05-24T02:10:00+03:00",
        "subject": "feat: implement browser update infrastructure with XML endpoint, release UI, and platform-specific data handling",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/acb50c61c8feecc291c697f0b33522636277a769"
      },
      {
        "hash": "78b386903df6a560ed0e04c2e1e6d593a08b696d",
        "shortHash": "78b3869",
        "author": "VastSea0",
        "date": "2026-05-24T02:06:05+03:00",
        "subject": "chore: upgrade to Next.js 16 and React 19, update TypeScript configuration, and implement async params for next-intl",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/78b386903df6a560ed0e04c2e1e6d593a08b696d"
      },
      {
        "hash": "26bdd5c9168a62a01a7eed88a9f43e196984407e",
        "shortHash": "26bdd5c",
        "author": "VastSea0",
        "date": "2026-05-24T02:05:53+03:00",
        "subject": "chore: upgrade website to Next.js 16/React 19, refactor middleware, and enhance browser UI transparency patches",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/26bdd5c9168a62a01a7eed88a9f43e196984407e"
      },
      {
        "hash": "83f2f0c3f7c9ec9f1877a89b1ae6afc2dc79b343",
        "shortHash": "83f2f0c",
        "author": "VastSea0",
        "date": "2026-05-24T02:00:56+03:00",
        "subject": "update pathces",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/83f2f0c3f7c9ec9f1877a89b1ae6afc2dc79b343"
      },
      {
        "hash": "5c4a26a2c7a3cbde332cfbc643980de995995796",
        "shortHash": "5c4a26a",
        "author": "VastSea0",
        "date": "2026-05-24T01:55:59+03:00",
        "subject": "feat: enable desktop application updater with custom policy and MAR build script",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5c4a26a2c7a3cbde332cfbc643980de995995796"
      },
      {
        "hash": "4bd5d430c9274d7d6e1fe64cdcf02a28b94d8720",
        "shortHash": "4bd5d43",
        "author": "VastSea0",
        "date": "2026-05-24T01:50:52+03:00",
        "subject": "docs: update hilal browser audit report findings",
        "body": "",
        "category": "docs",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4bd5d430c9274d7d6e1fe64cdcf02a28b94d8720"
      },
      {
        "hash": "e91a73637dd999febd40c9962016041f0db2d706",
        "shortHash": "e91a736",
        "author": "VastSea0",
        "date": "2026-05-24T01:42:43+03:00",
        "subject": "feat: add configurable privacy levels to preferences with workspace-specific enforcement",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e91a73637dd999febd40c9962016041f0db2d706"
      },
      {
        "hash": "d807f2a4b4315ba20f34e723cc10622206e6eaaf",
        "shortHash": "d807f2a",
        "author": "VastSea0",
        "date": "2026-05-24T01:42:36+03:00",
        "subject": "update report",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d807f2a4b4315ba20f34e723cc10622206e6eaaf"
      },
      {
        "hash": "bbc99a93c1931e1f9afe6c6a37df9985cd6ab7e6",
        "shortHash": "bbc99a9",
        "author": "VastSea0",
        "date": "2026-05-24T01:10:27+03:00",
        "subject": "fix(patches): correct line count in 0008 uBlock patch hunk header",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bbc99a93c1931e1f9afe6c6a37df9985cd6ab7e6"
      },
      {
        "hash": "d866552661c9af6c61aac04bd0ee46dc68e1dd61",
        "shortHash": "d866552",
        "author": "VastSea0",
        "date": "2026-05-24T01:08:41+03:00",
        "subject": "feat: set version to 0.2.0-alpha.3 and update changelog",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d866552661c9af6c61aac04bd0ee46dc68e1dd61"
      },
      {
        "hash": "d143f3241b8a58ba3a52a54ffe2e2ed6efe65866",
        "shortHash": "d143f32",
        "author": "VastSea0",
        "date": "2026-05-23T23:16:21+03:00",
        "subject": "chore: initialize test profile and add preference reorganization scripts",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d143f3241b8a58ba3a52a54ffe2e2ed6efe65866"
      },
      {
        "hash": "17a4b9fc097b894b6063a5291cf3165b021e4080",
        "shortHash": "17a4b9f",
        "author": "VastSea0",
        "date": "2026-05-23T23:03:23+03:00",
        "subject": "feat: initialize browser test profile and add preferences reorganization scaffold",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/17a4b9fc097b894b6063a5291cf3165b021e4080"
      },
      {
        "hash": "8546df1fce94f6de6cdc92789e3fb38b5c19c605",
        "shortHash": "8546df1",
        "author": "VastSea0",
        "date": "2026-05-23T22:50:50+03:00",
        "subject": "refactor: update Hilal workspace preferences and UI patches with associated test profile artifacts",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8546df1fce94f6de6cdc92789e3fb38b5c19c605"
      },
      {
        "hash": "23a798adda2b180aadce5e30082fed22a231d053",
        "shortHash": "23a798a",
        "author": "VastSea0",
        "date": "2026-05-23T22:11:39+03:00",
        "subject": "feat: initialize browser test profile and add audit report with workspace patch updates",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/23a798adda2b180aadce5e30082fed22a231d053"
      },
      {
        "hash": "78b7c6e2060fd29948e59a9f8699713211e89bfa",
        "shortHash": "78b7c6e",
        "author": "VastSea0",
        "date": "2026-05-22T22:09:27+03:00",
        "subject": "fix(welcome): resolve layout rendering and branding logo in welcome screen",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/78b7c6e2060fd29948e59a9f8699713211e89bfa"
      },
      {
        "hash": "e729e652b2e35a0b58fc3f8a308feb188371714e",
        "shortHash": "e729e65",
        "author": "VastSea0",
        "date": "2026-05-22T21:53:48+03:00",
        "subject": "Revert \"ui: center Awesomebar on New Tab, add copy-url button with feedback, hide empty tab groups\"",
        "body": "This reverts commit e57d18e1a9a04afd8b2bcf3ecb24bc8cb9fb8428.",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e729e652b2e35a0b58fc3f8a308feb188371714e"
      },
      {
        "hash": "e57d18e1a9a04afd8b2bcf3ecb24bc8cb9fb8428",
        "shortHash": "e57d18e",
        "author": "VastSea0",
        "date": "2026-05-22T21:25:31+03:00",
        "subject": "ui: center Awesomebar on New Tab, add copy-url button with feedback, hide empty tab groups",
        "body": "- HilalWorkspaces.js: add initNewTabCentering() to set/remove has-newtab-open\n  on the root element on tab select and navigation events; add gHilalBrowser\n  with copyCurrentURL() that uses nsIClipboardHelper and shows ConfirmationHint\n- hilal-ui-fix.css: position #urlbar-container fixed at 35vh when has-newtab-open\n  is set; shift center right by half sidebar width when navbar.as_sidebar is on;\n  style #urlbar with rounded corners and shadow; fade non-urlbar toolbar items;\n  hide tab-group[hidden=true]; style copy-url button and its copied state\n- patches/0001: add copy-url-button-box hbox after star-button-box in XUL",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e57d18e1a9a04afd8b2bcf3ecb24bc8cb9fb8428"
      },
      {
        "hash": "afe30dc6f584640f7ba05161a4cf4948fabd8206",
        "shortHash": "afe30dc",
        "author": "VastSea0",
        "date": "2026-05-22T21:01:42+03:00",
        "subject": "welcome: rewrite overlay to cover full chrome, redesign UI",
        "body": "",
        "category": "style",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/afe30dc6f584640f7ba05161a4cf4948fabd8206"
      },
      {
        "hash": "80562ac2f39b78c3985d023c3f034c13fcf982b1",
        "shortHash": "80562ac",
        "author": "VastSea0",
        "date": "2026-05-22T20:41:58+03:00",
        "subject": "fix startup sessionstore crash and SVG icon path issues",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/80562ac2f39b78c3985d023c3f034c13fcf982b1"
      },
      {
        "hash": "965e57ce4ad0e05bf3d8d586324efaf0b542119b",
        "shortHash": "965e57c",
        "author": "VastSea0",
        "date": "2026-05-22T20:35:27+03:00",
        "subject": "modularize workspaces code and add premium onboarding welcome screen",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/965e57ce4ad0e05bf3d8d586324efaf0b542119b"
      },
      {
        "hash": "67b671f13353839f77325b50dea0b05cdb62fc79",
        "shortHash": "67b671f",
        "author": "VastSea0",
        "date": "2026-05-22T20:22:09+03:00",
        "subject": "feat: implement premium onboarding welcome screen overlay for first run",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/67b671f13353839f77325b50dea0b05cdb62fc79"
      },
      {
        "hash": "b0c8f83c470d8daed342ff10ad6921f5b142838a",
        "shortHash": "b0c8f83",
        "author": "VastSea0",
        "date": "2026-05-22T20:09:19+03:00",
        "subject": "patches: Prevent unknown bangs from redirecting to DuckDuckGo",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b0c8f83c470d8daed342ff10ad6921f5b142838a"
      },
      {
        "hash": "0e51908a372dc15fad905cd1cfbb173af5864741",
        "shortHash": "0e51908",
        "author": "VastSea0",
        "date": "2026-05-22T20:09:17+03:00",
        "subject": "workspaces: Harden deletion by explicitly purging container site data",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0e51908a372dc15fad905cd1cfbb173af5864741"
      },
      {
        "hash": "689fe898956c37c35bd46ef2b3ef9f7e0ea2b9e9",
        "shortHash": "689fe89",
        "author": "VastSea0",
        "date": "2026-05-22T20:09:16+03:00",
        "subject": "scripts: Pin uBlock Origin to 1.57.2 and add checksum verification",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/689fe898956c37c35bd46ef2b3ef9f7e0ea2b9e9"
      },
      {
        "hash": "b3536a297a2ded965f56d966500a78aeda250802",
        "shortHash": "b3536a2",
        "author": "VastSea0",
        "date": "2026-05-22T20:09:13+03:00",
        "subject": "www: Update Next.js, next-intl, and postcss to resolve security vulnerabilities",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b3536a297a2ded965f56d966500a78aeda250802"
      },
      {
        "hash": "da068a9caadfb85137109c9b502644522521b664",
        "shortHash": "da068a9",
        "author": "VastSea0",
        "date": "2026-05-22T19:42:56+03:00",
        "subject": "Revert \"feat(ui): center and auto-focus Awesomebar on New Tab page (closes #5)\"",
        "body": "This reverts commit a54903c9b34b30b832daf6b36dbf97d989991168.",
        "category": "style",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/da068a9caadfb85137109c9b502644522521b664"
      },
      {
        "hash": "96a3b57791d9bb290b8098c4bea24837ea849b5f",
        "shortHash": "96a3b57",
        "author": "VastSea0",
        "date": "2026-05-22T19:42:56+03:00",
        "subject": "Revert \"feat(ui): add dedicated Copy URL button in URL bar (closes #6)\"",
        "body": "This reverts commit a4aad20ba2fe251922e9fcbc41bd131e2d507e41.",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/96a3b57791d9bb290b8098c4bea24837ea849b5f"
      },
      {
        "hash": "a4aad20ba2fe251922e9fcbc41bd131e2d507e41",
        "shortHash": "a4aad20",
        "author": "VastSea0",
        "date": "2026-05-20T22:12:44+03:00",
        "subject": "feat(ui): add dedicated Copy URL button in URL bar (closes #6)",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a4aad20ba2fe251922e9fcbc41bd131e2d507e41"
      },
      {
        "hash": "a54903c9b34b30b832daf6b36dbf97d989991168",
        "shortHash": "a54903c",
        "author": "VastSea0",
        "date": "2026-05-20T22:09:25+03:00",
        "subject": "feat(ui): center and auto-focus Awesomebar on New Tab page (closes #5)",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/a54903c9b34b30b832daf6b36dbf97d989991168"
      },
      {
        "hash": "d18a2116f228c0297c2cba445fe9a850a9a4e96a",
        "shortHash": "d18a211",
        "author": "VastSea0",
        "date": "2026-05-20T22:06:56+03:00",
        "subject": "fix(workspaces): collapse empty tab groups in workspace view (closes #4)",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d18a2116f228c0297c2cba445fe9a850a9a4e96a"
      },
      {
        "hash": "b20703e004fcb278b2013e4ca1c741d48c8bebb9",
        "shortHash": "b20703e",
        "author": "VastSea0",
        "date": "2026-05-20T21:04:39+03:00",
        "subject": "fix(uifix): use native media query pref syntax to prevent CSS discard (closes #3)",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b20703e004fcb278b2013e4ca1c741d48c8bebb9"
      },
      {
        "hash": "354c214cc6b38e5f7e6fc669fa83907813e5ed9b",
        "shortHash": "354c214",
        "author": "VastSea0",
        "date": "2026-05-20T16:50:21+03:00",
        "subject": "fix(ublock): enable automatic startup scanning and loading for pre-installed extensions (closes #2)",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/354c214cc6b38e5f7e6fc669fa83907813e5ed9b"
      },
      {
        "hash": "b99a468a0f1762069e81bc48b43639899efb8f4e",
        "shortHash": "b99a468",
        "author": "VastSea0",
        "date": "2026-05-20T14:12:19+03:00",
        "subject": "fix(workspaces): prevent retargeting privileged browser schemes (closes #1)",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b99a468a0f1762069e81bc48b43639899efb8f4e"
      },
      {
        "hash": "8e6e2d0034bc62561f002d8cbf4a43dfea82779c",
        "shortHash": "8e6e2d0",
        "author": "VastSea0",
        "date": "2026-05-20T12:55:10+03:00",
        "subject": "feat: integrate Firefox-UI-Fix with dynamic settings UI",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8e6e2d0034bc62561f002d8cbf4a43dfea82779c"
      }
    ],
    "highlights": {
      "added": [
        "**Dynamic Firefox-UI-Fix Preferences Integration**: Integrated the Firefox-UI-Fix suite with dynamic options in the Settings UI (preferences page).",
        "**Desktop Application Update Plumbing**: Enabled Firefox's desktop updater for Hilal builds, bundled a Hilal `AppUpdateURL` policy, and added a helper for creating complete MAR updates.",
        "**Website Release Surface**: Added platform-aware latest release cards, visible changelog notes, release metadata JSON, and a Firefox updater XML route.",
        "**Onboarding Welcome Screen**: Added a first-run welcome overlay.",
        "**Bangs Search Fallback Control**: Prevented unknown bangs from redirecting to DuckDuckGo.",
        "**uBlock Origin Pinning & Verification**: Hardened uBlock Origin default installation by pinning to `1.57.2` with SHA-256 checksum verification during environment setup.",
        "**Container Site-Data Deletion**: Purged container site data when a workspace is deleted.",
        "**Browser Test Profile & Audit Report**: Added a developer test profile, preference test tooling, and a workspace audit report."
      ],
      "changed": [
        "**Website/www Security Update**: Upgraded the website to Next.js `16.2.6`, next-intl `4.12.0`, React `19.2.6`, and TypeScript `6.0.3`; migrated middleware to `proxy.ts` and fixed React hydration warnings.",
        "**Refactored Workspace Patches**: Modularized the workspaces codebase and refactored core workspace preference structures."
      ],
      "fixed": [
        "**Privileged Scheme Protection**: Fixed container retargeting issues by preventing navigation to privileged browser schemes (e.g. `about:config`, `chrome://...`).",
        "**uBlock Startup Load**: Fixed an issue where the pre-installed uBlock Origin extension would not load or scan immediately upon browser startup.",
        "**CSS Preference Discarding**: Resolved a styling discard bug in UI fixes by switching to native media query preference syntax.",
        "**Workspace Tab Group Collapsing**: Collapsed empty tab groups in workspace view.",
        "**First-run Crashes & Assets**: Fixed startup sessionstore crashes and incorrect welcome screen layout rendering, SVG icon paths, and branding logo display."
      ]
    },
    "githubUrl": "https://github.com/VastSea0/hilal-browser/releases/tag/v0.2.0-alpha.3",
    "compareUrl": "https://github.com/VastSea0/hilal-browser/compare/v0.2.0-alpha.2...v0.2.0-alpha.3"
  },
  {
    "tag": "v0.2.0-alpha.2",
    "version": "0.2.0-alpha.2",
    "isDev": false,
    "date": "2026-05-19T23:46:00+03:00",
    "commitCount": 31,
    "commits": [
      {
        "hash": "7867c7f03c85f35d2c69bee9876e24e352f59404",
        "shortHash": "7867c7f",
        "author": "VastSea0",
        "date": "2026-05-19T23:46:00+03:00",
        "subject": "Add missing dsstore to Hilal branding overlay",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7867c7f03c85f35d2c69bee9876e24e352f59404"
      },
      {
        "hash": "2e20966b2f8a88bc302afabc4a61470c40a3ae2a",
        "shortHash": "2e20966",
        "author": "VastSea0",
        "date": "2026-05-19T23:44:51+03:00",
        "subject": "Fix macOS packaging openrsync dylib copy issue",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2e20966b2f8a88bc302afabc4a61470c40a3ae2a"
      },
      {
        "hash": "4385d0b998b31f32ed1900f80655fd6a9f8b5ec6",
        "shortHash": "4385d0b",
        "author": "VastSea0",
        "date": "2026-05-19T23:01:11+03:00",
        "subject": "feat: add Android build configuration files, automation script, and documentation",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4385d0b998b31f32ed1900f80655fd6a9f8b5ec6"
      },
      {
        "hash": "55ad1ec20c040c3356905aa5bf9472c9c300822d",
        "shortHash": "55ad1ec",
        "author": "VastSea0",
        "date": "2026-05-19T22:25:14+03:00",
        "subject": "feat: move build/package workflows to local build scripts",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/55ad1ec20c040c3356905aa5bf9472c9c300822d"
      },
      {
        "hash": "c9111ebe3a60cd97d8ff0287c4b9a242ef50dd3c",
        "shortHash": "c9111eb",
        "author": "VastSea0",
        "date": "2026-05-19T22:22:28+03:00",
        "subject": "feat: set version to 0.2.0-alpha.2 and add changelog",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c9111ebe3a60cd97d8ff0287c4b9a242ef50dd3c"
      },
      {
        "hash": "89c4dc87b07a60f4b38d9684bd77abe3685ed609",
        "shortHash": "89c4dc8",
        "author": "VastSea0",
        "date": "2026-05-19T22:15:06+03:00",
        "subject": "feat: pre-install uBlock Origin by default",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/89c4dc87b07a60f4b38d9684bd77abe3685ed609"
      },
      {
        "hash": "c81914464d4b258c8594922012734b2f6895b93c",
        "shortHash": "c819144",
        "author": "VastSea0",
        "date": "2026-05-19T22:07:40+03:00",
        "subject": "feat: add browser-wide Bangs! support",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/c81914464d4b258c8594922012734b2f6895b93c"
      },
      {
        "hash": "73951333f348014a9e5d1e37066ef4f4ac31006f",
        "shortHash": "7395133",
        "author": "VastSea0",
        "date": "2026-05-19T22:03:45+03:00",
        "subject": "Hide workspace names in the sidebar under all conditions",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/73951333f348014a9e5d1e37066ef4f4ac31006f"
      },
      {
        "hash": "945a7e7c1413d4bd70e42498992afa6e7e228e70",
        "shortHash": "945a7e7",
        "author": "VastSea0",
        "date": "2026-05-19T22:01:33+03:00",
        "subject": "Add setting to toggle public tab groups visibility in workspaces",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/945a7e7c1413d4bd70e42498992afa6e7e228e70"
      },
      {
        "hash": "148e4a683b1130a081e5492e2ec5a567192a40af",
        "shortHash": "148e4a6",
        "author": "VastSea0",
        "date": "2026-05-19T21:45:50+03:00",
        "subject": "Add preference for public vs workspace-specific pinned tabs",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/148e4a683b1130a081e5492e2ec5a567192a40af"
      },
      {
        "hash": "bb9f73f5d6baf1e51fad93526af30136287627ce",
        "shortHash": "bb9f73f",
        "author": "VastSea0",
        "date": "2026-05-19T21:36:49+03:00",
        "subject": "fix(workspaces): load about:newtab directly for new empty tabs when container retargeting",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bb9f73f5d6baf1e51fad93526af30136287627ce"
      },
      {
        "hash": "7d25c067ca55af214e452b12bc7927a0022d8583",
        "shortHash": "7d25c06",
        "author": "VastSea0",
        "date": "2026-05-19T21:30:37+03:00",
        "subject": "feat(workspaces): remove tab count badge indicator from active workspace",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/7d25c067ca55af214e452b12bc7927a0022d8583"
      },
      {
        "hash": "5cc9f481ccd8f6a53bbe24f61c90b5c73c85b31e",
        "shortHash": "5cc9f48",
        "author": "VastSea0",
        "date": "2026-05-19T21:28:38+03:00",
        "subject": "feat(workspaces): restrict workspace bar to single horizontal row with fading scrollable layout",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/5cc9f481ccd8f6a53bbe24f61c90b5c73c85b31e"
      },
      {
        "hash": "df746f715d188cd326d534dd8cdd56468638f05f",
        "shortHash": "df746f7",
        "author": "VastSea0",
        "date": "2026-05-19T21:20:54+03:00",
        "subject": "feat(workspaces): switch to emoji picker and hide label for inactive workspaces",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/df746f715d188cd326d534dd8cdd56468638f05f"
      },
      {
        "hash": "72d7884b032d283e142b74c2daacffc51276a14e",
        "shortHash": "72d7884",
        "author": "VastSea0",
        "date": "2026-05-19T19:51:18+03:00",
        "subject": "feat: extract logo into component and apply new visual styling across website components",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/72d7884b032d283e142b74c2daacffc51276a14e"
      },
      {
        "hash": "ddec1246099452b227280fc59bd98fe1fd2ab103",
        "shortHash": "ddec124",
        "author": "VastSea0",
        "date": "2026-05-19T19:46:32+03:00",
        "subject": "feat: initialize project structure with Next.js, Tailwind CSS, and internationalization support",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ddec1246099452b227280fc59bd98fe1fd2ab103"
      },
      {
        "hash": "67b12ca5cef43e256fe2e6cbc47e9292f3225015",
        "shortHash": "67b12ca",
        "author": "VastSea0",
        "date": "2026-05-19T19:13:42+03:00",
        "subject": "refactor: improve Hilal workspace data management with structured validation and container integration",
        "body": "",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/67b12ca5cef43e256fe2e6cbc47e9292f3225015"
      },
      {
        "hash": "2ca927d11c3382a8ddf5391d81e5a8451bded934",
        "shortHash": "2ca927d",
        "author": "VastSea0",
        "date": "2026-05-15T19:46:53+03:00",
        "subject": "Drop BrandShortName/BrandProductName from hilal NSIS branding",
        "body": "These are defined by Mozilla's defines.nsi.in (BrandShortName from\nMOZ_APP_DISPLAYNAME, BrandProductName hardcoded). Defining them in\nbranding.nsi as well causes the Windows installer build to abort with:\n\n  !define: \"BrandProductName\" already defined!\n  !include: error in script: \"defines.nsi\" on line 26\n\nuninstaller.nsi/installer.nsi/stub.nsh include branding.nsi before\ndefines.nsi, so the redefinition is fatal. BrandShortName ends up as\n\"Hilal Browser\" via MOZ_APP_DISPLAYNAME; BrandProductName falls back\nto the upstream \"Firefox\" string in the stub installer dialog and\nwill be polished separately if needed.",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/2ca927d11c3382a8ddf5391d81e5a8451bded934"
      },
      {
        "hash": "af2994275ee2172b6427799d14459c269b40abb6",
        "shortHash": "af29942",
        "author": "VastSea0",
        "date": "2026-05-15T19:40:36+03:00",
        "subject": "Add stubinstaller assets to hilal branding overlay",
        "body": "The Windows stub installer (helper.exe) needs bgstub.jpg and the two\ninstaller-page CSS files. Mirror them from the official branding so the\nNSIS-driven installer build can complete on Windows.",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/af2994275ee2172b6427799d14459c269b40abb6"
      },
      {
        "hash": "b122b99915ae2eb49ac07deac2419b53d44b28a8",
        "shortHash": "b122b99",
        "author": "VastSea0",
        "date": "2026-05-15T19:37:22+03:00",
        "subject": "Drop hilal-workspaces.css from workspaces patch",
        "body": "The HilalWorkspaces.js component injects its own styles into a Shadow\nDOM via _getCSS(), so no separate stylesheet ever needed to be\nregistered in jar.mn. The reference to a non-existent\ncontent/hilal/hilal-workspaces.css broke the misc tier of the build\nwith:\n\n  RuntimeError: File 'content/hilal/hilal-workspaces.css' not found in\n  .../browser/base, .../obj-.../browser/base",
        "category": "style",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b122b99915ae2eb49ac07deac2419b53d44b28a8"
      },
      {
        "hash": "73353efeb6b4aa53e0180cdd8a5e8a21445d73bc",
        "shortHash": "73353ef",
        "author": "VastSea0",
        "date": "2026-05-15T19:28:25+03:00",
        "subject": "Replace libwebrtc unified-prefix patch with full goog_cc_scream removal",
        "body": "The previous FILES_PER_UNIFIED_FILE=1 workaround did not fix the\nunderlying mozmake-on-Windows issue: even with a non-unified .obj name,\nmozmake still cannot resolve the obj path during xul.dll link, despite\nthe .obj existing on disk and the path being well under MAX_PATH.\n\nDrop the gn directory from libwebrtc DIRS and stop using\nGoogCcScreamNetworkController in goog_cc_factory.cc; the default\nGoogCcNetworkController fallback handles the affected experimental\nmodes.",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/73353efeb6b4aa53e0180cdd8a5e8a21445d73bc"
      },
      {
        "hash": "4a2939ccbf7d237e7d5cd1c6ab4a63550afd616d",
        "shortHash": "4a2939c",
        "author": "VastSea0",
        "date": "2026-05-15T18:03:52+03:00",
        "subject": "Add patch to avoid libwebrtc unified-prefix collision on Windows",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/4a2939ccbf7d237e7d5cd1c6ab4a63550afd616d"
      },
      {
        "hash": "447517f681986a997e84217c4219ef11a0e7f822",
        "shortHash": "447517f",
        "author": "VastSea0",
        "date": "2026-05-14T14:57:51+03:00",
        "subject": "Add MozillaBuild and Python 3.11/3.12 detection to Windows scripts",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/447517f681986a997e84217c4219ef11a0e7f822"
      },
      {
        "hash": "f550fb47493a1ef607e4eeebe078421f39b83788",
        "shortHash": "f550fb4",
        "author": "VastSea0",
        "date": "2026-05-14T14:52:21+03:00",
        "subject": "Fix Join-Path and Resolve-Path for PowerShell 5.1 compatibility",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f550fb47493a1ef607e4eeebe078421f39b83788"
      },
      {
        "hash": "25ddfb25cf9bc6ab80a48f4e62184ab9fdbcb6aa",
        "shortHash": "25ddfb2",
        "author": "VastSea0",
        "date": "2026-05-14T14:50:54+03:00",
        "subject": "Use manual argument parsing and fix python mach invocation in build-windows.ps1",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/25ddfb25cf9bc6ab80a48f4e62184ab9fdbcb6aa"
      },
      {
        "hash": "30e7d3d22a9cb2df27626b0388a956b9cf0d7936",
        "shortHash": "30e7d3d",
        "author": "VastSea0",
        "date": "2026-05-14T14:47:41+03:00",
        "subject": "Add catch-all parameter to build-windows.ps1 for stray args from npm/cmd",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/30e7d3d22a9cb2df27626b0388a956b9cf0d7936"
      },
      {
        "hash": "172cda75b8c61d38775e17e49358e7c2c2a5cb09",
        "shortHash": "172cda7",
        "author": "VastSea0",
        "date": "2026-05-14T14:42:10+03:00",
        "subject": "Pass --no-symlinks to apply.sh on Windows to avoid python3 dependency",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/172cda75b8c61d38775e17e49358e7c2c2a5cb09"
      },
      {
        "hash": "f69efadebccabb215b911fcf615467a9a2242122",
        "shortHash": "f69efad",
        "author": "VastSea0",
        "date": "2026-05-14T14:40:06+03:00",
        "subject": "Add .gitattributes to force LF line endings on patches and shell scripts",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/f69efadebccabb215b911fcf615467a9a2242122"
      },
      {
        "hash": "08d8292b2eda2c38dbd486ef945cbc6bb7963649",
        "shortHash": "08d8292",
        "author": "VastSea0",
        "date": "2026-05-14T14:36:07+03:00",
        "subject": "Make apply.sh and refresh.sh work without rsync on Windows",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/08d8292b2eda2c38dbd486ef945cbc6bb7963649"
      },
      {
        "hash": "8517839019a5d1e6718fc6dc884f4f0e78395470",
        "shortHash": "8517839",
        "author": "VastSea0",
        "date": "2026-05-14T14:34:53+03:00",
        "subject": "Fix path handling in Windows build script for Git Bash compatibility",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8517839019a5d1e6718fc6dc884f4f0e78395470"
      },
      {
        "hash": "ce68b73eb628fa70e53f8a2e1309adbeb9d7acad",
        "shortHash": "ce68b73",
        "author": "VastSea0",
        "date": "2026-05-14T14:15:39+03:00",
        "subject": "Add Windows PowerShell build scripts and npm entry points",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/ce68b73eb628fa70e53f8a2e1309adbeb9d7acad"
      }
    ],
    "highlights": {
      "added": [
        "**Browser-wide Bangs! Support**: Direct search redirection (e.g., `!g` for Google, `!yt` for YouTube, `!w` for Wikipedia, `!gh` for GitHub) typed directly in the address bar, with automatic fallback to DuckDuckGo for any unknown bangs.",
        "**Default uBlock Origin Bundling**: Pre-installed the uBlock Origin adblocker extension by default on all profiles. The extension XPI is fetched automatically during the environment apply phase.",
        "**Preferences for Pinned Tabs & Tab Groups**: Settings in the Preferences page to configure whether pinned tabs and tab groups are visible across all workspaces (public) or specific to the active workspace."
      ],
      "changed": [
        "**Sidebar Labels**: Hid workspace names in the sidebar and kept square workspace buttons.",
        "**Display Version Update**: Set the user-facing browser version identifier to `0.2.0-alpha.2` in `version_display.txt`."
      ],
      "fixed": []
    },
    "githubUrl": "https://github.com/VastSea0/hilal-browser/releases/tag/v0.2.0-alpha.2",
    "compareUrl": "https://github.com/VastSea0/hilal-browser/compare/v0.1.0...v0.2.0-alpha.2"
  },
  {
    "tag": "v0.1.0",
    "version": "0.1.0",
    "isDev": false,
    "date": "2026-05-14T13:57:25+03:00",
    "commitCount": 19,
    "commits": [
      {
        "hash": "b4497ebd44c3006847c72a7ef71112e4c6000b01",
        "shortHash": "b4497eb",
        "author": "VastSea0",
        "date": "2026-05-14T13:57:25+03:00",
        "subject": "Add Windows build documentation",
        "body": "Adds docs/BUILD-WINDOWS.md with prerequisites, build steps, packaging,\nand common issues for building Hilal Browser on Windows. Also updates\nREADME.md to reference the new doc.",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/b4497ebd44c3006847c72a7ef71112e4c6000b01"
      },
      {
        "hash": "6518bec1ca9a45265a61c814a6b028339d805c2a",
        "shortHash": "6518bec",
        "author": "VastSea0",
        "date": "2026-05-14T13:57:15+03:00",
        "subject": "Fix corrupted 0004-hilal-preferences.patch",
        "body": "Regenerate from the actual Firefox tree to fix the malformed diff\nthat caused 'corrupt patch at line 36' during apply.",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/6518bec1ca9a45265a61c814a6b028339d805c2a"
      },
      {
        "hash": "3c8c7f0492bba294fcf9644f5275349b61f031f7",
        "shortHash": "3c8c7f0",
        "author": "VastSea0",
        "date": "2026-05-14T10:29:44+03:00",
        "subject": "Add Windows build to release CI workflow",
        "body": "Include windows-latest in the build matrix with the correct artifact\nglob for .zip packages, and add the bootstrap step.",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/3c8c7f0492bba294fcf9644f5275349b61f031f7"
      },
      {
        "hash": "bd0ca4d8560e7d30b42fae8c5fe527048a478ba9",
        "shortHash": "bd0ca4d",
        "author": "VastSea0",
        "date": "2026-05-14T00:37:18+03:00",
        "subject": "Add agent workflow documentation",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bd0ca4d8560e7d30b42fae8c5fe527048a478ba9"
      },
      {
        "hash": "dc16f888476731289ac01c3da25e7c6957003b70",
        "shortHash": "dc16f88",
        "author": "VastSea0",
        "date": "2026-05-14T00:35:49+03:00",
        "subject": "Add CI/CD build pipeline and cross-platform mozconfigs",
        "body": "- GitHub Actions workflow for Linux and macOS release builds\n- Pinned Firefox commit (FIREFOX_COMMIT) for reproducible builds\n- Base + per-platform mozconfigs with Hilal branding\n- Add --no-symlinks flag to apply.sh for Windows CI compatibility",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/dc16f888476731289ac01c3da25e7c6957003b70"
      },
      {
        "hash": "0f43be7cbba3d08c1c152ece4c3ea144bcc0c941",
        "shortHash": "0f43be7",
        "author": "VastSea0",
        "date": "2026-05-14T00:35:41+03:00",
        "subject": "Workspace fixes and cleanup",
        "body": "- Remove unused hilal-workspaces.css and its patch references\n- Localize preferences UI with Fluent strings (hilal-l10n.patch)\n- Add data-l10n-id attributes and async l10n formatting in preferences\n- Update HilalWorkspaces.js with improvements",
        "category": "refactor",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/0f43be7cbba3d08c1c152ece4c3ea144bcc0c941"
      },
      {
        "hash": "dda9dbad24b0269cf467b37a613414e30a552f5c",
        "shortHash": "dda9dba",
        "author": "VastSea0",
        "date": "2026-05-14T00:10:44+03:00",
        "subject": "Add Hilal workspace system with emoji support",
        "body": "Implements a workspace switcher injected into the sidebar-main shadow DOM,\nsitting above the tools row. Workspaces use Firefox native tab hide/show API.\n\n- Icon-only buttons matching moz-button ghost style (size, tokens, hover/active)\n- Collapsed sidebar: single column; expanded: horizontal wrapping row\n- Right-click any workspace to edit name/emoji or delete\n- + button to create new workspaces\n- Creation/edit dialog using native panel tokens and moz-button elements\n- 50-emoji picker grid with name input and keyboard shortcuts\n- Workspace data persisted via hilal.workspaces.data pref\n- Tab assignment tracked via SessionStore custom values\n- Hilal Browser section in about:preferences with enable toggle and reset\n- apply.sh now symlinks prefs/ files so edits are live without re-running it",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/dda9dbad24b0269cf467b37a613414e30a552f5c"
      },
      {
        "hash": "8b87a9f5945f189a7886f8a309bc0f189d69d912",
        "shortHash": "8b87a9f",
        "author": "VastSea0",
        "date": "2026-05-13T21:18:43+03:00",
        "subject": "Refine Hilal native macOS vibrancy implementation",
        "body": "Update patch to use proper NSVisualEffectView blur instead of CSS backdrop-filter fallbacks, improve glass opacity values, and add WebRender opaque-backdrop fallback for better rendering.",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/8b87a9f5945f189a7886f8a309bc0f189d69d912"
      },
      {
        "hash": "897016d3c9f329b9e5ae7317953db26acb2cb88e",
        "shortHash": "897016d",
        "author": "VastSea0",
        "date": "2026-05-13T18:01:28+03:00",
        "subject": "Add native blur layer for Hilal glass",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/897016d3c9f329b9e5ae7317953db26acb2cb88e"
      },
      {
        "hash": "e146874b421d6472c3f8f00748abd569387fc6cf",
        "shortHash": "e146874",
        "author": "VastSea0",
        "date": "2026-05-13T17:53:54+03:00",
        "subject": "Tune Hilal macOS glass readability",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e146874b421d6472c3f8f00748abd569387fc6cf"
      },
      {
        "hash": "70b3ae86deb3624f6e69a95ad068632f512cfd3c",
        "shortHash": "70b3ae8",
        "author": "VastSea0",
        "date": "2026-05-13T17:48:01+03:00",
        "subject": "Use native macOS vibrancy for Hilal chrome",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/70b3ae86deb3624f6e69a95ad068632f512cfd3c"
      },
      {
        "hash": "083100aceb3fc5ecae7195e0ee47a30993b22ec9",
        "shortHash": "083100a",
        "author": "VastSea0",
        "date": "2026-05-13T17:18:16+03:00",
        "subject": "Fix macOS transparent chrome surfaces",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/083100aceb3fc5ecae7195e0ee47a30993b22ec9"
      },
      {
        "hash": "49f65f67a67db3c771790b789ac4cab7bbc25998",
        "shortHash": "49f65f6",
        "author": "VastSea0",
        "date": "2026-05-13T13:59:32+03:00",
        "subject": "Add transparent macOS chrome for Hilal",
        "body": "",
        "category": "feature",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/49f65f67a67db3c771790b789ac4cab7bbc25998"
      },
      {
        "hash": "e3e73ef891a538c157c1f5281e9ce7d643c14ae7",
        "shortHash": "e3e73ef",
        "author": "VastSea0",
        "date": "2026-05-13T13:44:42+03:00",
        "subject": "Show full Hilal Browser wordmark",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/e3e73ef891a538c157c1f5281e9ce7d643c14ae7"
      },
      {
        "hash": "720f6811166733c321f5bb8346a155f5894d6767",
        "shortHash": "720f681",
        "author": "VastSea0",
        "date": "2026-05-13T13:17:00+03:00",
        "subject": "Enable sidebar and vertical tabs by default",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/720f6811166733c321f5bb8346a155f5894d6767"
      },
      {
        "hash": "bf7d9e80a714114f1b34ce6d5f2d6b59b1fdd86d",
        "shortHash": "bf7d9e8",
        "author": "VastSea0",
        "date": "2026-05-13T12:50:43+03:00",
        "subject": "Harden Hilal default privacy prefs",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/bf7d9e80a714114f1b34ce6d5f2d6b59b1fdd86d"
      },
      {
        "hash": "d6f33c88e7853e9c9c5e29d7b9cca49851b29694",
        "shortHash": "d6f33c8",
        "author": "VastSea0",
        "date": "2026-05-13T11:25:15+03:00",
        "subject": "Fix Hilal logo transparency",
        "body": "",
        "category": "fix",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d6f33c88e7853e9c9c5e29d7b9cca49851b29694"
      },
      {
        "hash": "d76e3f831da72d7fd7b61019663ff88b5b1f4b34",
        "shortHash": "d76e3f8",
        "author": "VastSea0",
        "date": "2026-05-13T11:12:19+03:00",
        "subject": "Rebrand browser as Hilal",
        "body": "",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/d76e3f831da72d7fd7b61019663ff88b5b1f4b34"
      },
      {
        "hash": "870e4ab6bfc483635b4dd1a0decf6bc13d4a780b",
        "shortHash": "870e4ab",
        "author": "VastSea0",
        "date": "2026-05-13T00:30:01+03:00",
        "subject": "Initial Hüma Browser patch-layer",
        "body": "Set up this repository as a lightweight patch and overlay layer on top\nof upstream mozilla-firefox/firefox. The Firefox source tree is never\ncommitted; it lives in a gitignored ./firefox/ subdirectory and is\nmanaged entirely by Mozilla's standard tooling (./mach).\n\nContents:\n\n* patches/series + patches/0001-huma-branding-defaults.patch\n  Repoints MOZ_BRANDING_DIRECTORY at browser/branding/huma, sets\n  MOZ_APP_VENDOR=Huma, and pins distribution-id=org.huma so macOS\n  CFBundleIdentifier and helper-process bundle ids reflect the product.\n\n* branding/huma/\n  Full Hüma branding asset directory (53 files). rsync'd into\n  firefox/browser/branding/huma/ by scripts/apply.sh on every apply,\n  so binary assets stay as files instead of base64-inflated patches.\n\n* prefs/\n  Placeholder for future preference/config overlays. Files dropped\n  here are copied to the matching path in the Firefox tree on apply.\n\n* scripts/\n  - setup-firefox.sh : clone Firefox into ./firefox (or fetch if present)\n  - apply.sh         : copy overlays + apply patches in series order\n  - refresh.sh       : regenerate patches from current Firefox tree\n  - sync-upstream.sh : fetch upstream, reset, re-apply Hüma changes\n  - build-macos.sh   : thin wrapper around ./mach build\n  - lib.sh           : shared helpers\n\n* docs/\n  - WORKFLOW.md      : day-to-day workflow + conflict resolution\n  - BUILD-MACOS.md   : macOS build notes\n  - UPSTREAM-SYNC.md : how to roll Hüma forward to a newer Firefox\n\nThe apply/refresh round-trip was verified to be byte-identical against\na clean upstream Firefox checkout.",
        "category": "chore",
        "githubUrl": "https://github.com/VastSea0/hilal-browser/commit/870e4ab6bfc483635b4dd1a0decf6bc13d4a780b"
      }
    ],
    "highlights": {
      "added": [
        "**Transparent macOS Chrome**: Implemented native macOS glass vibrancy and transparent chrome surfaces (`VibrancyManager` integration).",
        "**Hilal Workspace System**: Initial implementation of containerized workspaces with emoji representation.",
        "**Sidebar & Vertical Tabs**: Turned on vertical tabs and the compact sidebar by default.",
        "**Privacy Hardening**: Changed default privacy preferences and telemetry blocks.",
        "**Windows Build Support**: Added Windows PowerShell build scripts (`build-windows.ps1`), cross-platform CI/CD mozconfigs, and detailed Windows build documentation.",
        "**Rebranding**: Complete branding overhaul of the browser to Hilal/Hüma Browser."
      ],
      "changed": [],
      "fixed": []
    },
    "githubUrl": "https://github.com/VastSea0/hilal-browser/releases/tag/v0.1.0",
    "compareUrl": null
  }
];
