"use client";

import { AlertTriangle, Info, X } from "lucide-react";

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Delete", 
  cancelText = "Cancel",
  type = "danger" 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-near-black/40 backdrop-blur-sm transition-all duration-300">
      <div 
        className="bg-ivory border border-border-cream rounded-[40px] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300"
        role="dialog"
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-3xl ${type === 'danger' ? 'bg-terracotta/10 text-terracotta' : 'bg-green-50 text-green-600'}`}>
              {type === 'danger' ? <AlertTriangle className="w-8 h-8" /> : <Info className="w-8 h-8" />}
            </div>
            <button 
              onClick={onCancel}
              className="p-2 hover:bg-warm-sand/10 rounded-full transition-colors text-stone-gray"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-2xl font-serif text-near-black mb-3">{title}</h3>
          <p className="text-stone-gray leading-relaxed mb-8">{message}</p>

          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-4 px-6 rounded-2xl border border-border-cream text-stone-gray font-mono text-xs uppercase tracking-widest hover:bg-warm-sand/10 transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-4 px-6 rounded-2xl text-white font-mono text-xs uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                type === 'danger' ? 'bg-terracotta hover:bg-terracotta/90' : 'bg-near-black hover:bg-near-black/90'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
