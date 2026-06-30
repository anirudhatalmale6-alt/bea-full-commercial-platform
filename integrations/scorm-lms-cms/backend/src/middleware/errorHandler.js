'use strict';
const logger = require('../lib/logger');

function errorHandler(err, req, res, _next) {
  // Validation errors from express-validator surface as arrays
  if (Array.isArray(err)) {
    return res.status(422).json({ errors: err });
  }

  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Internal server error';

  if (status >= 500) {
    logger.error('Unhandled error', { error: err.message, stack: err.stack, path: req.path });
  }

  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
