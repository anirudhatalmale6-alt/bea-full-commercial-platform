'use strict';
const jwt = require('jsonwebtoken');

/**
 * Verify JWT and attach decoded payload to req.user.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token expired or invalid.' });
  }
}

/**
 * Role guard factory.
 * @param {...string} roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    next();
  };
}

/**
 * Ensure the authenticated user can only access their own resources
 * OR has an elevated role that grants access to anyone.
 * @param {string} paramName - req.params key that holds the target user/learner id
 * @param {...string} allowedRoles - roles that bypass the ownership check
 */
function requireOwnerOrRole(paramName, ...allowedRoles) {
  return (req, res, next) => {
    if (allowedRoles.includes(req.user.role)) return next();
    if (req.user.sub === req.params[paramName]) return next();
    return res.status(403).json({ error: 'Access denied.' });
  };
}

module.exports = { authenticate, requireRole, requireOwnerOrRole };
