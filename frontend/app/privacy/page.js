import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | DevSecOps AI Platform",
  description: "How we protect your code and data with zero-trust architecture.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-parchment">
      <Header />
      <main className="flex-grow py-24 px-6">
        <article className="max-w-3xl mx-auto">
          <header className="mb-16">
            <h1 className="text-4xl md:text-5xl mb-6 font-serif">Privacy Policy</h1>
            <p className="text-olive-gray italic font-serif">Last updated: April 22, 2026</p>
          </header>

          <div className="prose prose-stone max-w-none space-y-12 text-near-black">
            <section>
              <h2 className="text-2xl font-serif mb-4">Security by Default</h2>
              <p className="leading-relaxed text-olive-gray">
                At DevSecOps AI Platform, we treat your source code as our highest priority asset. Our privacy model is built on zero-trust principles: we never trust user input, and we ensure that your intellectual property is encrypted and protected at every stage of the lifecycle.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">Secure Code Vaulting</h2>
              <p className="leading-relaxed text-olive-gray mb-4">
                When you upload source code for analysis, it is immediately handled by our Secure Code Vault system:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-olive-gray">
                <li>**Encryption at Rest**: All code is encrypted using AES-256-CBC before storage.</li>
                <li>**Isolation**: Code analysis happens in isolated, short-lived environments.</li>
                <li>**Deletion Policy**: All uploaded source code and temporary artifacts are permanently deleted immediately after the AI scan is completed.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">Data Collection</h2>
              <p className="leading-relaxed text-olive-gray mb-4">
                We only collect data necessary to secure your applications:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-olive-gray">
                <li>Account credentials (managed through secure hashed protocols).</li>
                <li>Audit logs of your security scans for compliance purposes.</li>
                <li>Anonymous telemetry to improve our security detection models.</li>
              </ul>
            </section>

            <section className="bg-ivory border border-border-cream p-8 rounded-2xl">
              <h2 className="text-xl font-serif mb-4">Regulatory Compliance</h2>
              <p className="leading-relaxed text-olive-gray">
                Our platform is designed to assist you in meeting global security standards. We provide full audit trails of every action taken within the platform to support your internal compliance and RBAC requirements.
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
