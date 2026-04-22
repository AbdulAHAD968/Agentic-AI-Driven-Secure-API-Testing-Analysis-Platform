import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ModelGrid from "@/components/ModelGrid";
import CTASection from "@/components/CTASection";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <ModelGrid />
        <CTASection />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
