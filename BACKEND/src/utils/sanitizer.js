/**
 * @file sanitizer.js
 * @purpose Custom Express middleware that performs deep sanitization of
 *   all incoming request data (body, query string, and route parameters)
 *   to protect against XSS, HTML injection, and NoSQL operator injection.
 *
 * SECURE CODING PRACTICES APPLIED IN THIS FILE:
 * -----------------------------------------------
 * [Cross-Site Scripting (XSS) / Reliance on Untrusted Inputs]
 *   - Removes complete <script>...</script> blocks from string values.
 *   - Strips HTML angle brackets (< and >) to prevent tag injection.
 *   - Replaces MongoDB operator prefix ($) with an underscore to neutralize
 *     NoSQL injection attempts (defense-in-depth alongside mongoSanitize).
 *
 * [SQL Injection / NoSQL Injection]
 *   - The $ replacement prevents MongoDB operators like $where, $gt, $ne
 *     from being injected through user-controlled strings.
 *
 * [Reliance on Untrusted Inputs]
 *   - Deep (recursive) traversal means nested objects and arrays in the
 *     request body are also sanitized, not just top-level fields.
 *   - Non-string values (numbers, booleans) are passed through unchanged
 *     to avoid corrupting legitimate data types.
 *   - Password and token values are not rewritten character-by-character;
 *     this preserves authentication secrets while mongoSanitize handles
 *     dangerous object keys/operators.
 */

const SECRET_VALUE_KEYS = new Set([
  "password",
  "currentPassword",
  "newPassword",
  "confirmPassword",
  "token",
  "csrf_token",
  "challengeToken",
]);

/**
 * sanitizeValue: Sanitize a single string value.
 *
 * Security checks applied:
 * 1. Replace $ prefix — neutralizes MongoDB operator injection.
 * 2. Remove <script> blocks — eliminates the most dangerous XSS vector.
 * 3. Strip < and > characters — prevents HTML tag injection in remaining content.
 *
 * [XSS / NoSQL Injection]
 *
 * @param {*} val - The value to sanitize (only strings are mutated)
 * @returns {*}   - Sanitized string, or the original value if not a string
 */
const sanitizeValue = (val, key = "") => {
  if (typeof val !== "string") return val;

  if (SECRET_VALUE_KEYS.has(key)) {
    /**
     * [Authentication Security]
     * Do not alter passwords, CSRF tokens, reset tokens, or MFA challenges:
     * changing `$`, `<`, or `>` inside secrets causes false login failures and
     * can invalidate cryptographically generated values. Object-key injection is
     * still handled by express-mongo-sanitize before this middleware.
     */
    return val;
  }

  return val
    .replace(/\$/g, "_")                                    // NoSQL injection: neutralize MongoDB operators
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") // XSS: strip complete <script> blocks
    .replace(/[<>]/g, "");                                  // XSS: strip remaining HTML angle brackets
};

/**
 * deepSanitize: Recursively sanitize all string values and remove MongoDB
 * operator keys (keys starting with `$`) from an object.
 *
 * [NoSQL Injection / Reliance on Untrusted Inputs]
 * express-mongo-sanitize v2 is incompatible with Express 5 because Express 5
 * makes req.query a read-only getter; the package throws
 * "Cannot set property query of #<IncomingMessage> which has only a getter"
 * on every request. This function replaces that package by:
 *   1. Deleting any key starting with `$` (MongoDB operator injection via key names).
 *   2. Replacing `$` in string values (value-level injection).
 * Both strategies together match the protection previously provided by
 * express-mongo-sanitize.
 *
 * @param {Object|Array} obj - The object to sanitize in-place
 * @returns {Object|Array}   - The same object with all strings sanitized
 */
const deepSanitize = (obj) => {
  if (obj && typeof obj === "object") {
    Object.keys(obj).forEach((key) => {
      /**
       * [NoSQL Injection] Keys beginning with `$` are MongoDB operator names
       * (e.g. `$gt`, `$where`, `$ne`). Delete them so callers cannot inject
       * operator objects such as `{ "password": { "$gt": "" } }`.
       */
      if (typeof key === "string" && key.startsWith("$")) {
        delete obj[key];
        return;
      }

      const value = obj[key];
      if (value && typeof value === "object") {
        deepSanitize(value); // Recurse for nested objects and arrays
      } else {
        obj[key] = sanitizeValue(value, key);
      }
    });
  }
  return obj;
};

/**
 * customSanitizer: Express middleware that sanitizes req.body, req.query, and req.params.
 *
 * [XSS / SQL Injection / Reliance on Untrusted Inputs]
 * - Applied globally in index.js before any route handler runs.
 * - Acts as a defense-in-depth layer alongside mongoSanitize() and helmet().
 * - Sanitizes all three input surfaces: parsed body, query string, and URL params.
 *
 * @param {Object}   req  - Express request object
 * @param {Object}   res  - Express response object (unused here)
 * @param {Function} next - Calls the next middleware in the chain
 */
const customSanitizer = (req, res, next) => {
  /**
   * [NoSQL Injection / XSS] Sanitize all three input surfaces.
   *
   * req.body and req.params are plain mutable objects — deepSanitize operates
   * in-place on them safely.
   *
   * req.query is a read-only getter in Express 5 (the object returned by the
   * getter CAN have its own properties mutated, but the getter itself cannot be
   * reassigned). deepSanitize therefore mutates the query object's properties
   * directly without trying to replace req.query itself — this is why
   * express-mongo-sanitize throws here and is not used.
   */
  if (req.body)   deepSanitize(req.body);
  if (req.query)  deepSanitize(req.query);
  if (req.params) deepSanitize(req.params);

  next();
};

module.exports = customSanitizer;
