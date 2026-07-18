'use server'

import fs from 'fs';
import path from 'path';

export interface AppLog {
  timestamp: string;
  level: string;
  message: string;
  meta: any;
}

export async function fetchLogs(): Promise<AppLog[]> {
  try {
    const logFilePath = path.join(process.cwd(), 'logs', 'app.log');
    if (!fs.existsSync(logFilePath)) {
      return [];
    }

    const content = fs.readFileSync(logFilePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    const logs: AppLog[] = [];
    const startIdx = Math.max(0, lines.length - 200);
    
    for (let i = lines.length - 1; i >= startIdx; i--) {
      try {
        logs.push(JSON.parse(lines[i]));
      } catch (e) {
        // Skip invalid JSON
      }
    }
    return logs;
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return [];
  }
}
