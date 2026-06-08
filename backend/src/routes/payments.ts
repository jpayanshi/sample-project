import { Router } from 'express';
import express from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import * as paymentsController from '../controllers/payments.controller';

const router = Router();

router.post('/create-intent', authenticate, asyncHandler(paymentsController.createIntent));

// Stripe requires the raw request body to verify the signature
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(paymentsController.handleWebhook)
);

export default router;
