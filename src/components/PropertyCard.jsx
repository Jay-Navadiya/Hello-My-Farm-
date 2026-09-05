import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { Star, Heart, Bed, Users, Maximize2, Waves, Sparkles, MapPin, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

export default function PropertyCard({ property, onSelect }) {
  const { favorites, toggleFavorite } = useBooking();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const isFav = favorites.includes(property.id);

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'];

  const nextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleCardClick = (e) => {
    if (typeof onSelect === 'function' && property) {
      onSelect(property);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/40 flex flex-col cursor-pointer glass-card"
    >
      {/* Image Slider Container */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-950">
        <img 
          src={images[currentImgIndex]} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          {property.isTopRated && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-xl shadow-md uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              <span>TOP RATED</span>
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition ${
            isFav 
              ? 'bg-rose-500/90 text-white shadow-lg shadow-rose-950' 
              : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
        </button>

        {/* Image Navigation Arrows */}
        {images.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition">
            <button 
              onClick={prevImg}
              className="p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white backdrop-blur-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextImg}
              className="p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white backdrop-blur-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Image Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center space-x-1">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentImgIndex ? 'bg-white w-4' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        {/* Rating & Area Pill */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-slate-200 text-xs font-semibold bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span className="line-clamp-1">{property.areaName}</span>
          </div>

          <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{property.rating}</span>
            <span className="text-slate-400 font-normal">({property.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition line-clamp-1">
            {property.title}
          </h3>

          {/* Key Specs */}
          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-2">
            <span className="flex items-center space-x-1">
              <Bed className="w-3.5 h-3.5 text-emerald-400" />
              <span>{property.bedrooms} BHK</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{property.maxStayGuests} Stay ({property.maxDayGuests} Day)</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{property.sqft?.toLocaleString()} SqFt</span>
            </span>
          </div>

          {/* Top Amenities Pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {property.amenities?.slice(0, 3).map((amenity, idx) => (
              <span 
                key={idx}
                className="bg-slate-800/60 border border-slate-700/50 text-slate-300 text-[11px] px-2 py-0.5 rounded-lg flex items-center space-x-1"
              >
                <Waves className="w-3 h-3 text-emerald-400" />
                <span>{amenity.name}</span>
              </span>
            ))}
            {property.amenities?.length > 3 && (
              <span className="bg-slate-800/40 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-lg">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Booking Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Starts from</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-extrabold text-white">₹{property.price6h?.toLocaleString('en-IN')}</span>
              <span className="text-xs text-slate-400 font-normal">/ 6 Hours</span>
            </div>
          </div>

          <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-md shadow-emerald-950 flex items-center space-x-1">
            <span>Book Slot</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
