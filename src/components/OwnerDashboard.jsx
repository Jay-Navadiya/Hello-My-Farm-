import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { Building, Plus, Edit3, Trash2, ShieldAlert, CheckCircle2, Clock, X, AlertCircle } from 'lucide-react';

export default function OwnerDashboard({ isOpen, onClose, onOpenAddProperty, onEditProperty }) {
  const { myProperties, fetchMyProperties, deleteProperty, getOwnerBookings } = useBooking();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('properties'); // 'properties', 'bookings'
  const [ownerBookings, setOwnerBookings] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchMyProperties().finally(() => setLoading(false));
      getOwnerBookings().then(b => setOwnerBookings(b || []));
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full my-auto p-6 sm:p-8 shadow-2xl glass-modal relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Owner Portal</h3>
              <p className="text-xs text-slate-400">Manage your farmhouses, view guest bookings & submission statuses</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenAddProperty}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Property</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-800 pt-3 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'properties'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            My Properties ({myProperties.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'bookings'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Guest Bookings on My Farms ({ownerBookings.length})
          </button>
        </div>

        {/* Content List */}
        <div className="overflow-y-auto py-6 space-y-4 flex-1 pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading data...</div>
          ) : activeTab === 'bookings' ? (
            <div className="space-y-3">
              {ownerBookings.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  No guest bookings recorded for your properties yet.
                </div>
              ) : (
                ownerBookings.map(b => (
                  <div key={b.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center font-bold text-white">
                      <span>{b.propertyName}</span>
                      <span className="text-emerald-400 font-mono text-sm">₹{b.totalAmount?.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300 font-medium pt-1 border-t border-slate-800/60">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Guest Name:</span>
                        <span>{b.guestName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Contact Mobile:</span>
                        <span>{b.guestMobile}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Check-In / Out:</span>
                        <span className="font-mono text-emerald-400">{b.checkInDate} to {b.checkOutDate}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 text-[11px] font-mono text-slate-400">
                      <span>Booking ID: {b.id}</span>
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold uppercase">{b.bookingStatus}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : myProperties.length === 0 ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <Building className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No Properties Listed Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven\'t added any farmhouse or villa properties. Click the button below to submit your property for admin approval.
              </p>
              <button
                onClick={onOpenAddProperty}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Your Property</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myProperties.map(p => {
                let statusBadge = (
                  <span className="bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Pending Approval</span>
                  </span>
                );

                if (p.status === 'approved') {
                  statusBadge = (
                    <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approved & Live</span>
                    </span>
                  );
                } else if (p.status === 'rejected') {
                  statusBadge = (
                    <span className="bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Rejected</span>
                    </span>
                  );
                }

                return (
                  <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 relative group">
                    <div className="h-36 rounded-xl overflow-hidden relative bg-slate-900">
                      <img src={p.images?.[0]} alt={p.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">
                        {statusBadge}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{p.title}</h4>
                      <p className="text-xs text-slate-400">{p.areaName} • {p.bedrooms} BHK</p>
                    </div>

                    {p.status === 'rejected' && p.rejectionReason && (
                      <div className="p-2.5 bg-rose-950/40 border border-rose-800/40 rounded-xl text-[11px] text-rose-300 flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Rejection Reason:</span>
                          <span>{p.rejectionReason}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        ₹{p.price24h?.toLocaleString()}/24h
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onEditProperty(p)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-semibold transition flex items-center space-x-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${p.title}?`)) {
                              deleteProperty(p.id);
                            }
                          }}
                          className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl transition"
                          title="Delete Property"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
