import { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

export const SearchBar = ({ onSearch }) => {
  const [city, setCity] = useState('');
  const [guests, setGuests] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch({ city, guests, propertyType });
  };

  return (
    <div className="w-full max-w-4xl mx-auto -mt-8 relative z-20 px-4">
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white border border-stone-200 rounded-2xl shadow-xl p-3 grid grid-cols-1 md:grid-cols-4 gap-2 divide-y md:divide-y-0 md:divide-x divide-stone-200"
      >
        {/* Destination Location */}
        <div className="px-4 py-2 flex flex-col justify-center">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 flex items-center gap-1.5">
            <MapPin size={12} className="text-amber-600" />
            Destination
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Mirissa, Colombo..."
            className="w-full text-xs text-zinc-900 font-medium focus:outline-none bg-transparent placeholder:text-stone-400 mt-1"
          />
        </div>

        {/* Sanctuary Tier */}
        <div className="px-4 py-2 flex flex-col justify-center">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 flex items-center gap-1.5">
            <Calendar size={12} className="text-amber-600" />
            Category
          </label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full text-xs text-zinc-900 font-medium focus:outline-none bg-transparent mt-1 cursor-pointer"
          >
            <option value="">All Architectures</option>
            <option value="villa">Cliffside Villa</option>
            <option value="penthouse">Sky Penthouse</option>
            <option value="chalet">Alpine Chalet</option>
            <option value="beachfront">Beachfront</option>
          </select>
        </div>

        {/* Guest Allocation */}
        <div className="px-4 py-2 flex flex-col justify-center">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 flex items-center gap-1.5">
            <Users size={12} className="text-amber-600" />
            Guests
          </label>
          <input
            type="number"
            min="1"
            max="16"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            placeholder="No. of guests"
            className="w-full text-xs text-zinc-900 font-medium focus:outline-none bg-transparent placeholder:text-stone-400 mt-1"
          />
        </div>

        {/* Action Submit Button */}
        <div className="px-2 py-1 flex items-center justify-end">
          <button
            type="submit"
            className="w-full md:w-auto h-full bg-zinc-900 hover:bg-amber-600 text-white rounded-xl px-6 py-3 flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-semibold transition-all shadow-md cursor-pointer"
          >
            <Search size={14} className="text-white shrink-0" />
            <span>Search</span>
          </button>
        </div>
      </form>
    </div>
  );
};