const xss = require('xss');


function sanitizeValue(value) {
  if (typeof value === 'string') {
    return xss(value.trim(), { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ['script'] });
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const clean = {};
    for (const key of Object.keys(value)) {
      clean[key] = sanitizeValue(value[key]);
    }
    return clean;
  }
  return value;
}

function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
}

module.exports = sanitizeBody;