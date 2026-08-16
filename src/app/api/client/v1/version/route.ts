import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonResponse } from '@/lib/api-logger';

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
      try {
        const semver = require('semver');
        if (semver.lt(clientVersion, versionRecord.version)) {
          needsUpdate = true;
          forceUpdate = versionRecord.forceUpdate;
        }
      } catch (e) {
        // semver parse error, fallback to simple string comparison
        if (clientVersion !== versionRecord.version) {
          needsUpdate = true;
          forceUpdate = versionRecord.forceUpdate;
        }
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
