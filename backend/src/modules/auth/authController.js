'use strict';

/**
 * backend/src/modules/auth/authController.js
 * ────────────────────────────────────────────
 * Handles:
 *   POST /api/auth/login  — credential validation + JWT issuance
 *   GET  /api/auth/me     — session restoration (token → user object)
 */

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { query } = require('../../db');               // primary DB pool

const JWT_SECRET  = process.env.JWT_SECRET || 'unihub_jwt_secret_change_me_in_prod';
const JWT_EXPIRES = '24h';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Map a DB role name → the frontend route the user should land on after login.
 * The frontend also performs this mapping in AuthContext, but the backend
 * echoes it so clients have one authoritative source.
 */
function resolveRedirect(role, department) {
  switch (role) {
    case 'CANTEEN_ADMIN':  return '/canteen/admin';
    case 'PRINT_OPERATOR': return '/print';
    case 'ADMIN':          return '/';
    case 'STUDENT':
    default:               return '/';
  }
}

// ─── POST /api/auth/login ────────────────────────────────────────────────────

/**
 * Accepts:
 *   { identifier: string, password: string, loginType: 'student' | 'admin' }
 *
 * - loginType 'student' → looks up by college_id
 * - loginType 'admin'   → looks up by admin_id
 *
 * Returns:
 *   { success, token, user: { id, name, role, department }, redirectTo }
 */
async function login(req, res) {
  try {
    const { identifier, password, loginType } = req.body;

    // ── Input validation ──────────────────────────────────────────────────
    if (!identifier || !password || !loginType) {
      return res.status(400).json({
        success: false,
        message: 'identifier, password and loginType are all required.',
      });
    }

    if (!['student', 'admin'].includes(loginType)) {
      return res.status(400).json({
        success: false,
        message: "loginType must be either 'student' or 'admin'.",
      });
    }

    // ── Determine lookup column ───────────────────────────────────────────
    const lookupColumn = loginType === 'student' ? 'college_id' : 'admin_id';

    // ── Fetch user (join roles so we get the role name string) ────────────
    const sql = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.college_id,
        u.admin_id,
        u.password_hash,
        u.department,
        u.is_active,
        r.name AS role
      FROM  unihub_users u
      JOIN  unihub_roles r ON r.id = u.role_id
      WHERE u.${lookupColumn} = $1
      LIMIT 1
    `;

    const { rows } = await query(sql, [identifier.trim()]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your ID and password.',
      });
    }

    const user = rows[0];

    // ── Account status check ──────────────────────────────────────────────
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact your administrator.',
      });
    }

    // ── Password verification ─────────────────────────────────────────────
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your ID and password.',
      });
    }

    // ── JWT signing ───────────────────────────────────────────────────────
    const payload = {
      id:         user.id,
      name:       user.name,
      role:       user.role,
      department: user.department,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    // ── Log the successful login event (best-effort, non-blocking) ────────
    const ip        = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    query(
      `INSERT INTO unihub_login_events (user_id, ip_address, user_agent, success)
       VALUES ($1, $2, $3, TRUE)`,
      [user.id, ip, userAgent]
    ).catch(() => {}); // swallow — audit log must never break auth flow

    // ── Respond ───────────────────────────────────────────────────────────
    return res.status(200).json({
      success:    true,
      token,
      user: {
        id:         user.id,
        name:       user.name,
        role:       user.role,
        department: user.department,
      },
      redirectTo: resolveRedirect(user.role, user.department),
    });
  } catch (err) {
    console.error('[Auth] login error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
}

// ─── GET /api/auth/me ────────────────────────────────────────────────────────

/**
 * Protected route — verifyToken middleware must run first.
 * Returns the decoded user object so the frontend can restore sessions
 * after a page refresh without re-logging-in.
 */
async function me(req, res) {
  try {
    // req.user was attached by verifyToken middleware
    const { rows } = await query(
      `SELECT u.id, u.name, u.email, u.college_id, u.admin_id,
              u.department, u.is_active, r.name AS role
       FROM   unihub_users u
       JOIN   unihub_roles r ON r.id = u.role_id
       WHERE  u.id = $1 AND u.is_active = TRUE
       LIMIT  1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated.' });
    }

    const user = rows[0];
    return res.status(200).json({
      success: true,
      user: {
        id:         user.id,
        name:       user.name,
        email:      user.email,
        college_id: user.college_id,
        admin_id:   user.admin_id,
        role:       user.role,
        department: user.department,
      },
    });
  } catch (err) {
    console.error('[Auth] me error:', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = { login, me };
