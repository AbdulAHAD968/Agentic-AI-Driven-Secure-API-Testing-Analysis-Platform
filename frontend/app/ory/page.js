"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle2, Shield, Fingerprint, Lock, Zap, Server, Database } from "lucide-react";

export default function OryExplanationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-parchment text-near-black font-sans selection:bg-terracotta/20">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section - Pure Typographic Elegance */}
        <section className="pt-48 pb-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-16 md:items-end">
              <div className="flex-1">
                <span className="text-xs uppercase tracking-[0.4em] font-bold text-terracotta mb-6 block animate-pulse">Infrastructure Layer</span>
                <h1 className="text-7xl md:text-9xl font-serif font-medium leading-[0.85] tracking-tighter text-near-black">
                  Secure <br /> 
                  <span className="italic">Identity.</span>
                </h1>
              </div>
              <div className="flex-1 space-y-8">
                <p className="text-2xl text-olive-gray leading-relaxed font-sans font-light">
                  We've engineered our platform using Ory—the global standard for Zero Trust identity. 
                  By decoupling authentication from application logic, we provide an unbreakable vault for your credentials.
                </p>
                <div className="flex items-center gap-6">
                  <Link href="/signup" className="btn-terracotta px-12 py-6 text-xl rounded-none shadow-none hover:opacity-90 transition-all active:scale-95">
                    Create Secure Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Technical Grid - Sophisticated & Minimal */}
        <section className="py-24 border-t border-border-cream">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border-cream border border-border-cream shadow-whisper">
              {[
                { icon: Shield, title: "Zero Trust", desc: "Every request is cryptographically verified. No implicit trust." },
                { icon: Lock, title: "Argon2 Hashing", desc: "Industry-leading hashing with high memory-hardness protection." },
                { icon: Fingerprint, title: "WebAuthn", desc: "Native support for hardware keys, FaceID, and TouchID." },
                { icon: Zap, title: "Edge Performance", desc: "Distributed identity verification at the network edge." }
              ].map((item, i) => (
                <div key={i} className="bg-ivory p-10 hover:bg-white transition-all duration-500 group">
                  <item.icon className="w-8 h-8 text-terracotta/40 group-hover:text-terracotta transition-colors mb-8" />
                  <h3 className="text-xl font-serif mb-4 tracking-tight">{item.title}</h3>
                  <p className="text-stone-gray text-sm font-sans leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deep Dive Narrative */}
        <section className="py-40 bg-near-black text-ivory overflow-hidden relative">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div>
                <h2 className="text-5xl md:text-6xl font-serif mb-12 text-white leading-tight tracking-tight">
                  Why settle for <br /> <span className="italic text-stone-gray">traditional auth?</span>
                </h2>
                <div className="space-y-16">
                  <div className="relative pl-12 border-l border-white/10 group">
                    <div className="absolute -left-px top-0 w-px h-0 bg-terracotta group-hover:h-full transition-all duration-700" />
                    <h4 className="text-terracotta font-bold text-xs uppercase tracking-widest mb-4">01 / Separation of Concerns</h4>
                    <p className="text-stone-gray text-lg leading-relaxed font-sans">
                      Our main servers never see your password. Ory handles the sensitive exchange in an isolated environment, 
                      limiting the attack surface to near zero.
                    </p>
                  </div>
                  <div className="relative pl-12 border-l border-white/10 group">
                    <div className="absolute -left-px top-0 w-px h-0 bg-terracotta group-hover:h-full transition-all duration-700" />
                    <h4 className="text-terracotta font-bold text-xs uppercase tracking-widest mb-4">02 / Cryptographic Proof</h4>
                    <p className="text-stone-gray text-lg leading-relaxed font-sans">
                      Authentication isn't just a database check. It's a series of signed cryptographic handshakes that 
                      guarantee the integrity of your session.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 space-y-8 relative">
                 <div className="flex gap-2 mb-8">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                 </div>
                 <div className="font-mono text-sm text-stone-gray space-y-4">
                    <p className="text-terracotta">// Ory Session Verification</p>
                    <p className="text-white">const session = await ory.toSession(cookie);</p>
                    <p>if (!session.active) return unauthorized();</p>
                    <p className="text-blue-400">return next();</p>
                 </div>
                 <div className="pt-12 border-t border-white/10">
                    <p className="text-sm font-sans text-stone-gray leading-relaxed italic">
                      "Our architecture assumes that the network is always hostile. Ory is how we enforce that rule."
                    </p>
                 </div>
              </div>
            </div>
          </div>
          
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        </section>

        {/* Final Typographic CTA */}
        <section className="py-48 text-center bg-ivory">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-6xl md:text-8xl font-serif mb-16 tracking-tighter leading-none">
              Modern. <span className="italic">Secure.</span> <br /> Seamless.
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-8">
              <Link href="/signup" className="btn-terracotta px-16 py-8 text-2xl font-medium">Create Account</Link>
              <Link href="/login" className="px-16 py-8 border border-border-cream bg-white text-2xl hover:bg-parchment transition-all active:scale-95 font-medium">Sign In</Link>
            </div>
            <p className="mt-12 text-stone-gray font-sans uppercase tracking-[0.2em] text-xs">Join the elite DevSecOps community</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
