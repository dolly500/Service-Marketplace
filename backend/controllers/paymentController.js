// controllers/paymentController.js
import stripe from '../config/stripe.js';
import bookingModel from '../models/bookingModel.js';
import { createPaymentIntentService } from "../services/paymentService.js";
import serviceModel from '../models/serviceModel.js';

// Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId, currency } = req.body;
    const paymentResponse = await createPaymentIntentService(bookingId, currency);
    res.json(paymentResponse);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


// Confirm Payment
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      const bookingId = paymentIntent.metadata.bookingId;
      
      // Update booking status
      const updatedBooking = await bookingModel.findByIdAndUpdate(
        bookingId,
        {
          paymentStatus: 'paid',
          status: 'confirmed',
          'metadata.stripePaymentId': paymentIntent.id,
          'metadata.paymentCompletedAt': new Date()
        },
        { new: true }
      ).populate('service', 'name description price category')
       .populate('user', 'name email phone');

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        booking: updatedBooking
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not successful',
        status: paymentIntent.status
      });
    }

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Process Refund
export const processRefund = async (req, res) => {
  try {
    const { bookingId, amount, reason } = req.body;

    const booking = await bookingModel.findById(bookingId);
    if (!booking || !booking.metadata.stripePaymentIntentId) {
      return res.status(404).json({
        success: false,
        message: 'Booking or payment not found'
      });
    }

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: booking.metadata.stripePaymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
      reason: reason || 'requested_by_customer',
      metadata: {
        bookingId: booking._id.toString()
      }
    });

    // Update booking
    const refundAmount = refund.amount / 100;
    const refundStatus = refundAmount >= booking.totalPrice ? 'full_refund' : 'partial_refund';

    await bookingModel.findByIdAndUpdate(bookingId, {
      paymentStatus: 'refunded',
      status: 'cancelled',
      'metadata.stripeRefundId': refund.id,
      'metadata.refundedAt': new Date(),
      'metadata.refundStatus': refundStatus
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refundId: refund.id,
      refundAmount: refundAmount
    });

  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};