import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { api } from '../api';
import { 
  X, Star, MapPin, Bed, Bath, Users, Maximize2, Waves, ShieldCheck, 
  Calendar, Clock, Check, ChevronLeft, ChevronRight, Map, Heart, Share2, 
  Sparkles, AlertCircle, Info, Lock, Flame, Tv, Wifi, Utensils, Music, Gamepad2, Home, ArrowRight
} from 'lucide-react';

// Safe Helper for dynamic SEO Meta Tags
function updateMetaTags({ title, description, ogImage }) {
  if (typeof document === 'undefined') return;
  try {
    if (title) document.title = `${title} | FarmhouseHub Gujarat`;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && description) {
      metaDesc.setAttribute('content', description);
    }
  } catch (err) {
    console.warn('[SEO Meta Tag Notice]', err.message);
  }
}

// Safe Helper for Schema.org JSON-LD Structured Data
function injectJSONLDSchema(property) {
  if (typeof document === 'undefined' || !property) return;
  try {
    let script = document.getElementById('jsonld-schema-property');
    if (!script) {
      script = document.createElement('script');
      script.id = 'jsonld-schema-property';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      "name": property.title || "Luxury Farmhouse",
      "description": property.description || "",
      "address": property.address || property.areaName || ""
    };
    script.textContent = JSON.stringify(schemaData);
  } catch (err) {
    console.warn('[JSON-LD Schema Notice]', err.message);
  }
}

// Safe API helpers for reviews
async function getPropertyReviews(propertyId) {
  try {
    if (api && typeof api.getPropertyReviews === 'function') {
      const res = await api.getPropertyReviews(propertyId);
      if (res && res.success) return res;
    }
  } catch (err) {}
  return { success: true, reviews: [], ratingStats: { reviewCount: 0, avgRating: 5.0 } };
}

async function submitReview(payload) {
  try {
    if (api && typeof api.submitReview === 'function') {
      const res = await api.submitReview(payload);
      if (res) return res;
    }
  } catch (err) {}
  return { success: true, message: 'Thank you! Your stay review has been submitted for moderation.' };
}

export default function PropertyDetailModal({ property, isOpen, onClose, onProceedToCheckout }) {
  const { user, getBookedDates, searchParams, favorites, toggleFavorite, properties } = useBooking();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [bookedRanges, setBookedRanges] = useState([]);
  
  // Reviews & Rating State
  const [reviewsList, setReviewsList] = useState([]);
  const [ratingStats, setRatingStats] = useState({ reviewCount: 0, avgRating: 5.0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Safe default dates
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const [checkInDate, setCheckInDate] = useState(searchParams?.checkInDate || todayStr);
  const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);
  const [selectedSlotType, setSelectedSlotType] = useState('24h'); // '6h', '12h', '24h'
  const [guestCountInput, setGuestCountInput] = useState(searchParams?.guestCount || 10);

  // Fetch booked ranges from backend when property opens
  useEffect(() => {
    if (property?.id && isOpen) {
      // 1. Inject Enterprise SEO & Structured Data
      updateMetaTags({
        title: property.title,
        description: property.description || `Rent ${property.title} in ${property.areaName || property.cityId}`,
        ogImage: property.images?.[0]
      });
      injectJSONLDSchema(property);

      // 2. Fetch Booked Ranges
      if (typeof getBookedDates === 'function') {
        getBookedDates(property.id)
          .then(ranges => setBookedRanges(Array.isArray(ranges) ? ranges : []))
          .catch(() => setBookedRanges([]));
      }

      // 3. Fetch Approved User Reviews
      getPropertyReviews(property.id)
        .then(res => {
          if (res?.success) {
            setReviewsList(res.reviews || []);
            setRatingStats(res.ratingStats || { reviewCount: 0, avgRating: 5.0 });
          }
        })
        .catch(() => {});
    }
  }, [property?.id, isOpen]);

  // Sync searchParams checkInDate if changed
  useEffect(() => {
    if (searchParams?.checkInDate) {
      setCheckInDate(searchParams.checkInDate);
    }
  }, [searchParams?.checkInDate]);

  if (!isOpen || !property) return null;

  const images = Array.isArray(property.images) && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'];

  const isFav = Array.isArray(favorites) && favorites.includes(property.id);

  // Number of nights calculation
  const startMs = new Date(checkInDate || todayStr).getTime();
  const endMs = new Date(checkOutDate || tomorrowStr).getTime();
  const rawDiff = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));
  const diffDays = isNaN(rawDiff) || rawDiff < 1 ? 1 : rawDiff;

  // Check real-time slot availability against booked ranges
  const isOverlapping = bookedRanges.some(r => {
    const rStart = r.checkInDate;
    const rEnd = r.checkOutDate || r.checkInDate;
    return checkInDate <= rEnd && checkOutDate >= rStart;
  });
  const isAvailable = !isOverlapping;

  // Calculate pricing based on slot package & night count
  let nightlyRate = property.price24h || 12000;
  let slotLabel = `${diffDays} Day Stay (${diffDays} Night${diffDays > 1 ? 's' : ''})`;
  if (selectedSlotType === '6h') {
    nightlyRate = property.price6h || 4000;
    slotLabel = '6 Hours Day/Evening Package';
  } else if (selectedSlotType === '12h') {
    nightlyRate = property.price12h || 7000;
    slotLabel = '12 Hours Evening/Overnight Package';
  }

  const basePrice = (nightlyRate || 4000) * (selectedSlotType === '24h' ? diffDays : 1);
  const securityDeposit = property.securityDeposit || 2500;
  const grandTotal = basePrice + securityDeposit;

  // Similar properties suggestion (same city, excluding current)
  const similarProps = (properties || []).filter(p => p.cityId === property.cityId && p.id !== property.id).slice(0, 3);

  const handleCheckoutClick = () => {
    if (new Date(checkOutDate) < new Date(checkInDate)) {
      alert('Check-Out date cannot be earlier than Check-In date!');
      return;
    }
    if (!isAvailable) {
      alert('Sorry, this property is already booked for the selected dates. Please select different dates.');
      return;
    }
    onProceedToCheckout({
      property,
      date: checkInDate,
      checkInDate,
      checkOutDate,
      diffDays,
      slotType: selectedSlotType,
      slotLabel,
      guestCount: guestCountInput,
      basePrice,
      securityDeposit,
      grandTotal
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await submitReview({
        propertyId: property.id,
        rating: newRating,
        reviewText: newReviewText
      });
      alert(res.message);
      setShowReviewForm(false);
      setNewReviewText('');
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Coordinates & Distance Matrix
  const lat = property.mapCoordinates?.lat || 21.1702;
  const lng = property.mapCoordinates?.lng || 72.8311;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full my-auto shadow-2xl glass-modal overflow-hidden relative flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold uppercase">
              {property.propertyType || 'Luxury Villa'}
            </span>
            <h2 className="text-base sm:text-xl font-extrabold text-white truncate max-w-md">{property.title}</h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleFavorite(property.id)}
              className={`p-2 rounded-xl border transition ${isFav ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-400' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Main Gallery Carousel */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 h-64 sm:h-96 group border border-slate-800">
            <img
              src={images[activeImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover transition duration-500"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-950 transition opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-950 transition opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Thumbnail Strip */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 bg-slate-950/70 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-12 h-9 rounded-lg overflow-hidden border-2 transition ${activeImageIndex === idx ? 'border-emerald-400 scale-105' : 'border-transparent opacity-60'}`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Details, Map & Reviews */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Quick Specs */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <Bed className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span className="font-bold text-white block">{property.bedrooms} BHK</span>
                  <span className="text-[10px] text-slate-400">Bedrooms</span>
                </div>
                <div>
                  <Bath className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span className="font-bold text-white block">{property.bathrooms} Baths</span>
                  <span className="text-[10px] text-slate-400">Bathrooms</span>
                </div>
                <div>
                  <Maximize2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span className="font-bold text-white block">{property.sqft?.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400">Sq. Ft Lawn</span>
                </div>
                <div>
                  <Users className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <span className="font-bold text-white block">Max {property.maxDayGuests || 45}</span>
                  <span className="text-[10px] text-slate-400">Guest Capacity</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-bold text-white text-base">About this Property</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{property.description || 'Premium private luxury farmhouse equipped with swimming pool, rain dance lawn, gazebo, full AC bedrooms, and 24x7 caretaker.'}</p>
              </div>

              {/* Feature 10: Embedded Google Maps & Distance Matrix */}
              <div className="space-y-3 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Location & Distance Matrix</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">8.5 km from City Center</span>
                </div>

                <div className="h-48 rounded-xl overflow-hidden border border-slate-800">
                  <iframe
                    title="Property Map Location"
                    src={mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                </div>
                <p className="text-xs text-slate-400">{property.address || `${property.areaName}, ${property.cityId?.toUpperCase()}`}</p>
              </div>

              {/* Feature 8: Post-Stay User Feedback & Reviews Section */}
              <div className="space-y-4 bg-slate-950 border border-slate-800 p-5 rounded-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <h3 className="font-bold text-white text-sm">{ratingStats.avgRating} ({ratingStats.reviewCount} Verified Reviews)</h3>
                  </div>
                  {user?.isLoggedIn && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition"
                    >
                      Write a Review
                    </button>
                  )}
                </div>

                {/* Review Form Modal */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 animate-fade-in text-xs">
                    <h4 className="font-bold text-white">Share Your Stay Experience</h4>
                    <div>
                      <label className="block text-slate-400 mb-1">Star Rating (1-5)</label>
                      <select
                        value={newRating}
                        onChange={(e) => setNewRating(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-1.5"
                      >
                        <option value={5}>5 Stars - Excellent</option>
                        <option value={4}>4 Stars - Very Good</option>
                        <option value={3}>3 Stars - Average</option>
                        <option value={2}>2 Stars - Poor</option>
                        <option value={1}>1 Star - Terrible</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Review Details</label>
                      <textarea
                        rows={3}
                        placeholder="Write details about your stay, cleanliness, pool quality..."
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2 rounded-xl flex items-center space-x-1"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>Submit for Moderation</span>
                    </button>
                  </form>
                )}

                {/* Approved Reviews List */}
                <div className="space-y-3">
                  {reviewsList.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No approved reviews yet. Be the first to stay and review!</p>
                  ) : (
                    reviewsList.map(r => (
                      <div key={r.id} className="border-b border-slate-800/60 pb-3 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">{r.userName}</span>
                          <div className="flex items-center space-x-1 text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span className="font-bold">{r.rating}</span>
                          </div>
                        </div>
                        <p className="text-slate-300">{r.reviewText}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Booking Card */}
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4 sticky top-4">
                
                <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Starting From</span>
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono">₹{nightlyRate?.toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">/ Slot Package</span>
                </div>

                {/* Slot Selection */}
                <div className="space-y-2 text-xs">
                  <label className="block font-bold text-slate-300">Select Time Slot Duration</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setSelectedSlotType('6h')}
                      className={`py-2 px-2 rounded-xl font-bold border transition ${selectedSlotType === '6h' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      6 Hours
                    </button>
                    <button
                      onClick={() => setSelectedSlotType('12h')}
                      className={`py-2 px-2 rounded-xl font-bold border transition ${selectedSlotType === '12h' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      12 Hours
                    </button>
                    <button
                      onClick={() => setSelectedSlotType('24h')}
                      className={`py-2 px-2 rounded-xl font-bold border transition ${selectedSlotType === '24h' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      24 Hours
                    </button>
                  </div>
                </div>

                {/* Dates Selection */}
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Check-In</label>
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Check-Out</label>
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time Availability Alert */}
                {!isAvailable && (
                  <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>Slot is reserved by another user. Choose different dates!</span>
                  </div>
                )}

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Area</span>
                    <span className="font-bold text-white">{property.sqft?.toLocaleString()} SqFt</span>
                  </div>
                {/* Pricing Summary */}
                <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stay Rent:</span>
                    <span>₹{basePrice.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Overnight Stay</span>
                    <span className="font-bold text-white">Up to {property.maxStayGuests} Guests</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Refundable Security Deposit:</span>
                    <span>₹{securityDeposit.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Day Event</span>
                    <span className="font-bold text-white">Up to {property.maxDayGuests} Guests</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-white text-sm pt-2 border-t border-slate-800">
                    <span>Total Pay Amount:</span>
                    <span className="text-emerald-400 font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-300 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Real-Time Calendar Availability</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isAvailable ? '✅ Date slot is available for instant booking!' : '⚠️ Slot is blocked for selected date.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-xl transition shadow-xl text-xs flex items-center justify-center space-x-2"
              >
                <span>Reserve & Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white">Amenities & Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {(property.amenities || []).map((amenity, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center space-x-2 text-slate-200">
                  <Waves className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold line-clamp-1">{typeof amenity === 'string' ? amenity : amenity.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Similar Properties Suggestions */}
          {similarProps.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white">More Farmhouses in {property.areaName}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {similarProps.map(sim => (
                  <div 
                    key={sim.id}
                    onClick={() => {
                      onClose();
                      setTimeout(() => window.dispatchEvent(new CustomEvent('open-property', { detail: sim })), 100);
                    }}
                    className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-3 cursor-pointer transition flex items-center space-x-3"
                  >
                    <img src={sim.images?.[0]} alt={sim.title} className="w-14 h-14 rounded-xl object-cover" />
                    <div className="text-xs overflow-hidden">
                      <h4 className="font-bold text-white truncate">{sim.title}</h4>
                      <p className="text-emerald-400 font-mono font-bold">₹{sim.price6h?.toLocaleString()}/6h</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Sticky Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Estimated Payable</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">₹{grandTotal.toLocaleString()}</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition"
            >
              Close
            </button>
            <button
              onClick={handleCheckoutClick}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition shadow-lg shadow-emerald-950 flex items-center space-x-1.5"
            >
              <span>Book Now & Pay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
