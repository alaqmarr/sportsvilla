import { NextResponse } from 'next/server';
import { apiLog, jsonResponse } from '@/lib/api-logger';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(public message: string, public status: number = 400) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiHandlerContext = {
  params?: any;
};

export function withApiHandler(
  handler: (req: Request, ctx: ApiHandlerContext) => Promise<NextResponse | any>
) {
  return async (req: Request, ctx: ApiHandlerContext) => {
    try {
      const response = await handler(req, ctx);
      
      if (response instanceof NextResponse) {
        return response;
      }
      
      return jsonResponse(response);
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        apiLog(`[ZOD ERROR] ${req.method} ${req.url}`, { errors: error.errors });
        return jsonResponse(
          { success: false, error: 'Validation failed', details: error.errors },
          { status: 400 }
        );
      }
      
      if (error instanceof ApiError) {
        apiLog(`[API ERROR] ${req.method} ${req.url}`, { error: error.message });
        return jsonResponse(
          { success: false, error: error.message },
          { status: error.status }
        );
      }
      
      const isDev = process.env.NODE_ENV !== 'production';
      apiLog(`[UNHANDLED ERROR] ${req.method} ${req.url}`, { error: error.message, stack: error.stack });
      console.error(`[UNHANDLED ERROR] ${req.method} ${req.url} ->`, error);

      return jsonResponse(
        { 
          success: false, 
          error: isDev ? error.message : 'Internal server error'
        }, 
        { status: 500 }
      );
    }
  };
}
