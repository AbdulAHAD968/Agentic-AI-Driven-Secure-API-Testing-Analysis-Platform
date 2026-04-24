"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, Cpu, Globe, Shield } from "lucide-react";

export default function AdminLandingPage() {
  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-terracotta/5 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-near-black/5 rounded-full blur-[140px]" />

      <main className="max-w-4xl w-full text-center relative z-10">
        <div className="flex justify-center mb-12">
          <div className="w-20 h-20 bg-near-black text-ivory rounded-[2rem] flex items-center justify-center shadow-2xl ring-8 ring-white/10">
            <Shield className="w-10 h-10" />
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-serif text-near-black mb-8 leading-tight tracking-tighter">
          Secure <span className="text-terracotta italic">Control</span>.
        </h1>

        <p className="text-xl md:text-2xl text-stone-gray font-sans mb-12 max-w-2xl mx-auto leading-relaxed opacity-80">
          The proprietary operations gateway for Topic AI. Manage global users, distribute intelligence, and monitor platform integrity.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
          <Link href="/login" className="bg-near-black text-ivory px-14 py-5 rounded-2xl text-xl font-serif flex items-center justify-center gap-3 hover:bg-terracotta transition-all duration-500 shadow-xl hover:shadow-terracotta/20 group">
            Authenticate Session <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
          <button className="bg-white/40 backdrop-blur-md border border-white/60 text-near-black px-12 py-5 rounded-2xl text-lg font-sans hover:bg-white/80 transition-all shadow-sm">
            Infrastructure Status
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-near-black/5 pt-20">
          {[
            { icon: Lock, label: "Identity Matrix", sub: "Ory-backed zero trust auth" },
            { icon: Cpu, label: "Neural Health", sub: "Live model inference tracking" },
            { icon: Globe, label: "Global Reach", sub: "Distributed platform oversight" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-4 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-near-black shadow-md border border-border-cream group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-bold text-near-black tracking-tight mb-1">{item.label}</p>
                <p className="text-xs text-stone-gray font-sans opacity-60 uppercase tracking-widest">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="mt-auto py-12 flex flex-col items-center gap-4 relative z-10">
        <div className="flex items-center gap-3 opacity-30">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-near-black">
            Topic AI Secure Node Alpha
          </p>
        </div>
      </footer>
    </div>
  );
}
