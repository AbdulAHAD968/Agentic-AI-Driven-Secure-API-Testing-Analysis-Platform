"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/services/newsletterService";
import { toast } from "react-hot-toast";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await subscribeNewsletter(email);
      toast.success(res.message);
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Subscription failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 px-6 md:px-12 bg-parchment relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="bg-ivory border border-border-cream rounded-[48px] p-12 md:p-20 shadow-whisper relative overflow-hidden group">
          
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-terracotta/5 rounded-full blur-3xl pointer-events-none group-hover:bg-terracotta/10 transition-all duration-1000" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <p className="text-terracotta font-mono text-xs uppercase tracking-widest font-bold mb-4">Newsletter</p>
              <h2 className="text-4xl md:text-5xl font-serif text-near-black mb-6 leading-tight">
                Thoughtful insights, <br className="hidden md:block" /> 
                delivered <span className="italic">occasionally</span>.
              </h2>
              <p className="text-lg text-olive-gray font-sans mb-10 max-w-lg">
                Subscribe to receive deep dives into AI architecture, automation strategy, and the future of collaborative intelligence. No spam, only substance.
              </p>

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md">
                <div className="relative flex-grow">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-gray" />
                  <input 
                    type="email" 
                    required
                    placeholder="email@example.com"
                    className="w-full bg-warm-sand/20 border border-border-cream rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all font-sans"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-terracotta px-8 py-4 flex items-center justify-center gap-2 font-serif text-lg group whitespace-nowrap"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Subscribe <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
              
              <p className="mt-8 text-xs text-stone-gray font-sans italic opacity-60">
                Join 5,000+ early adopters. Unsubscribe anytime.
              </p>
            </div>

            <div className="hidden lg:block relative aspect-square">
              <div className="absolute inset-0 bg-terracotta/5 rounded-full blur-2xl animate-pulse" />
              <img 
                src="/assets/newsletter_visual.png" 
                alt="Secure Newsletter" 
                className="w-full h-full object-contain relative z-10 animate-float"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
