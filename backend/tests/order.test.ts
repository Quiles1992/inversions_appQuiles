import request from 'supertest';
import express from 'express';
import { describe, it, expect } from 'vitest';
import orderRoutes from '../src/routes/order-routes.js';
import { authMiddleware } from '../src/middleware/auth.js';
import { config } from '../src/config/index.js';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/orders', authMiddleware, orderRoutes);

describe('Orders API', () => {
  const token = jwt.sign({ sub: 'user-1', email: 'test@example.com' }, config.jwtSecret);

  it('creates an order as pending_approval', async () => {
    const response = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ signalId: 'sig-1', symbol: 'AAPL', side: 'buy', quantity: 10 });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('pending_approval');
    expect(response.body.version).toBe(1);
  });

  it('approves and submits an order successfully', async () => {
    const create = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ signalId: 'sig-2', symbol: 'MSFT', side: 'buy', quantity: 5 });
    expect(create.status).toBe(201);

    const approve = await request(app)
      .post(`/orders/${create.body.id}/approve`)
      .set('Authorization', `Bearer ${token}`)
      .send({ version: create.body.version });
    expect(approve.status).toBe(200);
    expect(approve.body.status).toBe('approved');

    const submit = await request(app)
      .post(`/orders/${create.body.id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ version: approve.body.version });
    expect(submit.status).toBe(200);
    expect(['submitted', 'failed']).toContain(submit.body.status);
  });

  it('returns 409 for stale order version on approval', async () => {
    const create = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ signalId: 'sig-3', symbol: 'TSLA', side: 'sell', quantity: 2 });
    expect(create.status).toBe(201);

    const stale = await request(app)
      .post(`/orders/${create.body.id}/approve`)
      .set('Authorization', `Bearer ${token}`)
      .send({ version: create.body.version + 1 });
    expect(stale.status).toBe(409);
    expect(stale.body.error).toBe('ORDER_VERSION_STALE');
  });
});
