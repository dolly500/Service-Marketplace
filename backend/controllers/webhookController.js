// controllers/webhookController.js
import stripe from '../config/stripe.js';
import bookingModel from '../models/bookingModel.js';

export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

const handlePaymentSucceeded = async (paymentIntent) => {
  const bookingId = paymentIntent.metadata.bookingId;
  
  await bookingModel.findByIdAndUpdate(bookingId, {
    paymentStatus: 'paid',
    status: 'confirmed',
    'metadata.stripePaymentId': paymentIntent.id,
    'metadata.paymentCompletedAt': new Date()
  });

  console.log(`Payment succeeded for booking: ${bookingId}`);
};

const handlePaymentFailed = async (paymentIntent) => {
  const bookingId = paymentIntent.metadata.bookingId;
  
  await bookingModel.findByIdAndUpdate(bookingId, {
    paymentStatus: 'failed',
    status: 'cancelled'
  });

  console.log(`Payment failed for booking: ${bookingId}`);
};

const handleChargeDispute = async (dispute) => {
  // Handle dispute logic here
  console.log('Charge dispute created:', dispute.id);
};
