import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/core/auth/auth";
import { getApiLogs, jsonResponse } from '@/core/logging/api-logger';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return jsonResponse({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const logs = getApiLogs();
    return jsonResponse({ success: true, count: logs.length, retention: '24h', logs });
  } catch (error) {
    return jsonResponse({ error: 'Failed to fetch API logs' }, { status: 500 });
  }
}
