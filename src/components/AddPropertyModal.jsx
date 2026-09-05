import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { CITIES } from '../data/cities';
import { X, Plus, Trash2, Building, DollarSign, Image, Shield, Check, Sparkles } from 'lucide-react';

export default function AddPropertyModal({ isOpen, onClose, editProperty = null, onSave }) {
  const { submitProperty, editProperty: contextEditProperty } = useBooking();

  const [formData, setFormData] = useState({
    title: '',
    cityId: 'surat',
    areaId: 'dumas',
    areaName: 'Dumas Road & Beach',
    bedrooms: 3,
    bathrooms: 3,
    sqft: 15000,
    maxStayGuests: 12,
    maxDayGuests: 35,
    price6h: 3800,
    price12h: 6200,
    price24h: 9800,
    securityDeposit: 2500,
    refundableDepositInfo: 'Full security deposit refunded upon checkout.',
    couplesAllowed: true,
    petsAllowed: true,
    loudMusicAllowed: 'Allowed till 11:00 PM',
    address: 'Sector 4, Dumas Beach Expressway, Surat',
    description: 'Beautiful modern pool villa with luxury lawn, rain dance arena, and spacious AC rooms.',
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
    ]
  });

  const [newImageInput, setNewImageInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editProperty) {
      setFormData(editProperty);
    } else {
      setFormData({
        title: '',
        cityId: 'surat',
        areaId: 'dumas',
        areaName: 'Dumas Road & Beach',
        bedrooms: 3,
        bathrooms: 3,
        sqft: 15000,
        maxStayGuests: 12,
        maxDayGuests: 35,
        price6h: 3800,
        price12h: 6200,
        price24h: 9800,
        securityDeposit: 2500,
        refundableDepositInfo: 'Full security deposit refunded upon checkout.',
        couplesAllowed: true,
        petsAllowed: true,
        loudMusicAllowed: 'Allowed till 11:00 PM',
        address: 'Sector 4, Dumas Beach Expressway, Surat',
        description: 'Beautiful modern pool villa with luxury lawn, rain dance arena, and spacious AC rooms.',
        images: [
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
        ]
      });
    }
  }, [editProperty, isOpen]);

  if (!isOpen) return null;

  const handleCityChange = (e) => {
    const cid = e.target.value;
    const foundCity = CITIES.find(c => c.id === cid);
    setFormData(prev => ({
      ...prev,
      cityId: cid,
      areaId: foundCity?.areas[0]?.id || 'default',
      areaName: foundCity?.areas[0]?.name || 'Central'
    }));
  };

  const handleAddImage = () => {
    if (newImageInput.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images, newImageInput.trim()] }));
      setNewImageInput('');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (onSave) {
        await onSave(formData);
      } else if (editProperty) {
        await contextEditProperty(editProperty.id, formData);
        alert('Property details updated successfully!');
        onClose();
      } else {
        await submitProperty(formData);
        alert('New property submitted successfully! It is now pending Admin approval.');
        onClose();
      }
    } catch (err) {
      alert(`Property Submission Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full my-auto p-6 sm:p-8 shadow-2xl glass-modal relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Property Owner Portal</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {editProperty ? 'Edit Property Details' : 'Add New Farmhouse Property'}
            </h3>
            <p className="text-xs text-slate-400">Submissions default to Pending Approval until Admin review</p>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 text-xs pr-1 flex-1">
          
          <div>
            <label className="block text-slate-300 font-bold mb-1">Farmhouse Title / Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Palms Luxury Villa"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          {/* City & Area selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">City</label>
              <select
                value={formData.cityId}
                onChange={handleCityChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                {CITIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Area Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dumas Road"
                value={formData.areaName}
                onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Bedrooms (BHK)</label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Area (Sq. Ft.)</label>
              <input
                type="number"
                value={formData.sqft}
                onChange={(e) => setFormData({ ...formData, sqft: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Stay Guests</label>
              <input
                type="number"
                value={formData.maxStayGuests}
                onChange={(e) => setFormData({ ...formData, maxStayGuests: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Day Event Guests</label>
              <input
                type="number"
                value={formData.maxDayGuests}
                onChange={(e) => setFormData({ ...formData, maxDayGuests: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Slot Packages Pricing */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-emerald-400">Pricing Packages (6h / 12h / 24h) & Security Deposit</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">6-Hour Rate (₹)</label>
                <input
                  type="number"
                  value={formData.price6h}
                  onChange={(e) => setFormData({ ...formData, price6h: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">12-Hour Rate (₹)</label>
                <input
                  type="number"
                  value={formData.price12h}
                  onChange={(e) => setFormData({ ...formData, price12h: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">24-Hour Rate (₹)</label>
                <input
                  type="number"
                  value={formData.price24h}
                  onChange={(e) => setFormData({ ...formData, price24h: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Security Deposit (₹)</label>
                <input
                  type="number"
                  value={formData.securityDeposit}
                  onChange={(e) => setFormData({ ...formData, securityDeposit: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">Property Overview & Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          {/* Image URLs Manager */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">Photos (Image URLs)</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={newImageInput}
                onChange={(e) => setNewImageInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl"
              >
                Add Image
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group w-16 h-12 rounded-lg overflow-hidden border border-slate-800">
                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 bg-red-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-xl shadow-lg"
            >
              {submitting ? 'Submitting...' : editProperty ? 'Save Changes' : 'Submit Property for Approval'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
