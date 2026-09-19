import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const API_LOG_FILE = path.join(process.cwd(), 'logs', 'api-24h.log');
const RETENTION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface ApiLogEntry {
  timestamp: string;
  message: string;
  meta?: any;
}

/**
 * Appends a log entry to the 24-hour API log file.
 * Automatically checks file age and overwrites if older than 24 hours.
 */
export function apiLog(message: string, meta?: any) {
  try {
    const logDir = path.dirname(API_LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const now = Date.now();
    let overwrite = false;

    if (fs.existsSync(API_LOG_FILE)) {
      const stats = fs.statSync(API_LOG_FILE);
      if (now - stats.mtimeMs > RETENTION_MS) {
        overwrite = true;
      }
    }

    const entry: ApiLogEntry = {
      timestamp: new Date(now).toISOString(),
      message,
      meta: meta || undefined
    };

    const line = JSON.stringify(entry) + '\n';

    if (overwrite) {
      fs.writeFileSync(API_LOG_FILE, line, 'utf-8');
    } else {
      fs.appendFileSync(API_LOG_FILE, line, 'utf-8');
    }
  } catch (err) {
    // Fail silently so logging never breaks API requests
  }
}

/**
 * Retrieves API logs retained within the last 24 hours.
 */
export function getApiLogs(): ApiLogEntry[] {
  try {
    if (!fs.existsSync(API_LOG_FILE)) {
      return [];
    }
    const content = fs.readFileSync(API_LOG_FILE, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    const now = Date.now();
    const validLogs: ApiLogEntry[] = [];
    const retainedLines: string[] = [];

    for (const line of lines) {
      try {
        const parsed: ApiLogEntry = JSON.parse(line);
        const entryTime = new Date(parsed.timestamp).getTime();
        if (now - entryTime <= RETENTION_MS) {
          validLogs.push(parsed);
          retainedLines.push(line);
        }
      } catch {
        // Skip malformed lines
      }
    }

    // If some entries expired, overwrite the file with only retained entries
    if (retainedLines.length < lines.length) {
      try {
        fs.writeFileSync(API_LOG_FILE, retainedLines.join('\n') + (retainedLines.length ? '\n' : ''), 'utf-8');
      } catch {
        // Ignore write err
      }
    }

    return validLogs;
  } catch (err) {
    return [];
  }
}

export function jsonResponse(data: any, init?: ResponseInit) {
  return NextResponse.json(data, init);
}
