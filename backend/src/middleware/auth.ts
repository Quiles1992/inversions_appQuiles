import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.header('Authorization');
  if (!header) {
    return res.status(401).json({ error: 'AUTH_CONTEXT_MISSING', code: 'FR-006' });
  }

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return res.status(401).json({ error: 'AUTH_CONTEXT_INVALID_TOKEN', code: 'FR-006' });
  }

  const token = parts[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string; email?: string };
    if (!payload.sub) {
      return res.status(401).json({ error: 'AUTH_CONTEXT_INVALID_TOKEN', code: 'FR-006' });
    }
    req.user = { id: payload.sub, email: payload.email ?? 'unknown' };
    next();
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'invalid token';
    return res.status(401).json({ error: 'AUTH_CONTEXT_INVALID_TOKEN', message, code: 'FR-006' });
  }
}
