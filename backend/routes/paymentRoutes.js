import express from 'express';
import { createPaymentIntent, confirmPayment, processRefund } from '../controllers/paymentController.js';
import { stripeWebhook } from '../controllers/webhookController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Your auth middleware

const router = express.Router();

// Protected routes (require authentication)
router.post('/create-payment-intent', authMiddleware, createPaymentIntent);
router.post('/confirm-payment', authMiddleware, confirmPayment);
router.post('/refund', authMiddleware, processRefund); // Add admin middleware if needed

// Webhook route (no authentication needed, Stripe handles verification)
router.post('/webhook', express.raw({type: 'application/json'}), stripeWebhook);

export default router;