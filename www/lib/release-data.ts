export type PlatformKey = 'macos' | 'windows' | 'linux' | 'android';

export type PlatformRelease = {
  key: PlatformKey;
  artifact: string;
  updateChannel?: string;
  githubUrl: string;
  published: boolean;
};

export const latestRelease = {
  version: '0.2.0-alpha.3',
  date: '2026-05-24',
  channel: 'hilal-release',
  buildId: '20260524000000',
  sourceUrl: 'https://github.com/VastSea0/hilal-browser/releases',
  tagUrl: 'https://github.com/VastSea0/hilal-browser/releases/tag/v0.2.0-alpha.3',
  firefoxCommit: '923c4d7d35ebb5693f5bda5dec9083f7c4f993b3',
  platforms: [
    {
      key: 'macos',
      artifact: 'DMG / complete MAR',
      updateChannel: 'hilal-release',
      githubUrl: 'https://github.com/VastSea0/hilal-browser/releases',
      published: false,
    },
    {
      key: 'windows',
      artifact: 'MSIX / installer',
      updateChannel: 'hilal-release',
      githubUrl: 'https://github.com/VastSea0/hilal-browser/releases',
      published: false,
    },
    {
      key: 'linux',
      artifact: 'tarball / AppImage',
      updateChannel: 'hilal-release',
      githubUrl: 'https://github.com/VastSea0/hilal-browser/releases',
      published: false,
    },
    {
      key: 'android',
      artifact: 'APK',
      githubUrl: 'https://github.com/VastSea0/hilal-browser/releases',
      published: false,
    },
  ] satisfies PlatformRelease[],
};

export function platformFromBuildTarget(buildTarget: string): PlatformKey | null {
  const value = buildTarget.toLowerCase();
  if (value.includes('darwin') || value.includes('macos')) {
    return 'macos';
  }
  if (value.includes('winnt') || value.includes('windows')) {
    return 'windows';
  }
  if (value.includes('linux')) {
    return 'linux';
  }
  if (value.includes('android')) {
    return 'android';
  }
  return null;
}

export function releaseManifest() {
  return latestRelease;
}
