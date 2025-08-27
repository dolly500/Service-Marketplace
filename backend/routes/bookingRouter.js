// routes/bookingRouter.js
import express from 'express';
import {
    createBooking,
  getUserBookings,
  getProviderBookings,
  updateBookingStatus,
  getBookingDetails,
  getAvailableTimeSlots,
  addBookingReview
} from '../controllers/bookingController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { protectProvider } from '../middleware/providerAuth.js';

const bookingRouter = express.Router();

// Public routes
bookingRouter.get("/available-slots", getAvailableTimeSlots);

// User routes (require user authentication)
bookingRouter.post("/create", authMiddleware, createBooking);
bookingRouter.get("/user", authMiddleware, getUserBookings);
bookingRouter.post("/review", authMiddleware, addBookingReview);

// Provider routes (require provider authentication)
bookingRouter.get("/provider", protectProvider, getProviderBookings);
bookingRouter.post("/status", protectProvider, updateBookingStatus);

// Shared routes (require authentication - user or provider)
bookingRouter.get("/details/:id", (req, res, next) => {
  // Try user auth first, then provider auth
  authMiddleware(req, res, (err) => {
    if (err || !req.user) {
      // If user auth fails, try provider auth
      protectProvider(req, res, next);
    } else {
      next();
    }
  });
}, getBookingDetails);

export default bookingRouter;