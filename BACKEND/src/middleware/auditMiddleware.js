/**
 * @file auditMiddleware.js
 * @purpose Express middleware factory that wraps route handler responses to
 *   automatically create an AuditLog entry for every action it decorates.
 *
 * SECURE CODING PRACTICES APPLIED IN THIS FILE:
 * -----------------------------------------------
 * [API9:2023 - Improper Inventory Management / Audit Trail]
 *   - Provides a centralized, automatic mechanism for recording user actions.
 *   - Captures who performed the action (user ID), what they did (action name),
 *     on which resource (URL + resource ID), from where (IP address and User-Agent),
 *     and whether it succeeded or failed.
 *   - Audit failures are caught and logged to console rather than propagated,
 *     ensuring that audit errors never break the primary business logic.
 *
 * [Error Handling]
 *   - The AuditLog.create() call is fire-and-forget (no await in the middleware
 *     wrapper) — it uses .catch() to prevent an audit DB failure from blocking
 *     or crashing the response.
 *
 * [Missing or Incorrect Authorization]
 *   - Combined with protect() and authorize() middleware, the audit trail
 *     provides non-repudiation: every authorized action is recorded with
 *     the authenticated user's ID.
 */

const AuditLog = require("../models/AuditLog");

/**
 * audit: Middleware factory that records an AuditLog entry after each response.
 *
 * [API9:2023 / Audit Trail / Non-Repudiation]
 * Intercepts res.json() to inspect the outgoing response status code.
 * Determines success or failure based on whether the status code is >= 400.
 * Creates an AuditLog document with:
 *   - user:       The authenticated user's ID (from req.user, set by protect())
 *   - action:     The action label passed to audit() (e.g., "CREATE_PROJECT")
 *   - resource:   The full API path (baseUrl + path)
 *   - resourceId: req.params.id if present (the specific resource acted upon)
 *   - ipAddress:  Client IP address (for IP-based forensics)
 *   - userAgent:  Client User-Agent header (for device/browser tracking)
 *   - status:     "success" (< 400) or "failure" (>= 400)
 *   - details:    Error message on failure, generic success text on success
 *
 * @param {string} action - Human-readable action label (e.g., "DELETE_PROJECT")
 * @returns {Function}    - Express middleware function
 */
exports.audit = (action) => {
  return async (req, res, next) => {
    // Save reference to the original res.json method
    const originalJson = res.json;

    // Intercept res.json to capture the response before it is sent
    res.json = function (data) {
      const log = {
        user:       req.user ? req.user.id : null,  // null for unauthenticated requests
        action:     action,
        resource:   req.baseUrl + req.path,
        resourceId: req.params.id || null,
        ipAddress:  req.ip,
        userAgent:  req.get("user-agent"),
        // [Error Handling] Classify as failure for any 4xx/5xx response
        status:     res.statusCode >= 400 ? "failure" : "success",
        details:    res.statusCode >= 400 ? data.message : "Action completed successfully",
      };

      // [Error Handling] Fire-and-forget: audit log failures must not break the response
      AuditLog.create(log).catch((err) => console.error("Audit log failed", err));

      // Call the original res.json to send the response normally
      return originalJson.call(this, data);
    };

    next();
  };
};
