import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Shield, Zap, Search, Lock, Database, Globe } from "lucide-react";

export const metadata = {
  title: "Platform Overview | DevSecOps AI Platform",
  description: "A deep dive into the intelligence behind our automated security ecosystem.",
};

export default function OverviewPage() {
  return (
    <div className="flex flex-col min-h-screen bg-parchment">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-24 px-6 border-b border-border-cream">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl mb-8 font-serif">Deep Intelligence. <br /> Automated Defense.</h1>
              <p className="text-xl text-olive-gray leading-relaxed mb-8">
                The DevSecOps AI Platform is an integrated ecosystem designed to solve the complexity of modern software security. By combining LLM-driven reasoning with deterministic security analysis, we provide a defense layer that evolves as fast as your code.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-ivory border border-border-cream rounded-full text-xs font-mono uppercase tracking-widest text-terracotta">
                  <Shield className="w-3 h-3" /> SAST + DAST
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-ivory border border-border-cream rounded-full text-xs font-mono uppercase tracking-widest text-terracotta">
                  <Lock className="w-3 h-3" /> AES-256 VAULT
                </div>
              </div>
            </div>
            <div className="relative aspect-square bg-ivory rounded-[48px] border border-border-cream shadow-whisper overflow-hidden group">
              <Image 
                src="/assets/overview.png" 
                alt="Platform Overview Illustration" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700" 
              />
            </div>
          </div>
        </section>

        {/* Component Breakdown */}
        <section className="py-24 px-6 bg-ivory/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl mb-16 font-serif">Core Architecture</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-near-black rounded-2xl flex items-center justify-center text-ivory">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif">Secure Code Vault</h3>
                <p className="text-olive-gray">Your source code is our highest priority. All submitted code is encrypted using industry-standard AES-256 protocols and stored in air-gapped virtual nodes until processing.</p>
              </div>
              <div className="space-y-6">
                <div className="w-12 h-12 bg-near-black rounded-2xl flex items-center justify-center text-ivory">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif">AI-Logic SAST</h3>
                <p className="text-olive-gray">Unlike traditional regex-based scanners, our AI engine understands application logic. It identifies BOLA, logic flaws, and complex data-flow vulnerabilities that others miss.</p>
              </div>
              <div className="space-y-6">
                <div className="w-12 h-12 bg-near-black rounded-2xl flex items-center justify-center text-ivory">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif">Sandbox DAST</h3>
                <p className="text-olive-gray">Our dynamic engine generates context-aware payloads for your specific API structure, testing common attack vectors in a safe, ephemeral sandbox environment.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
