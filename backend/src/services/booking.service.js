import mongoose from 'mongoose';
import { Property } from '../models/property.model.js';
import { Booking } from '../models/booking.model.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../constants/bookingStatus.js';
import { ApiError } from '../utils/ApiError.js';

export class BookingService {
  /**
   * Calculates night difference using pure UTC day boundaries
   */
  static calculateNights(checkInDate, checkOutDate) {
    const utc1 = Date.UTC(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());
    const utc2 = Date.UTC(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate());
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((utc2 - utc1) / msPerDay);
  }

  /**
   * Generates authoritative server pricing
   */
  static calculatePricing(property, totalNights) {
    const baseTotal = property.pricePerNight * totalNights;
    const cleaningFee = property.cleaningFee || 0;
    const serviceFee = Math.round(baseTotal * (property.serviceFeeRate || 0.02));
    const totalAmount = baseTotal + cleaningFee + serviceFee;

    return {
      pricePerNight: property.pricePerNight,
      baseTotal,
      cleaningFee,
      serviceFee,
      totalAmount,
    };
  }

  /**
   * Executes atomic reservation within a MongoDB ACID Transaction
   */
  static async createReservation({ propertyId, guestId, checkIn, checkOut, guestCount }) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (checkInDate < now) {
      throw new ApiError('Check-in date cannot be in the past', 400);
    }

    const totalNights = this.calculateNights(checkInDate, checkOutDate);
    if (totalNights < 1) {
      throw new ApiError('Check-out date must be at least 1 day after check-in date', 400);
    }

    // Initialize MongoDB Client Session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Fetch Property and verify capacity
      const property = await Property.findById(propertyId).session(session);
      if (!property || !property.isAvailable) {
        throw new ApiError('This architectural property is unavailable or unlisted', 404);
      }

      if (guestCount > property.maxGuests) {
        throw new ApiError(
          `Guest capacity exceeded. Maximum allowed guests: ${property.maxGuests}`,
          400
        );
      }

      // 2. Strict Overlap Concurrency Check inside transaction
      // Existing: [existing.checkIn, existing.checkOut]
      // Requested: [checkInDate, checkOutDate]
      // Overlap occurs if existing.checkIn < checkOutDate AND existing.checkOut > checkInDate
      const activeOverlap = await Booking.findOne({
        property: propertyId,
        bookingStatus: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING] },
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
      }).session(session);

      if (activeOverlap) {
        throw new ApiError(
          'Selected dates are no longer available. Another guest has reserved these dates.',
          409 // Conflict
        );
      }

      // 3. Compute Server-Authoritative Pricing
      const pricing = this.calculatePricing(property, totalNights);

      // 4. Create Booking Document bound to Session
      const [newBooking] = await Booking.create(
        [
          {
            property: property._id,
            guest: guestId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            totalNights,
            guestCount,
            pricing,
            bookingStatus: BOOKING_STATUS.PENDING,
            paymentStatus: PAYMENT_STATUS.UNPAID,
          },
        ],
        { session }
      );

      // Commit the ACID transaction atomically
      await session.commitTransaction();
      return newBooking;
    } catch (error) {
      // Rollback write modifications if concurrent collision or validation failed
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}