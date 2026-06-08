import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../schemas/product.schema';
import * as productsController from '../controllers/products.controller';

const router = Router();

router.get('/', validate(productQuerySchema, 'query'), asyncHandler(productsController.listProducts));
router.get('/:slug', asyncHandler(productsController.getProduct));
router.post('/', authenticate, adminOnly, validate(createProductSchema), asyncHandler(productsController.createProduct));
router.put('/:id', authenticate, adminOnly, validate(updateProductSchema), asyncHandler(productsController.updateProduct));
router.delete('/:id', authenticate, adminOnly, asyncHandler(productsController.deleteProduct));

export default router;
