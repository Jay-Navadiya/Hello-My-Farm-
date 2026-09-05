import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { Sparkles, Bot, Cpu, Check, Terminal, Play, Zap, RefreshCw, X, Palette, Image as ImageIcon, Layout, Flame } from 'lucide-react';

export default function AntigravityAIModal({ isOpen, onClose, onOpenThemeCustomizer }) {
  const { siteTheme, updateSiteTheme } = useBooking();

  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiLogs, setAiLogs] = useState([
    { id: 1, text: 'Antigravity AI Engine v2.5 initialized and ready for live web command execution.', time: 'System Online' }
  ]);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleExecuteAICommand = (commandText) => {
    const textToExecute = commandText || prompt;
    if (!textToExecute.trim()) return;

    setIsProcessing(true);
    setSuccessMsg('');
    const lower = textToExecute.toLowerCase();

    setTimeout(() => {
      let actionTaken = 'Custom AI modification applied to live site.';

      if (lower.includes('gold') || lower.includes('obsidian') || lower.includes('black')) {
        updateSiteTheme({
          themePreset: 'gold_obsidian',
          bgColor: '#08080a',
          cardBgColor: '#121217',
          accentColor: '#f59e0b',
          btnGradient: 'from-amber-500 to-orange-500',
          heroTitle: 'Luxury Gold Private Villas & Pool Resorts',
          promoBannerEnabled: true,
          promoBannerText: '✨ GOLDEN DEALS: Exclusive 20% Discount on Luxury 24-Hour Weekend Stays!'
        });
        actionTaken = 'Theme switched to Gold Obsidian & Accent updated to Amber Gold.';
      } else if (lower.includes('emerald') || lower.includes('green') || lower.includes('nature')) {
        updateSiteTheme({
          themePreset: 'emerald_bay',
          bgColor: '#061310',
          cardBgColor: '#0c211c',
          accentColor: '#10b981',
          btnGradient: 'from-emerald-600 to-teal-500',
          heroTitle: 'Find & Book Premier Emerald Farmhouses in Gujarat',
          promoBannerEnabled: true,
          promoBannerText: '🌿 NATURE SPECIAL: 15% Off on 12-Hour Day Picnic Slot Stays!'
        });
        actionTaken = 'Theme switched to Emerald Bay & Accent updated to Emerald Green.';
      } else if (lower.includes('blue') || lower.includes('sapphire') || lower.includes('ocean')) {
        updateSiteTheme({
          themePreset: 'royal_sapphire',
          bgColor: '#091224',
          cardBgColor: '#0f1d38',
          accentColor: '#3b82f6',
          btnGradient: 'from-blue-600 to-indigo-600',
          heroTitle: 'Exclusive Ocean & Pool Side Weekend Villas',
          promoBannerEnabled: true,
          promoBannerText: '🌊 POOL PARTY SPECIAL: Book 24 Hours & Get Complimentary Pool Sound System!'
        });
        actionTaken = 'Theme switched to Royal Sapphire & Accent updated to Ocean Blue.';
      } else if (lower.includes('banner') || lower.includes('discount') || lower.includes('promo')) {
        updateSiteTheme({
          promoBannerEnabled: true,
          promoBannerText: `🔥 AI PROMO: Special Flash Sale Activated! Use Code: ANTIGRAVITY25 for 25% OFF!`
        });
        actionTaken = 'Live Flash Promo Discount Banner generated & published.';
      } else if (lower.includes('reset') || lower.includes('default') || lower.includes('normal')) {
        updateSiteTheme({
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
        });
        actionTaken = 'Site theme and settings reset to Default Dark Slate.';
      } else if (lower.includes('title') || lower.includes('hero') || lower.includes('heading')) {
        updateSiteTheme({
          heroTitle: textToExecute.length > 10 ? textToExecute : 'Premier Private Luxury Farmhouses & Pool Resorts'
        });
        actionTaken = `Hero Title updated to "${textToExecute}".`;
      } else {
        // General AI adjustment
        updateSiteTheme({
          promoBannerEnabled: true,
          promoBannerText: `✨ Live Update: ${textToExecute}`
        });
        actionTaken = `Processed instruction: "${textToExecute}". Applied live page updates.`;
      }

      setAiLogs(prev => [
        { id: Date.now(), text: `[AI EXECUTION] ${actionTaken}`, time: new Date().toLocaleTimeString() },
        ...prev
      ]);

      setIsProcessing(false);
      setSuccessMsg(`✓ ${actionTaken}`);
      setPrompt('');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full my-auto shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 text-slate-950 flex items-center justify-center font-extrabold shadow-lg shadow-amber-950">
              <Sparkles className="w-6 h-6 fill-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold text-white">Antigravity AI Command Center</h3>
                <span className="text-[10px] bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded font-mono uppercase">
                  LIVE SITE AI CONTROL
                </span>
              </div>
              <p className="text-xs text-slate-400">Type natural language prompt to modify theme, banner, title & live UI instantly</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                if (onOpenThemeCustomizer) onOpenThemeCustomizer();
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition flex items-center space-x-1"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme Editor</span>
            </button>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Status Message */}
          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-2xl font-bold flex items-center justify-between animate-fade-in">
              <span>{successMsg}</span>
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
          )}

          {/* Prompt Box */}
          <form onSubmit={(e) => { e.preventDefault(); handleExecuteAICommand(); }} className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Enter AI Prompt / Instruction:
            </label>
            
            <div className="relative">
              <textarea
                rows={3}
                placeholder="e.g., 'Switch theme to Gold Obsidian', 'Set hero title to Luxury Villas', 'Enable 25% Off flash sale banner'..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl p-4 text-xs font-mono text-white placeholder-slate-500 focus:outline-none transition resize-none"
              />
              <button
                type="submit"
                disabled={isProcessing || !prompt.trim()}
                className="absolute right-3 bottom-3 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-lg flex items-center space-x-1.5"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Execute AI Command</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick AI Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              1-Click Antigravity AI Quick Actions:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleExecuteAICommand('Switch theme to Gold Obsidian')}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-amber-500/30 rounded-xl text-xs text-amber-300 text-left font-bold transition flex items-center space-x-2"
              >
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Gold Obsidian Theme</span>
              </button>

              <button
                onClick={() => handleExecuteAICommand('Switch theme to Emerald Bay')}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 text-left font-bold transition flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Emerald Bay Theme</span>
              </button>

              <button
                onClick={() => handleExecuteAICommand('Switch theme to Royal Sapphire')}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-blue-500/30 rounded-xl text-xs text-blue-300 text-left font-bold transition flex items-center space-x-2"
              >
                <Zap className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Royal Sapphire Theme</span>
              </button>

              <button
                onClick={() => handleExecuteAICommand('Enable 25% Off flash sale banner')}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-rose-500/30 rounded-xl text-xs text-rose-300 text-left font-bold transition flex items-center space-x-2"
              >
                <Terminal className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Activate Promo Banner</span>
              </button>

              <button
                onClick={() => handleExecuteAICommand('Set Hero Title to Premier Luxury Farmhouses in Gujarat')}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-purple-500/30 rounded-xl text-xs text-purple-300 text-left font-bold transition flex items-center space-x-2"
              >
                <Layout className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Update Hero Heading</span>
              </button>

              <button
                onClick={() => handleExecuteAICommand('Reset theme to Default Slate')}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 text-left font-bold transition flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>

          {/* AI Execution Console Log */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
              <span className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px]">
                <Terminal className="w-3.5 h-3.5" />
                <span>AI Execution Log Timeline</span>
              </span>
              <span className="text-[10px] text-slate-500">Live Socket Event Stream</span>
            </div>

            <div className="max-h-32 overflow-y-auto space-y-1.5 text-[11px] pt-1">
              {aiLogs.map(log => (
                <div key={log.id} className="text-slate-300 flex items-start space-x-2">
                  <span className="text-slate-500 shrink-0">[{log.time}]</span>
                  <span className="text-emerald-400">{log.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
