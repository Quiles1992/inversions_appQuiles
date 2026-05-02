import { v4 as uuid } from 'uuid';
import { Signal, SignalStatus } from '../models/signal.js';
import { observability } from './observability.js';

const signals = new Map<string, Signal>();

export class SignalService {
  createSignal(symbol: string, action: 'buy' | 'sell' | 'hold', confidence: number, sourceCores: string[], rationale: string, expiresInMinutes = 60): Signal {
    const now = new Date();
    const signal: Signal = {
      id: uuid(),
      symbol,
      action,
      confidence,
      sourceCores,
      rationale,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + expiresInMinutes * 60000).toISOString(),
      status: 'active'
    };
    signals.set(signal.id, signal);
    observability.logAudit('signal_created', { signalId: signal.id, symbol, action, confidence });
    return signal;
  }

  getSignal(signalId: string): Signal | undefined {
    const signal = signals.get(signalId);
    if (!signal) return undefined;

    if (signal.status === 'active' && new Date(signal.expiresAt) <= new Date()) {
      signal.status = 'expired';
      observability.logAudit('signal_expired', { signalId });
    }
    return signal;
  }

  listSignals(): Signal[] {
    return Array.from(signals.values()).map((signal) => {
      if (signal.status === 'active' && new Date(signal.expiresAt) <= new Date()) {
        signal.status = 'expired';
      }
      return signal;
    });
  }
}

export const signalService = new SignalService();
