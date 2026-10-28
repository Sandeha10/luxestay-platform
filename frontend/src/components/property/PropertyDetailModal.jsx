import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Star, MapPin, Users, Bed, Bath, ShieldCheck, 
  Calendar, Check, AlertCircle, Sparkles, ArrowRight 
} from 'lucide-react';
import { differenceInCalendarDays, isWithinInterval, parseISO } from 'date-fns';
import { fetchBookedDates, createBookingRequest, createCheckoutSession } from '../../services/api';

export const PropertyDetailModal = ({ property, isOpen, onClose, onBookingSuccess }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Fetch reserved date windows on modal open
  useEffect(() => {
    if (!isOpen || !property?._id) return;

    const loadAvailability = async () => {
      try {
        setIsLoadingAvailability(true);
        const res = await fetchBookedDates(property._id);
        setBookedRanges(res.data?.bookedRanges || []);
      } catch (err) {
        console.error('Failed to load availability:', err);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    loadAvailability();
    setErrorMsg('');
    setSuccessMsg('');
    setCheckIn('');
    setCheckOut('');
    setGuests(1);
  }, [isOpen, property]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 2. Authoritative client projection of nights & fees
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn));
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const pricingSummary = useMemo(() => {
    if (!property || nights <= 0) return null;
    const baseTotal = property.pricePerNight * nights;
    const cleaningFee = property.cleaningFee || 0;
    const serviceFee = Math.round(baseTotal * (property.serviceFeeRate || 0.12));
    const totalAmount = baseTotal + cleaningFee + serviceFee;

    return { baseTotal, cleaningFee, serviceFee, totalAmount };
  }, [property, nights]);

  // 3. Collision detection for user-selected checkIn & checkOut
  const isSelectedRangeOverlapping = useMemo(() => {
    if (!checkIn || !checkOut || bookedRanges.length === 0) return false;
    const start = parseISO(checkIn);
    const end = parseISO(checkOut);

    return bookedRanges.some((range) => {
      const bStart = parseISO(range.checkIn);
      const bEnd = parseISO(range.checkOut);
      return bStart < end && bEnd > start;
    });
  }, [checkIn, checkOut, bookedRanges]);

  if (!isOpen || !property) return null;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (nights <= 0) {
      setErrorMsg('Please select valid check-in and check-out dates.');
      return;
    }

    if (isSelectedRangeOverlapping) {
      setErrorMsg('The selected date range conflicts with an existing booking.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Pre-allocate reservation via ACID transaction
      const res = await createBookingRequest({
        propertyId: property._id,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        guestCount: Number(guests),
      });

      const newBooking = res.data?.booking;
      if (!newBooking?._id) {
        throw new Error('Booking could not be created.');
      }

      setSuccessMsg('Sanctuary allocated! Initiating checkout...');

      // 2. Attempt Stripe checkout session creation
      try {
        const paymentRes = await createCheckoutSession(newBooking._id);
        if (paymentRes.data?.checkoutUrl) {
          window.location.href = paymentRes.data.checkoutUrl;
          return;
        }
      } catch (stripeErr) {
        console.warn('Stripe checkout unavailable, redirecting directly to confirmed view:', stripeErr);
        // Fallback: If Stripe key is missing or in dev mode, navigate to confirmation page
        window.location.href = `/booking-confirmed?bookingId=${newBooking._id}`;
        return;
      }

      // Direct fallback if no checkoutUrl was returned
      window.location.href = `/booking-confirmed?bookingId=${newBooking._id}`;
    } catch (err) {
      setSuccessMsg(''); // Clear green banner on error
      setErrorMsg(
        err.response?.data?.message || 'Failed to place reservation. Please sign in or try different dates.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const coverImage = property.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Dimmed backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-5xl bg-white border border-luxe-border rounded-2xl shadow-2xl z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Top Bar with Close Button */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-luxe-border">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-editorial text-luxe-amber font-semibold">
                {property.propertyType}
              </span>
              <span className="text-stone-300">•</span>
              <div className="flex items-center gap-1 text-xs font-mono font-medium">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span>{property.averageRating?.toFixed(2)}</span>
                <span className="text-luxe-muted">({property.reviewsCount || 0} reviews)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-luxe-muted hover:text-luxe-primary rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 Columns: Architectural Showcase & Narrative */}
            <div className="lg:col-span-7 space-y-6">
              {/* Cover Viewport */}
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-stone-100 border border-luxe-border">
                <img
                  src={coverImage}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] tracking-luxury uppercase px-3 py-1 rounded-full">
                  Verified Residence
                </div>
              </div>

              {/* Title & Location */}
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-luxe-primary font-normal leading-tight">
                  {property.title}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-luxe-muted mt-2">
                  <MapPin size={13} className="text-luxe-amber shrink-0" />
                  <span>{property.location?.address}, {property.location?.city}, {property.location?.country}</span>
                </div>
              </div>

              {/* Property Attributes Badge Row */}
              <div className="flex flex-wrap gap-4 py-3 border-y border-luxe-border text-xs text-stone-700">
                <div className="flex items-center gap-1.5 font-medium">
                  <Users size={14} className="text-luxe-muted" />
                  <span>Up to {property.maxGuests} Guests</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Bed size={14} className="text-luxe-muted" />
                  <span>{property.bedrooms} Bedrooms ({property.beds} Beds)</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Bath size={14} className="text-luxe-muted" />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
              </div>

              {/* Experience Description */}
              <div>
                <h4 className="text-xs uppercase tracking-luxury text-luxe-primary font-semibold mb-2">
                  Architectural Narrative
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Amenities Grid */}
              {property.amenities?.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-luxury text-luxe-primary font-semibold mb-3">
                    Curated Amenities
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {property.amenities.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-stone-700 bg-luxe-sand/70 border border-stone-200/60 px-3 py-2 rounded-lg"
                      >
                        <Sparkles size={12} className="text-luxe-amber shrink-0" />
                        <span className="capitalize">{item.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 5 Columns: Sticky Reservation & Receipt Engine */}
            <div className="lg:col-span-5">
              <div className="sticky top-4 bg-luxe-canvas border border-luxe-border rounded-xl p-6 shadow-sm space-y-5">
                {/* Price Display */}
                <div className="flex items-baseline justify-between pb-4 border-b border-luxe-border">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-2xl font-bold text-luxe-primary">
                      ${property.pricePerNight}
                    </span>
                    <span className="text-xs text-luxe-muted">/ night</span>
                  </div>
                  <span className="text-[11px] text-luxe-emerald uppercase tracking-wider font-medium">
                    Best Rate Guaranteed
                  </span>
                </div>

                {/* Feedback Alerts */}
                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 rounded-lg">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 rounded-lg">
                    <Check size={15} className="shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Booking Form */}
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {/* Date Input Frame */}
                  <div className="grid grid-cols-2 bg-white border border-luxe-border rounded-xl overflow-hidden divide-x divide-luxe-border">
                    <div className="p-2.5">
                      <label className="block text-[9px] uppercase tracking-luxury text-luxe-muted font-semibold mb-1">
                        Check-In
                      </label>
                      <input
                        type="date"
                        required
                        value={checkIn}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full text-xs text-luxe-primary font-medium focus:outline-none bg-transparent cursor-pointer"
                      />
                    </div>
                    <div className="p-2.5">
                      <label className="block text-[9px] uppercase tracking-luxury text-luxe-muted font-semibold mb-1">
                        Check-Out
                      </label>
                      <input
                        type="date"
                        required
                        value={checkOut}
                        min={checkIn || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full text-xs text-luxe-primary font-medium focus:outline-none bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Guest Dropdown */}
                  <div className="bg-white border border-luxe-border rounded-xl p-2.5">
                    <label className="block text-[9px] uppercase tracking-luxury text-luxe-muted font-semibold mb-1">
                      Guests Allocation
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full text-xs text-luxe-primary font-medium bg-transparent focus:outline-none cursor-pointer"
                    >
                      {[...Array(property.maxGuests || 4)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i + 1 === 1 ? 'Guest' : 'Guests'} (Max {property.maxGuests})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Overlap Collision Warning */}
                  {isSelectedRangeOverlapping && (
                    <p className="text-[11px] text-rose-600 font-medium">
                      ⚠️ These dates are already reserved. Please select another interval.
                    </p>
                  )}

                  {/* Live Quote Breakdown */}
                  {pricingSummary && (
                    <div className="pt-3 border-t border-luxe-border space-y-2 text-xs">
                      <div className="flex justify-between text-stone-600">
                        <span>${property.pricePerNight} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                        <span className="font-mono">LKR{pricingSummary.baseTotal}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Cleaning & Sanitization</span>
                        <span className="font-mono">LKR{pricingSummary.cleaningFee}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Concierge Service (2%)</span>
                        <span className="font-mono">LKR{pricingSummary.serviceFee}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-luxe-primary pt-2 border-t border-stone-200">
                        <span>Total Quote</span>
                        <span className="font-mono text-luxe-amber">LKR{pricingSummary.totalAmount}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit / Reserve Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isSelectedRangeOverlapping || nights <= 0}
                    className="w-full mt-4 bg-zinc-900 hover:bg-amber-600 text-white py-4 px-4 rounded-xl text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2 animate-pulse">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Locking Dates...</span>
                      </span>
                    ) : (
                      <>
                        <span>Reserve Sanctuary</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-luxe-muted uppercase tracking-wider pt-2">
                  <ShieldCheck size={13} className="text-luxe-emerald" />
                  <span>Zero-Loss Cancellation within 48 Hours</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};