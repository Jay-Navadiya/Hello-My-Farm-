import React, { useState } from 'react';
import PropertyCard from './PropertyCard';
import { MapPin, ArrowRight, Sparkles, X, ChevronRight } from 'lucide-react';

export default function AreaSection({ area, properties, onSelectProperty }) {
  const [showAllDrawer, setShowAllDrawer] = useState(false);

  // Filter properties for this specific area
  const areaProperties = properties.filter(p => {
    if (!p.areaName && !p.areaId) return true;
    const pAreaName = (p.areaName || '').toLowerCase().trim();
    const pAreaId = (p.areaId || '').toLowerCase().trim();
    const areaName = (area.name || '').toLowerCase().trim();
    const areaId = (area.id || '').toLowerCase().trim();

    return pAreaName === areaName || 
           pAreaId === areaId || 
           (areaId && pAreaName.includes(areaId)) || 
           (areaName && pAreaName.includes(areaName)) ||
           (pAreaName && areaName.includes(pAreaName));
  });

  if (areaProperties.length === 0) return null;

  // Sort by rating descending
  const sortedProperties = [...areaProperties].sort((a, b) => (b.rating || 4.9) - (a.rating || 4.9));

  // Top 4 properties shown on homepage row
  const top4Properties = sortedProperties.slice(0, 4);

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>{area.name}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{area.description || 'Top rated weekend getaway pool villas'}</p>
        </div>

        {/* View All Button */}
        {sortedProperties.length > 0 && (
          <button
            onClick={() => setShowAllDrawer(true)}
            className="self-start sm:self-auto flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 px-3.5 py-1.5 rounded-xl transition"
          >
            <span>View All ({sortedProperties.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Grid of Top 4 Rated Farmhouses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {top4Properties.map(property => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            onSelect={onSelectProperty} 
          />
        ))}
      </div>

      {/* Expanded Modal/Drawer for "View All" in this Area */}
      {showAllDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full p-6 md:p-8 shadow-2xl glass-modal max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>Area View All</span>
                </div>
                <h3 className="text-2xl font-bold text-white">All Farmhouses in {area.name}</h3>
                <p className="text-xs text-slate-400 mt-1">Showing all {sortedProperties.length} available pool villas and farm stays in this area.</p>
              </div>

              <button
                onClick={() => setShowAllDrawer(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto pr-1 flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 py-6">
              {sortedProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={(p) => {
                    setShowAllDrawer(false);
                    onSelectProperty(p);
                  }}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAllDrawer(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-5 py-2.5 rounded-xl transition"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
