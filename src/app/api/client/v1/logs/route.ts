import { NextResponse } from 'next/server';
import { getApiLogs, jsonResponse } from '@/lib/api-logger';

export async function GET() {
  try {
    const logs = getApiLogs();
    return jsonResponse({ success: true, count: logs.length, retention: '24h', logs });
  } catch (error) {
    return jsonResponse({ error: 'Failed to fetch API logs' }, { status: 500 });
  }
}
