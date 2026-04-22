import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl md:text-8xl font-serif text-near-black leading-[1.1] mb-8">
          Secure APIs at the <span className="italic text-terracotta">Speed of AI</span>
        </h1>
        <p className="text-xl md:text-2xl text-olive-gray max-w-2xl mx-auto leading-relaxed mb-12">
          Automate vulnerability discovery with AI-assisted SAST & DAST. Secure your backend code with our encrypted vault and ephemeral sandbox execution.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/login" className="btn-terracotta w-full sm:w-auto text-lg px-8 py-4 flex items-center justify-center">
            Try Platform Free
          </Link>
          <Link href="/docs" className="btn-warm-sand w-full sm:w-auto text-lg px-8 py-4 flex items-center justify-center">
            View Documentation
          </Link>
        </div>


        <div className="relative mt-20 p-2 bg-ivory border border-border-cream rounded-[32px] shadow-whisper max-w-5xl mx-auto group">
          <div className="rounded-[24px] overflow-hidden bg-parchment">
            <img
              src="/hero-illustration.png"
              alt="Security Automation Flow"
              className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
            />
          </div>

          <div className="absolute inset-0 rounded-[32px] shadow-[0_0_0_1px_rgba(232,230,220,1)] pointer-events-none" />
        </div>
      </div>


      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-terracotta/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-coral/5 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2" />
    </section>
  );
}
