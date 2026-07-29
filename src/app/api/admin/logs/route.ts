import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getApiLogs } from '@/lib/api-logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = getApiLogs();
    return NextResponse.json({ success: true, count: logs.length, retention: '24h', logs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch API logs' }, { status: 500 });
  }
}
