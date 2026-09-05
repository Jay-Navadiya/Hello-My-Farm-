import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { 
  MapPin, User, ShieldCheck, Calendar, PlusCircle, Building, ChevronDown, LogOut, PhoneCall, Sparkles, Palette, Settings, Wrench
} from 'lucide-react';

export default function Navbar({ 
  onOpenAuth, 
  onOpenAdmin, 
  onOpenMyBookings, 
  onOpenOwnerDashboard, 
  onOpenAddProperty,
  onOpenUserProfile,
  onOpenAI,
  onOpenThemeCustomizer
}) {
  const { selectedCity, setShowCityModal, user, logoutUser } = useBooking();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  const userEmail = (user?.email || '').toLowerCase().trim();
  const isAdmin = user.isLoggedIn && (
    user.role === 'admin' || 
    userEmail === 'gaurang.smv2501@gmail.com' || 
    userEmail === 'admin@farmhousehub.in'
  );

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2">
        
        {/* Brand Logo & City Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <a href="#" className="flex items-center space-x-2 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-950 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="text-xl">🏡</span>
              </div>
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white font-heading group-hover:text-emerald-400 transition">
                FarmStay <span className="text-emerald-400">India</span>
              </span>
              <span className="block text-[9px] sm:text-[10px] text-slate-400 font-mono tracking-wider">GUJARAT & INDIA</span>
            </div>
          </a>

          {/* Location Picker Pill */}
          <button
            onClick={() => setShowCityModal(true)}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 px-2.5 sm:px-3.5 py-2 rounded-2xl transition text-xs shadow-sm shrink-0"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-slate-200 text-xs">{selectedCity?.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Action Buttons & Settings Dropdown */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          
          {/* ⚙️ SETTINGS & CONTROLS DROPDOWN MENU */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSettingsDropdown(!showSettingsDropdown);
                setShowUserDropdown(false);
              }}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 px-3 py-2 rounded-xl text-xs font-extrabold transition whitespace-nowrap shadow-sm"
            >
              <Settings className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>Settings</span>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
            </button>

            {showSettingsDropdown && (
              <>
                {/* Backdrop to close dropdown on click outside */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowSettingsDropdown(false)} 
                />

                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2.5 z-50 animate-fade-in text-xs space-y-1">
                  <div className="px-3.5 py-1.5 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-white uppercase text-[10px] tracking-wider text-slate-400">Settings & Controls</span>
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("[Navbar] 'Admin Control Portal' clicked in Settings dropdown");
                      setShowSettingsDropdown(false);
                      if (typeof onOpenAdmin === 'function') {
                        onOpenAdmin();
                      } else {
                        console.warn("[Navbar] onOpenAdmin callback prop was not provided");
                      }
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-amber-500/20 text-amber-300 font-extrabold flex items-center space-x-2.5 transition"
                  >
                    <ShieldCheck className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                    <div>
                      <span className="block text-amber-300 text-xs font-extrabold">Admin Control Portal</span>
                      <span className="text-[10px] text-slate-400 font-normal">Approve, edit & remove farmhouses</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowSettingsDropdown(false);
                      if (typeof onOpenThemeCustomizer === 'function') onOpenThemeCustomizer();
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800 text-emerald-300 font-bold flex items-center space-x-2.5 transition"
                  >
                    <Palette className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="block text-white text-xs font-bold">Theme & Colors Editor</span>
                      <span className="text-[10px] text-slate-400 font-normal">Change colors, bg images & fonts</span>
                    </div>
                  </button>

                  <div className="border-t border-slate-800 my-1"></div>

                  {/* Owner Dashboard */}
                  <button
                    onClick={() => {
                      setShowSettingsDropdown(false);
                      if (typeof onOpenOwnerDashboard === 'function') onOpenOwnerDashboard();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-300 flex items-center space-x-2.5 transition"
                  >
                    <Building className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>My Properties / Owner Panel</span>
                  </button>

                  {/* Add Property */}
                  <button
                    onClick={() => {
                      setShowSettingsDropdown(false);
                      if (typeof onOpenAddProperty === 'function') onOpenAddProperty();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-300 flex items-center space-x-2.5 transition"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Add New Farmhouse Listing</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* User Auth / Profile Dropdown */}
          <div className="relative shrink-0">
            {user.isLoggedIn ? (
              <div>
                <button
                  onClick={() => {
                    setShowUserDropdown(!showUserDropdown);
                    setShowSettingsDropdown(false);
                  }}
                  className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-xl text-xs text-slate-200 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline font-medium">{user.name || 'Account'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showUserDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserDropdown(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in text-xs space-y-1">
                      <div className="px-3.5 py-2 border-b border-slate-800">
                        <p className="font-semibold text-white">{user.name || 'Verified User'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{user.email || user.mobile}</p>
                      </div>

                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          console.log("[Navbar] 'Admin Control Portal' clicked in User dropdown"); 
                          setShowUserDropdown(false); 
                          if (typeof onOpenAdmin === 'function') {
                            onOpenAdmin();
                          } else {
                            console.warn("[Navbar] onOpenAdmin callback prop was not provided");
                          }
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-amber-500/20 text-amber-300 font-extrabold flex items-center space-x-2 transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Admin Control Portal</span>
                      </button>

                      <button
                        onClick={() => { setShowUserDropdown(false); if (typeof onOpenUserProfile === 'function') onOpenUserProfile(); }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center space-x-2 transition"
                      >
                        <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>My Profile Settings</span>
                      </button>

                      <button
                        onClick={() => { setShowUserDropdown(false); if (typeof onOpenMyBookings === 'function') onOpenMyBookings(); }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center space-x-2 transition"
                      >
                        <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>My Bookings History</span>
                      </button>

                      <div className="border-t border-slate-800 my-1"></div>

                      <button
                        onClick={() => { setShowUserDropdown(false); logoutUser(); }}
                        className="w-full text-left px-3.5 py-2 hover:bg-rose-950/40 text-rose-400 flex items-center space-x-2 font-medium transition"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={onOpenAuth}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center space-x-1"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </nav>
  );
}
