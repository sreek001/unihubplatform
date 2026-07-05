'use strict';

/**
 * backend/src/modules/auth/authRoutes.js
 * ────────────────────────────────────────
 * Mounts at: /api/auth   (registered in backend/index.js)
 *
 *   POST /api/auth/login  — public, issues JWT
 *   GET  /api/auth/me     — protected, restores session
 */

const express       = require('express');
const router        = express.Router();
const { login, me } = require('./authController');
const { verifyToken } = require('../../middleware/authMiddleware');

// Public endpoint — no token needed
router.post('/login', login);

// Protected endpoint — token required for session restoration
router.get('/me', verifyToken, me);

module.exports = router;
