import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Brain, Cpu, ShieldAlert, FileCode, Search, Terminal } from "lucide-react";

export const metadata = {
  title: "AI Models | DevSecOps AI Platform",
  description: "The mathematical backbone of our security intelligence.",
};

export default function ModelsPage() {
  const models = [
    {
      title: "Logic-Flow-v1",
      type: "SAST Engine",
      capabilities: "Analyzes application logic, business flow, and BOLA vulnerability patterns.",
      tech: "Context-aware LLM Analysis",
      icon: <Brain className="w-6 h-6" />
    },
    {
      title: "Dynamic-Guard-Alpha",
      type: "DAST Engine",
      capabilities: "Generates real-world payloads based on API schema and endpoint context.",
      tech: "Adaptive Payload Generation",
      icon: <Cpu className="w-6 h-6" />
    },
    {
      title: "Vault-Sentry-OS",
      type: "Core Storage",
      capabilities: "Manages AES-256 encryption keys and secure code rotation.",
      tech: "Deterministic Encryption Orchestrator",
      icon: <Terminal className="w-6 h-6" />
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-parchment">
      <Header />
      <main className="flex-grow">
        
        <section className="py-24 px-6 border-b border-border-cream">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative aspect-square bg-near-black rounded-[48px] overflow-hidden shadow-2xl group">
              <Image 
                src="/assets/models.png" 
                alt="AI Models Illustration" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90" 
              />
              <div className="absolute inset-0 bg-gradient-to-br from-terracotta/20 to-transparent" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl mb-8 font-serif">Engineered for <br /> Precision.</h1>
              <p className="text-xl text-olive-gray leading-relaxed mb-8">
                Our models aren't general-purpose. They are fine-tuned security guardians trained on millions of vulnerability reports, OWASP patterns, and secure coding standards.
              </p>
              <div className="space-y-6">
                 <div className="flex gap-4 p-6 bg-ivory border border-border-cream rounded-3xl">
                    <ShieldAlert className="w-8 h-8 text-terracotta shrink-0" />
                    <div>
                      <h4 className="font-serif text-lg">OWASP Top 10 Coverage</h4>
                      <p className="text-sm text-olive-gray">100% automated coverage for AI01 through AI10 2023 guidelines.</p>
                    </div>
                 </div>
                 <div className="flex gap-4 p-6 bg-ivory border border-border-cream rounded-3xl">
                    <FileCode className="w-8 h-8 text-terracotta shrink-0" />
                    <div>
                      <h4 className="font-serif text-lg">Cross-Language Engine</h4>
                      <p className="text-sm text-olive-gray">Support for Node.js, Python, Go, and Java source code analysis.</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        
        <section className="py-24 px-6 bg-ivory/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl mb-16 font-serif">Platform Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {models.map((model, i) => (
                <div key={i} className="bg-ivory border border-border-cream p-10 rounded-[40px] shadow-whisper hover:border-terracotta/30 transition-all group">
                  <div className="w-12 h-12 bg-near-black text-ivory rounded-2xl flex items-center justify-center mb-8 group-hover:bg-terracotta transition-colors">
                    {model.icon}
                  </div>
                  <div className="mb-6">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-terracotta">{model.type}</span>
                    <h3 className="text-2xl font-serif mt-2">{model.title}</h3>
                  </div>
                  <p className="text-olive-gray mb-8">{model.capabilities}</p>
                  <div className="pt-8 border-t border-border-cream/50 flex items-center justify-between">
                    <span className="text-xs font-mono opacity-40 uppercase tracking-widest">Technology</span>
                    <span className="text-xs font-semibold">{model.tech}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
