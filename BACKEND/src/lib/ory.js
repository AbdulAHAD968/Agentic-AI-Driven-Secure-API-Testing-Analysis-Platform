/**
 * @file ory.js
 * @purpose Initializes and exports the Ory Network FrontendApi client used
 *   for server-side session verification.
 *
 * SECURE CODING PRACTICES APPLIED IN THIS FILE:
 * -----------------------------------------------
 * [Authentication Bypass / API2:2023 - Broken Authentication]
 *   - The Ory SDK URL is loaded from the ORY_SDK_URL environment variable.
 *   - withCredentials: true ensures session cookies are forwarded to the
 *     Ory cloud for server-side validation — the backend never trusts
 *     session state claimed by the client.
 *
 * [Missing or Incorrect Authorization]
 *   - This client is used exclusively in authMiddleware.protect() to verify
 *     session validity before any route handler executes.
 *
 * [API8:2023 - Security Misconfiguration]
 *   - Production requires ORY_SDK_URL so session verification never targets the wrong tenant.
 *   - Development may fall back to the shared class Ory project URL only when ORY_SDK_URL is unset.
 */

const { Configuration, FrontendApi } = require("@ory/client");

const DEV_ORY_FALLBACK = "https://suspicious-agnesi-frtp7mro6t.projects.oryapis.com";

/**
 * ory: Ory FrontendApi client for session verification.
 *
 * [API2:2023 - Broken Authentication]
 * basePath points to the Ory project API, configured per-environment via
 * ORY_SDK_URL. withCredentials: true is required so that the session cookie
 * sent by the browser is forwarded to Ory for validation.
 */
const resolvedOryBasePath =
  process.env.ORY_SDK_URL ||
  (process.env.NODE_ENV === "development" ? DEV_ORY_FALLBACK : "");

if (!resolvedOryBasePath) {
  throw new Error("ORY_SDK_URL must be configured for server-side Ory session verification.");
}

const ory = new FrontendApi(
  new Configuration({
    basePath:    resolvedOryBasePath.replace(/\/$/, ""),
    baseOptions: {
      withCredentials: true, // Forward session cookies to Ory for server-side validation
    },
  })
);

module.exports = ory;
