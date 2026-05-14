const { HttpError } = require('../utils/httpError');
const { ZodError } = require('zod');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  // Prisma known errors
  if (err && err.code === 'P2002') {
    return res.status(409).json({ error: 'Unique constraint violation', details: err.meta });
  }
  if (err && err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }

  console.error('[error]', err);
  res.status(500).json({ error: 'Internal Server Error' });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };
