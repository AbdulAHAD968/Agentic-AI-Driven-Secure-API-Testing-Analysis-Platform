"use client";

import { useState } from "react";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";
import { BrainCircuit, Shield, Settings, Save, AlertCircle } from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    activeModel: "gpt-4o-mini",
    simulationMode: false,
    maxFileSize: 10,
    retentionDays: 7,
    scanDepth: "Advanced"
  });

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("System settings updated successfully across the DevSecOps infrastructure.");
    }, 1500);
  };

  return (
    <AdminLayoutWrapper>
      <div className="mb-12">
        <h1 className="text-4xl mb-2">Systems Configuration</h1>
        <p className="text-olive-gray font-sans">Manage global security engine parameters and AI model logic.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-ivory border border-border-cream rounded-3xl p-8 shadow-whisper">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-warm-sand/50 rounded-xl flex items-center justify-center text-terracotta">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-serif">AI Scanner Engine</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-mono mb-2 uppercase opacity-60">Active Inference Model</label>
                <select 
                  value={settings.activeModel}
                  onChange={(e) => setSettings({...settings, activeModel: e.target.value})}
                  className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 outline-none focus:border-terracotta/50"
                >
                  <option value="gpt-4o-mini">GPT-4o-mini (Standard)</option>
                  <option value="gpt-4o">GPT-4o (Enhanced Reasoning)</option>
                  <option value="o1-preview">o1-preview (Advanced SAST)</option>
                </select>
                <p className="text-[10px] text-stone-gray mt-2 italic">Standard model recommended for daily DAST/SAST cycles.</p>
              </div>

              <div>
                <label className="block text-xs font-mono mb-2 uppercase opacity-60">Execution Mode</label>
                <div className="flex items-center gap-4 h-12">
                  <button 
                    onClick={() => setSettings({...settings, simulationMode: false})}
                    className={`flex-grow py-2 rounded-lg text-xs font-mono transition-all ${
                      !settings.simulationMode ? "bg-terracotta text-ivory shadow-lg" : "bg-warm-sand/20 text-near-black"
                    }`}
                  >
                    LIVE AI
                  </button>
                  <button 
                    onClick={() => setSettings({...settings, simulationMode: true})}
                    className={`flex-grow py-2 rounded-lg text-xs font-mono transition-all ${
                      settings.simulationMode ? "bg-terracotta text-ivory shadow-lg" : "bg-warm-sand/20 text-near-black"
                    }`}
                  >
                    SIMULATED
                  </button>
                </div>
              </div>
            </div>
          </section>

          
          <section className="bg-ivory border border-border-cream rounded-3xl p-8 shadow-whisper">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-warm-sand/50 rounded-xl flex items-center justify-center text-terracotta">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-serif">Resource & Vault Limits</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-mono mb-2 uppercase opacity-60">Max Upload Size (MB)</label>
                <input 
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({...settings, maxFileSize: e.target.value})}
                  className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 outline-none focus:border-terracotta/50"
                />
              </div>
              <div>
                <label className="block text-xs font-mono mb-2 uppercase opacity-60">Report Retention (Days)</label>
                <input 
                  type="number"
                  value={settings.retentionDays}
                  onChange={(e) => setSettings({...settings, retentionDays: e.target.value})}
                  className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 outline-none focus:border-terracotta/50"
                />
              </div>
            </div>
          </section>
        </div>

        
        <div className="space-y-6">
          <div className="bg-near-black rounded-[32px] p-8 text-ivory shadow-whisper relative overflow-hidden group">
            <h3 className="text-xl font-serif mb-6 relative z-10">Control Panel</h3>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full btn-terracotta py-4 flex items-center justify-center gap-2 relative z-10 disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'Syncing...' : 'Apply Changes'}
            </button>
            <div className="mt-8 space-y-4 relative z-10">
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-[10px] opacity-60 font-sans uppercase tracking-widest text-left">
                  Changing the AI Model will affect scan costs and precision levels globally.
                </p>
              </div>
            </div>
            
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-terracotta/10 rounded-full blur-3xl pointer-events-none group-hover:bg-terracotta/20 transition-all duration-700" />
          </div>

          <div className="bg-ivory border border-border-cream rounded-[32px] p-8 shadow-whisper">
            <h3 className="text-lg font-serif mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-terracotta" />
              Inventory Metadata
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-mono border-b border-border-cream/50 pb-2">
                <span className="opacity-40 uppercase">Cluster Version</span>
                <span className="text-terracotta font-bold text-right">v1.2.4-STABLE</span>
              </div>
              <div className="flex justify-between text-xs font-mono border-b border-border-cream/50 pb-2">
                <span className="opacity-40 uppercase">Vault Node</span>
                <span className="text-terracotta font-bold text-right">AES-256-NODE-01</span>
              </div>
              <div className="flex justify-between text-xs font-mono pb-2">
                <span className="opacity-40 uppercase">Region</span>
                <span className="text-terracotta font-bold text-right">Cloud-Core-US</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
