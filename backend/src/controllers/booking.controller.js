import { BookingService } from '../services/booking.service.js';
import { Booking } from '../models/booking.model.js';
import { Property } from '../models/property.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BOOKING_STATUS } from '../constants/bookingStatus.js';

// @desc    Reserve villa with atomic date-overlap check
// @route   POST /api/v1/bookings
export const createBooking = asyncHandler(async (req, res) => {
  const { propertyId, checkIn, checkOut, guestCount } = req.body;

  const booking = await BookingService.createReservation({
    propertyId,
    guestId: req.user._id,
    checkIn,
    checkOut,
    guestCount,
  });

  res.status(201).json(
    new ApiResponse(201, { booking }, 'Reservation pre-allocated successfully. Pending payment.')
  );
});

// @desc    Get user's personal booking history (IDOR protected)
// @route   GET /api/v1/bookings/my-bookings
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ guest: req.user._id })
    .populate('property', 'title slug images location pricePerNight')
    .sort('-createdAt');

  res.status(200).json(
    new ApiResponse(200, { count: bookings.length, bookings }, 'Guest reservations loaded.')
  );
});

// @desc    Get all booked date ranges for a property calendar
// @route   GET /api/v1/bookings/property/:propertyId/booked-dates
export const getPropertyBookedDates = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  const activeBookings = await Booking.find({
    property: propertyId,
    bookingStatus: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING] },
    checkOut: { $gte: new Date() },
  }).select('checkIn checkOut -_id');

  res.status(200).json(
    new ApiResponse(200, { bookedRanges: activeBookings }, 'Property availability calendar loaded.')
  );
});

// @desc    Get booking details by ID
// @route   GET /api/v1/bookings/:id
export const getBookingById = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('property', 'title slug location images')
    .populate('guest', 'name email');

  if (!booking) {
    return next(new ApiError('Reservation identifier not found', 404));
  }

  // IDOR Guard: Only Guest, Property Host, or Admin can view
  const isGuest = booking.guest._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isGuest && !isAdmin) {
    return next(new ApiError('Unauthorized to inspect this reservation record', 403));
  }

  res.status(200).json(new ApiResponse(200, { booking }, 'Reservation record loaded.'));
});