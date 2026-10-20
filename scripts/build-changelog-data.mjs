#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

// 1. Get all tags
let rawTags = [];
try {
  const tagsOutput = execSync("git tag --list --sort=-creatordate", {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  rawTags = tagsOutput.split("\n").filter(Boolean);
} catch (e) {
  console.warn("Notice: Could not query git tags:", e.message);
}

// Define standard release tags list
const releaseTags = [
  "v0.3.0-alpha.6",
  "v0.3.0-alpha.5",
  "v0.3.0-alpha.4",
  "v0.3.0-alpha.3",
  "v0.3.0-alpha.2",
  "v0.3.0-alpha.1",
  "v0.2.0-alpha.5",
  "v0.2.0-alpha.4",
  "v0.2.0-alpha.3",
  "v0.2.0-alpha.2",
  "v0.1.0",
];

// Map tag dates and commit hashes
const tagInfoMap = {};
for (const tag of rawTags) {
  try {
    const commitHash = execSync(`git rev-list -n 1 ${tag}`, {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    const date = execSync(`git log -1 --format=%aI ${tag}`, {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    tagInfoMap[tag] = { tag, commitHash, date };
  } catch {}
}

// 2. Parse changelog.md sections
let changelogMd = "";
try {
  changelogMd = readFileSync(resolve(repoRoot, "changelog.md"), "utf8");
} catch {}

function parseChangelogSections(content) {
  const sections = {};
  const releaseBlocks = content.split(/^##\s+\[/m);

  for (const block of releaseBlocks) {
    if (!block.trim() || block.startsWith("# Changelog")) continue;
    const firstLineEnd = block.indexOf("\n");
    const header = block.slice(0, firstLineEnd).trim();
    const match = header.match(/^([^\]]+)\]\s*-\s*(\d{4}-\d{2}-\d{2})/);
    if (!match) continue;

    const version = match[1].trim();
    const date = match[2].trim();
    const body = block.slice(firstLineEnd).trim();

    const categories = {
      added: [],
      changed: [],
      fixed: [],
    };

    let currentCategory = null;
    const lines = body.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("### Added")) {
        currentCategory = "added";
      } else if (trimmed.startsWith("### Changed")) {
        currentCategory = "changed";
      } else if (trimmed.startsWith("### Fixed")) {
        currentCategory = "fixed";
      } else if (trimmed.startsWith("---") || trimmed.startsWith("## ")) {
        currentCategory = null;
      } else if (trimmed.startsWith("- ") && currentCategory) {
        categories[currentCategory].push(trimmed.slice(2));
      }
    }

    sections[version] = {
      version,
      date,
      highlights: categories,
    };
  }

  return sections;
}

const changelogHighlights = parseChangelogSections(changelogMd);

// 3. Get all git commits
let rawCommits = "";
try {
  rawCommits = execSync(
    "git log --date=iso-strict --pretty=format:\"%H%x09%h%x09%an%x09%ad%x09%s%x09%b%x1e\"",
    { cwd: repoRoot, encoding: "utf8" }
  );
} catch (e) {
  console.warn("Notice: Could not retrieve git log:", e.message);
}

function categorizeCommit(subject) {
  const s = subject.toLowerCase().trim();
  if (/^feat(\(.*\))?:/i.test(s)) return "feature";
  if (/^fix(\(.*\))?:/i.test(s)) return "fix";
  if (/^refactor(\(.*\))?:/i.test(s)) return "refactor";
  if (/^perf(\(.*\))?:/i.test(s)) return "perf";
  if (/^docs?(\(.*\))?:/i.test(s)) return "docs";
  if (/^style(\(.*\))?:/i.test(s)) return "style";
  if (/^(ci|build|release)(\(.*\))?:/i.test(s)) return "build";
  if (/^chore(\(.*\))?:/i.test(s)) return "chore";
  if (/^revert(\(.*\))?:/i.test(s)) return "fix";

  if (/\b(add|implement|introduce|support|feature)\b/i.test(s)) return "feature";
  if (/\b(fix|resolve|correct|prevent|handle error|crash)\b/i.test(s)) return "fix";
  if (/\b(refactor|cleanup|simplify|modularize|reorganize)\b/i.test(s)) return "refactor";
  if (/\b(perf|speed|optimize|fast)\b/i.test(s)) return "perf";
  if (/\b(doc|readme|guide|instruction)\b/i.test(s)) return "docs";
  if (/\b(build|ci|workflow|action|mozconfig|setup|script)\b/i.test(s)) return "build";
  if (/\b(style|css|ui|theme|dark mode)\b/i.test(s)) return "style";
  return "chore";
}

const allCommits = rawCommits
  .split("\x1e")
  .map(e => e.trim())
  .filter(Boolean)
  .map(e => {
    const parts = e.split("\t");
    const hash = parts[0] || "";
    const shortHash = parts[1] || hash.slice(0, 7);
    const author = parts[2] || "Egehan KAHRAMAN";
    const date = parts[3] || "";
    const subject = parts[4] || "";
    const body = (parts[5] || "").trim();

    return {
      hash,
      shortHash,
      author,
      date,
      subject,
      body,
      category: categorizeCommit(subject),
      githubUrl: `https://github.com/VastSea0/hilal-browser/commit/${hash}`,
    };
  });

// If git history is incomplete or shallow (common in Vercel/CI shallow clones)
// and changelogData.ts already exists with data, preserve it and exit cleanly!
const targetChangelogPath = resolve(repoRoot, "www/src/data/changelogData.ts");
let existingChangelogSize = 0;
try {
  if (existsSync(targetChangelogPath)) {
    existingChangelogSize = statSync(targetChangelogPath).size;
  }
} catch {}

if (allCommits.length === 0) {
  if (existingChangelogSize > 0) {
    console.log("No git commits found. Preserving existing changelogData.ts.");
    process.exit(0);
  }
} else if (allCommits.length < 50 && existingChangelogSize > 5000) {
  console.log(
    `Git history is shallow or incomplete (${allCommits.length} commits found). Preserving existing changelogData.ts (${existingChangelogSize} bytes).`
  );
  process.exit(0);
}

// 4. Map commits into Release Buckets
const releases = [];

// A. Unreleased / latest commits on main
const latestTag = releaseTags[0];
let unreleasedHashes = new Set();
try {
  const unreleasedOutput = execSync(`git rev-list ${latestTag}..HEAD`, {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  if (unreleasedOutput) {
    unreleasedHashes = new Set(unreleasedOutput.split("\n").filter(Boolean));
  }
} catch (e) {
  console.warn(`Notice: Could not resolve git rev-list for ${latestTag}..HEAD:`, e.message);
}

const unreleasedCommits = allCommits.filter(c => unreleasedHashes.has(c.hash));
if (unreleasedCommits.length > 0) {
  releases.push({
    tag: "main",
    version: "Geliştirme / Unreleased",
    isDev: true,
    date: unreleasedCommits[0]?.date || new Date().toISOString(),
    commitCount: unreleasedCommits.length,
    commits: unreleasedCommits,
    highlights: null,
    githubUrl: "https://github.com/VastSea0/hilal-browser/commits/main",
    compareUrl: `https://github.com/VastSea0/hilal-browser/compare/${latestTag}...main`,
  });
}

// B. Grouped by tags
for (let i = 0; i < releaseTags.length; i++) {
  const currentTag = releaseTags[i];
  const prevTag = releaseTags[i + 1];
  const range = prevTag ? `${prevTag}..${currentTag}` : currentTag;

  let tagHashes = [];
  try {
    tagHashes = execSync(`git rev-list ${range}`, { cwd: repoRoot, encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {}

  const tagHashSet = new Set(tagHashes);
  const commitsForTag = allCommits.filter(c => tagHashSet.has(c.hash));
  const cleanVersion = currentTag.replace(/^v/, "");
  const highlights = changelogHighlights[cleanVersion]?.highlights || null;

  releases.push({
    tag: currentTag,
    version: cleanVersion,
    isDev: false,
    date: tagInfoMap[currentTag]?.date || commitsForTag[0]?.date || "",
    commitCount: commitsForTag.length,
    commits: commitsForTag,
    highlights,
    githubUrl: `https://github.com/VastSea0/hilal-browser/releases/tag/${currentTag}`,
    compareUrl: prevTag
      ? `https://github.com/VastSea0/hilal-browser/compare/${prevTag}...${currentTag}`
      : null,
  });
}

// 5. Parse Contributors
let rawAuthors = [];
try {
  rawAuthors = execSync('git log --pretty=format:"%an%x09%ae"', {
    cwd: repoRoot,
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);
} catch (e) {
  console.warn("Notice: Could not parse git authors:", e.message);
}

const authorCounts = {};
for (const line of rawAuthors) {
  const [name, email] = line.split("\t");
  let key = name || "unknown";
  let username = name || "unknown";
  let cleanName = name || "unknown";
  let role = "Contributor";

  const lowerEmail = (email || "").toLowerCase();
  const lowerName = (name || "").toLowerCase();

  if (
    lowerEmail.includes("vastsea") ||
    lowerName.includes("vastsea") ||
    lowerName.includes("egehan")
  ) {
    key = "VastSea0";
    username = "VastSea0";
    cleanName = "Egehan KAHRAMAN";
    role = "Lead Developer";
  } else if (lowerEmail.includes("greenkod") || lowerName.includes("greenkod")) {
    key = "greenkod";
    username = "greenkod";
    cleanName = "GreenKod";
    role = "Contributor";
  } else if (lowerEmail.includes("mmapro12") || lowerName.includes("muhammed beshir")) {
    key = "mmapro12";
    username = "mmapro12";
    cleanName = "Muhammed Beshir";
    role = "Contributor";
  }

  if (!authorCounts[key]) {
    authorCounts[key] = {
      username,
      name: cleanName,
      avatarUrl: `https://github.com/${username}.png`,
      githubUrl: `https://github.com/${username}`,
      contributions: 0,
      role,
    };
  }
  authorCounts[key].contributions += 1;
}

const contributors = Object.values(authorCounts).sort(
  (a, b) => b.contributions - a.contributions
);

// 6. Output file
const outputTs = `// Generated automatically from real git repository commits and tags.
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

export interface ContributorItem {
  username: string;
  name: string;
  avatarUrl: string;
  githubUrl: string;
  contributions: number;
  role: string;
}

export const REPO_COMMITS_TOTAL = ${allCommits.length};
export const REPO_RELEASES_TOTAL = ${releaseTags.length};
export const LATEST_RELEASE_TAG = "${latestTag}";

export const ALL_COMMITS: CommitEntry[] = ${JSON.stringify(allCommits, null, 2)};

export const RELEASES_DATA: ReleaseGroup[] = ${JSON.stringify(releases, null, 2)};

export const CONTRIBUTORS_DATA: ContributorItem[] = ${JSON.stringify(contributors, null, 2)};
`;

const outputDir = resolve(repoRoot, "www/src/data");
mkdirSync(outputDir, { recursive: true });
writeFileSync(resolve(outputDir, "changelogData.ts"), outputTs, "utf8");

console.log(`Generated changelog and contributor data:`);
console.log(`- Total commits: ${allCommits.length}`);
console.log(`- Total release groups: ${releases.length}`);
console.log(`- Total contributors: ${contributors.length}`);
console.log(`- Target: www/src/data/changelogData.ts`);

