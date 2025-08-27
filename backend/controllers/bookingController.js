// controllers/bookingController.js
import bookingModel from "../models/bookingModel.js";
import serviceModel from "../models/serviceModel.js";
// import { createPaymentIntent } from "../controllers/paymentController.js"
import { createPaymentIntentService } from "../services/paymentService.js";


const createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      bookingDate,
      timeSlot,
      customerDetails,
      serviceLocation,
      specialRequests,
      paymentMethod = 'stripe'
    } = req.body;

    // Validate service exists
    const service = await serviceModel.findById(serviceId);
    if (!service || !service.isActive) {
      return res.json({
        success: false,
        message: "Service not found or inactive"
      });
    }

    const bookingDateTime = new Date(bookingDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0); 
    bookingDateTime.setHours(0, 0, 0, 0);
    
    if (bookingDateTime < now) {
      return res.json({
        success: false,
        message: "Booking date cannot be in the past"
      });
    }

    // Calculate duration and total price
    const startTime = timeSlot.startTime.split(':');
    const endTime = timeSlot.endTime.split(':');
    const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
    const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
    const duration = endMinutes - startMinutes;

    if (duration <= 0) {
      return res.json({
        success: false,
        message: "Invalid time slot duration"
      });
    }

    const totalPrice = service.price * (duration / 60);

    // Create booking
    const booking = new bookingModel({
      user: req.user._id,
      service: serviceId,
      serviceProvider: service.serviceProvider,
      bookingDate: new Date(bookingDate),
      timeSlot,
      duration,
      totalPrice,
      customerDetails,
      serviceLocation,
      specialRequests,
      paymentMethod,
      status: paymentMethod === 'cash' ? 'confirmed' : 'pending',
      paymentStatus: paymentMethod === 'cash' ? 'paid' : 'pending',
      metadata: {
        createdBy: 'customer',
        source: req.body.source || 'web'
      }
    });

    await booking.save();

    // Populate the booking
    const populatedBooking = await bookingModel.findById(booking._id)
      .populate('service', 'name description price category image')
      .populate('user', 'name email phone')
      .populate('serviceProvider', 'businessName email phone');

    let paymentIntent = null;
    
    // Create Stripe Payment Intent if payment method is Stripe
      if (paymentMethod === 'stripe') {
        try {
          const paymentResponse = await createPaymentIntentService(booking._id, 'usd');
          paymentIntent = {
            clientSecret: paymentResponse.clientSecret,
            paymentIntentId: paymentResponse.paymentIntentId,
            customerId: paymentResponse.customerId
          };
        } catch (err) {
          console.error("Payment intent creation failed:", err.message);
        }
      }

    const response = {
      success: true,
      message: "Booking created successfully",
      data: populatedBooking,
      requiresPayment: paymentMethod !== 'cash',
      paymentMethod: paymentMethod,
      paymentIntent: paymentIntent
    };

    res.json(response);

  } catch (error) {
    console.error('Booking creation error:', error);
    res.json({
      success: false,
      message: "Error creating booking",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.user._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const bookings = await bookingModel.find(query)
      .populate('service', 'name description price category image')
      .populate('serviceProvider', 'businessName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalBookings = await bookingModel.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBookings / limit),
        totalBookings,
        hasNextPage: skip + bookings.length < totalBookings,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error fetching bookings"
    });
  }
};

// Get provider's bookings
const getProviderBookings = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    let query = { serviceProvider: req.provider._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      const queryDate = new Date(date);
      const nextDay = new Date(queryDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.bookingDate = {
        $gte: queryDate,
        $lt: nextDay
      };
    }

    const skip = (page - 1) * limit;
    
    const bookings = await bookingModel.find(query)
      .populate('service', 'name description price category image')
      .populate('user', 'name email phone')
      .sort({ bookingDate: 1, 'timeSlot.startTime': 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalBookings = await bookingModel.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBookings / limit),
        totalBookings,
        hasNextPage: skip + bookings.length < totalBookings,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error fetching provider bookings"
    });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status, cancellationReason } = req.body;

    const validStatuses = ['confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status"
      });
    }

    const updateData = { status };
    
    if (status === 'cancelled' || status === 'rejected') {
      updateData.cancellationReason = cancellationReason;
    }

    const booking = await bookingModel.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    )
    .populate('service', 'name description price')
    .populate('user', 'name email phone')
    .populate('serviceProvider', 'businessName email phone');

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found"
      });
    }

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      data: booking
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error updating booking status"
    });
  }
};

// Get booking details
const getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await bookingModel.findById(id)
      .populate('service', 'name description price category image')
      .populate('user', 'name email phone')
      .populate('serviceProvider', 'businessName email phone address');

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check authorization - user can see their own bookings, provider can see their bookings
    const isAuthorized = (req.user && booking.user._id.toString() === req.user._id.toString()) ||
                         (req.provider && booking.serviceProvider._id.toString() === req.provider._id.toString()) ||
                         (req.user && req.user.role === 'admin');

    if (!isAuthorized) {
      return res.json({
        success: false,
        message: "Not authorized to view this booking"
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error fetching booking details"
    });
  }
};

// Get available time slots for a service on a specific date
const getAvailableTimeSlots = async (req, res) => {
  try {
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      return res.json({
        success: false,
        message: "Service ID and date are required"
      });
    }

    const queryDate = new Date(date);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get all existing bookings for this service on the specified date
    const existingBookings = await bookingModel.find({
      service: serviceId,
      bookingDate: {
        $gte: queryDate,
        $lt: nextDay
      },
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    // Define available time slots (9 AM to 6 PM, 1-hour slots)
    const allTimeSlots = [];
    for (let hour = 9; hour < 18; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      allTimeSlots.push({ startTime, endTime });
    }

    // Filter out booked time slots
    const bookedSlots = existingBookings.map(booking => booking.timeSlot.startTime);
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot.startTime));

    res.json({
      success: true,
      data: availableSlots
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error fetching available time slots"
    });
  }
};

// Add rating and review to completed booking
const addBookingReview = async (req, res) => {
  try {
    const { bookingId, rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found"
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.json({
        success: false,
        message: "Not authorized to review this booking"
      });
    }

    if (booking.status !== 'completed') {
      return res.json({
        success: false,
        message: "Can only review completed bookings"
      });
    }

    booking.rating = {
      score: rating,
      review: review || '',
      reviewDate: new Date()
    };

    await booking.save();

    res.json({
      success: true,
      message: "Review added successfully",
      data: booking
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error adding review"
    });
  }
};

// Get all bookings (Admin only)
const getAllBookings = async (req, res) => {
  try {
    const { status, date, serviceId, userId, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (serviceId) {
      query.service = serviceId;
    }
    
    if (userId) {
      query.user = userId;
    }

    if (date) {
      const queryDate = new Date(date);
      const nextDay = new Date(queryDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.bookingDate = {
        $gte: queryDate,
        $lt: nextDay
      };
    }

    const skip = (page - 1) * limit;
    
    const bookings = await bookingModel.find(query)
      .populate('service', 'name description price category image')
      .populate('user', 'name email phone')
      .populate('serviceProvider', 'businessName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalBookings = await bookingModel.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBookings / limit),
        totalBookings,
        hasNextPage: skip + bookings.length < totalBookings,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error fetching all bookings"
    });
  }
};

// Get booking statistics
const getBookingStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'week':
        dateFilter.createdAt = {
          $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        };
        break;
      case 'month':
        dateFilter.createdAt = {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1)
        };
        break;
      case 'year':
        dateFilter.createdAt = {
          $gte: new Date(now.getFullYear(), 0, 1)
        };
        break;
    }

    // Get counts by status
    const statusStats = await bookingModel.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" }
        }
      }
    ]);

    // Get total bookings
    const totalBookings = await bookingModel.countDocuments(dateFilter);

    // Get revenue stats
    const revenueStats = await bookingModel.aggregate([
      { 
        $match: { 
          ...dateFilter,
          status: { $in: ['completed', 'confirmed'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          averageBookingValue: { $avg: "$totalPrice" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get popular services
    const popularServices = await bookingModel.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$service",
          bookingCount: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "serviceDetails"
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalBookings,
        statusStats,
        revenueStats: revenueStats[0] || {
          totalRevenue: 0,
          averageBookingValue: 0,
          count: 0
        },
        popularServices
      }
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error fetching booking statistics"
    });
  }
};

// Cancel booking (User or Admin)
const cancelBooking = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;

    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check if user owns the booking or is admin
    const isAuthorized = booking.user.toString() === req.user._id.toString() || 
                         req.user.role === 'admin';

    if (!isAuthorized) {
      return res.json({
        success: false,
        message: "Not authorized to cancel this booking"
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.json({
        success: false,
        message: "Cannot cancel completed or already cancelled booking"
      });
    }

    // Calculate refund eligibility based on cancellation time
    const bookingDateTime = new Date(booking.bookingDate + ' ' + booking.timeSlot.startTime);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

    let refundStatus = 'no_refund';
    if (hoursUntilBooking > 24) {
      refundStatus = 'full_refund';
    } else if (hoursUntilBooking > 2) {
      refundStatus = 'partial_refund';
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.metadata.refundStatus = refundStatus;
    booking.metadata.cancelledAt = new Date();
    booking.metadata.cancelledBy = req.user._id;

    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        booking,
        refundStatus
      }
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error cancelling booking"
    });
  }
};

// Reschedule booking
const rescheduleBooking = async (req, res) => {
  try {
    const { bookingId, newDate, newTimeSlot, reason } = req.body;

    const booking = await bookingModel.findById(bookingId);

    if (!booking) {
      return res.json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check authorization
    const isAuthorized = booking.user.toString() === req.user._id.toString() || 
                         req.user.role === 'admin';

    if (!isAuthorized) {
      return res.json({
        success: false,
        message: "Not authorized to reschedule this booking"
      });
    }

    // Check if booking can be rescheduled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.json({
        success: false,
        message: "Cannot reschedule completed or cancelled booking"
      });
    }

    // Validate new date is not in the past
    const newBookingDate = new Date(newDate);
    if (newBookingDate < new Date()) {
      return res.json({
        success: false,
        message: "New booking date cannot be in the past"
      });
    }

    // Check if new time slot is available
    const conflictingBooking = await bookingModel.findOne({
      service: booking.service,
      bookingDate: newBookingDate,
      'timeSlot.startTime': newTimeSlot.startTime,
      status: { $in: ['pending', 'confirmed', 'in-progress'] },
      _id: { $ne: bookingId }
    });

    if (conflictingBooking) {
      return res.json({
        success: false,
        message: "New time slot is already booked"
      });
    }

    // Store original booking details
    booking.metadata.originalBookingDate = booking.bookingDate;
    booking.metadata.originalTimeSlot = booking.timeSlot;
    booking.metadata.rescheduledAt = new Date();
    booking.metadata.rescheduleReason = reason;

    // Update booking
    booking.bookingDate = newBookingDate;
    booking.timeSlot = newTimeSlot;
    booking.status = 'pending'; // Reset to pending for provider confirmation

    await booking.save();

    const populatedBooking = await bookingModel.findById(bookingId)
      .populate('service', 'name description price')
      .populate('user', 'name email phone')
      .populate('serviceProvider', 'businessName email phone');

    res.json({
      success: true,
      message: "Booking rescheduled successfully",
      data: populatedBooking
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error rescheduling booking"
    });
  }
};

// Export additional functions
export {
  createBooking,
  getUserBookings,
  getProviderBookings,
  updateBookingStatus,
  getBookingDetails,
  getAvailableTimeSlots,
  addBookingReview,
  getAllBookings,
  getBookingStats,
  cancelBooking,
  rescheduleBooking
};
