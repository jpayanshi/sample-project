import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import { updateOrderStatusSchema } from '../schemas/order.schema';
import * as adminController from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/orders', asyncHandler(adminController.listAllOrders));
router.put('/orders/:id', validate(updateOrderStatusSchema), asyncHandler(adminController.updateOrderStatus));

export default router;
