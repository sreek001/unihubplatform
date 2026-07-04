const db = require('./db');
const CanteenModel = require('./canteenModel');

// ======================================
// GET MENU
// ======================================

exports.getMenu = async (req, res) => {
  try {

    const menu = await CanteenModel.getMenu();

    return res.status(200).json({
      success: true,
      count: menu.length,
      menu
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

// ======================================
// CREATE ORDER
// ======================================

exports.createOrder = async (req, res) => {

  const client = await db.connect();

  try {

    const { userId, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one menu item."
      });
    }

    await client.query("BEGIN");

    let totalAmount = 0;
    const validatedItems = [];

    // Validate every ordered item
    for (const item of items) {

      const menuItem = await CanteenModel.getMenuItemById(item.menuItemId);

      if (!menuItem) {
        throw new Error(`Menu item with ID ${item.menuItemId} not found.`);
      }

      if (!menuItem.available) {
        throw new Error(`${menuItem.name} is currently unavailable.`);
      }

     if (menuItem.stock < item.quantity) {

  await client.query("ROLLBACK");

  return res.status(400).json({
    success: false,
    message: "Insufficient stock.",
    itemName: menuItem.name,
    availableStock: menuItem.stock
  });

}

      totalAmount += Number(menuItem.price) * item.quantity;

      validatedItems.push({
        id: menuItem.id,
        quantity: item.quantity,
        price: Number(menuItem.price)
      });
    }

    // Create Order
    const order = await CanteenModel.createOrder(
      client,
      userId || 1,
      totalAmount
    );

    // Insert Order Items
    for (const item of validatedItems) {

      await CanteenModel.createOrderItem(
        client,
        order.id,
        item.id,
        item.quantity,
        item.price
      );

      // Reduce stock
      await client.query(
        `
        UPDATE menu_items
        SET stock = stock - $1
        WHERE id = $2
        `,
        [
          item.quantity,
          item.id
        ]
      );

    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order
    });

  } catch (err) {

    await client.query("ROLLBACK");

    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  } finally {

    client.release();

  }

};
// ======================================
// GET ALL ORDERS
// ======================================

exports.getAllOrders = async (req, res) => {

  try {

    const orders = await CanteenModel.getAllOrders();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }

};

// ======================================
// UPDATE ORDER STATUS
// ======================================

exports.updateOrderStatus = async (req, res) => {

  try {

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = [
      "PENDING",
      "PREPARING",
      "READY",
      "DELIVERED",
      "CANCELLED"
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required."
      });
    }

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status."
      });
    }

    const order = await CanteenModel.updateOrderStatus(
      id,
      status
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }

};