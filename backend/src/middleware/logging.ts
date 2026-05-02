import { Request, Response, NextFunction } from 'express';
import { observability } from '../services/observability.js';

export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    observability.logRequest(req.method, req.originalUrl, durationMs);
  });
  next();
}
