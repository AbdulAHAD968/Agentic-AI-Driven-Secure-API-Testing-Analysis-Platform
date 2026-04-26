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
 *   - No default credentials or insecure fallback behaviors are configured.
 *   - The basePath falls back to the known Ory project URL if the env var
 *     is not set, which is still a secure Ory-hosted endpoint.
 */

const { Configuration, FrontendApi } = require("@ory/client");

/**
 * ory: Ory FrontendApi client for session verification.
 *
 * [API2:2023 - Broken Authentication]
 * basePath points to the Ory project API, configured per-environment via
 * ORY_SDK_URL. withCredentials: true is required so that the session cookie
 * sent by the browser is forwarded to Ory for validation.
 */
const ory = new FrontendApi(
  new Configuration({
    basePath:    process.env.ORY_SDK_URL || "https://suspicious-agnesi-frtp7mro6t.projects.oryapis.com",
    baseOptions: {
      withCredentials: true, // Forward session cookies to Ory for server-side validation
    },
  })
);

module.exports = ory;
