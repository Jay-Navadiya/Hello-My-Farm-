import React from 'react';
import { useBooking } from '../context/BookingContext';
import { Calendar, Users, MapPin, Search, RotateCcw, Filter } from 'lucide-react';

export default function SearchFilterBar() {
  const { selectedCity, searchParams, setSearchParams } = useBooking();

  const handleDateChange = (e) => {
    setSearchParams(prev => ({ ...prev, checkInDate: e.target.value }));
  };

  const handleGuestChange = (e) => {
    setSearchParams(prev => ({ ...prev, guestCount: Number(e.target.value) }));
  };

  const handleAreaChange = (e) => {
    setSearchParams(prev => ({ ...prev, selectedAreaId: e.target.value }));
  };

  const handleQueryChange = (e) => {
    setSearchParams(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const resetFilters = () => {
    setSearchParams({
      checkInDate: new Date().toISOString().split('T')[0],
      guestCount: 1,
      selectedAreaId: 'all',
      searchQuery: ''
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl glass-panel relative z-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Date Selector */}
        <div className="bg-slate-950/80 border border-slate-800 focus-within:border-emerald-500/60 rounded-2xl p-3 flex items-center space-x-3 transition">
          <Calendar className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Check-In Date
            </label>
            <input
              type="date"
              value={searchParams.checkInDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none w-full cursor-pointer"
            />
          </div>
        </div>

        {/* Guest Count Selector */}
        <div className="bg-slate-950/80 border border-slate-800 focus-within:border-emerald-500/60 rounded-2xl p-3 flex items-center space-x-3 transition">
          <Users className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Guests Capacity
            </label>
            <select
              value={searchParams.guestCount}
              onChange={handleGuestChange}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none w-full cursor-pointer"
            >
              <option value={1} className="bg-slate-900">Any Capacity (1+ Guests)</option>
              <option value={8} className="bg-slate-900">Small Group (8+ Guests)</option>
              <option value={15} className="bg-slate-900">Medium Party (15+ Guests)</option>
              <option value={30} className="bg-slate-900">Large Event (30+ Guests)</option>
              <option value={50} className="bg-slate-900">Grand Celebration (50+ Guests)</option>
            </select>
          </div>
        </div>

        {/* Area Filter Selector */}
        <div className="bg-slate-950/80 border border-slate-800 focus-within:border-emerald-500/60 rounded-2xl p-3 flex items-center space-x-3 transition">
          <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Area in {selectedCity?.name}
            </label>
            <select
              value={searchParams.selectedAreaId}
              onChange={handleAreaChange}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none w-full cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Areas in {selectedCity?.name}</option>
              {selectedCity?.areas?.map(area => (
                <option key={area.id} value={area.id} className="bg-slate-900">
                  {area.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Search Box & Reset */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-slate-950/80 border border-slate-800 focus-within:border-emerald-500/60 rounded-2xl p-3 flex items-center space-x-2 transition">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Filter by villa name, pool, rain dance..."
              value={searchParams.searchQuery}
              onChange={handleQueryChange}
              className="bg-transparent text-xs font-medium text-white focus:outline-none w-full"
            />
          </div>

          {(searchParams.selectedAreaId !== 'all' || searchParams.searchQuery || searchParams.guestCount > 1) && (
            <button
              onClick={resetFilters}
              title="Reset Filters"
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
