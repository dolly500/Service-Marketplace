import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables if not already loaded
dotenv.config();

// Validate that Stripe secret key exists
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default stripe;