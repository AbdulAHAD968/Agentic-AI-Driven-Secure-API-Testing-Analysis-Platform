import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Cookie Policy | DevSecOps AI Platform",
  description: "How we use cookies to provide a secure and efficient platform experience.",
};

export default function CookiesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-parchment">
      <Header />
      <main className="flex-grow py-24 px-6">
        <article className="max-w-3xl mx-auto">
          <header className="mb-16">
            <h1 className="text-4xl md:text-5xl mb-6 font-serif">Cookie Policy</h1>
            <p className="text-olive-gray italic font-serif">Last updated: April 22, 2026</p>
          </header>

          <div className="prose prose-stone max-w-none space-y-12 text-near-black">
            <section>
              <h2 className="text-2xl font-serif mb-4">What are cookies?</h2>
              <p className="leading-relaxed text-olive-gray">
                Cookies are small text files stored on your device that help our platform recognize you and provide a secure, personalized experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">How we use them</h2>
              <p className="leading-relaxed text-olive-gray mb-4">
                We use cookies primarily for security and functional purposes:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-olive-gray">
                <li>**Authentication**: To keep you logged in securely while you navigate the platform.</li>
                <li>**Security**: To prevent CSRF (Cross-Site Request Forgery) attacks and detect unauthorized session attempts.</li>
                <li>**Preferences**: To remember your dashboard layout and security scan settings.</li>
              </ul>
            </section>

            <section className="bg-ivory border border-border-cream p-8 rounded-2xl">
              <h2 className="text-xl font-serif mb-4">Managing Cookies</h2>
              <p className="leading-relaxed text-olive-gray">
                Most web browsers allow you to control cookies through their settings. However, since we use cookies for essential security functions (such as JWT authentication), disabling them may prevent you from using the core features of the DevSecOps AI Platform.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
