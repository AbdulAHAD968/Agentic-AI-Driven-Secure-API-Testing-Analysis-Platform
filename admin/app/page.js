"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, Cpu, Globe } from "lucide-react";

export default function AdminLandingPage() {
  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-terracotta/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px]" />
      </div>

      <main className="max-w-4xl w-full text-center relative z-10">

        <h1 className="text-6xl md:text-8xl font-serif text-near-black mb-8 leading-tight">
          Control the <span className="italic">Intelligence</span>.
        </h1>

        <p className="text-xl md:text-2xl text-olive-gray font-sans mb-12 max-w-2xl mx-auto leading-relaxed">
          The centralized portal for Topic AI operators. Manage global users, distribute thoughtful insights, and oversee platform communications.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
          <Link href="/login" className="btn-terracotta text-lg px-12 py-5 group">
            Login to Portal <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <button className="btn-warm-sand text-lg px-12 py-5">
            System Status
          </button>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-border-cream pt-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center text-near-black shadow-sm border border-border-cream/50">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Secure Access</p>
              <p className="text-xs text-stone-gray font-sans">Multi-factor identity verification enforced.</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center text-near-black shadow-sm border border-border-cream/50">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Edge Monitoring</p>
              <p className="text-xs text-stone-gray font-sans">Live tracking of model inference loads.</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center text-near-black shadow-sm border border-border-cream/50">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Global Scale</p>
              <p className="text-xs text-stone-gray font-sans">Distributed oversight for global operations.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-12 text-stone-gray text-xs font-mono tracking-widest uppercase opacity-40">
        Topic AI Internal &middot; Confidential Environment
      </footer>
    </div>
  );
}
