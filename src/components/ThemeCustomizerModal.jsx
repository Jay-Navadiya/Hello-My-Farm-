import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { Palette, X, Check, Image as ImageIcon, Sparkles, Layout, Sliders, RefreshCw, Eye } from 'lucide-react';

export default function ThemeCustomizerModal({ isOpen, onClose }) {
  const { siteTheme, updateSiteTheme } = useBooking();

  const [form, setForm] = useState({
    themePreset: siteTheme?.themePreset || 'dark_slate',
    bgColor: siteTheme?.bgColor || '#090d16',
    cardBgColor: siteTheme?.cardBgColor || '#0f172a',
    accentColor: siteTheme?.accentColor || '#10b981',
    btnGradient: siteTheme?.btnGradient || 'from-emerald-600 to-teal-500',
    heroTitle: siteTheme?.heroTitle || 'Find & Book Luxury Private Farmhouses & Resorts',
    heroSubtitle: siteTheme?.heroSubtitle || 'Exclusive 6h, 12h & 24h Slot Stays with Private Pool, Lawn & Rain Dance in Gujarat',
    heroBgImage: siteTheme?.heroBgImage || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1920&q=80',
    promoBannerEnabled: siteTheme?.promoBannerEnabled !== false,
    promoBannerText: siteTheme?.promoBannerText || '🎉 MON-THU SPECIAL: Get 20% Extra Off on 12-Hour & 24-Hour Day Stays! Use Code: HUB20'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (presetKey) => {
    let presetValues = {};
    if (presetKey === 'gold_obsidian') {
      presetValues = {
        themePreset: 'gold_obsidian',
        bgColor: '#08080a',
        cardBgColor: '#121217',
        accentColor: '#f59e0b',
        btnGradient: 'from-amber-500 to-orange-500',
        heroTitle: 'Luxury Gold Private Villas & Pool Resorts'
      };
    } else if (presetKey === 'emerald_bay') {
      presetValues = {
        themePreset: 'emerald_bay',
        bgColor: '#061310',
        cardBgColor: '#0c211c',
        accentColor: '#10b981',
        btnGradient: 'from-emerald-600 to-teal-500',
        heroTitle: 'Find & Book Premier Emerald Farmhouses in Gujarat'
      };
    } else if (presetKey === 'royal_sapphire') {
      presetValues = {
        themePreset: 'royal_sapphire',
        bgColor: '#091224',
        cardBgColor: '#0f1d38',
        accentColor: '#3b82f6',
        btnGradient: 'from-blue-600 to-indigo-600',
        heroTitle: 'Exclusive Ocean & Pool Side Weekend Villas'
      };
    } else if (presetKey === 'sunset_amber') {
      presetValues = {
        themePreset: 'sunset_amber',
        bgColor: '#14080e',
        cardBgColor: '#240f1a',
        accentColor: '#f43f5e',
        btnGradient: 'from-rose-500 to-pink-500',
        heroTitle: 'Sunset Party Farmhouses & Gazebo Resorts'
      };
    } else {
      presetValues = {
        themePreset: 'dark_slate',
        bgColor: '#090d16',
        cardBgColor: '#0f172a',
        accentColor: '#10b981',
        btnGradient: 'from-emerald-600 to-teal-500',
        heroTitle: 'Find & Book Luxury Private Farmhouses & Resorts'
      };
    }

    const updated = { ...form, ...presetValues };
    setForm(updated);
    updateSiteTheme(updated);
  };

  const handleSaveTheme = (e) => {
    if (e) e.preventDefault();
    updateSiteTheme(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefault = () => {
    handleApplyPreset('dark_slate');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full my-auto shadow-2xl overflow-hidden relative flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold text-white">Live Theme & Appearance Editor</h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded uppercase font-bold">
                  REAL-TIME PREVIEW
                </span>
              </div>
              <p className="text-xs text-slate-400">Change background colors, button gradients, hero images & promo banners in real time</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {savedSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-2xl font-bold flex items-center justify-between">
              <span>✓ Live site theme configuration saved & updated successfully!</span>
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
          )}

          {/* Section 1: Presets Scheme */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Preset Theme Color Schemes:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'dark_slate', label: 'Dark Slate', bg: '#090d16', accent: '#10b981' },
                { id: 'gold_obsidian', label: 'Gold Obsidian', bg: '#08080a', accent: '#f59e0b' },
                { id: 'emerald_bay', label: 'Emerald Bay', bg: '#061310', accent: '#10b981' },
                { id: 'royal_sapphire', label: 'Royal Sapphire', bg: '#091224', accent: '#3b82f6' },
                { id: 'sunset_amber', label: 'Sunset Amber', bg: '#14080e', accent: '#f43f5e' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id)}
                  className={`p-3 rounded-2xl border transition flex flex-col items-center justify-between space-y-2 text-center ${
                    form.themePreset === p.id 
                      ? 'border-amber-500 bg-slate-800 shadow-lg' 
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/20" style={{ backgroundColor: p.bg }}>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.accent }}></div>
                  </div>
                  <span className="font-bold text-white text-[11px]">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Colors & Buttons */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-4">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              2. Custom Color Controls:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Background Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={form.bgColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm({ ...form, bgColor: val });
                      updateSiteTheme({ bgColor: val });
                    }}
                    className="w-10 h-10 rounded-xl bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.bgColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm({ ...form, bgColor: val });
                      updateSiteTheme({ bgColor: val });
                    }}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Accent Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm({ ...form, accentColor: val });
                      updateSiteTheme({ accentColor: val });
                    }}
                    className="w-10 h-10 rounded-xl bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.accentColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm({ ...form, accentColor: val });
                      updateSiteTheme({ accentColor: val });
                    }}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Button Gradient Style</label>
                <select
                  value={form.btnGradient}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, btnGradient: val });
                    updateSiteTheme({ btnGradient: val });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-semibold focus:outline-none"
                >
                  <option value="from-emerald-600 to-teal-500">Emerald Green</option>
                  <option value="from-amber-500 to-orange-500">Amber Gold</option>
                  <option value="from-blue-600 to-indigo-600">Royal Blue</option>
                  <option value="from-rose-500 to-pink-500">Rose Gold</option>
                  <option value="from-purple-600 to-indigo-600">Deep Purple</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Hero Section & Wallpapers */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-4">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              3. Hero Banner & Wallpaper Background:
            </span>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Hero Title Text</label>
                <input
                  type="text"
                  value={form.heroTitle}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, heroTitle: val });
                    updateSiteTheme({ heroTitle: val });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Hero Background Image URL</label>
                <input
                  type="text"
                  value={form.heroBgImage}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, heroBgImage: val });
                    updateSiteTheme({ heroBgImage: val });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              {/* Wallpaper Presets */}
              <div className="pt-1 space-y-1.5">
                <span className="text-[11px] text-slate-400 font-bold block">Quick Villa Wallpaper Presets:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { title: 'Night Pool Villa', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1920&q=80' },
                    { title: 'Sunset Resort', url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1920&q=80' },
                    { title: 'Modern Farmhouse', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80' },
                    { title: 'Green Lawn Estate', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80' }
                  ].map(w => (
                    <button
                      key={w.title}
                      onClick={() => {
                        setForm({ ...form, heroBgImage: w.url });
                        updateSiteTheme({ heroBgImage: w.url });
                      }}
                      className="h-16 rounded-xl overflow-hidden border border-slate-800 hover:border-amber-500 relative group transition"
                    >
                      <img src={w.url} alt={w.title} className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-[9px] font-bold text-white text-center p-1">
                        {w.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Promo Banner Customizer */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                4. Announcement & Promo Banner:
              </span>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.promoBannerEnabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm({ ...form, promoBannerEnabled: checked });
                    updateSiteTheme({ promoBannerEnabled: checked });
                  }}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500"
                />
                <span className="text-xs font-bold text-white">Enable Top Banner</span>
              </label>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Banner Announcement Text</label>
              <input
                type="text"
                value={form.promoBannerText}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({ ...form, promoBannerText: val });
                  updateSiteTheme({ promoBannerText: val });
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold"
              />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={handleResetDefault}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition flex items-center space-x-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition text-xs"
            >
              Close
            </button>
            <button
              onClick={handleSaveTheme}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded-xl transition shadow-lg text-xs flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save & Apply Theme Live</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
