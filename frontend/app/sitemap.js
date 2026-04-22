export default function sitemap() {
  const baseUrl = "https://topic-ai.com";

  const routes = [
    "",
    "/about",
    "/careers",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/notifications",
    "/settings",
    "/dashboard",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  return routes;
}
