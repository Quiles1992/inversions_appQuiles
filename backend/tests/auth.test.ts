import request from 'supertest';
import express from 'express';
import { describe, it, expect } from 'vitest';
import { authMiddleware } from '../src/middleware/auth.js';
import { config } from '../src/config/index.js';
import jwt from 'jsonwebtoken';

const app = express();
app.get('/secure', authMiddleware, (_req, res) => res.status(200).json({ ok: true }));

describe('Auth Middleware', () => {
  const validToken = jwt.sign({ sub: 'user-1', email: 'test@example.com' }, config.jwtSecret);

  it('rejects missing authorization header', async () => {
    const response = await request(app).get('/secure');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('AUTH_CONTEXT_MISSING');
  });

  it('rejects malformed authorization header', async () => {
    const response = await request(app).get('/secure').set('Authorization', 'Bearer');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('AUTH_CONTEXT_INVALID_TOKEN');
  });

  it('accepts valid JWT bearer token', async () => {
    const response = await request(app)
      .get('/secure')
      .set('Authorization', `Bearer ${validToken}`);
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });
});
