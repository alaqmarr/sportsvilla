import { NextResponse } from 'next/server';

export function jsonResponse(data: any, init?: ResponseInit) {
  console.log(`[API RESPONSE]`, JSON.stringify(data, null, 2));
  return NextResponse.json(data, init);
}
