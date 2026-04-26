/** @type {import('next').NextConfig} */
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").origin;
  } catch {
    return "http://localhost:5000";
  }
})();

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // [API8:2023 - Security Misconfiguration / XSS] Admin UI gets strict browser hardening headers.
          { key: "Content-Security-Policy", value: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: ${apiOrigin}; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'` },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
