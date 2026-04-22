

const sanitizeValue = (val) => {
  if (typeof val !== 'string') return val;
  
  
  
  return val
    .replace(/\$/g, '_')
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
    .replace(/[<>]/g, ''); 
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
