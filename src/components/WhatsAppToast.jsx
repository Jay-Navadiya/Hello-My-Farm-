import React from 'react';
import { MessageSquare, X, ExternalLink, CheckCircle2, Copy } from 'lucide-react';

export default function WhatsAppToast({ toast, toastData, onClose }) {
  const activeToast = toast || toastData;
  if (!activeToast) return null;

  const { booking, messageText, timestamp } = activeToast;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(messageText);
    alert('WhatsApp message text copied to clipboard!');
  };

  const openWhatsAppDirectly = () => {
    const encoded = encodeURIComponent(messageText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-fade-in shadow-2xl">
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-4 text-slate-100 backdrop-blur-xl shadow-[0_0_40px_rgba(16,185,129,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-emerald-400 text-sm">Automated WhatsApp Cloud API</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">LIVE SENT</span>
              </div>
              <p className="text-xs text-slate-400">To Agency & Customer ({booking?.customerPhone}) • {timestamp}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Preview Box */}
        <div className="bg-slate-950/80 rounded-xl p-3.5 border border-emerald-900/40 text-xs font-mono text-slate-300 space-y-1.5 max-h-48 overflow-y-auto mb-3 whitespace-pre-wrap leading-relaxed">
          {messageText}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={openWhatsAppDirectly}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition shadow-lg shadow-emerald-950"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open WhatsApp Web</span>
          </button>

          <button
            onClick={copyToClipboard}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-lg flex items-center justify-center space-x-1 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>
        </div>
      </div>
    </div>
  );
}
