import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Shield, Award, Terminal, Rocket, ChevronLeft } from "lucide-react";

export const metadata = {
  title: "About Us | DevSecOps AI Platform",
  description: "Securing the modern software lifecycle with AI-powered intelligence.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-parchment">
      <Header />
      <main className="flex-grow py-24 px-6">
        <article className="max-w-4xl mx-auto">
          <header className="text-center mb-24">
            <h1 className="text-5xl md:text-6xl mb-8 font-serif">Security with <br /> Intelligence.</h1>
            <p className="text-xl text-olive-gray max-w-2xl mx-auto leading-relaxed">
              DevSecOps AI Platform was born from a simple mission: to make automated security testing deeper, smarter, and more accessible for modern engineering teams.
            </p>
          </header>

          <div className="space-y-32">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl mb-6 font-serif">Our Mission</h2>
                <p className="text-lg text-olive-gray leading-relaxed mb-6">
                  We build AI that doesn't just scan for bugs, but understands the intent behind the code. Our mission is to integrate security seamlessly into the development lifecycle through automated SAST, DAST, and secure code vaulting.
                </p>
                <p className="text-lg text-olive-gray leading-relaxed">
                  By bridging the gap between security research and artificial intelligence, we're creating a world where every developer has the power of a senior security auditor by their side.
                </p>
              </div>
              <div className="aspect-square bg-ivory border border-border-cream rounded-[32px] p-12 flex items-center justify-center">
                <Shield className="w-24 h-24 text-terracotta" />
              </div>
            </section>

            <section className="bg-near-black text-ivory rounded-[48px] p-12 md:p-24 text-center overflow-hidden relative group">
              <div className="relative z-10">
                <h2 className="text-4xl mb-12 text-ivory font-serif">The Minds Behind.</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16 max-w-4xl mx-auto">
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-terracotta/10 rounded-full mx-auto border border-terracotta/20 overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                      <Image
                        src="/team/abdul.png"
                        alt="Abdul Ahad"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif text-ivory">Abdul Ahad</h3>
                      <p className="text-sm text-terracotta font-mono uppercase tracking-widest mt-1">Project Manager</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="w-28 h-28 bg-terracotta/10 rounded-full mx-auto border border-terracotta/20 overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                      <Image
                        src="/team/faizan.png"
                        alt="M. Faizan Shakeel"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif text-ivory">M. Faizan Shakeel</h3>
                      <p className="text-sm text-terracotta font-mono uppercase tracking-widest mt-1">Senior RED TEAMER</p>
                      <p className="text-[10px] text-[#b0aea5]/50 italic mt-1 leading-tight flex items-center justify-center gap-1">
                        <Award className="w-3 h-3 text-amber-400" /> 2 Times Gold Medalist
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-terracotta/10 rounded-full mx-auto border border-terracotta/20 overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                      <Image
                        src="/team/hayyan.png"
                        alt="Muhammad Hayyan"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif text-ivory">Muhammad Hayyan</h3>
                      <p className="text-sm text-terracotta font-mono uppercase tracking-widest mt-1">CEO & Sr. DevSecOps Engineer</p>
                      <p className="text-[10px] text-[#b0aea5]/50 italic mt-1 font-sans flex items-center justify-center gap-1">
                        <Terminal className="w-3 h-3" /> Lead @ Monolayer
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/5">
                  <div>
                    <div className="text-3xl mb-2 text-terracotta">2026</div>
                    <div className="text-sm uppercase tracking-widest text-[#b0aea5]/50">Launched</div>
                  </div>
                  <div>
                    <div className="text-3xl mb-1 text-terracotta">100%</div>
                    <div className="text-[10px] uppercase tracking-widest text-[#b0aea5]/50">Secure Vault</div>
                  </div>
                  <div>
                    <div className="text-3xl mb-2 text-terracotta">BS CYBER</div>
                    <div className="text-sm uppercase tracking-widest text-[#b0aea5]/50">Batch B</div>
                  </div>
                  <div>
                    <div className="text-3xl mb-2 text-terracotta">API</div>
                    <div className="text-sm uppercase tracking-widest text-[#b0aea5]/50">First</div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-terracotta/5 rounded-full blur-3xl pointer-events-none group-hover:bg-terracotta/10 transition-all duration-700" />
            </section>

            <section className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl mb-6 font-serif">Our Core Values</h2>
              <ul className="space-y-8 text-left">
                <li className="flex gap-6">
                  <span className="text-terracotta font-serif text-2xl">01.</span>
                  <div>
                    <h3 className="text-xl mb-2 font-serif">Security by Design</h3>
                    <p className="text-olive-gray">We believe security is a feature, not an afterthought. Every line of code we write is hardened from the start.</p>
                  </div>
                </li>
                <li className="flex gap-6">
                  <span className="text-terracotta font-serif text-2xl">02.</span>
                  <div>
                    <h3 className="text-xl mb-2 font-serif">Academic Rigor</h3>
                    <p className="text-olive-gray">Our methodologies are backed by deep research in vulnerability discovery and threat modeling.</p>
                  </div>
                </li>
                <li className="flex gap-6">
                  <span className="text-terracotta font-serif text-2xl">03.</span>
                  <div>
                    <h3 className="text-xl mb-2 font-serif">Radical Transparency</h3>
                    <p className="text-olive-gray">We provide clear, actionable audit logs and reporting, so you always know your security posture.</p>
                  </div>
                </li>
              </ul>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
