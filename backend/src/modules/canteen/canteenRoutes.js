const express = require('express');
const router = express.Router();

const canteenController = require('./canteenController');
const { verifyToken, requireRole } = require('./authMiddleware');



router.get('/menu', canteenController.getMenu);


router.post('/order', canteenController.createOrder);


router.get(
  '/orders',

  canteenController.getAllOrders
);


router.patch(
  '/order/:id/status',
  
  canteenController.updateOrderStatus
);
router.patch(
  "/menu/:id/stock",
  canteenController.updateStock
);

module.exports = router;