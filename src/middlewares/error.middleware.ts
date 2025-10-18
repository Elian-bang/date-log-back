import { Request, Response, NextFunction } from 'express';

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
}

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  console.error('Error:', err);

  const error: ApiError = {
    code: 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  };

  // Add error details in development mode
  if (process.env.NODE_ENV === 'development') {
    error.details = {
      stack: err.stack,
    };
  }

  return res.status(500).json({ error });
};
