import mongoose from 'mongoose';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../constants/bookingStatus.js';

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.ObjectId,
      ref: 'Property',
      required: [true, 'A reservation must reference a listed property'],
      index: true,
    },
    guest: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A reservation must be linked to an authenticated guest'],
      index: true,
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
      index: true,
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
      index: true,
    },
    totalNights: {
      type: Number,
      required: true,
      min: [1, 'Reservations must be at least 1 night'],
    },
    guestCount: {
      type: Number,
      required: true,
      min: [1, 'At least 1 guest required'],
    },
    // Authoritative Financial Breakdown (USD)
    pricing: {
      pricePerNight: { type: Number, required: true },
      baseTotal: { type: Number, required: true },
      cleaningFee: { type: Number, required: true },
      serviceFee: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
    },
    bookingStatus: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
      index: true,
    },
    paymentIntentId: {
      type: String,
      select: false,
    },
    paidAt: Date,
    cancellationReason: String,
  },
  {
    timestamps: true,
  }
);

// High-speed compound index for overlap sweeps
bookingSchema.index({
  property: 1,
  bookingStatus: 1,
  checkIn: 1,
  checkOut: 1,
});

export const Booking = mongoose.model('Booking', bookingSchema);