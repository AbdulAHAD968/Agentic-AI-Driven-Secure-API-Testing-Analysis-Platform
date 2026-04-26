/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          /**
           * [API8:2023 - Security Misconfiguration]
           * Non-CSP security headers that are safe with Next.js/Turbopack in both dev and prod.
           * CSP requires nonce-based integration with Next.js to avoid blocking React hydration
           * inline scripts; the backend API already enforces CSP via helmet() for API responses.
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
