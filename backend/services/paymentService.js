import stripe from "../config/stripe.js";
import bookingModel from "../models/bookingModel.js";

export const createPaymentIntentService = async (bookingId, currency = "usd") => {
  const booking = await bookingModel.findById(bookingId)
    .populate("service", "name description price")
    .populate("user", "name email");

  if (!booking) throw new Error("Booking not found");
  if (booking.paymentStatus === "paid") throw new Error("Booking already paid");

  const amount = Math.round(booking.totalPrice * 100);

  const customer = await stripe.customers.create({
    email: booking.customerDetails.email,
    name: booking.customerDetails.name,
    phone: booking.customerDetails.phone,
    metadata: {
      userId: booking.user._id.toString(),
      bookingId: booking._id.toString()
    }
  });


  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customer.id,
    description: `Payment for ${booking.service.name} booking`,
    receipt_email: booking.customerDetails.email,
    metadata: {
      bookingId: booking._id.toString(),
      userId: booking.user._id.toString(),
      serviceName: booking.service.name,
      bookingDate: booking.bookingDate.toISOString(),
      timeSlot: `${booking.timeSlot.startTime}-${booking.timeSlot.endTime}`
    },
    setup_future_usage: "on_session" // allows re-use of card
  });

  await bookingModel.findByIdAndUpdate(bookingId, {
    "metadata.stripePaymentIntentId": paymentIntent.id,
    "metadata.stripeCustomerId": customer.id,
    paymentMethod: "stripe"
  });

  return {
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    customerId: customer.id,
    amount: booking.totalPrice,
    currency
  };
};
