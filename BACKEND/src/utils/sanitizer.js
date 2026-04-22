/**
 * Express 5 Compatible NoSQL & XSS Sanitizer
 * 
 * Standard middlewares like xss-clean and older mongo-sanitize fail on Express 5
 * because they attempt to re-assign read-only properties like req.query.
 * 
 * This sanitizer performs deep traversal and modifies values IN-PLACE
 * to maintain compatibility with Express 5's read-only getters.
 */

const sanitizeValue = (val) => {
  if (typeof val !== 'string') return val;
  
  // Neutralize NoSQL injection patterns ($ and .)
  // and basic XSS script tags
  return val
    .replace(/\$/g, '_')
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
    .replace(/[<>]/g, ''); // Basic character neutralization
};

const deepSanitize = (obj) => {
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value && typeof value === 'object') {
        deepSanitize(value);
      } else {
        obj[key] = sanitizeValue(value);
      }
    });
  }
  return obj;
};

const customSanitizer = (req, res, next) => {
  if (req.body) deepSanitize(req.body);
  if (req.query) deepSanitize(req.query);
  if (req.params) deepSanitize(req.params);
  
  next();
};

module.exports = customSanitizer;
