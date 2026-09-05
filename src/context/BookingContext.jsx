import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import { CITIES } from '../data/cities';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]); // Surat default
  const [showCityModal, setShowCityModal] = useState(false);
  
  const [searchParams, setSearchParams] = useState({
    checkInDate: new Date().toISOString().split('T')[0],
    guestCount: 1,
    selectedAreaId: 'all',
    searchQuery: ''
  });

  const [properties, setProperties] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState({ isLoggedIn: false, role: 'user', token: null });
  const [favorites, setFavorites] = useState(['fh-101', 'fh-105']);

  // Dynamic Site Theme & Appearance Customizer State
  const defaultTheme = {
    themePreset: 'dark_slate',
    bgColor: '#090d16',
    cardBgColor: '#0f172a',
    accentColor: '#10b981',
    btnGradient: 'from-emerald-600 to-teal-500',
    heroTitle: 'Find & Book Luxury Private Farmhouses & Resorts',
    heroSubtitle: 'Exclusive 6h, 12h & 24h Slot Stays with Private Pool, Lawn & Rain Dance in Gujarat',
    heroBgImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1920&q=80',
    promoBannerEnabled: true,
    promoBannerText: '🎉 MON-THU SPECIAL: Get 20% Extra Off on 12-Hour & 24-Hour Day Stays! Use Code: HUB20'
  };

  const [siteTheme, setSiteTheme] = useState(() => {
    const saved = localStorage.getItem('farmhouse_hub_theme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });

  const updateSiteTheme = async (newSettings) => {
    let updatedObj = null;
    setSiteTheme(prev => {
      updatedObj = { ...prev, ...newSettings };
      localStorage.setItem('farmhouse_hub_theme', JSON.stringify(updatedObj));
      return updatedObj;
    });

    // Save to global server DB so ALL connected users see real-time live theme updates
    try {
      if (updatedObj) {
        await api.saveSiteConfig(updatedObj);
      }
    } catch (err) {
      console.warn('[Server Theme Sync Notice]', err.message);
    }
  };

  // Dynamic WhatsApp Notification Toast
  const [whatsappToast, setWhatsappToast] = useState(null);

  useEffect(() => {
    fetchPublicProperties();
    checkAuthToken();
    fetchSiteConfig();

    const handleStorage = (e) => {
      if (e.key === 'farmhouse_hub_theme' && e.newValue) {
        try { setSiteTheme(JSON.parse(e.newValue)); } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // Live Sync Polling every 3.5 seconds for real-time updates to all connected users
    const pollInterval = setInterval(() => {
      fetchSiteConfig();
      fetchPublicProperties();
    }, 3500);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(pollInterval);
    };
  }, []);

  const fetchSiteConfig = async () => {
    try {
      const res = await api.getSiteConfig();
      if (res.success && res.theme) {
        setSiteTheme(res.theme);
        localStorage.setItem('farmhouse_hub_theme', JSON.stringify(res.theme));
      }
    } catch (e) {}
  };

  const checkAuthToken = async () => {
    const token = localStorage.getItem('farmhouse_hub_token');
    if (token) {
      try {
        const res = await api.getProfile();
        if (res.success && res.user) {
          setUser({ isLoggedIn: true, token, ...res.user });
          fetchMyBookings();
        }
      } catch (err) {
        localStorage.removeItem('farmhouse_hub_token');
        setUser({ isLoggedIn: false, role: 'user', token: null });
      }
    }
  };

  const fetchPublicProperties = async () => {
    try {
      const res = await api.getProperties();
      if (res.success) setProperties(res.properties);
    } catch (err) {
      console.warn('[Fetch Properties Error]', err.message);
    }
  };

  const fetchMyProperties = async () => {
    if (!user.isLoggedIn) return;
    try {
      const res = await api.getMyProperties();
      if (res.success) setMyProperties(res.properties);
    } catch (err) {
      console.warn('[Fetch My Properties Error]', err.message);
    }
  };

  const fetchMyBookings = async () => {
    if (!user.isLoggedIn) return;
    try {
      const res = await api.getMyBookings();
      if (res.success) setBookings(res.bookings);
    } catch (err) {
      console.warn('[Fetch My Bookings Error]', err.message);
    }
  };

  // Auth Operations
  const sendOtp = (mobile) => api.sendOtp(mobile);

  const verifyOtp = async (payload) => {
    const res = await api.verifyOtp(payload);
    if (res.success && res.token) {
      localStorage.setItem('farmhouse_hub_token', res.token);
      setUser({ isLoggedIn: true, token: res.token, ...res.user });
      fetchMyBookings();
    }
    return res;
  };

  const sendEmailOtp = (email) => api.sendEmailOtp(email);

  const verifyEmailOtp = async (payload) => {
    const res = await api.verifyEmailOtp(payload);
    if (res.success && res.token) {
      localStorage.setItem('farmhouse_hub_token', res.token);
      setUser({ isLoggedIn: true, token: res.token, ...res.user });
      fetchMyBookings();
    }
    return res;
  };

  const googleLogin = async (payload) => {
    const res = await api.googleLogin(payload);
    if (res.success && res.token) {
      localStorage.setItem('farmhouse_hub_token', res.token);
      setUser({ isLoggedIn: true, token: res.token, ...res.user });
      fetchMyBookings();
    }
    return res;
  };

  const emailLogin = async (email, password) => {
    const res = await api.emailLogin({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('farmhouse_hub_token', res.token);
      setUser({ isLoggedIn: true, token: res.token, ...res.user });
      fetchMyBookings();
    }
    return res;
  };

  const emailSignup = async (payload) => {
    const res = await api.emailSignup(payload);
    if (res.success && res.token) {
      localStorage.setItem('farmhouse_hub_token', res.token);
      setUser({ isLoggedIn: true, token: res.token, ...res.user });
      fetchMyBookings();
    }
    return res;
  };

  const socialLogin = async (payload) => {
    const res = await api.socialLogin(payload);
    if (res.success && res.token) {
      localStorage.setItem('farmhouse_hub_token', res.token);
      setUser({ isLoggedIn: true, token: res.token, ...res.user });
      fetchMyBookings();
    }
    return res;
  };

  const adminLogin = async (email, password) => {
    const res = await api.adminLogin({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('farmhouse_hub_token', res.token);
      setUser({ isLoggedIn: true, token: res.token, ...res.user });
    }
    return res;
  };

  const logoutUser = () => {
    localStorage.removeItem('farmhouse_hub_token');
    setUser({ isLoggedIn: false, role: 'user', token: null });
    setMyProperties([]);
    setBookings([]);
  };

  const updateUserProfile = async (payload) => {
    const res = await api.updateProfile(payload);
    if (res.success && res.user) {
      setUser(prev => ({ ...prev, ...res.user }));
    }
    return res;
  };

  // Property Operations
  const submitProperty = async (propertyData) => {
    const res = await api.submitProperty(propertyData);
    if (res.success) {
      fetchMyProperties();
      fetchPublicProperties();
    }
    return res;
  };

  const editProperty = async (id, updatedData) => {
    const res = await api.editProperty(id, updatedData);
    if (res.success) {
      fetchMyProperties();
      fetchPublicProperties();
    }
    return res;
  };

  const deleteProperty = async (id) => {
    const res = await api.deleteProperty(id);
    if (res.success) {
      fetchMyProperties();
      fetchPublicProperties();
    }
    return res;
  };

  // Booking Operations
  const checkSlotAvailability = async (propertyId, checkInDate, checkOutDate, slotType) => {
    try {
      const res = await api.checkAvailability({ propertyId, checkInDate, checkOutDate, slotType });
      return res.available;
    } catch (err) {
      return false;
    }
  };

  const getBookedDates = async (propertyId) => {
    try {
      const res = await api.getBookedDates(propertyId);
      return res.success ? res.bookedRanges : [];
    } catch (err) {
      return [];
    }
  };

  const getOwnerBookings = async () => {
    try {
      const res = await api.getOwnerBookings();
      return res.success ? res.bookings : [];
    } catch (err) {
      return [];
    }
  };

  const cancelBooking = async (bookingId) => {
    const res = await api.cancelBooking(bookingId);
    if (res.success) {
      fetchMyBookings();
      fetchPublicProperties();
    }
    return res;
  };

  const initiateBooking = async (bookingDetails) => {
    const res = await api.initiateBooking(bookingDetails);
    return res;
  };

  const verifyPayment = async (paymentDetails) => {
    const res = await api.verifyPayment(paymentDetails);
    if (res.success) {
      fetchMyBookings();
      fetchPublicProperties();

      if (res.whatsappNotification?.success) {
        setWhatsappToast({
          id: Date.now(),
          booking: res.booking,
          messageText: res.whatsappNotification.messageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    }
    return res;
  };

  const toggleFavorite = (propertyId) => {
    setFavorites(prev => 
      prev.includes(propertyId) ? prev.filter(id => id !== propertyId) : [...prev, propertyId]
    );
  };

  const autoDetectGPSLocation = () => {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
          },
          () => resolve({ lat: 21.1702, lng: 72.8311 })
        );
      } else {
        resolve({ lat: 21.1702, lng: 72.8311 });
      }
    });
  };

  return (
    <BookingContext.Provider value={{
      selectedCity,
      setSelectedCity,
      showCityModal,
      setShowCityModal,
      searchParams,
      setSearchParams,
      properties,
      myProperties,
      bookings,
      user,
      favorites,
      siteTheme,
      updateSiteTheme,
      toggleFavorite,
      autoDetectGPSLocation,
      sendOtp,
      verifyOtp,
      sendEmailOtp,
      verifyEmailOtp,
      googleLogin,
      emailLogin,
      emailSignup,
      socialLogin,
      adminLogin,
      logoutUser,
      updateUserProfile,
      fetchMyProperties,
      fetchPublicProperties,
      submitProperty,
      addProperty: submitProperty,
      editProperty,
      updateProperty: editProperty,
      deleteProperty,
      checkSlotAvailability,
      getBookedDates,
      getOwnerBookings,
      cancelBooking,
      initiateBooking,
      verifyPayment,
      fetchMyBookings,
      whatsappToast,
      closeWhatsAppToast: () => setWhatsappToast(null)
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
};
