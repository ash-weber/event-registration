function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.code === 'P2002') {
    statusCode = 409;
    const field = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
    message = `A record with this ${field} already exists.`;
  }

  const payload = {
    success: false,
    message,
  };

  if (err.details) payload.errors = err.details;

  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }

  console.error(`[ERROR] ${req.method} ${req.originalUrl} -> ${statusCode}: ${message}`);

  res.status(statusCode).json(payload);
}

function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };