export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/settings/", "/dashboard/", "/api/"],
    },
    sitemap: "https://topic-ai.com/sitemap.xml",
  };
}
