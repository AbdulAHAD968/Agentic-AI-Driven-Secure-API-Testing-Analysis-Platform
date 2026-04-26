/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          /**
           * [API8:2023 - Security Misconfiguration]
           * Non-CSP browser hardening headers safe with Next.js/Turbopack in dev and prod.
           * A strict Content-Security-Policy for Next.js requires nonce integration to avoid
           * blocking React hydration inline scripts; backend helmet() covers API CSP.
           */
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
