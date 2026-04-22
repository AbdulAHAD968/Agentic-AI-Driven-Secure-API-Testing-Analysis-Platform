"use client";

import { X, AlertTriangle } from "lucide-react";

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm",
  confirmVariant = "danger", 
  loading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-near-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div 
        className="bg-ivory w-full max-w-md rounded-[48px] border border-border-cream overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-10 text-center">
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 border ${
            confirmVariant === 'danger' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-warm-sand/50 border-border-cream text-terracotta'
          }`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <h3 className="text-2xl font-serif text-near-black mb-2">{title}</h3>
          <p className="text-sm text-olive-gray mb-10 leading-relaxed">{message}</p>
          
          <div className="flex gap-4">
             <button 
               onClick={onConfirm}
               disabled={loading}
               className={`w-full py-4 text-sm uppercase tracking-widest font-bold rounded-xl transition-all ${
                 confirmVariant === 'danger' 
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm' 
                  : 'btn-terracotta'
               }`}
             >
               {loading ? "Processing..." : confirmText}
             </button>
             <button 
               onClick={onClose}
               disabled={loading}
               className="w-full py-4 text-sm font-bold uppercase tracking-widest text-stone-gray hover:text-near-black bg-warm-sand/20 rounded-xl transition-colors"
             >
               Cancel
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
