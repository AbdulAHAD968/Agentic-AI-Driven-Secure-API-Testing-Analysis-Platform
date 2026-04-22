import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Check, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Pricing | DevSecOps AI Platform",
  description: "Flexible tiers for scaling your security operations.",
};

export default function PricingPage() {
  const tiers = [
    {
      name: "Hobby",
      price: "$0",
      description: "Perfect for security researchers and student projects.",
      features: ["5 Scans per month", "Basic SAST Analysis", "Email Support", "Secure Vault Access"],
      cta: "Get Started",
      featured: false
    },
    {
      name: "Professional",
      price: "$49",
      description: "Advanced intelligence for production teams and startups.",
      features: ["Unlimited Scans", "AI Logic Detection", "Full DAST Sandboxing", "Audit Log Exports", "Priority Support"],
      cta: "Start Free Trial",
      featured: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "High-compliance solutions for massive scale.",
      features: ["Dedicated Infrastructure", "Custom LLM Fine-tuning", "SSO/SAML Integration", "24/7 Security Concierge", "On-premise Options"],
      cta: "Contact Sales",
      featured: false
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-parchment">
      <Header />
      <main className="flex-grow py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h1 className="text-5xl md:text-6xl mb-8 font-serif">Transparent Value. <br /> Absolute Security.</h1>
              <p className="text-xl text-olive-gray leading-relaxed mb-8">
                Whether you're a lone developer or a global enterprise, we have a tier that scales with your codebase. All our tiers include AES-256 encryption as standard.
              </p>
            </div>
            <div className="relative aspect-video bg-near-black rounded-[48px] border border-white/10 shadow-2xl overflow-hidden group">
              <Image 
                src="/assets/pricing.png" 
                alt="Pricing Illustration" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-1000 opacity-80" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-near-black to-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, i) => (
              <div 
                key={i} 
                className={`p-10 rounded-[40px] border flex flex-col transition-all duration-300 ${
                  tier.featured 
                    ? "bg-near-black text-ivory border-terracotta shadow-2xl scale-105 z-10" 
                    : "bg-ivory border-border-cream text-near-black hover:border-terracotta/30"
                }`}
              >
                <div className="mb-8">
                  <h3 className={`text-sm font-mono uppercase tracking-widest mb-2 ${tier.featured ? "text-terracotta" : "opacity-40"}`}>
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-serif">{tier.price}</span>
                    {tier.price !== "Custom" && <span className="opacity-40 text-sm">/month</span>}
                  </div>
                  <p className="mt-4 text-sm opacity-60 leading-relaxed">{tier.description}</p>
                </div>

                <ul className="space-y-4 mb-10 flex-grow">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <Check className={`w-4 h-4 ${tier.featured ? "text-terracotta" : "text-olive-gray"}`} />
                      <span className="opacity-80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  tier.featured 
                    ? "bg-terracotta text-ivory hover:bg-terracotta/90" 
                    : "bg-near-black text-ivory hover:bg-near-black/90"
                }`}>
                  {tier.cta} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
