const express = require('express');
const router = express.Router();

const { verifyToken } = require('./authMiddleware');
const {
  getLocations,
  getPosts,
  createPost,
  updateStatus,
  deletePost,
  cleanupExpired,
} = require('./lostFoundController');

// ─── Lost & Found Routes ───
router.get('/locations', getLocations);
router.get('/posts', getPosts);
router.post('/posts', verifyToken, createPost);
router.patch('/posts/:id/status', verifyToken, updateStatus);
router.delete('/posts/:id', verifyToken, deletePost);
router.delete('/cleanup', verifyToken, cleanupExpired);

module.exports = router;
