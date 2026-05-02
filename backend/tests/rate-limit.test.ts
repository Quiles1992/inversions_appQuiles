import request from 'supertest';
import express from 'express';
import { describe, it, expect } from 'vitest';
import { rateLimitMiddleware } from '../src/middleware/rate-limit.js';

const app = express();
app.use(rateLimitMiddleware);
app.get('/', (_req, res) => res.status(200).json({ ok: true }));

describe('Rate Limit Middleware', () => {
  it('allows requests below the threshold', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  it('returns 429 after the limit is exceeded', async () => {
    for (let i = 0; i < 61; i += 1) {
      await request(app).get('/');
    }
    const response = await request(app).get('/');
    expect(response.status).toBe(429);
    expect(response.body.error).toBe('TOO_MANY_REQUESTS');
  });
});
