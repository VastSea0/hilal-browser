import { latestRelease, type PlatformKey } from './release-data';

type UpdatePatch = {
  url: string;
  hashFunction: 'sha512' | 'sha384' | 'sha256';
  hashValue: string;
  size: number;
};

const envPrefixByPlatform: Record<PlatformKey, string> = {
  macos: 'HILAL_UPDATE_MACOS',
  windows: 'HILAL_UPDATE_WINDOWS',
  linux: 'HILAL_UPDATE_LINUX',
  android: 'HILAL_UPDATE_ANDROID',
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function getConfiguredPatch(platform: PlatformKey): UpdatePatch | null {
  const prefix = envPrefixByPlatform[platform];
  const url = process.env[`${prefix}_MAR_URL`];
  const hashValue = process.env[`${prefix}_MAR_HASH`];
  const size = Number.parseInt(process.env[`${prefix}_MAR_SIZE`] || '', 10);
  const hashFunction =
    (process.env[`${prefix}_MAR_HASH_FUNCTION`] as UpdatePatch['hashFunction']) ||
    'sha512';

  if (!url || !hashValue || !Number.isFinite(size) || size <= 0) {
    return null;
  }

  return { url, hashFunction, hashValue, size };
}

export function emptyUpdateXml() {
  return '<?xml version="1.0"?>\n<updates>\n</updates>\n';
}

export function updateXmlForPatch(patch: UpdatePatch) {
  const buildId = process.env.HILAL_UPDATE_BUILD_ID || latestRelease.buildId;
  const detailsUrl =
    process.env.HILAL_UPDATE_DETAILS_URL || latestRelease.tagUrl;

  return `<?xml version="1.0"?>
<updates>
  <update type="minor" displayVersion="${escapeXml(latestRelease.version)}" appVersion="${escapeXml(latestRelease.version)}" platformVersion="${escapeXml(latestRelease.version)}" buildID="${escapeXml(buildId)}" detailsURL="${escapeXml(detailsUrl)}">
    <patch type="complete" URL="${escapeXml(patch.url)}" hashFunction="${escapeXml(patch.hashFunction)}" hashValue="${escapeXml(patch.hashValue)}" size="${patch.size}"/>
  </update>
</updates>
`;
}
