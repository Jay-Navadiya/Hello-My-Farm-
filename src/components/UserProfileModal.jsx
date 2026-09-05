import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { X, User, Phone, Mail, ShieldCheck, CheckCircle2, Save, Smartphone, Globe } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, updateUserProfile } = useBooking();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg('');
    try {
      await updateUserProfile({ name, email, mobile });
      setMsg('Profile updated successfully!');
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const providers = user?.authProviders || ['mobile'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl glass-modal relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white">User Profile & Account</h3>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {msg && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs rounded-xl font-medium">
            {msg}
          </div>
        )}

        <form onSubmit={handleSave} className="py-6 space-y-4 text-xs">
          
          {/* User Role Badge */}
          <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <span className="font-bold text-white block">{user?.name || 'Valued Guest'}</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">{user?.role || 'User'} Account</span>
              </div>
            </div>

            <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
              VERIFIED
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Mobile Number (Verified)</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white"
                required
              />
            </div>
          </div>

          {/* Connected Authentication Providers */}
          <div className="pt-2">
            <label className="block font-bold text-slate-400 mb-1.5 uppercase text-[10px] tracking-wider">
              Connected Authentication Methods
            </label>
            <div className="flex flex-wrap gap-2">
              {providers.map((p, idx) => (
                <span key={idx} className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded-lg flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="capitalize">{p}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl transition shadow-lg text-xs flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Settings'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
