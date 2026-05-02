import { Router } from 'express';
import { signalController } from '../controllers/signal-controller.js';

/**
 * T013/T014: Signal routes for creation, retrieval, expiration, and archival.
 * All routes require JWT authentication via authMiddleware.
 */
const router = Router();

// T013: Signal creation and retrieval
router.post('/', signalController.createSignal);
router.get('/', signalController.listSignals);
router.get('/:id', signalController.getSignal);

// T014: Signal expiration and archival
router.get('/expired/list', signalController.getExpiredSignals);
router.delete('/:id', signalController.archiveSignal);
router.post('/archive/bulk', signalController.archiveExpiredSignals);

// T014: Archived signals retrieval (audit trail)
router.get('/archived/list', signalController.getArchivedSignals);
router.get('/archived/:id', signalController.getArchivedSignal);

export default router;
