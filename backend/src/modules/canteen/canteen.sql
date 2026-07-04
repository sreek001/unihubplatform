-- =====================================================
-- CAMPUS CANTEEN TRACKER DATABASE
-- =====================================================

---

-- MENU ITEMS

---

CREATE TABLE menu_items (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL,
description TEXT,
price DECIMAL(10,2) NOT NULL,
stock INT DEFAULT 0,
prep_time INT DEFAULT 5,
image_url TEXT,
available BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---

-- ORDERS

---

CREATE TABLE orders (
id SERIAL PRIMARY KEY,
user_id INT NOT NULL,
token_number SERIAL UNIQUE,
total_amount DECIMAL(10,2) DEFAULT 0,
status VARCHAR(20) DEFAULT 'PENDING'
CHECK (
status IN (
'PENDING',
'PREPARING',
'READY',
'DELIVERED',
'CANCELLED'
)
),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---

-- ORDER ITEMS

---

CREATE TABLE order_items (
id SERIAL PRIMARY KEY,
order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
menu_item_id INT NOT NULL REFERENCES menu_items(id),
quantity INT DEFAULT 1,
price DECIMAL(10,2) NOT NULL
);

---

-- SAMPLE MENU DATA

---

INSERT INTO menu_items
(name, description, price, stock, prep_time)
VALUES
('Veg Meal', 'Rice, curry and side dishes', 50, 25, 5),

('Chicken Roll', 'Freshly prepared chicken roll', 45, 20, 3),

('Masala Dosa', 'South Indian breakfast item', 40, 15, 4),

('Cold Coffee', 'Chilled coffee beverage', 35, 30, 2),

('Fresh Lime', 'Refreshing lime juice', 20, 50, 1);
