import express from 'express';
import { createBookingCheckoutSession } from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post(
  '/create-checkout-session/:bookingId',
  protect,
  createBookingCheckoutSession
);

export default router;