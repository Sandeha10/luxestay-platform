import express from 'express';
import {
  createBooking,
  getMyBookings,
  getPropertyBookedDates,
  getBookingById,
} from '../controllers/booking.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createBookingSchema } from '../validations/booking.validation.js';

const router = express.Router();

// Public: Calendar availability lookup
router.get('/property/:propertyId/booked-dates', getPropertyBookedDates);

// Protected Guest routes
router.use(protect);

router.route('/')
  .post(validate(createBookingSchema), createBooking);

router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingById);

export default router;