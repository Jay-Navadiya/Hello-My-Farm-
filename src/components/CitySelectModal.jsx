import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { CITIES } from '../data/cities';
import { MapPin, Navigation, Search, Check, Sparkles, X, Globe } from 'lucide-react';

export default function CitySelectModal({ isOpen, onClose }) {
  const { selectedCity, setSelectedCity, autoDetectGPSLocation } = useBooking();
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState(null);
  const [citySearch, setCitySearch] = useState('');

  if (!isOpen) return null;

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    onClose();
  };

  const handleGPSClick = async () => {
    setGpsLoading(true);
    setGpsMessage(null);
    try {
      const res = await autoDetectGPSLocation();
      setGpsMessage(`Matched ${res.city.name} (${res.distanceKm} km away)`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setGpsMessage(`Location error: ${err}`);
    } finally {
      setGpsLoading(false);
    }
  };

  const filteredCities = CITIES.filter(c => 
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.state.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.tagline.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl overflow-hidden relative glass-modal max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Location Engine</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Select Your Destination</h2>
            <p className="text-slate-400 text-sm mt-1">
              Explore top farmhouses and weekend pool villas in Gujarat & surrounding getaways.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS "Near Me" Button & Search Bar */}
        <div className="py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* GPS Auto Detect */}
            <button
              onClick={handleGPSClick}
              disabled={gpsLoading}
              className="flex items-center justify-center space-x-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold py-3 px-5 rounded-2xl transition shadow-lg shadow-emerald-950/50 whitespace-nowrap"
            >
              <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Detecting Location...' : 'Near Me (GPS Auto)'}</span>
            </button>

            {/* City Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search city (e.g. Surat, Vadodara, Daman, Goa)..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-200 focus:outline-none transition"
              />
            </div>
          </div>

          {gpsMessage && (
            <div className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-2 rounded-xl flex items-center space-x-2 animate-fade-in">
              <Check className="w-4 h-4" />
              <span>{gpsMessage}</span>
            </div>
          )}
        </div>

        {/* City Grid */}
        <div className="overflow-y-auto pr-1 flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-2">
          {filteredCities.map(city => {
            const isSelected = selectedCity?.id === city.id;
            return (
              <div
                key={city.id}
                onClick={() => handleCitySelect(city)}
                className={`group relative cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300 ${
                  isSelected 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-slate-800/80 shadow-lg shadow-emerald-950' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-800/40'
                }`}
              >
                {/* Background Image */}
                <div className="h-32 w-full relative overflow-hidden">
                  <img 
                    src={city.image} 
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Popular Tag */}
                  {city.popular && (
                    <span className="absolute top-2.5 right-2.5 bg-amber-500/90 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Popular
                    </span>
                  )}

                  {isSelected && (
                    <span className="absolute top-2.5 left-2.5 bg-emerald-500 text-slate-950 p-1 rounded-full">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* City Details */}
                <div className="p-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                      {city.name}
                    </h3>
                    <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                      {city.state}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{city.tagline}</p>
                  
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <MapPin className="w-3 h-3" />
                      <span>{city.areas.length} Locations</span>
                    </span>
                    <span className="text-slate-400 group-hover:translate-x-0.5 transition">Select &rarr;</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Serving Surat, Vadodara, Daman, Goa & pan-India</span>
          </div>
          <button 
            onClick={() => handleCitySelect(CITIES[0])}
            className="text-emerald-400 hover:underline font-medium"
          >
            Browse All Cities
          </button>
        </div>

      </div>
    </div>
  );
}
