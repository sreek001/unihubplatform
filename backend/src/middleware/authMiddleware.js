/**
 * backend/src/middleware/authMiddleware.js
 * ─────────────────────────────────────────
 * Canonical, app-wide JWT middleware for UniHub.
 *
 * The two module-scoped copies (canteen/authMiddleware.js and
 * booking/authMiddleware.js) are left intact so their require()
 * calls continue to work without changes.  New modules should
 * import from this centralised location instead:
 *
 *   const { verifyToken, requireRole } = require('../../middleware/authMiddleware');
 */

'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'unihub_jwt_secret_change_me_in_prod';

/**
 * verifyToken
 * ───────────
 * Extracts and cryptographically verifies a JWT from the
 * Authorization header (Bearer scheme).
 *
 * On success  → attaches `req.user = { id, name, role, department }` and calls next().
 * On failure  → 401 JSON with a descriptive message.
 *
 * Expected header:   Authorization: Bearer <token>
 * Expected payload:  { id, name, role, department }
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid Bearer token.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Normalise the fields we expose downstream
    req.user = {
      id:         decoded.id,
      name:       decoded.name       || 'Unknown',
      role:       decoded.role       || null,
      department: decoded.department || null,
    };
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Invalid or tampered token. Access denied.';
    return res.status(401).json({ success: false, message });
  }
}

/**
 * requireRole(...allowedRoles)
 * ────────────────────────────
 * Returns an Express middleware that guards the route against
 * users whose role is not in the allowed set.
 *
 * Must be used AFTER verifyToken so req.user is populated.
 *
 * Usage:
 *   router.get('/admin-only', verifyToken, requireRole('ADMIN'), handler);
 *   router.patch('/...', verifyToken, requireRole('CANTEEN_ADMIN', 'ADMIN'), handler);
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
        message: `Access denied. Required: [${allowedRoles.join(', ')}]. You are: ${req.user.role}.`,
      });
    }

    next();
  };
}

module.exports = { verifyToken, requireRole };
