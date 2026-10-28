import { Star, Users, Bed, Bath, MapPin, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { translations } from '../../utils/translations';

export const VillaCard = ({ property, onSelect, currency = 'LKR (Rs)', language = 'English (US)' }) => {
  const t = translations[language] || translations['English (US)'];
  const coverImage = property.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800';

  const formatPrice = (amountInLKR, curr) => {
    if (!amountInLKR) return '0';
    const rates = {
      'USD ($)': { rate: 0.0033, symbol: '$' },
      'EUR (€)': { rate: 0.0031, symbol: '€' },
      'GBP (£)': { rate: 0.0026, symbol: '£' },
      'LKR (Rs)': { rate: 1, symbol: 'Rs. ' },
    };
    const selected = rates[curr] || rates['LKR (Rs)'];
    const converted = Math.round(amountInLKR * selected.rate);
    return `${selected.symbol}${converted.toLocaleString()}`;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onClick={() => onSelect(property)}
      className="group cursor-pointer flex flex-col bg-luxe-surface border border-luxe-border rounded-xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img src={coverImage} alt={property.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute top-3 left-3">
          <span className="bg-luxe-surface/90 backdrop-blur-md text-luxe-primary text-[9px] uppercase tracking-luxury px-2.5 py-1 font-medium rounded-full">
            {property.propertyType}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-xs text-luxe-muted mb-1">
          <MapPin size={12} className="text-luxe-amber shrink-0" />
          <span className="truncate">{property.location?.city}, {property.location?.country}</span>
        </div>
        <h3 className="font-serif text-lg text-luxe-primary font-normal leading-snug line-clamp-1 mb-1 group-hover:text-luxe-amber">{property.title}</h3>
        
        <div className="pt-3 mt-2 border-t border-stone-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-base font-bold text-luxe-primary">
              {formatPrice(property.pricePerNight, currency)}
            </span>
            <span className="text-xs text-luxe-muted">{t.night}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-luxe-emerald font-medium">
            {t.verifiedSanctuary}
          </span>
        </div>
      </div>
    </motion.article>
  );
};