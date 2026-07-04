import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Clock, ChefHat } from 'lucide-react';
import './CanteenDashboard.css';

// Import our cleanly separated components
import MenuGrid from './components/MenuGrid';
import LiveTracker from './components/LiveTracker';
import CartSidebar from './components/CartSidebar';

// ─── Framer spring config ───
const fluidSpring = { type: 'spring', stiffness: 280, damping: 28, mass: 0.8 };

export default function CanteenDashboard() {
  const [activeTab, setActiveTab] = useState('menu');
  const [cart, setCart] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMenu = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/canteen/menu');
      const data = await response.json();
      const formattedMenu = data.menu.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        prepTime: item.prep_time,
        stock: item.stock > 0,
        stockCount: item.stock,
        icon: Utensils,
        color: '#1d4ed8',
      }));
      setMenuItems(formattedMenu);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // ─── STATE LOGIC ───
  const updateCart = (item, delta) => {
    if (!item.stock) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        const nextQty = existing.quantity + delta;
        if (nextQty <= 0) return prev.filter(i => i.id !== item.id);
        return prev.map(i => i.id === item.id ? { ...i, quantity: nextQty } : i);
      }
      if (delta > 0) return [...prev, { ...item, quantity: 1 }];
      return prev;
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    try {
      const response = await fetch('http://localhost:4000/api/canteen/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          items: cart.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await response.json();
      console.log(data);

      if (!data.success) {
        const stockMessage =
          data.availableStock === 0
            ? `${data.itemName} is completely out of stock.`
            : `${data.itemName} has only ${data.availableStock} item(s) left.`;
        alert(`Order Failed\n\n${stockMessage}\n\nPlease reduce the quantity and try again.`);
        fetchMenu();
        return;
      }

      const maxPrep = Math.max(...cart.map(i => i.prepTime));
      setActiveOrder({
        id: data.order.token_number,
        items: [...cart],
        total: cartTotal,
        status: data.order.status,
        eta: maxPrep + 5,
        queue: 3,
      });
      setCart([]);
      setActiveTab('tracker');
      alert(`Order Placed!\n\nToken Number: ${data.order.token_number}`);
      fetchMenu();
    } catch (error) {
      console.error(error);
      alert('Unable to connect to backend.');
    }
  };

  const tabs = [
    { id: 'menu', label: 'Live Menu', icon: Utensils },
    { id: 'tracker', label: 'Order Tracker', icon: Clock },
  ];

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background: '#fafafc',
        color: '#0f172a',
      }}
    >
      <div
        className="max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-10"
        style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}
      >
        {/* ── Main grid — content + sidebar ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 32,
          }}
          className="lg:grid-cols-[1fr_360px]"
        >
          {/* LEFT COLUMN: Main Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* ── Page intro (replaces heavy dark header) ── */}
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={fluidSpring}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 20,
                borderBottom: '1px solid rgba(15,76,129,0.07)',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.025em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <ChefHat style={{ width: 26, height: 26, color: '#d97706' }} />
                  Live Canteen
                </h1>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>
                  Skip the line. Order from class.
                </p>
              </div>

              {/* Live badge */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 14px',
                  borderRadius: 9999,
                  background: 'rgba(212,175,55,0.08)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#92400e',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#d97706',
                    boxShadow: '0 0 0 3px rgba(217,119,6,0.2)',
                    animation: 'pulse 2s infinite',
                    display: 'inline-block',
                  }}
                />
                Kitchen Live
              </span>
            </motion.div>

            {/* ── Tab switcher — light glass ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fluidSpring, delay: 0.08 }}
              style={{
                display: 'flex',
                gap: 4,
                background: 'rgba(255,255,255,0.75)',
                padding: 5,
                borderRadius: 16,
                border: '1px solid rgba(15,76,129,0.08)',
                backdropFilter: 'blur(16px)',
                width: 'fit-content',
                boxShadow: '0 2px 12px rgba(15,76,129,0.05)',
              }}
            >
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    disabled={tab.id === 'tracker' && !activeOrder}
                    whileHover={tab.id === 'tracker' && !activeOrder ? {} : { scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '9px 18px',
                      borderRadius: 12,
                      border: 'none',
                      background: 'transparent',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      fontFamily: 'Inter, sans-serif',
                      cursor: tab.id === 'tracker' && !activeOrder ? 'not-allowed' : 'pointer',
                      opacity: tab.id === 'tracker' && !activeOrder ? 0.35 : 1,
                      color: isActive ? '#1d4ed8' : '#64748b',
                      transition: 'color 0.2s',
                      zIndex: 1,
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="canteenTabBubble"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(29,78,216,0.07)',
                          border: '1px solid rgba(29,78,216,0.14)',
                          borderRadius: 12,
                          zIndex: -1,
                        }}
                        transition={fluidSpring}
                      />
                    )}
                    <Icon style={{ width: 15, height: 15 }} />
                    {tab.label}
                  </motion.button>
                );
              })}
            </motion.div>

            {/* DYNAMIC CONTENT SWITCHING */}
            <AnimatePresence mode="wait">
              {activeTab === 'menu' ? (
                <MenuGrid
                  key="menu"
                  menuItems={menuItems}
                  cart={cart}
                  updateCart={updateCart}
                />
              ) : (
                <LiveTracker key="tracker" activeOrder={activeOrder} />
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Cart Sidebar */}
          <CartSidebar
            cart={cart}
            cartTotal={cartTotal}
            updateCart={updateCart}
            placeOrder={placeOrder}
          />
        </div>
      </div>
    </div>
  );
}