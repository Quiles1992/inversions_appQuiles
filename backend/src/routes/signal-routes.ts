import { Router } from 'express';
import { signalController } from '../controllers/signal-controller.js';

const router = Router();
router.post('/', signalController.createSignal);
router.get('/:id', signalController.getSignal);

export default router;
