import { Request, Response } from 'express';
import { orderService } from '../services/order-service.js';
import { AuthRequest } from '../middleware/auth.js';

export const orderController = {
  createOrder(req: AuthRequest, res: Response) {
    const { signalId, symbol, side, quantity } = req.body;
    if (!signalId || !symbol || !side || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'INVALID_PAYLOAD' });
    }
    const order = orderService.createOrder(signalId, symbol, side, quantity);
    return res.status(201).json(order);
  },

  approveOrder(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { version } = req.body;
    if (typeof version !== 'number') {
      return res.status(400).json({ error: 'INVALID_VERSION' });
    }
    try {
      const order = orderService.approveOrder(id, version);
      return res.status(200).json(order);
    } catch (error) {
      if (error instanceof Error && error.message === 'ORDER_NOT_FOUND') {
        return res.status(404).json({ error: 'ORDER_NOT_FOUND' });
      }
      if (error instanceof Error && error.message === 'ORDER_VERSION_STALE') {
        return res.status(409).json({ error: 'ORDER_VERSION_STALE', code: 'FR-013' });
      }
      return res.status(400).json({ error: 'ORDER_APPROVAL_FAILED', reason: error instanceof Error ? error.message : 'UNKNOWN' });
    }
  },

  async submitOrder(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { version } = req.body;
    if (typeof version !== 'number') {
      return res.status(400).json({ error: 'INVALID_VERSION' });
    }
    try {
      const order = await orderService.submitOrder(id, version);
      return res.status(200).json(order);
    } catch (error) {
      if (error instanceof Error && error.message === 'ORDER_NOT_FOUND') {
        return res.status(404).json({ error: 'ORDER_NOT_FOUND' });
      }
      if (error instanceof Error && error.message === 'ORDER_VERSION_STALE') {
        return res.status(409).json({ error: 'ORDER_VERSION_STALE', code: 'FR-013' });
      }
      if (error instanceof Error && error.message === 'ORDER_NOT_APPROVABLE') {
        return res.status(400).json({ error: 'ORDER_NOT_APPROVABLE' });
      }
      return res.status(400).json({ error: 'ORDER_SUBMIT_FAILED', reason: error instanceof Error ? error.message : 'UNKNOWN' });
    }
  },

  getOrder(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const order = orderService.getOrder(id);
    if (!order) {
      return res.status(404).json({ error: 'ORDER_NOT_FOUND' });
    }
    return res.status(200).json(order);
  }
};
