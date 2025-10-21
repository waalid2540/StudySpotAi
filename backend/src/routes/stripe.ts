import { Router } from 'express';
import stripeController from '../controllers/stripeController';
import { authenticate } from '../middleware/auth';
import express from 'express';

const router = Router();

// Public routes
router.get('/plans', stripeController.getPlans);

// Webhook endpoint (no auth, raw body needed)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeController.handleWebhook
);

// Protected routes
router.post('/checkout', authenticate, stripeController.createCheckoutSession);
router.post('/portal', authenticate, stripeController.createPortalSession);
router.get('/subscription', authenticate, stripeController.getCurrentSubscription);
router.delete('/subscription', authenticate, stripeController.cancelSubscription);

export default router;
