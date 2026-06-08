import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import * as addressController from '../controllers/address.controller';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(addressController.listAddresses));
router.post('/', asyncHandler(addressController.createAddress));
router.delete('/:id', asyncHandler(addressController.deleteAddress));

export default router;
