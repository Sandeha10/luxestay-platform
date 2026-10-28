// frontend/src/pages/BookingCancelled.jsx
import { XCircle, ArrowLeft, RefreshCw, Compass } from 'lucide-react';

export const BookingCancelled = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('bookingId');

  return (
    <div className="max-w-xl mx-auto my-16 px-6 text-center">
      <div className="bg-white border border-luxe-border rounded-2xl p-8 sm:p-10 shadow-xs">
        {/* Amber / Warning Badge */}
        <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-5">
          <XCircle size={28} />
        </div>

        <span className="text-[10px] uppercase tracking-editorial text-amber-600 font-semibold block mb-1">
          Checkout Interrupted
        </span>

        <h1 className="font-serif text-2xl sm:text-3xl text-luxe-primary font-normal mb-3">
          No funds were captured.
        </h1>

        <p className="text-xs text-luxe-muted leading-relaxed max-w-md mx-auto mb-6">
          Your card has not been billed. The reservation hold remains pending. You can re-attempt the remittance or explore other private architectural sanctuaries.
        </p>

        {bookingId && (
          <div className="bg-luxe-canvas border border-luxe-border rounded-lg p-3 mb-6 inline-block">
            <span className="text-[11px] font-mono text-stone-600">
              Reference: #{bookingId}
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-luxe-border px-5 py-2.5 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Compass size={14} />
            <span>Browse Portfolio</span>
          </a>

          <a
            href="/my-bookings"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-luxe-primary text-white text-xs uppercase tracking-luxury py-2.5 px-6 rounded-lg hover:bg-luxe-amber transition-colors shadow-xs"
          >
            <RefreshCw size={14} />
            <span>Review Stays</span>
          </a>
        </div>
      </div>
    </div>
  );
};