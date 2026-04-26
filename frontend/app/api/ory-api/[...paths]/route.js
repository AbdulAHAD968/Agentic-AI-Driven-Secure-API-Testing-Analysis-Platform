import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  return handleProxy(request, params);
}

export async function POST(request, { params }) {
  return handleProxy(request, params);
}

export async function PUT(request, { params }) {
  return handleProxy(request, params);
}

export async function PATCH(request, { params }) {
  return handleProxy(request, params);
}

export async function DELETE(request, { params }) {
  return handleProxy(request, params);
}

const PROXY_BASE = "/api/ory-api";

const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "accept-charset",
  "accept-encoding",
  "accept-language",
  "authorization",
  "cache-control",
  "content-type",
  "cookie",
  "user-agent",
];

// Ory sets cookies with Domain=<project>.projects.oryapis.com. The browser
// refuses to store those on localhost, so the CSRF cookie goes missing and
// submission calls come back as 403. Strip Domain so the cookies are stored
// host-only for the current origin.
function rewriteSetCookie(cookieHeader) {
  return cookieHeader.replace(/;\s*Domain=[^;]+/i, "");
}

async function handleProxy(request, params) {
  const { paths } = await params;
  const path = paths.join("/");
  const sdkUrl = (process.env.NEXT_PUBLIC_ORY_SDK_URL || "https://suspicious-agnesi-frtp7mro6t.projects.oryapis.com").replace(/\/$/, "");
  const url = `${sdkUrl}/${path}${request.nextUrl.search}`;

  const requestHeaders = new Headers();
  request.headers.forEach((value, key) => {
    if (FORWARDED_REQUEST_HEADERS.includes(key.toLowerCase())) {
      requestHeaders.set(key, value);
    }
  });
  requestHeaders.set("host", new URL(sdkUrl).host);
  requestHeaders.set("X-Ory-Base-URL-Rewrite", "false");
  requestHeaders.set("Ory-Base-URL-Rewrite", "false");
  requestHeaders.set("Ory-No-Custom-Domain-Redirect", "true");

  try {
    const response = await fetch(url, {
      method: request.method,
      headers: requestHeaders,
      body: request.method !== "GET" && request.method !== "HEAD" ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
    });

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k === "content-encoding" || k === "transfer-encoding" || k === "content-length" || k === "set-cookie") {
        return;
      }
      responseHeaders.append(key, value);
    });

    const setCookies = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
    setCookies.forEach((cookie) => {
      responseHeaders.append("set-cookie", rewriteSetCookie(cookie));
    });

    const location = response.headers.get("location");
    if (location) {
      if (location.startsWith(sdkUrl)) {
        responseHeaders.set("location", location.replace(sdkUrl, PROXY_BASE));
      } else if (location.startsWith("/self-service/") || location.startsWith("/ui/")) {
        responseHeaders.set("location", PROXY_BASE + location);
      }
    }

    const buf = Buffer.from(await response.arrayBuffer());
    let body;
    try {
      body = buf.toString("utf-8").replaceAll(sdkUrl, PROXY_BASE);
    } catch {
      body = buf;
    }

    return new NextResponse(body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Ory Proxy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
