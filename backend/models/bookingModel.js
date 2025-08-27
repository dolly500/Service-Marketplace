// models/bookingModel.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: () => 'BK' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase()
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: false
  },
  bookingDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    startTime: {
      type: String,
      required: true 
    },
    endTime: {
      type: String,
      required: true 
    }
  },
  duration: {
    type: Number,
    required: true, 
    default: 60
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'stripe', 'cash'],
    default: 'card'
  },
  customerDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  serviceLocation: {
    type: {
      type: String,
      enum: ['customer_location', 'provider_location', 'online'],
      default: 'customer_location'
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },
  specialRequests: {
    type: String,
    maxlength: 500
  },
  cancellationReason: {
    type: String,
    maxlength: 500
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: 1000
    },
    reviewDate: Date
  },
  metadata: {
    createdBy: {
      type: String,
      default: 'customer'
    },
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin'],
      default: 'web'
    },
    // Payment-related metadata
    stripePaymentIntentId: String,
    stripePaymentId: String,
    stripeRefundId: String,
    paypalOrderId: String,
    paypalPaymentId: String,
    paypalRefundId: String,
    paymentCompletedAt: Date,
    refundedAt: Date,
    // Booking management metadata
    originalBookingDate: Date,
    originalTimeSlot: {
      startTime: String,
      endTime: String
    },
    rescheduledAt: Date,
    rescheduleReason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    refundStatus: {
      type: String,
      enum: ['no_refund', 'partial_refund', 'full_refund']
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ serviceProvider: 1, createdAt: -1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ bookingDate: 1, status: 1 });
bookingSchema.index({ bookingId: 1 });

const bookingModel = mongoose.model("Booking", bookingSchema);

export default bookingModel;