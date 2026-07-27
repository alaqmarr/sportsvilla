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
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      return [];
    }

    const files = fs.readdirSync(logDir)
      .filter(f => (f.startsWith('app-') && f.endsWith('.log')) || f === 'app.log')
      .sort()
      .reverse();
      
    if (files.length === 0) return [];
    
    let allLines: string[] = [];
    
    // Read from the newest file(s) until we have at least 200 lines
    for (const file of files) {
      const filePath = path.join(logDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim() !== '');
      allLines = [...lines, ...allLines]; // older files go before newer files
      if (allLines.length >= 200) break;
    }
    
    const logs: AppLog[] = [];
    const startIdx = Math.max(0, allLines.length - 200);
    
    for (let i = allLines.length - 1; i >= startIdx; i--) {
      try {
        logs.push(JSON.parse(allLines[i]));
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
