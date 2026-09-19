import { NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';
import { jsonResponse } from '@/core/logging/api-logger';

/**
 * Native semantic version comparator helper (major.minor.patch[-prerelease]).
 * Avoids MODULE_NOT_FOUND runtime crashes by eliminating external dependencies.
 */
function compareSemver(v1: string, v2: string): number {
  const parse = (v: string) => {
    const cleaned = v.trim().replace(/^v/i, "");
    const [main, pre] = cleaned.split("-");
    const parts = main.split(".").map((num) => {
      const parsed = parseInt(num, 10);
      return isNaN(parsed) ? 0 : parsed;
    });
    while (parts.length < 3) parts.push(0);
    return { parts: parts.slice(0, 3), pre };
  };

  const p1 = parse(v1);
  const p2 = parse(v2);

  for (let i = 0; i < 3; i++) {
    if (p1.parts[i] < p2.parts[i]) return -1;
    if (p1.parts[i] > p2.parts[i]) return 1;
  }

  if (p1.pre && !p2.pre) return -1;
  if (!p1.pre && p2.pre) return 1;
  if (p1.pre && p2.pre) {
    return p1.pre.localeCompare(p2.pre);
  }

  return 0;
}

function isVersionLessThan(clientVer: string, latestVer: string): boolean {
  return compareSemver(clientVer, latestVer) < 0;
}

export async function GET(request: Request) {
  try {
    const versions = await prisma.appVersion.findMany();
    const android = versions.find(v => v.platform === 'android');
    const ios = versions.find(v => v.platform === 'ios');

    const { searchParams } = new URL(request.url);
    const clientVersion = searchParams.get('clientVersion');
    const platform = searchParams.get('platform') || 'android';

    const versionRecord = platform === 'ios' ? ios : android;
    
    let needsUpdate = false;
    let forceUpdate = false;

    if (versionRecord && clientVersion) {
      if (isVersionLessThan(clientVersion, versionRecord.version)) {
        needsUpdate = true;
        forceUpdate = versionRecord.forceUpdate;
      }
    }


    return jsonResponse({
      success: true,
      android: android ? {
        version: android.version,
        forceUpdate: android.forceUpdate,
        downloadUrl: android.downloadUrl,
        releaseNotes: android.releaseNotes
      } : null,
      ios: ios ? {
        version: ios.version,
        forceUpdate: ios.forceUpdate,
        downloadUrl: ios.downloadUrl,
        releaseNotes: ios.releaseNotes
      } : null,
      updateStatus: {
        needsUpdate,
        forceUpdate,
        latestVersion: versionRecord?.version
      }
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/version ->`, error);
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
