import { NextResponse } from 'next/server';
import { logger } from './logger';

export function jsonResponse(data: any, init?: ResponseInit) {
  logger.info(`[API RESPONSE]`, data);
  return NextResponse.json(data, init);
}
