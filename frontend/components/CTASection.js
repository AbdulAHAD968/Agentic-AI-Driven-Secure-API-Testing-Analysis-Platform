export default function CTASection() {
  return (
    <section className="py-24 md:py-32 px-6 bg-parchment relative overflow-hidden">
      <div className="max-w-4xl mx-auto rounded-[32px] bg-terracotta p-8 md:p-20 text-center text-ivory relative z-10">
        <h2 className="text-4xl md:text-5xl font-serif text-ivory mb-8 leading-tight">
          Ready to secure your <br />API infrastructure?
        </h2>
        <p className="text-ivory/60 text-lg mb-12 max-w-xl mx-auto">
          Join developers building secure, resilient applications with DevSecOps AI Platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="bg-ivory text-terracotta px-10 py-4 rounded-xl font-medium text-lg hover:bg-white transition-all shadow-lg shadow-black/10">
            Start Your Journey
          </button>
          <button className="bg-transparent border border-ivory/30 text-ivory px-10 py-4 rounded-xl font-medium text-lg hover:bg-ivory/10 transition-all">
            Contact Sales
          </button>
        </div>
        
        
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
          <div className="w-full h-full bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
      </div>
      
      
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-terracotta/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-coral/5 rounded-full blur-3xl -z-10" />
    </section>
  );
}
