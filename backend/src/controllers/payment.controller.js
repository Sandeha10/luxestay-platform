import Stripe from 'stripe';
import { Booking } from '../models/booking.model.js';
import { Property } from '../models/property.model.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../constants/bookingStatus.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Lazy-loaded Stripe instance helper
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new ApiError('Stripe secret key is not configured in environment variables.', 500);
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// @desc    Initiate Stripe Checkout Session for an existing pre-allocated booking
// @route   POST /api/v1/payments/create-checkout-session/:bookingId
export const createBookingCheckoutSession = asyncHandler(async (req, res, next) => {
  const stripe = getStripe();
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId).populate('property');
  if (!booking) {
    return next(new ApiError('Reservation record not found', 404));
  }

  // IDOR Guard: Verify ownership
  if (booking.guest.toString() !== req.user._id.toString()) {
    return next(new ApiError('Unauthorized to remit payment for this reservation', 403));
  }

  if (booking.paymentStatus === PAYMENT_STATUS.PAID) {
    return next(new ApiError('This reservation has already been settled in full', 400));
  }

  const property = booking.property;
  const { pricePerNight, baseTotal, cleaningFee, serviceFee, totalAmount } = booking.pricing;

  // Build itemized Stripe line items (converted to cents)
  const line_items = [
    {
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(pricePerNight * 100),
        product_data: {
          name: `${property.title} — ${booking.totalNights} Night Stay`,
          description: `Check-in: ${new Date(booking.checkIn).toLocaleDateString()} | Check-out: ${new Date(booking.checkOut).toLocaleDateString()}`,
          images: property.images?.length > 0 ? [property.images[0].url] : [],
        },
      },
      quantity: booking.totalNights,
    },
    {
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(cleaningFee * 100),
        product_data: {
          name: 'Sanitization & Cleaning Protocol',
          description: 'Comprehensive sanitization and preparation for your arrival',
        },
      },
      quantity: 1,
    },
    {
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(serviceFee * 100),
        product_data: {
          name: 'LuxeStay Concierge Service Fee',
          description: '24/7 dedicated guest concierge and platform coordination (12%)',
        },
      },
      quantity: 1,
    },
  ];

  // Create Hosted Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: req.user.email,
    client_reference_id: booking._id.toString(),
    line_items,
    metadata: {
      bookingId: booking._id.toString(),
      propertyId: property._id.toString(),
      guestId: req.user._id.toString(),
    },
    success_url: `${process.env.CLIENT_URL}/booking-confirmed?bookingId=${booking._id}`,
    cancel_url: `${process.env.CLIENT_URL}/booking-cancelled?bookingId=${booking._id}`,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        sessionId: session.id,
        checkoutUrl: session.url,
      },
      'Stripe checkout session initialized.'
    )
  );
});

// @desc    Cryptographic Stripe Webhook to finalize reservation
// @route   POST /api/v1/payments/webhook
export const handleStripeWebhook = async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Validate raw binary signature using Stripe secret
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`[Stripe Webhook Signature Error]: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.client_reference_id || session.metadata?.bookingId;

    try {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        console.error(`[Webhook Alert] Booking not found for ID: ${bookingId}`);
        return res.status(404).json({ error: 'Booking missing' });
      }

      // Idempotency: skip if already settled
      if (booking.paymentStatus === PAYMENT_STATUS.PAID) {
        return res.status(200).json({ received: true });
      }

      // Finalize booking state
      booking.paymentStatus = PAYMENT_STATUS.PAID;
      booking.bookingStatus = BOOKING_STATUS.CONFIRMED;
      booking.paymentIntentId = session.payment_intent;
      booking.paidAt = new Date();
      await booking.save();

      console.log(`[LuxeStay Payment Succeeded] Booking confirmed: #${booking._id}`);
    } catch (dbErr) {
      console.error('[Database Webhook Exception]:', dbErr);
      return res.status(500).json({ error: 'Database update failed' });
    }
  }

  res.status(200).json({ received: true });
};