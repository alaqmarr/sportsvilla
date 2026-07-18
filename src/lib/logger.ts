// Simple structured logger for the backend
import fs from 'fs';
import path from 'path';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

const logFilePath = path.join(process.cwd(), 'logs', 'app.log');

const formatLogConsole = (level: LogLevel, message: string, meta?: any) => {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
};

const writeToFile = (level: LogLevel, message: string, meta?: any) => {
  try {
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
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
};

export const logger = {
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
