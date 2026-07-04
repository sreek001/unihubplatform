const express = require('express');
const router = express.Router();

const canteenController = require('./canteenController');
const { verifyToken, requireRole } = require('./authMiddleware');



router.get('/menu', canteenController.getMenu);


router.post('/order', canteenController.createOrder);


router.get(
  '/orders',
  verifyToken,
  requireRole('ADMIN', 'STAFF'),
  canteenController.getAllOrders
);


router.patch(
  '/order/:id/status',
  verifyToken,
  requireRole('ADMIN', 'STAFF'),
  canteenController.updateOrderStatus
);

module.exports = router;