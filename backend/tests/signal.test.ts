import request from 'supertest';
import express from 'express';
import { describe, it, expect } from 'vitest';
import signalRoutes from '../src/routes/signal-routes.js';
import { authMiddleware } from '../src/middleware/auth.js';
import { config } from '../src/config/index.js';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/signals', authMiddleware, signalRoutes);

describe('Signals API', () => {
  const token = jwt.sign({ sub: 'user-1', email: 'test@example.com' }, config.jwtSecret);

  it('creates a signal with explainability metadata', async () => {
    const response = await request(app)
      .post('/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        symbol: 'GOOGL',
        action: 'buy',
        confidence: 0.93,
        sourceCores: ['Market Data', 'AI Advisor'],
        rationale: 'Strong momentum and positive news',
        expiresInMinutes: 30
      });

    expect(response.status).toBe(201);
    expect(response.body.confidence).toBe(0.93);
    expect(response.body.rationale).toBe('Strong momentum and positive news');
    expect(response.body.sourceCores).toEqual(['Market Data', 'AI Advisor']);
    expect(response.body.status).toBe('active');
  });
});
