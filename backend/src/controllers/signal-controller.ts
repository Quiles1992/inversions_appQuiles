import { Request, Response } from 'express';
import { signalService } from '../services/signal-service.js';
import { AuthRequest } from '../middleware/auth.js';

export const signalController = {
  createSignal(req: AuthRequest, res: Response) {
    const { symbol, action, confidence, sourceCores, rationale, expiresInMinutes } = req.body;
    if (!symbol || !action || typeof confidence !== 'number' || !Array.isArray(sourceCores) || typeof rationale !== 'string') {
      return res.status(400).json({ error: 'INVALID_PAYLOAD' });
    }
    const signal = signalService.createSignal(symbol, action, confidence, sourceCores, rationale, typeof expiresInMinutes === 'number' ? expiresInMinutes : 60);
    return res.status(201).json(signal);
  },

  getSignal(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const signal = signalService.getSignal(id);
    if (!signal) {
      return res.status(404).json({ error: 'SIGNAL_NOT_FOUND' });
    }
    return res.status(200).json(signal);
  }
};
