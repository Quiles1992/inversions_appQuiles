import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { observability } from '../services/observability.js';

const stores = new Map<string, { count: number; firstRequest: number }>();

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const entry = stores.get(key);

  if (!entry || now - entry.firstRequest > config.rateLimitWindowMs) {
    stores.set(key, { count: 1, firstRequest: now });
    return next();
  }

  entry.count += 1;
  if (entry.count > config.rateLimitMaxRequests) {
    observability.logRateLimit(key);
    return res.status(429).json({ error: 'TOO_MANY_REQUESTS', code: 'SC-006_RATE_LIMIT' });
  }

  next();
}
