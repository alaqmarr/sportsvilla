// Simple structured logger for the backend
import fs from 'fs';
import path from 'path';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const getLogFilePath = () => {
  const date = new Date().toISOString().split('T')[0];
  return path.join(process.cwd(), 'logs', `app-${date}.log`);
};

const cleanupOldLogs = () => {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) return;
    
    const files = fs.readdirSync(logDir);
    const now = new Date();
    
    files.forEach(file => {
      if (file.endsWith('.log')) {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);
        const daysOld = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysOld > 3) {
          fs.unlinkSync(filePath);
        }
      }
    });
  } catch (error) {
    console.error('Failed to cleanup old logs:', error);
  }
};

let lastCleanup = 0;

const writeToFile = (level: LogLevel, message: string, meta?: any) => {
  try {
    const logFilePath = getLogFilePath();
    const logDir = path.dirname(logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      meta: meta || null
    };
    fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');

    // Run cleanup at most once per hour
    const now = Date.now();
    if (now - lastCleanup > 3600000) {
      lastCleanup = now;
      setTimeout(cleanupOldLogs, 1000);
    }
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
};

const formatLogConsole = (level: LogLevel, message: string, meta?: any) => {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
};

export const logger = {
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
      console.log(formatLogConsole('DEBUG', message, meta));
    }
  },
  info: (message: string, meta?: any) => {
    console.log(formatLogConsole('INFO', message, meta));
    writeToFile('INFO', message, meta);
  },
  warn: (message: string, meta?: any) => {
    console.warn(formatLogConsole('WARN', message, meta));
    writeToFile('WARN', message, meta);
  },
  error: (message: string, meta?: any) => {
    console.error(formatLogConsole('ERROR', message, meta));
    writeToFile('ERROR', message, meta);
  }
};
