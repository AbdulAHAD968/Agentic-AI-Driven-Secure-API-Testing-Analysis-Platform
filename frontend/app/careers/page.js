import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Careers | DevSecOps AI Platform",
  description: "Join our mission to secure the future of software with artificial intelligence.",
};

export default function CareersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-parchment">
      <Header />
      <main className="flex-grow py-24 px-6">
        <article className="max-w-4xl mx-auto">
          <header className="text-center mb-24">
            <h1 className="text-5xl md:text-6xl mb-8 font-serif">Defend the code. <br /> Build the future.</h1>
            <p className="text-xl text-olive-gray max-w-2xl mx-auto leading-relaxed">
              We're looking for security researchers, AI engineers, and DevSecOps practitioners who are passionate about building the world's most resilient software security engine.
            </p>
          </header>

          <div className="space-y-32">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl mb-6 font-serif">Engineering Excellence</h2>
                <p className="text-lg text-olive-gray leading-relaxed mb-6">
                  At DevSecOps AI Platform, you'll work at the intersection of vulnerability research and large language models. We don't just use tools; we invent them.
                </p>
                <div className="space-y-4">
                  <div className="bg-ivory border border-border-cream p-4 rounded-2xl">
                    <h4 className="font-serif text-terracotta mb-1 uppercase text-xs tracking-widest">Open Role</h4>
                    <p className="text-near-black font-medium">Security AI Researcher</p>
                  </div>
                  <div className="bg-ivory border border-border-cream p-4 rounded-2xl">
                    <h4 className="font-serif text-terracotta mb-1 uppercase text-xs tracking-widest">Open Role</h4>
                    <p className="text-near-black font-medium">DevSecOps Systems Architect</p>
                  </div>
                </div>
              </div>
              <div className="aspect-square bg-near-black rounded-[32px] p-12 flex flex-col justify-end relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-2xl text-ivory mb-2 font-serif">Remote-First Culture</h3>
                  <p className="text-ivory/60 text-sm">We're a global team building security for a global audience.</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/10 rounded-full blur-3xl group-hover:bg-terracotta/20 transition-all duration-700" />
              </div>
            </section>

            <section className="text-center">
              <h2 className="text-3xl mb-12 font-serif">Why work with us?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-ivory border border-border-cream rounded-3xl text-left">
                  <h3 className="text-xl mb-4 font-serif">High Autonomy</h3>
                  <p className="text-olive-gray text-sm">We hire experts and get out of their way. You own your features from design to deployment.</p>
                </div>
                <div className="p-8 bg-ivory border border-border-cream rounded-3xl text-left">
                  <h3 className="text-xl mb-4 font-serif">Security First</h3>
                  <p className="text-olive-gray text-sm">We don't ship until it's hardened. You'll have the space to do things the right way, every time.</p>
                </div>
                <div className="p-8 bg-ivory border border-border-cream rounded-3xl text-left">
                  <h3 className="text-xl mb-4 font-serif">AI Innovation</h3>
                  <p className="text-olive-gray text-sm">Work with the latest models and contribute to the evolution of automated security intelligence.</p>
                </div>
              </div>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
