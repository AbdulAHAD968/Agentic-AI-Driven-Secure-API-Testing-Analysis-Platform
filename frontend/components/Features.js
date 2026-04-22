export default function Features() {
  const features = [
    {
      title: "AI-Powered SAST",
      description: "Identify API routes, parameters, and insecure patterns using automated AI-assisted static code analysis.",
      icon: "◈"
    },
    {
      title: "Automated DAST",
      description: "Generate and execute real-world attack payloads against staging APIs in isolated sandbox environments.",
      icon: "◇"
    },
    {
      title: "Secure Code Vault",
      description: "Your source code is protected with AES-256 encryption at rest and transit, and automatically deleted after scanning.",
      icon: "○"
    },
    {
      title: "RBAC Compliance",
      description: "Strict role-based access control managed via industry-standard identity services for reports and settings.",
      icon: "▣"
    },
    {
      title: "Detailed Audit Trails",
      description: "Immutable event logging captures all system interactions, codebase scans, and user access events for compliance.",
      icon: "▤"
    },
    {
      title: "Shift-Left Integration",
      description: "Seamlessly integrate with your existing CI/CD pipelines to automatically block deployments containing critical threats.",
      icon: "◩"
    }
  ];

  return (
    <section id="features" className="py-24 md:py-32 px-6 bg-ivory/30">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-[52px] text-near-black mb-6">
            Designed for thoughtful work.
          </h2>
          <p className="text-lg text-olive-gray max-w-2xl mx-auto leading-relaxed">
            We've built the platform to be a companion in your productivity journey, not just another piece of cold machinery.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="card-ivory group hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-warm-sand/50 flex items-center justify-center text-terracotta text-2xl mb-8 font-serif">
                {feature.icon}
              </div>
              <h3 className="text-2xl text-near-black mb-4 group-hover:text-terracotta transition-colors">
                {feature.title}
              </h3>
              <p className="text-olive-gray leading-relaxed font-[15px]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
