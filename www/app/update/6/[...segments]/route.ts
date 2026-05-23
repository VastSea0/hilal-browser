import { emptyUpdateXml, getConfiguredPatch, updateXmlForPatch } from '@/lib/update-xml';
import { latestRelease, platformFromBuildTarget } from '@/lib/release-data';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ segments: string[] }>;
};

function xmlResponse(body: string) {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { segments } = await context.params;
  const [
    _product,
    currentVersion,
    _buildId,
    buildTarget,
    _locale,
    channel,
    _osVersion,
    _systemCapabilities,
    distribution,
    _distributionVersion,
    fileName,
  ] = segments;

  if (fileName !== 'update.xml') {
    return new Response('Not found', { status: 404 });
  }

  if (
    channel !== latestRelease.channel ||
    distribution !== 'hilal' ||
    currentVersion === latestRelease.version
  ) {
    return xmlResponse(emptyUpdateXml());
  }

  const platform = platformFromBuildTarget(buildTarget || '');
  const patch = platform ? getConfiguredPatch(platform) : null;

  return xmlResponse(patch ? updateXmlForPatch(patch) : emptyUpdateXml());
}
