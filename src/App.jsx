import React, { useState, useEffect } from 'react';
import { BookingProvider, useBooking } from './context/BookingContext';
import Navbar from './components/Navbar';
import CitySelectModal from './components/CitySelectModal';
import SearchFilterBar from './components/SearchFilterBar';
import AreaSection from './components/AreaSection';
import PropertyDetailModal from './components/PropertyDetailModal';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import WhatsAppToast from './components/WhatsAppToast';
import AdminPanel from './components/AdminPanel';
import AddPropertyModal from './components/AddPropertyModal';
import OwnerDashboard from './components/OwnerDashboard';
import UserProfileModal from './components/UserProfileModal';
import AntigravityAIModal from './components/AntigravityAIModal';
import ThemeCustomizerModal from './components/ThemeCustomizerModal';
import ErrorBoundary from './components/ErrorBoundary';
import { Sparkles, ShieldCheck, Calendar, Waves, MessageSquare, Award, Palette, Bot } from 'lucide-react';

function MainAppContent() {
  const { 
    selectedCity, 
    showCityModal, 
    setShowCityModal, 
    searchParams, 
    properties, 
    bookings, 
    user,
    submitProperty,
    editProperty,
    whatsappToast,
    closeWhatsAppToast,
    siteTheme
  } = useBooking();

  // Modals state
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showMyBookingsModal, setShowMyBookingsModal] = useState(false);

  // New AI & Theme Customizer Modals State
  const [showAIModal, setShowAIModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Global event listener for opening property details from similar properties
  useEffect(() => {
    const handleOpenProp = (e) => {
      if (e.detail) {
        setSelectedProperty(e.detail);
      }
    };
    window.addEventListener('open-property', handleOpenProp);
    return () => window.removeEventListener('open-property', handleOpenProp);
  }, []);

  // Filter approved properties for current city & search params
  const currentCityId = (selectedCity?.id || 'surat').toLowerCase();
  const cityProperties = properties.filter(p => 
    !p.cityId || p.cityId.toLowerCase() === currentCityId
  );

  const filteredProperties = cityProperties.filter(p => {
    if (searchParams.selectedAreaId !== 'all') {
      const areaFilter = searchParams.selectedAreaId.toLowerCase();
      const pAreaId = (p.areaId || '').toLowerCase();
      const pAreaName = (p.areaName || '').toLowerCase();
      if (!pAreaId.includes(areaFilter) && !pAreaName.includes(areaFilter)) {
        return false;
      }
    }
    const maxCapacity = p.maxDayGuests || p.maxStayGuests || 50;
    if (searchParams.guestCount > 1 && maxCapacity < searchParams.guestCount) {
      return false;
    }
    if (searchParams.searchQuery) {
      const q = searchParams.searchQuery.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchArea = p.areaName?.toLowerCase().includes(q);
      const matchAmenity = p.amenities?.some(a => (typeof a === 'string' ? a : a.name)?.toLowerCase().includes(q));
      if (!matchTitle && !matchArea && !matchAmenity) return false;
    }
    return true;
  });

  // Construct dynamic areas list so EVERY approved property has an area section rendered
  const knownAreasMap = new Map();

  (selectedCity?.areas || []).forEach(a => {
    knownAreasMap.set(a.name.toLowerCase().trim(), a);
  });

  filteredProperties.forEach(p => {
    if (p.areaName) {
      const key = p.areaName.toLowerCase().trim();
      if (!knownAreasMap.has(key)) {
        knownAreasMap.set(key, {
          id: p.areaId || p.areaName.toLowerCase().replace(/\s+/g, '-'),
          name: p.areaName,
          description: `Luxury villas & farmhouses in ${p.areaName}`
        });
      }
    }
  });

  const allAreasList = Array.from(knownAreasMap.values());

  const areasToRender = searchParams.selectedAreaId !== 'all'
    ? allAreasList.filter(a => a.id === searchParams.selectedAreaId || a.name?.toLowerCase().includes(searchParams.selectedAreaId.toLowerCase()))
    : allAreasList;

  const handleProceedToCheckout = (checkoutDetails) => {
    setSelectedProperty(null);
    setCheckoutData(checkoutDetails);
    if (!user.isLoggedIn) {
      setShowAuthModal(true);
    }
  };

  const handleSaveProperty = async (data) => {
    try {
      if (editingProperty) {
        const res = await editProperty(editingProperty.id, data);
        alert(res.message);
      } else {
        const res = await submitProperty(data);
        alert(res.message);
      }
      setShowAddPropertyModal(false);
    } catch (err) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  const userEmail = (user?.email || '').toLowerCase().trim();
  const isAdminUser = user.isLoggedIn && (
    user.role === 'admin' || 
    userEmail === 'gaurang.smv2501@gmail.com' || 
    userEmail === 'admin@farmhousehub.in'
  );

  return (
    <div 
      className="min-h-screen text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-500 relative"
      style={{ backgroundColor: siteTheme?.bgColor || '#090d16' }}
    >
      
      {/* Dynamic Announcement / Discount Promo Banner */}
      {siteTheme?.promoBannerEnabled && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 text-slate-950 px-4 py-2 text-xs font-extrabold text-center flex items-center justify-center space-x-2 shadow-md">
          <Sparkles className="w-4 h-4 fill-slate-950 animate-pulse" />
          <span>{siteTheme?.promoBannerText}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenAdmin={() => {
          console.log("[App.jsx] Admin Control Portal trigger invoked -> Setting showAdminPanel to TRUE");
          setShowAdminPanel(true);
        }}
        onOpenMyBookings={() => setShowMyBookingsModal(true)}
        onOpenOwnerDashboard={() => {
          if (!user.isLoggedIn) {
            setShowAuthModal(true);
          } else {
            setShowOwnerDashboard(true);
          }
        }}
        onOpenAddProperty={() => {
          if (!user.isLoggedIn) {
            setShowAuthModal(true);
          } else {
            setEditingProperty(null);
            setShowAddPropertyModal(true);
          }
        }}
        onOpenUserProfile={() => setShowUserProfileModal(true)}
        onOpenAI={() => setShowAIModal(true)}
        onOpenThemeCustomizer={() => setShowThemeModal(true)}
      />

      {/* Hero Header Section */}
      <div className="relative pt-8 pb-12 overflow-hidden">
        
        {/* Dynamic Wallpaper Overlay if set */}
        {siteTheme?.heroBgImage && (
          <div className="absolute inset-0 z-0 opacity-20 transition-all duration-700">
            <img src={siteTheme.heroBgImage} alt="Hero Wallpaper" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950" />
          </div>
        )}

        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-950/60 border border-emerald-800/60 px-4 py-1.5 rounded-full text-xs font-semibold text-emerald-300 animate-fade-in shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gujarat's #1 Full-Stack Real-Time Booking Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight font-heading max-w-4xl mx-auto leading-tight">
            {siteTheme?.heroTitle || 'Rent Luxury Farmhouses & Pool Villas in'} <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">{selectedCity?.name}</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-medium">
            {siteTheme?.heroSubtitle || 'Dynamic UPI QR Payment, Server Double-Booking Locking, User Property Approvals & Automated WhatsApp Confirmations.'}
          </p>

          <div className="max-w-5xl mx-auto pt-4">
            <SearchFilterBar />
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-400">
            <div className="flex items-center space-x-1.5 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Server-Side Payment Verification</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Automated WhatsApp SMS Alerts</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Admin Approval Review Workflow</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Area-Wise Property Rows */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-16 relative z-10">
        
        {filteredProperties.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Waves className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No Approved Farmhouses Found</h3>
            <p className="text-xs text-slate-400">
              Try resetting your search filters or explore another city. Only Admin-Approved properties are visible publicly.
            </p>
            <button
              onClick={() => setShowCityModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
            >
              Explore Other Cities
            </button>
          </div>
        ) : (
          areasToRender.map(area => (
            <AreaSection
              key={area.id}
              area={area}
              properties={filteredProperties}
              onSelectProperty={(prop) => setSelectedProperty(prop)}
            />
          ))
        )}

      </main>

      {/* Floating Action Control for Theme Editor (ADMIN ONLY) */}
      {isAdminUser && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center space-x-2">
          <button
            onClick={() => setShowThemeModal(true)}
            className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-extrabold px-4.5 py-3.5 rounded-2xl transition shadow-2xl flex items-center space-x-2 text-xs border border-white/20"
            title="Live Theme & Appearance Editor"
          >
            <Palette className="w-5 h-5" />
            <span>Edit Theme</span>
          </button>
        </div>
      )}

      {/* Modals & Dashboard Overlays */}

      <CitySelectModal
        isOpen={showCityModal}
        onClose={() => setShowCityModal(false)}
      />

      <ErrorBoundary onReset={() => setSelectedProperty(null)}>
        <PropertyDetailModal
          property={selectedProperty}
          isOpen={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onProceedToCheckout={handleProceedToCheckout}
        />
      </ErrorBoundary>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <CheckoutModal
        checkoutData={checkoutData}
        isOpen={!!checkoutData}
        onClose={() => setCheckoutData(null)}
      />

      <WhatsAppToast
        toastData={whatsappToast}
        onClose={closeWhatsAppToast}
      />

      <ErrorBoundary onReset={() => setShowAdminPanel(false)}>
        <AdminPanel
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
          onOpenAddProperty={() => {
            setEditingProperty(null);
            setShowAddPropertyModal(true);
          }}
          onEditProperty={(prop) => {
            setEditingProperty(prop);
            setShowAddPropertyModal(true);
          }}
          onOpenAI={() => setShowAIModal(true)}
          onOpenThemeCustomizer={() => setShowThemeModal(true)}
        />
      </ErrorBoundary>

      <OwnerDashboard
        isOpen={showOwnerDashboard}
        onClose={() => setShowOwnerDashboard(false)}
        onOpenAddProperty={() => {
          setEditingProperty(null);
          setShowAddPropertyModal(true);
        }}
        onEditProperty={(prop) => {
          setEditingProperty(prop);
          setShowAddPropertyModal(true);
        }}
      />

      <UserProfileModal
        isOpen={showUserProfileModal}
        onClose={() => setShowUserProfileModal(false)}
      />

      <AddPropertyModal
        isOpen={showAddPropertyModal}
        onClose={() => {
          setShowAddPropertyModal(false);
          setEditingProperty(null);
        }}
        onSave={handleSaveProperty}
        initialData={editingProperty}
      />

      {/* Antigravity AI Modal */}
      <AntigravityAIModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onOpenThemeCustomizer={() => setShowThemeModal(true)}
      />

      {/* Theme & Visual Appearance Customizer Modal */}
      <ThemeCustomizerModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />

      {/* Footer Branding */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <span className="font-bold text-white">FarmStay India™</span>
          <span>•</span>
          <span>Powered by Antigravity AI Engine</span>
        </div>
        <div className="flex items-center justify-center space-x-4 pt-1 text-[11px]">
          {isAdminUser && (
            <>
              <button onClick={() => setShowThemeModal(true)} className="text-emerald-400 font-bold hover:underline flex items-center space-x-1">
                <Palette className="w-3.5 h-3.5" />
                <span>Theme & Colors Editor</span>
              </button>
              <span>|</span>
            </>
          )}
          <button 
            onClick={() => {
              console.log("[Footer] Admin Portal button clicked");
              setShowAdminPanel(true);
            }} 
            className="text-amber-400 font-bold hover:underline"
          >
            Admin Portal
          </button>
          <span>|</span>
          <button onClick={() => setShowOwnerDashboard(true)} className="text-slate-400 hover:text-white">
            Owner Dashboard
          </button>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <BookingProvider>
      <MainAppContent />
    </BookingProvider>
  );
}
