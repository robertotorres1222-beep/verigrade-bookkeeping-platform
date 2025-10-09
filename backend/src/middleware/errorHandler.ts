import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  status?: number;
  code?: string;
}

export function errorHandler(err: CustomError, req: Request, res: Response, next: NextFunction): void {
  console.error(err && err.stack ? err.stack : err);
  const status = err.statusCode || err.status || 500;
  const safeMessage = status >= 500 ? 'Internal server error' : err.message;
  
  res.status(status).json({
    success: false,
    error: {
      message: safeMessage,
      code: err.code || null,
      details: process.env.NODE_ENV === 'production' ? undefined : (err.stack || null),
    },
  });
}

export default errorHandler;