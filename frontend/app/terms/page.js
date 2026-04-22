import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Service | DevSecOps AI Platform",
  description: "The legal guidelines for using the DevSecOps AI Platform.",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-parchment">
      <Header />
      <main className="flex-grow py-24 px-6">
        <article className="max-w-3xl mx-auto">
          <header className="mb-16">
            <h1 className="text-4xl md:text-5xl mb-6 font-serif">Terms of Service</h1>
            <p className="text-olive-gray italic font-serif">Last updated: April 22, 2026</p>
          </header>

          <div className="prose prose-stone max-w-none space-y-12 text-near-black">
            <section>
              <h2 className="text-2xl font-serif mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed text-olive-gray">
                By accessing or using the DevSecOps AI Platform, you agree to be bound by these Terms of Service. If you are using the platform on behalf of an organization, you agree to these terms for that organization and promise that you have the authority to bind that organization to these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">2. Ethical Use and Authorization</h2>
              <p className="leading-relaxed text-olive-gray mb-4">
                The DevSecOps AI Platform is designed for security testing and vulnerability discovery. You agree that:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-olive-gray">
                <li>You will only upload source code for which you have explicit legal authorization to scan.</li>
                <li>You will not use the platform to facilitate illegal activity or unauthorized access to third-party systems.</li>
                <li>The AI-generated findings are for informational purposes and should be verified by a security professional.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">3. Code Ownership and Protection</h2>
              <p className="leading-relaxed text-olive-gray">
                You retain all ownership rights to the source code you upload. We process your code solely for the purpose of generating security reports. As per our Privacy Policy, your code is encrypted at rest and permanently deleted once the analysis is complete.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">4. Limitation of Liability</h2>
              <p className="leading-relaxed text-olive-gray">
                DevSecOps AI Platform provides automated security analysis. While we strive for 100% accuracy, we do not guarantee that our scans will identify every possible vulnerability. Security is an ongoing process, and our reports should be used as part of a broader security strategy.
              </p>
            </section>

            <section className="bg-ivory border border-border-cream p-8 rounded-2xl">
              <h2 className="text-xl font-serif mb-4">5. Admin and RBAC</h2>
              <p className="leading-relaxed text-olive-gray">
                You are responsible for managing access to your project data through our Role-Based Access Control (RBAC) system. Ensure that only authorized personnel have access to project reports and audit logs.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
