import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { createOrderSchema } from '../schemas/order.schema';
import * as ordersController from '../controllers/orders.controller';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrderSchema), asyncHandler(ordersController.createOrder));
router.get('/', asyncHandler(ordersController.listMyOrders));
router.get('/:id', asyncHandler(ordersController.getOrder));

export default router;
