// frontend/src/pages/GuestDashboard.jsx
import { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, CheckCircle2, Clock, Compass, ArrowRight } from 'lucide-react';
import { fetchMyBookings } from '../services/api';

export const GuestDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'

  useEffect(() => {
    const loadBookings = async () => {
     try {
        setLoading(true);
        const res = await fetchMyBookings();
        setBookings(res.data?.bookings || []);
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Please sign in to view your active reservations and stay vouchers.');
        } else {
          setError('Unable to retrieve reservation history at this time.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const today = new Date();
  const upcomingStays = bookings.filter((b) => new Date(b.checkOut) >= today);
  const pastStays = bookings.filter((b) => new Date(b.checkOut) < today);
  const displayedStays = activeTab === 'upcoming' ? upcomingStays : pastStays;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-luxe-amber border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-luxury text-luxe-muted">
            Gathering Itineraries...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 lg:px-12 flex-1 w-full">
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-luxe-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-editorial text-luxe-amber font-semibold block mb-1">
            Guest Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-luxe-primary font-normal">
            Your Sanctuary Itineraries
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-lg border border-luxe-border bg-white p-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-1.5 text-xs rounded-md transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-luxe-primary text-white font-medium'
                : 'text-luxe-muted hover:text-luxe-primary'
            }`}
          >
            Upcoming Stays ({upcomingStays.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-1.5 text-xs rounded-md transition-colors ${
              activeTab === 'past'
                ? 'bg-luxe-primary text-white font-medium'
                : 'text-luxe-muted hover:text-luxe-primary'
            }`}
          >
            Completed ({pastStays.length})
          </button>
        </div>
      </div>

      {error ? (
        <div className="text-center py-16 bg-white border border-luxe-border rounded-xl">
          <p className="font-serif text-lg text-luxe-primary">{error}</p>
        </div>
      ) : displayedStays.length === 0 ? (
        <div className="text-center py-20 bg-white border border-luxe-border rounded-2xl">
          <Compass size={32} className="text-luxe-muted mx-auto mb-3" />
          <h3 className="font-serif text-xl text-luxe-primary mb-1">
            {activeTab === 'upcoming' ? 'No Upcoming Escapes' : 'No Completed Getaways'}
          </h3>
          <p className="text-xs text-luxe-muted mb-6">
            {activeTab === 'upcoming'
              ? 'Your calendar is free. Reserve an architectural retreat to unwind.'
              : 'Past retreats will populate here once your stays conclude.'}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-luxe-primary text-white text-xs uppercase tracking-luxury py-2.5 px-6 rounded-lg hover:bg-luxe-amber transition-colors"
          >
            <span>Explore Sanctuaries</span>
            <ArrowRight size={13} />
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedStays.map((booking) => {
            const property = booking.property;
            const isPaid = booking.paymentStatus === 'paid';

            return (
              <div
                key={booking._id}
                className="bg-white border border-luxe-border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-100">
                  <img
                    src={
                      property?.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800'
                    }
                    alt={property?.title || 'Sanctuary'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-luxury font-semibold px-2.5 py-1 rounded-full backdrop-blur-md ${
                        isPaid
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isPaid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                      {isPaid ? 'Confirmed & Settled' : 'Payment Pending'}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-luxury text-luxe-amber font-semibold">
                      {property?.propertyType || 'Villa'}
                    </span>
                    <h3 className="font-serif text-xl text-luxe-primary mt-0.5">
                      {property?.title || 'Private Residence'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-luxe-muted mt-1.5">
                      <MapPin size={13} className="text-luxe-amber shrink-0" />
                      <span>
                        {property?.location?.city}, {property?.location?.country}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-luxe-border text-xs">
                    <div>
                      <span className="text-[10px] uppercase tracking-luxury text-luxe-muted font-medium block">
                        Dates
                      </span>
                      <span className="font-medium text-stone-800">
                        {new Date(booking.checkIn).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        –{' '}
                        {new Date(booking.checkOut).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-luxury text-luxe-muted font-medium block">
                        Total Remitted
                      </span>
                      <span className="font-mono font-medium text-luxe-primary">
                        LKR{booking.pricing?.totalAmount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-luxe-muted">
                      Ref: #{booking._id.slice(-6)}
                    </span>
                    <a
                      href={`/booking-confirmed?bookingId=${booking._id}`}
                      className="text-xs uppercase tracking-luxury text-luxe-primary font-semibold hover:text-luxe-amber inline-flex items-center gap-1"
                    >
                      <span>View Voucher</span>
                      <ArrowRight size={12} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};