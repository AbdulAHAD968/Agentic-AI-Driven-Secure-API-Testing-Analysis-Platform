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
 */

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
const sanitizeValue = (val) => {
  if (typeof val !== "string") return val;

  return val
    .replace(/\$/g, "_")                                    // NoSQL injection: neutralize MongoDB operators
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "") // XSS: strip complete <script> blocks
    .replace(/[<>]/g, "");                                  // XSS: strip remaining HTML angle brackets
};

/**
 * deepSanitize: Recursively sanitize all string values in an object.
 *
 * [Reliance on Untrusted Inputs]
 * Traverses nested objects/arrays to ensure that injection payloads
 * hidden in deeply nested request body structures are also neutralized.
 *
 * @param {Object|Array} obj - The object to sanitize in-place
 * @returns {Object|Array}   - The same object with all strings sanitized
 */
const deepSanitize = (obj) => {
  if (obj && typeof obj === "object") {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value && typeof value === "object") {
        deepSanitize(value); // Recurse for nested objects and arrays
      } else {
        obj[key] = sanitizeValue(value);
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
  if (req.body)   deepSanitize(req.body);    // Sanitize parsed JSON/form body
  if (req.query)  deepSanitize(req.query);   // Sanitize query string parameters
  if (req.params) deepSanitize(req.params);  // Sanitize URL route parameters

  next();
};

module.exports = customSanitizer;
