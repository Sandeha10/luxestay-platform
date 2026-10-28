import { useEffect, useState } from 'react';
import { Check, Calendar, MapPin, Users, ShieldCheck, ArrowRight, Printer } from 'lucide-react';
import { fetchBookingById } from '../services/api';

export const BookingConfirmed = () => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('bookingId');

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) {
        setError('No reservation identifier found in request parameters.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetchBookingById(bookingId);
        setBooking(res.data?.booking);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to retrieve reservation manifest.');
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-luxe-amber border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-luxury text-luxe-muted">
            Verifying Reservation Manifest...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-luxe-border rounded-xl text-center shadow-xs">
        <h2 className="font-serif text-2xl text-luxe-primary mb-2">Reservation Notice</h2>
        <p className="text-xs text-luxe-muted mb-6">{error || 'Reservation could not be located.'}</p>
        <a
          href="/"
          className="inline-block bg-luxe-primary text-white text-xs uppercase tracking-luxury py-3 px-6 rounded-lg hover:bg-luxe-amber transition-colors"
        >
          Return to Portfolio
        </a>
      </div>
    );
  }

  const property = booking.property;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      {/* Editorial Header */}
      <div className="text-center pb-8 border-b border-luxe-border">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-luxe-emerald border border-emerald-200 flex items-center justify-center mx-auto mb-4">
          <Check size={26} />
        </div>
        <span className="text-[10px] uppercase tracking-editorial text-luxe-amber font-semibold block mb-1">
          Sanctuary Secured
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-luxe-primary font-normal">
          Your stay has been confirmed.
        </h1>
        <p className="text-xs font-mono text-luxe-muted mt-2">
          Reservation Reference: #{booking._id}
        </p>
      </div>

      {/* Residence Snapshot */}
      <div className="py-6 border-b border-luxe-border flex flex-col sm:flex-row items-center gap-6">
        <img
          src={property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=600'}
          alt={property?.title}
          className="w-full sm:w-44 aspect-[4/3] object-cover rounded-xl border border-luxe-border"
        />
        <div className="space-y-1.5 text-center sm:text-left">
          <span className="text-[10px] uppercase tracking-luxury text-luxe-emerald font-semibold">
            {property?.propertyType}
          </span>
          <h2 className="font-serif text-xl text-luxe-primary font-normal">
            {property?.title}
          </h2>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-luxe-muted">
            <MapPin size={13} className="text-luxe-amber shrink-0" />
            <span>{property?.location?.address}, {property?.location?.city}, {property?.location?.country}</span>
          </div>
        </div>
      </div>

      {/* Stay Schedule Matrix */}
      <div className="py-6 border-b border-luxe-border grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
        <div className="p-4 bg-luxe-canvas rounded-xl border border-luxe-border">
          <span className="text-[10px] uppercase tracking-luxury text-luxe-muted font-semibold block mb-1">
            Check-In
          </span>
          <p className="font-medium text-luxe-primary text-sm">
            {new Date(booking.checkIn).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <span className="text-[11px] text-luxe-muted">From 2:00 PM</span>
        </div>

        <div className="p-4 bg-luxe-canvas rounded-xl border border-luxe-border">
          <span className="text-[10px] uppercase tracking-luxury text-luxe-muted font-semibold block mb-1">
            Check-Out
          </span>
          <p className="font-medium text-luxe-primary text-sm">
            {new Date(booking.checkOut).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <span className="text-[11px] text-luxe-muted">Until 11:00 AM</span>
        </div>

        <div className="p-4 bg-luxe-canvas rounded-xl border border-luxe-border">
          <span className="text-[10px] uppercase tracking-luxury text-luxe-muted font-semibold block mb-1">
            Guest Party
          </span>
          <p className="font-medium text-luxe-primary text-sm">
            {booking.guestCount} {booking.guestCount === 1 ? 'Guest' : 'Guests'}
          </p>
          <span className="text-[11px] text-luxe-muted">{booking.totalNights} Nights Total</span>
        </div>
      </div>

      {/* Financial Settlement Breakdown */}
      <div className="py-6 border-b border-luxe-border space-y-2.5 text-xs">
        <h3 className="uppercase tracking-luxury text-luxe-muted font-semibold mb-3">
          Remittance Statement
        </h3>
        <div className="flex justify-between text-stone-600">
          <span>${booking.pricing?.pricePerNight} × {booking.totalNights} Nights</span>
          <span className="font-mono">LKR{booking.pricing?.baseTotal}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Cleaning & Sanitization</span>
          <span className="font-mono">LKR{booking.pricing?.cleaningFee}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Concierge Platform Fee (2%)</span>
          <span className="font-mono">LKR{booking.pricing?.serviceFee}</span>
        </div>
        <div className="flex justify-between text-base font-semibold text-luxe-primary pt-3 border-t border-luxe-border">
          <span>Total Settled</span>
          <span className="font-mono text-luxe-amber">LKR{booking.pricing?.totalAmount}</span>
        </div>
      </div>

      {/* Actions & Voucher Print */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => window.print()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-luxe-border px-4 py-2.5 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
        >
          <Printer size={14} />
          <span>Print Voucher Receipt</span>
        </button>

        <a
          href="/my-bookings"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-luxe-primary text-white text-xs uppercase tracking-luxury py-3 px-6 rounded-lg hover:bg-luxe-amber transition-colors shadow-xs"
        >
          <span>View Guest Dashboard</span>
          <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
};