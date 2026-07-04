const db = require('./db');

const CanteenModel = {

  // ==========================
  // MENU
  // ==========================

  async getMenu() {
    const query = `
      SELECT *
      FROM menu_items
      WHERE available = TRUE
      ORDER BY id;
    `;

    const { rows } = await db.query(query);
    return rows;
  },

  async getMenuItemById(id) {
    const query = `
      SELECT *
      FROM menu_items
      WHERE id = $1
      LIMIT 1;
    `;

    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  // ==========================
  // ORDER
  // ==========================

 async createOrder(client, userId, totalAmount) {

  const query = `
    INSERT INTO orders
    (
      user_id,
      total_amount
    )
    VALUES
    ($1, $2)
    RETURNING *;
  `;

  const { rows } = await client.query(
    query,
    [
      userId,
      totalAmount
    ]
  );

  return rows[0];
},
  async createOrderItem(
  client,
  orderId,
  menuItemId,
  quantity,
  price
) {

  const query = `
    INSERT INTO order_items
    (
      order_id,
      menu_item_id,
      quantity,
      price
    )
    VALUES
    ($1, $2, $3, $4)
    RETURNING *;
  `;

  const { rows } = await client.query(
    query,
    [
      orderId,
      menuItemId,
      quantity,
      price
    ]
  );

  return rows[0];
},

  // ==========================
  // STAFF
  // ==========================

  async getAllOrders() {

    const query = `
      SELECT
          o.id,
          o.token_number,
          o.user_id,
          o.total_amount,
          o.status,
          o.created_at,

          json_agg(
              json_build_object(
                  'menuItemId', oi.menu_item_id,
                  'name', m.name,
                  'quantity', oi.quantity,
                  'price', oi.price
              )
          ) AS items

      FROM orders o

      JOIN order_items oi
      ON o.id = oi.order_id

      JOIN menu_items m
      ON oi.menu_item_id = m.id

      GROUP BY o.id

      ORDER BY o.created_at DESC;
    `;

    const { rows } = await db.query(query);

    return rows;
  },

  async getOrderById(id) {

    const query = `
      SELECT
          o.*,

          json_agg(
              json_build_object(
                  'menuItemId', oi.menu_item_id,
                  'name', m.name,
                  'quantity', oi.quantity,
                  'price', oi.price
              )
          ) AS items

      FROM orders o

      JOIN order_items oi
      ON o.id = oi.order_id

      JOIN menu_items m
      ON oi.menu_item_id = m.id

      WHERE o.id = $1

      GROUP BY o.id;
    `;

    const { rows } = await db.query(query, [id]);

    return rows[0];
  },

  async updateOrderStatus(orderId, status) {

    const query = `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `;

    const { rows } = await db.query(
      query,
      [
        status,
        orderId
      ]
    );

    return rows[0];
  }

};

module.exports = CanteenModel;