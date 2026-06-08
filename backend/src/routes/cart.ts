import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validate';
import { optionalAuth } from '../middleware/auth';
import { addCartItemSchema, updateCartItemSchema } from '../schemas/cart.schema';
import * as cartController from '../controllers/cart.controller';

const router = Router();

// All cart routes use optionalAuth — logged-in users get DB cart, guests get Redis cart
router.use(optionalAuth);

router.get('/', asyncHandler(cartController.getCart));
router.post('/items', validate(addCartItemSchema), asyncHandler(cartController.addItem));
router.put('/items/:id', validate(updateCartItemSchema), asyncHandler(cartController.updateItem));
router.delete('/items/:id', asyncHandler(cartController.removeItem));

export default router;
