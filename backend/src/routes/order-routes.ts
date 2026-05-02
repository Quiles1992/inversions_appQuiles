import { Router } from 'express';
import { orderController } from '../controllers/order-controller.js';

const router = Router();
router.post('/', orderController.createOrder);
router.post('/:id/approve', orderController.approveOrder);
router.post('/:id/submit', orderController.submitOrder);
router.get('/:id', orderController.getOrder);

export default router;
