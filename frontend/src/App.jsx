import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { SearchBar } from './components/search/SearchBar';
import { VillaCard } from './components/property/VillaCard';
import { PropertyDetailModal } from './components/property/PropertyDetailModal';
import { AuthModal } from './components/auth/AuthModal';
import { BookingConfirmed } from './pages/BookingConfirmed';
import { BookingCancelled } from './pages/BookingCancelled';
import { GuestDashboard } from './pages/GuestDashboard';
import { fetchProperties, getMe, logoutUser } from './services/api';
import { translations } from './utils/translations';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [currentCurrency, setCurrentCurrency] = useState('LKR (Rs)');
  const [currentLanguage, setCurrentLanguage] = useState('English (US)');
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const t = translations[currentLanguage] || translations['English (US)'];

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getMe();
        setCurrentUser(res.data?.user || null);
      } catch (err) {
        setCurrentUser(null);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      window.location.reload();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const loadProperties = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const params = {};
      if (filters.city) params.search = filters.city;
      if (filters.propertyType) params.propertyType = filters.propertyType;
      if (filters.guests) params.guests = filters.guests;

      const res = await fetchProperties(params);
      setProperties(res.data?.properties || []);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectCategory = (categoryValue) => {
    setActiveCategory(categoryValue);
    loadProperties({ propertyType: categoryValue });
  };

  useEffect(() => {
    if (currentPath === '/') {
      loadProperties();
    }
  }, [currentPath, loadProperties]);

  return (
    <div className="min-h-screen flex flex-col bg-luxe-canvas">
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        currency={currentCurrency}
        onCurrencyChange={(curr) => setCurrentCurrency(curr)}
        language={currentLanguage}
        onLanguageChange={(lang) => setCurrentLanguage(lang)}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onAuthSuccess={(user) => setCurrentUser(user)} />
      <PropertyDetailModal property={selectedProperty} isOpen={Boolean(selectedProperty)} onClose={() => setSelectedProperty(null)} />

      {currentPath === '/booking-confirmed' ? (
        <BookingConfirmed />
      ) : currentPath === '/booking-cancelled' ? (
        <BookingCancelled />
      ) : currentPath === '/my-bookings' ? (
        <GuestDashboard />
      ) : (
        <>
          <section className="relative h-[480px] w-full overflow-hidden flex items-center justify-center text-center">
            <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1920" alt="Hero" className="absolute inset-0 w-full h-full object-cover brightness-50" />
            <div className="relative z-10 max-w-3xl px-6 text-white space-y-4">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-editorial bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-luxe-amber border border-white/20">
                <Sparkles size={11} /> Hand-Crafted Private Sanctuaries
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-tight">
                {t.searchTitle}
              </h2>
              <p className="text-xs sm:text-sm text-stone-200 font-light max-w-xl mx-auto leading-relaxed">
                {t.searchSubtitle}
              </p>
            </div>
          </section>

          <SearchBar onSearch={loadProperties} />

          <main className="max-w-7xl mx-auto px-6 lg:px-12 py-16 flex-1 w-full">
            <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-luxe-border">
              <div>
                <span className="text-[10px] uppercase tracking-editorial text-luxe-amber font-medium block mb-1">{t.curatedPortfolio}</span>
                <h3 className="font-serif text-2xl text-luxe-primary font-normal">{t.featuredResidences}</h3>
              </div>
              <span className="text-xs font-mono text-luxe-muted">{properties.length} {t.sanctuariesAvailable}</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] bg-stone-200/60 rounded-xl animate-pulse" />)}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20 bg-white border border-luxe-border rounded-xl">
                <p className="font-serif text-lg text-luxe-primary">No sanctuaries found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => (
                  <VillaCard 
                    key={property._id} 
                    property={property} 
                    currency={currentCurrency} 
                    language={currentLanguage}
                    onSelect={(p) => setSelectedProperty(p)} 
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      <footer className="border-t border-luxe-border py-12 bg-white text-center text-xs text-luxe-muted mt-auto">
        <p className="font-serif text-sm uppercase tracking-editorial text-luxe-primary mb-1">LuxeStay Global Portfolio</p>
        <p>© 2026 LuxeStay Concierge Group. All rights reserved.</p>
      </footer>
    </div>
  );
}