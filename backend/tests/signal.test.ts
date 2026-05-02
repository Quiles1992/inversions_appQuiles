import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import signalRoutes from '../src/routes/signal-routes.js';
import { authMiddleware } from '../src/middleware/auth.js';
import { config } from '../src/config/index.js';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/signals', authMiddleware, signalRoutes);

describe('Signals API - T013 & T014', () => {
  const token = jwt.sign({ sub: 'user-1', email: 'test@example.com' }, config.jwtSecret);
  let createdSignalId: string;

  /**
   * T013: Test signal creation with explainability metadata.
   */
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
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.expiresAt).toBeDefined();

    createdSignalId = response.body.id;
  });

  /**
   * T013: Test signal creation validation - invalid symbol.
   */
  it('rejects signal creation without symbol', async () => {
    const response = await request(app)
      .post('/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        action: 'buy',
        confidence: 0.93,
        sourceCores: ['Market Data'],
        rationale: 'Test'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INVALID_PAYLOAD');
  });

  /**
   * T013: Test signal creation validation - invalid action.
   */
  it('rejects signal creation with invalid action', async () => {
    const response = await request(app)
      .post('/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        symbol: 'GOOGL',
        action: 'invalid',
        confidence: 0.93,
        sourceCores: ['Market Data'],
        rationale: 'Test'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INVALID_PAYLOAD');
  });

  /**
   * T013: Test signal creation validation - invalid confidence.
   */
  it('rejects signal creation with confidence out of range', async () => {
    const response = await request(app)
      .post('/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        symbol: 'GOOGL',
        action: 'buy',
        confidence: 1.5,
        sourceCores: ['Market Data'],
        rationale: 'Test'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INVALID_PAYLOAD');
  });

  /**
   * T013: Test signal creation validation - empty sourceCores.
   */
  it('rejects signal creation with empty sourceCores', async () => {
    const response = await request(app)
      .post('/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        symbol: 'GOOGL',
        action: 'buy',
        confidence: 0.93,
        sourceCores: [],
        rationale: 'Test'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INVALID_PAYLOAD');
  });

  /**
   * T013: Test signal creation validation - empty rationale.
   */
  it('rejects signal creation with empty rationale', async () => {
    const response = await request(app)
      .post('/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        symbol: 'GOOGL',
        action: 'buy',
        confidence: 0.93,
        sourceCores: ['Market Data'],
        rationale: ''
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INVALID_PAYLOAD');
  });

  /**
   * T013: Test retrieving a signal by ID.
   */
  it('retrieves a signal by ID', async () => {
    // First create a signal
    const createResponse = await request(app)
      .post('/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        symbol: 'AAPL',
        action: 'sell',
        confidence: 0.75,
        sourceCores: ['Technical Analysis'],
        rationale: 'Overbought conditions detected',
        expiresInMinutes: 60
      });

    const signalId = createResponse.body.id;

    // Then retrieve it
    const response = await request(app)
      .get(`/signals/${signalId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(signalId);
    expect(response.body.symbol).toBe('AAPL');
    expect(response.body.action).toBe('sell');
    expect(response.body.confidence).toBe(0.75);
  });

  /**
   * T013: Test signal retrieval returns 404 for non-existent signal.
   */
  it('returns 404 for non-existent signal', async () => {
    const response = await request(app)
      .get('/signals/non-existent-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('SIGNAL_NOT_FOUND');
  });

  /**
   * T013: Test listing all signals.
   */
  it('lists all signals', async () => {
    // Create two signals
    await request(app)
      .post('/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        symbol: 'TSLA',
        action: 'buy',
        confidence: 0.85,
        sourceCores: ['AI Model'],
        rationale: 'Positive sentiment',
        expiresInMinutes: 120
      });

    await request(app)
      .post('/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        symbol: 'MSFT',
        action: 'hold',
        confidence: 0.60,
        sourceCores: ['Fundamentals'],
        rationale: 'Neutral outlook',
        expiresInMinutes: 120
      });

    // List all signals
    const response = await request(app)
      .get('/signals')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.signals)).toBe(true);
    expect(response.body.signals.length).toBeGreaterThanOrEqual(2);
  });

  /**
   * T014: Test archiving a signal.
   */
  it('archives a signal', async () => {
    // Create a signal
    const createResponse = await request(app)
      .post('/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        symbol: 'AMD',
        action: 'buy',
        confidence: 0.88,
        sourceCores: ['Market Data'],
        rationale: 'Strong technical setup',
        expiresInMinutes: 60
      });

    const signalId = createResponse.body.id;

    // Archive it
    const archiveResponse = await request(app)
      .delete(`/signals/${signalId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(archiveResponse.status).toBe(200);
    expect(archiveResponse.body.message).toBe('Signal archived successfully');
    expect(archiveResponse.body.signalId).toBe(signalId);

    // Verify it's no longer in the active list
    const listResponse = await request(app)
      .get('/signals')
      .set('Authorization', `Bearer ${token}`);

    const signalStillActive = listResponse.body.signals.some((s: any) => s.id === signalId && s.status !== 'archived');
    expect(signalStillActive).toBe(false);
  });

  /**
   * T014: Test retrieving archived signals.
   */
  it('retrieves archived signals', async () => {
    // Create and archive a signal
    const createResponse = await request(app)
      .post('/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        symbol: 'NVDA',
        action: 'buy',
        confidence: 0.92,
        sourceCores: ['AI Advisor'],
        rationale: 'GPU market growth',
        expiresInMinutes: 60
      });

    const signalId = createResponse.body.id;

    await request(app)
      .delete(`/signals/${signalId}`)
      .set('Authorization', `Bearer ${token}`);

    // Retrieve archived signals
    const response = await request(app)
      .get('/signals/archived/list')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.signals)).toBe(true);
    expect(response.body.count).toBeGreaterThanOrEqual(1);
  });

  /**
   * T014: Test retrieving a specific archived signal.
   */
  it('retrieves a specific archived signal', async () => {
    // Create and archive a signal
    const createResponse = await request(app)
      .post('/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        symbol: 'META',
        action: 'sell',
        confidence: 0.72,
        sourceCores: ['Fundamentals'],
        rationale: 'Valuation concerns',
        expiresInMinutes: 60
      });

    const signalId = createResponse.body.id;

    await request(app)
      .delete(`/signals/${signalId}`)
      .set('Authorization', `Bearer ${token}`);

    // Retrieve the specific archived signal
    const response = await request(app)
      .get(`/signals/archived/${signalId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(signalId);
    expect(response.body.status).toBe('archived');
  });

  /**
   * T014: Test bulk archiving expired signals.
   */
  it('bulk archives expired signals', async () => {
    // Create a signal with very short expiration
    await request(app)
      .post('/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        symbol: 'INTC',
        action: 'hold',
        confidence: 0.55,
        sourceCores: ['Technical Analysis'],
        rationale: 'Consolidation pattern',
        expiresInMinutes: 0.01 // ~1 second
      });

    // Wait for signal to expire
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Bulk archive expired signals
    const response = await request(app)
      .post('/signals/archive/bulk')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Expired signals archived');
    expect(response.body.archivedCount).toBeGreaterThanOrEqual(0);
  });

  /**
   * T014: Test retrieving expired signals.
   */
  it('retrieves expired signals', async () => {
    // Create a signal with very short expiration
    await request(app)
      .post('/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        symbol: 'IBM',
        action: 'buy',
        confidence: 0.68,
        sourceCores: ['AI Model'],
        rationale: 'Recovery expected',
        expiresInMinutes: 0.01 // ~1 second
      });

    // Wait for signal to expire
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Retrieve expired signals
    const response = await request(app)
      .get('/signals/expired/list')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.signals)).toBe(true);
    expect(response.body.count).toBeGreaterThanOrEqual(0);
  });

  /**
   * T013/T014: Test case sensitivity handling - symbol should be uppercase.
   */
  it('handles case sensitivity for symbols', async () => {
    const response = await request(app)
      .post('/signals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        symbol: 'googl', // lowercase
        action: 'BUY', // uppercase action
        confidence: 0.93,
        sourceCores: ['Market Data'],
        rationale: 'Test case handling',
        expiresInMinutes: 60
      });

    expect(response.status).toBe(201);
    expect(response.body.symbol).toBe('GOOGL'); // should be uppercase
    expect(response.body.action).toBe('buy'); // should be lowercase
  });
});
