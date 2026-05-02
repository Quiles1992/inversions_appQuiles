import { v4 as uuid } from 'uuid';
import { Signal, SignalStatus } from '../models/signal.js';
import { observability } from './observability.js';

const signals = new Map<string, Signal>();
const archivedSignals = new Map<string, Signal>(); // Audit trail for archived signals

export class SignalService {
  /**
   * T013: Create a signal with explainability metadata and lifecycle state.
   * Stores symbol, action, confidence, source cores, and rationale.
   * Automatically sets expiration time based on expiresInMinutes.
   */
  createSignal(
    symbol: string,
    action: 'buy' | 'sell' | 'hold',
    confidence: number,
    sourceCores: string[],
    rationale: string,
    expiresInMinutes = 60
  ): Signal {
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
    observability.logAudit('signal_created', {
      signalId: signal.id,
      symbol,
      action,
      confidence,
      sourceCores,
      expiresAt: signal.expiresAt
    });
    return signal;
  }

  /**
   * T013: Retrieve a signal by ID with automatic expiration detection.
   * Marks signals as expired if their expiresAt timestamp has passed.
   */
  getSignal(signalId: string): Signal | undefined {
    const signal = signals.get(signalId);
    if (!signal) return undefined;

    // Automatic expiration detection
    if (signal.status === 'active' && new Date(signal.expiresAt) <= new Date()) {
      signal.status = 'expired';
      observability.logAudit('signal_auto_expired', { signalId });
    }
    return signal;
  }

  /**
   * T013: List all signals with automatic expiration detection.
   * Marks signals as expired if their expiresAt timestamp has passed.
   */
  listSignals(): Signal[] {
    return Array.from(signals.values()).map((signal) => {
      if (signal.status === 'active' && new Date(signal.expiresAt) <= new Date()) {
        signal.status = 'expired';
        observability.logAudit('signal_auto_expired', { signalId: signal.id });
      }
      return signal;
    });
  }

  /**
   * T014: Archive a signal by moving it to archived storage.
   * Preserves the signal in audit trail and logs the archival.
   * Returns true if successful, false if signal not found or already archived.
   */
  archiveSignal(signalId: string): boolean {
    const signal = signals.get(signalId);
    if (!signal) return false;

    // Move to archived storage
    archivedSignals.set(signalId, signal);
    signal.status = 'archived';
    signals.delete(signalId);

    observability.logAudit('signal_archived', {
      signalId,
      symbol: signal.symbol,
      originalStatus: signal.status
    });
    return true;
  }

  /**
   * T014: Get archived signals for audit trail retrieval.
   * Returns all signals that have been archived.
   */
  getArchivedSignals(): Signal[] {
    return Array.from(archivedSignals.values());
  }

  /**
   * T014: Get signals that have expired based on their expiresAt timestamp.
   * Automatically transitions them to expired state if active.
   * This supports the expiration and archival behavior requirement.
   */
  getExpiredSignals(): Signal[] {
    const expiredSignals: Signal[] = [];
    const now = new Date();

    signals.forEach((signal) => {
      if (signal.status === 'active' && new Date(signal.expiresAt) <= now) {
        signal.status = 'expired';
        expiredSignals.push(signal);
        observability.logAudit('signal_expiration_detected', {
          signalId: signal.id,
          expiresAt: signal.expiresAt
        });
      }
    });

    return expiredSignals;
  }

  /**
   * T014: Bulk archive expired signals for automatic cleanup.
   * This ensures signals can expire by expiresAt and remain audit-traceable.
   * Returns the count of signals archived.
   */
  archiveExpiredSignals(): number {
    const expiredSignals = this.getExpiredSignals();
    let archivedCount = 0;

    expiredSignals.forEach((signal) => {
      if (this.archiveSignal(signal.id)) {
        archivedCount++;
      }
    });

    if (archivedCount > 0) {
      observability.logAudit('bulk_archive_completed', {
        archivedCount,
        timestamp: new Date().toISOString()
      });
    }

    return archivedCount;
  }

  /**
   * T014: Retrieve a signal from archived storage for audit purposes.
   */
  getArchivedSignal(signalId: string): Signal | undefined {
    return archivedSignals.get(signalId);
  }

  /**
   * T014: Get the total count of archived signals.
   */
  getArchivedSignalCount(): number {
    return archivedSignals.size;
  }
}

export const signalService = new SignalService();
