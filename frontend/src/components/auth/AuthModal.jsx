import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { loginUser, registerUser } from '../../services/api';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('guest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginUser({ email, password });
        setSuccess('Authenticated successfully! Welcome back.');
        setTimeout(() => {
          onAuthSuccess(res.data?.user);
          onClose();
        }, 800);
      } else {
        const res = await registerUser({ name, email, password, role });
        setSuccess('Account created successfully! Welcome to LuxeStay.');
        setTimeout(() => {
          onAuthSuccess(res.data?.user);
          onClose();
        }, 800);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Authentication failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-2xl p-6 sm:p-8 z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-zinc-900 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-[10px] uppercase tracking-widest text-amber-600 font-semibold block mb-1">
              Sanctuary Access
            </span>
            <h2 className="font-serif text-2xl text-zinc-900 font-normal">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {isLogin
                ? 'Sign in to manage your reservations and bookings'
                : 'Join LuxeStay to reserve and host luxury sanctuaries'}
            </p>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <Check size={14} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alexander Sterling"
                    className="w-full pl-9 pr-3 py-2 text-xs text-zinc-900 border border-stone-200 rounded-lg focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs text-zinc-900 border border-stone-200 rounded-lg focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-stone-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs text-zinc-900 border border-stone-200 rounded-lg focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('guest')}
                    className={`py-2 text-xs rounded-lg border font-medium transition-all ${
                      role === 'guest'
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    Guest Traveler
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('host')}
                    className={`py-2 text-xs rounded-lg border font-medium transition-all ${
                      role === 'host'
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    Property Host
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-3 rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors disabled:opacity-50 mt-2 cursor-pointer shadow-xs"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="text-center mt-6 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="text-xs text-stone-600 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              {isLogin ? (
                <>Don't have an account? <span className="font-semibold text-amber-600 underline">Register</span></>
              ) : (
                <>Already have an account? <span className="font-semibold text-amber-600 underline">Sign In</span></>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};