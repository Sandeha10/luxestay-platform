import { useState, useRef, useEffect } from 'react';
import { Compass, User, Globe, Menu, Calendar, ShieldCheck, LogIn, LogOut, PlusCircle, Check, X } from 'lucide-react';

export const Navbar = ({ 
  onOpenAuth, 
  currentUser, 
  onLogout, 
  activeCategory, 
  onSelectCategory, 
  currency = 'LKR (Rs)', 
  onCurrencyChange,
  language = 'English (US)',
  onLanguageChange 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    { label: 'All Stays', value: '' },
    { label: 'Cliffside Villas', value: 'Cliffside Villa' },
    { label: 'Penthouses', value: 'Penthouse' },
    { label: 'Beachfront', value: 'Beachfront' },
    { label: 'Alpine Chalets', value: 'Alpine Chalet' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-zinc-900 text-white flex items-center justify-center rounded-sm shadow-xs">
              <Compass size={20} className="text-amber-500" />
            </div>
            <div>
              <h1 className="font-serif text-xl tracking-[0.25em] uppercase text-zinc-900 font-medium">
                LuxeStay
              </h1>
              <span className="block text-[8px] tracking-[0.3em] text-stone-500 uppercase -mt-1">
                Architectural Residences
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center space-x-8 text-xs uppercase tracking-widest text-stone-600 font-medium">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => onSelectCategory?.(cat.value)}
                  className={`pb-1 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-zinc-900 border-b-2 border-zinc-900 font-semibold'
                      : 'hover:text-zinc-900 text-stone-500'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <a 
              href="/my-bookings" 
              className="hidden sm:inline-flex text-xs uppercase tracking-wider font-medium text-zinc-900 hover:text-amber-600 transition-colors px-3 py-2"
            >
              Host a Sanctuary
            </a>
            
            <button 
              onClick={() => setIsPrefsOpen(true)}
              className="p-2 text-stone-500 hover:text-zinc-900 transition-colors cursor-pointer" 
              aria-label="Language and Currency selection"
            >
              <Globe size={18} />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 border border-stone-300 bg-white hover:shadow-md transition-all rounded-full p-1.5 pl-3 cursor-pointer"
              >
                <Menu size={16} className="text-stone-600" />
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-medium">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : <User size={15} />}
                </div>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">Guest Account</p>
                    <p className="text-xs font-semibold text-zinc-900 truncate">{currentUser ? currentUser.name : 'Welcome'}</p>
                  </div>
                  <a href="/my-bookings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-800 hover:bg-stone-50">
                    <Calendar size={14} className="text-amber-600" />
                    <span>My Reservations</span>
                  </a>
                  {currentUser ? (
                    <button onClick={() => { setIsMenuOpen(false); onLogout?.(); }} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer">
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <button onClick={() => { setIsMenuOpen(false); onOpenAuth?.(); }} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-800 hover:bg-stone-50 cursor-pointer">
                      <LogIn size={14} className="text-stone-500" />
                      <span>Sign In / Register</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {isPrefsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs" onClick={() => setIsPrefsOpen(false)} />
          <div className="relative w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-2xl p-6 z-10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider">Regional Preferences</h3>
              <button onClick={() => setIsPrefsOpen(false)} className="p-1 text-stone-400 hover:text-zinc-900 rounded-full cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Currency */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">Currency</p>
              <div className="grid grid-cols-2 gap-2">
                {['USD ($)', 'EUR (€)', 'GBP (£)', 'LKR (Rs)'].map((curr) => (
                  <button
                    key={curr}
                    onClick={() => onCurrencyChange?.(curr)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      currency === curr ? 'border-zinc-900 bg-stone-50 text-zinc-900' : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    <span>{curr}</span>
                    {currency === curr && <Check size={14} className="text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">Language</p>
              <div className="space-y-1.5">
                {['English (US)', 'Français', 'Deutsch'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => onLanguageChange?.(lang)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      language === lang ? 'border-zinc-900 bg-stone-50 text-zinc-900' : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    <span>{lang}</span>
                    {language === lang && <Check size={14} className="text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsPrefsOpen(false)}
              className="w-full bg-zinc-900 hover:bg-amber-600 text-white py-3 rounded-xl text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </>
  );
};