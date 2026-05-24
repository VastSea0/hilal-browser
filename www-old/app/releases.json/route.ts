import { NextResponse } from 'next/server';
import { releaseManifest } from '@/lib/release-data';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(releaseManifest(), {
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
    },
  });
}
