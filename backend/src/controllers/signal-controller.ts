import { Request, Response } from 'express';
import { signalService } from '../services/signal-service.js';
import { AuthRequest } from '../middleware/auth.js';
import { observability } from '../services/observability.js';

/**
 * T013: Signal controller for creating, retrieving, and managing signals.
 * Handles explainability metadata and lifecycle state persistence.
 */
export const signalController = {
  /**
   * T013: Create a new signal with explainability metadata.
   * Expected payload:
   * {
   *   symbol: string (required)
   *   action: 'buy' | 'sell' | 'hold' (required)
   *   confidence: number 0.0-1.0 (required)
   *   sourceCores: string[] (required)
   *   rationale: string (required)
   *   expiresInMinutes: number (optional, default 60)
   * }
   */
  createSignal(req: AuthRequest, res: Response) {
    const { symbol, action, confidence, sourceCores, rationale, expiresInMinutes } = req.body;

    // Validation: all required fields must be present
    if (!symbol || typeof symbol !== 'string') {
      observability.logAudit('signal_creation_failed', { reason: 'missing_symbol' });
      return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'symbol is required and must be a string' });
    }

    if (!action || !['buy', 'sell', 'hold'].includes(action.toLowerCase())) {
      observability.logAudit('signal_creation_failed', { reason: 'invalid_action' });
      return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'action must be one of: buy, sell, hold' });
    }

    if (typeof confidence !== 'number' || confidence < 0.0 || confidence > 1.0) {
      observability.logAudit('signal_creation_failed', { reason: 'invalid_confidence' });
      return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'confidence must be a number between 0.0 and 1.0' });
    }

    if (!Array.isArray(sourceCores) || sourceCores.length === 0 || !sourceCores.every((s) => typeof s === 'string')) {
      observability.logAudit('signal_creation_failed', { reason: 'invalid_sourcecores' });
      return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'sourceCores must be a non-empty array of strings' });
    }

    if (typeof rationale !== 'string' || rationale.trim() === '') {
      observability.logAudit('signal_creation_failed', { reason: 'invalid_rationale' });
      return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'rationale is required and must be a non-empty string' });
    }

    if (expiresInMinutes !== undefined && (typeof expiresInMinutes !== 'number' || expiresInMinutes <= 0)) {
      observability.logAudit('signal_creation_failed', { reason: 'invalid_expiresInMinutes' });
      return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'expiresInMinutes must be a positive number' });
    }

    try {
      const signal = signalService.createSignal(
        symbol.toUpperCase(),
        action.toLowerCase() as 'buy' | 'sell' | 'hold',
        confidence,
        sourceCores,
        rationale,
        expiresInMinutes || 60
      );

      observability.logAudit('signal_created_successfully', { signalId: signal.id, symbol, action });
      return res.status(201).json(signal);
    } catch (error) {
      observability.logAudit('signal_creation_error', { error: String(error) });
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to create signal' });
    }
  },

  /**
   * T013: Retrieve a single signal by ID.
   * Returns 404 if not found, automatically detects expiration.
   */
  getSignal(req: AuthRequest, res: Response) {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'id parameter is required' });
    }

    try {
      const signal = signalService.getSignal(id);
      if (!signal) {
        observability.logAudit('signal_not_found', { signalId: id });
        return res.status(404).json({ error: 'SIGNAL_NOT_FOUND', message: `Signal ${id} not found` });
      }

      observability.logAudit('signal_retrieved', { signalId: id, status: signal.status });
      return res.status(200).json(signal);
    } catch (error) {
      observability.logAudit('signal_retrieval_error', { signalId: id, error: String(error) });
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to retrieve signal' });
    }
  },

  /**
   * T013: List all signals.
   * Automatically detects and marks expired signals.
   */
  listSignals(req: AuthRequest, res: Response) {
    try {
      const signals = signalService.listSignals();
      observability.logAudit('signals_listed', { count: signals.length });
      return res.status(200).json({ signals });
    } catch (error) {
      observability.logAudit('signals_list_error', { error: String(error) });
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to list signals' });
    }
  },

  /**
   * T014: Get signals that have expired.
   * Used for monitoring and archival workflows.
   */
  getExpiredSignals(req: AuthRequest, res: Response) {
    try {
      const expiredSignals = signalService.getExpiredSignals();
      observability.logAudit('expired_signals_retrieved', { count: expiredSignals.length });
      return res.status(200).json({ signals: expiredSignals, count: expiredSignals.length });
    } catch (error) {
      observability.logAudit('expired_signals_retrieval_error', { error: String(error) });
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to retrieve expired signals' });
    }
  },

  /**
   * T014: Archive a signal for audit trail preservation.
   * Returns 404 if signal not found.
   */
  archiveSignal(req: AuthRequest, res: Response) {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'id parameter is required' });
    }

    try {
      const success = signalService.archiveSignal(id);
      if (!success) {
        observability.logAudit('signal_archive_failed', { signalId: id, reason: 'not_found' });
        return res.status(404).json({ error: 'SIGNAL_NOT_FOUND', message: `Signal ${id} not found` });
      }

      observability.logAudit('signal_archived_successfully', { signalId: id });
      return res.status(200).json({ message: 'Signal archived successfully', signalId: id });
    } catch (error) {
      observability.logAudit('signal_archive_error', { signalId: id, error: String(error) });
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to archive signal' });
    }
  },

  /**
   * T014: Bulk archive all expired signals.
   * Used for batch cleanup workflows.
   */
  archiveExpiredSignals(req: AuthRequest, res: Response) {
    try {
      const count = signalService.archiveExpiredSignals();
      observability.logAudit('bulk_archive_completed', { archivedCount: count });
      return res.status(200).json({ message: 'Expired signals archived', archivedCount: count });
    } catch (error) {
      observability.logAudit('bulk_archive_error', { error: String(error) });
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to archive expired signals' });
    }
  },

  /**
   * T014: Retrieve archived signals for audit purposes.
   */
  getArchivedSignals(req: AuthRequest, res: Response) {
    try {
      const archivedSignals = signalService.getArchivedSignals();
      observability.logAudit('archived_signals_retrieved', { count: archivedSignals.length });
      return res.status(200).json({ signals: archivedSignals, count: archivedSignals.length });
    } catch (error) {
      observability.logAudit('archived_signals_retrieval_error', { error: String(error) });
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to retrieve archived signals' });
    }
  },

  /**
   * T014: Get a single archived signal for audit trail verification.
   */
  getArchivedSignal(req: AuthRequest, res: Response) {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'INVALID_PAYLOAD', message: 'id parameter is required' });
    }

    try {
      const signal = signalService.getArchivedSignal(id);
      if (!signal) {
        observability.logAudit('archived_signal_not_found', { signalId: id });
        return res.status(404).json({ error: 'ARCHIVED_SIGNAL_NOT_FOUND', message: `Archived signal ${id} not found` });
      }

      observability.logAudit('archived_signal_retrieved', { signalId: id });
      return res.status(200).json(signal);
    } catch (error) {
      observability.logAudit('archived_signal_retrieval_error', { signalId: id, error: String(error) });
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to retrieve archived signal' });
    }
  }
};
