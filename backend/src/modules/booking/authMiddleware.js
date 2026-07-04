const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'unihub_dev_secret';

/**
 * verifyToken
 * -----------
 * Extracts and verifies a JWT from the Authorization header.
 * On success, attaches `req.user = { id, role, name }` for
 * downstream handlers.
 *
 * Expected header format:  Authorization: Bearer <token>
 * Expected JWT payload:    { id: number, role: string, name: string }
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid Bearer token.',
    });
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
    const message =
      err.name === 'TokenExpiredError'
        ? 'Token has expired. Please log in again.'
        : 'Invalid token. Access denied.';
    return res.status(401).json({ success: false, message });
  }
}

/**
 * requireRole(...allowedRoles)
 * ----------------------------
 * Higher-order middleware that returns 403 if the authenticated
 * user's role is not among the allowed set.
 *
 * Usage:
 *   router.patch('/...', verifyToken, requireRole('FACULTY', 'ADMIN'), handler);
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
