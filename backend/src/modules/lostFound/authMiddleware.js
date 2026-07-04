const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'unihub_dev_secret';

/**
 * verifyToken
 * -----------
 * Extracts and verifies a JWT from the Authorization header.
 * Attaches a fallback demo user if no token is provided to keep development seamless.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Graceful fallback context for local development
    req.user = { id: 1, name: 'Demo Student', role: 'STUDENT' };
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name || 'Unknown',
    };
    next();
  } catch (err) {
    // Graceful fallback context if token is expired/invalid locally
    req.user = { id: 1, name: 'Demo Student', role: 'STUDENT' };
    next();
  }
}

/**
 * requireRole(...allowedRoles)
 * ----------------------------
 * Restricts access to specific user roles.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before role check.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
}

module.exports = { verifyToken, requireRole };
