import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Shield, MessageSquare, Globe } from "lucide-react";

export const metadata = {
  title: "Contact Us | DevSecOps AI Platform",
  description: "Get in touch with our security and engineering teams.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-parchment">
      <Header />
      <main className="flex-grow py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl mb-8 font-serif">Get in touch.</h1>
            <p className="text-xl text-olive-gray max-w-2xl mx-auto leading-relaxed">
              Have questions about our security models or need a custom enterprise solution? Our team of researchers and engineers is here to help.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-ivory border border-border-cream p-8 rounded-3xl shadow-whisper">
                <div className="w-12 h-12 bg-warm-sand/50 rounded-2xl flex items-center justify-center text-terracotta mb-6">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xl mb-2 font-serif">General Inquiries</h3>
                <p className="text-olive-gray text-sm mb-4">For general questions about the platform and features.</p>
                <a href="mailto:support@devsecops-ai.com" className="text-terracotta font-medium hover:underline">support@devsecops-ai.com</a>
              </div>

              <div className="bg-ivory border border-border-cream p-8 rounded-3xl shadow-whisper">
                <div className="w-12 h-12 bg-near-black rounded-2xl flex items-center justify-center text-terracotta mb-6">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl mb-2 font-serif">Security Reports</h3>
                <p className="text-olive-gray text-sm mb-4">To report a vulnerability or discuss security research.</p>
                <p className="text-terracotta font-medium">security@devsecops-ai.com</p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-ivory border border-border-cream p-12 rounded-[40px] shadow-whisper">
              <h2 className="text-3xl mb-8 font-serif">Send a Message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase opacity-60">Full Name</label>
                    <input type="text" className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 outline-none focus:border-terracotta/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase opacity-60">Work Email</label>
                    <input type="email" className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 outline-none focus:border-terracotta/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase opacity-60">Subject</label>
                  <select className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 outline-none focus:border-terracotta/50">
                    <option>General Support</option>
                    <option>Security/Vulnerability Research</option>
                    <option>Enterprise Licensing</option>
                    <option>Academic Partnership</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase opacity-60">Message</label>
                  <textarea className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 outline-none focus:border-terracotta/50 h-32"></textarea>
                </div>
                <button type="submit" className="w-full btn-terracotta py-4 text-sm font-medium">Transmit Message</button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
