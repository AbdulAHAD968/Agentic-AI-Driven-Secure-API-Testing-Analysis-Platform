import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { 
  FileCode, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  BookOpen, 
  Search,
  Lock,
  Cpu
} from "lucide-react";

export const metadata = {
  title: "Documentation | DevSecOps AI Platform",
  description: "Comprehensive guides for integrating AI-powered security into your workflow.",
};

export default function DocsPage() {
  const sections = [
    { name: "Getting Started", id: "started" },
    { name: "Architecture", id: "architecture" },
    { name: "Secure Vault", id: "vault" },
    { name: "AI Models", id: "models" },
    { name: "API Reference", id: "api" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-parchment">
      <Header />
      <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-16 grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block space-y-8 sticky top-36 h-fit">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-olive-gray mb-6">Documentation</h4>
            <nav className="flex flex-col gap-4">
              {sections.map((section) => (
                <a 
                  key={section.id} 
                  href={`#${section.id}`} 
                  className="text-sm font-medium text-stone-gray hover:text-terracotta transition-all flex items-center gap-2 group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-border-cream group-hover:bg-terracotta transition-colors" />
                  {section.name}
                </a>
              ))}
            </nav>
          </div>
          
          <div className="p-6 bg-ivory border border-border-cream rounded-3xl">
            <h5 className="text-sm font-serif mb-2">Need help?</h5>
            <p className="text-xs text-olive-gray mb-4">Our security team is available for enterprise support.</p>
            <button className="text-xs font-bold text-terracotta flex items-center gap-2 underline underline-offset-4">
              Contact Security <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3 space-y-24">
          
          {/* Quick Start */}
          <section id="started" className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-near-black text-ivory rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-4xl font-serif">Quick Start Guide</h2>
            </div>
            
            <p className="text-lg text-olive-gray leading-relaxed mb-12">
              Get up and running with the DevSecOps AI Platform in under 5 minutes. Our platform is designed to be plug-and-play, requiring zero configuration for standard web repositories.
            </p>

            <div className="relative aspect-video bg-near-black rounded-[40px] overflow-hidden mb-12 border border-white/5">
              <Image 
                src="/assets/docs_getting_started.png" 
                alt="Getting Started Illustration" 
                fill 
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-near-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-terracotta mb-2 block">Step 01</span>
                <h3 className="text-2xl text-ivory font-serif">Vault Ingestion</h3>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-near-black rounded-3xl p-8 font-mono text-sm text-ivory/90 border border-white/5 shadow-2xl">
                <div className="flex items-center gap-2 mb-4 opacity-40">
                  <Terminal className="w-4 h-4" />
                  <span>bash — node v18.0.0</span>
                </div>
                <p className="text-terracotta"># Initiate secure vault upload</p>
                <p>curl -X POST https://api.devsecops-ai.com/v1/vault/ingest \</p>
                <p className="pl-4">-H "Authorization: Bearer $API_TOKEN" \</p>
                <p className="pl-4">-F "file=@./source-code.zip"</p>
                <p className="mt-4 text-green-400">{"{ \"success\": true, \"vaultId\": \"vlt_8af292...\" }"}</p>
              </div>
            </div>
          </section>

          {/* Architecture */}
          <section id="architecture" className="scroll-mt-32">
            <h2 className="text-3xl font-serif mb-8">System Architecture</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-ivory border border-border-cream rounded-[32px]">
                <Cpu className="w-8 h-8 text-terracotta mb-6" />
                <h3 className="text-xl font-serif mb-4">Ephemeral Sandboxing</h3>
                <p className="text-sm text-olive-gray leading-relaxed">
                  Every scan executes in a isolated, ephemeral container. Once the analysis is complete, the sandbox is destroyed, leaving no trace of your code on persistent compute resources.
                </p>
              </div>
              <div className="p-8 bg-ivory border border-border-cream rounded-[32px]">
                <Lock className="w-8 h-8 text-terracotta mb-6" />
                <h3 className="text-xl font-serif mb-4">Zero-Knowledge Storage</h3>
                <p className="text-sm text-olive-gray leading-relaxed">
                  Using AES-256-CBC, your code is encrypted at the edge. Not even our engineers can view your source code without the temporary vault-access token generated during the scan.
                </p>
              </div>
            </div>
          </section>

          {/* AI Models */}
          <section id="models" className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-3xl font-serif">AI-Assisted Security</h2>
            </div>
            
            <p className="text-lg text-olive-gray leading-relaxed mb-12">
              Our models go beyond simple sequence matching. We use context-aware LLMs to map business logic and identify deep-seated vulnerabilities.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <ShieldCheck className="w-6 h-6 text-terracotta shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">OWASP ASVS Alignment</h4>
                    <p className="text-sm text-olive-gray">Deterministic checks for V2 (Authentication), V3 (Session), and V5 (Validation) modules.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Search className="w-6 h-6 text-terracotta shrink-0" />
                  <div>
                    <h4 className="font-bold mb-1">Logic Flaw Detection</h4>
                    <p className="text-sm text-olive-gray">Detects BOLA (Broken Object Level Authorization) by analyzing endpoint usage patterns.</p>
                  </div>
                </div>
              </div>
              <div className="relative aspect-square bg-near-black rounded-[40px] overflow-hidden border border-white/5">
                <Image 
                  src="/assets/docs_api.png" 
                  alt="API Logic Illustration" 
                  fill 
                  className="object-cover opacity-70"
                />
              </div>
            </div>
          </section>

          <footer className="pt-16 border-t border-border-cream">
            <div className="bg-near-black rounded-[40px] p-12 text-center text-ivory">
              <h3 className="text-3xl font-serif mb-6">Ready to secure your stack?</h3>
              <p className="text-[#b0aea5]/70 mb-10 max-w-lg mx-auto">Join the hundreds of organizations trusting our AI for their security audits.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/signup" className="bg-terracotta text-ivory px-8 py-4 rounded-2xl font-bold hover:bg-terracotta/90 transition-colors">
                  Create Account
                </a>
              </div>
            </div>
          </footer>

        </main>
      </div>
      <Footer />
    </div>
  );
}
