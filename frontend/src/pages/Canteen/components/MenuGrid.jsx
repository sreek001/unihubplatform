import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, Minus, Utensils } from 'lucide-react';

// ─── Animation config ───
const fluidSpring = { type: 'spring', stiffness: 280, damping: 28, mass: 0.8 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, ease: [0.25, 1, 0.5, 1] },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function MenuGrid({ menuItems, cart, updateCart }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -16 }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16,
      }}
    >
      {menuItems.length === 0 && (
        <motion.div
          variants={childVariants}
          style={{
            gridColumn: '1/-1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 24px',
            color: '#94a3b8',
            gap: 12,
          }}
        >
          <Utensils style={{ width: 40, height: 40, opacity: 0.3 }} />
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>Loading menu...</p>
        </motion.div>
      )}

      {menuItems.map(item => {
        const ItemIcon = item.icon;
        const cartItem = cart.find(i => i.id === item.id);
        const qty = cartItem ? cartItem.quantity : 0;

        return (
          <motion.div
            key={item.id}
            variants={childVariants}
            whileHover={item.stock ? { y: -6, scale: 1.015, transition: fluidSpring } : {}}
            whileTap={item.stock ? { scale: 0.985 } : {}}
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '22px 20px',
              borderRadius: 20,
              border: item.stock
                ? '1px solid rgba(15,76,129,0.07)'
                : '1px solid rgba(15,76,129,0.04)',
              background: item.stock
                ? 'rgba(255,255,255,0.75)'
                : 'rgba(249,250,251,0.6)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: item.stock
                ? '0 2px 16px rgba(15,76,129,0.05)'
                : 'none',
              opacity: item.stock ? 1 : 0.5,
              filter: item.stock ? 'none' : 'grayscale(0.4)',
              willChange: 'transform, opacity',
              transition: 'border-color 0.3s',
            }}
            onMouseEnter={e => {
              if (item.stock) e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = item.stock
                ? 'rgba(15,76,129,0.07)'
                : 'rgba(15,76,129,0.04)';
            }}
          >
            {/* Gold shimmer accent — top edge */}
            {item.stock && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)',
                  borderRadius: '20px 20px 0 0',
                  opacity: 0.8,
                }}
              />
            )}

            {/* Header row: icon + price */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  padding: 9,
                  borderRadius: 12,
                  background: item.stock ? 'rgba(29,78,216,0.08)' : 'rgba(15,76,129,0.04)',
                  border: item.stock ? '1px solid rgba(29,78,216,0.12)' : '1px solid transparent',
                  color: item.stock ? '#1d4ed8' : '#94a3b8',
                }}
              >
                <ItemIcon style={{ width: 18, height: 18 }} />
              </div>

              {/* Price badge — Liquid Gold */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  borderRadius: 9999,
                  background: item.stock
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                    : 'rgba(203,213,225,0.5)',
                  color: item.stock ? '#fff' : '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                  boxShadow: item.stock ? '0 2px 8px rgba(217,119,6,0.2)' : 'none',
                }}
              >
                ₹{item.price}
              </span>
            </div>

            <h3
              style={{
                margin: '0 0 4px',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '-0.01em',
              }}
            >
              {item.name}
            </h3>

            <p
              style={{
                margin: '0 0 16px',
                color: '#94a3b8',
                fontSize: '0.76rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Clock style={{ width: 12, height: 12 }} />
              Prep: {item.prepTime} mins
            </p>

            {/* Cart controls */}
            {item.stock ? (
              qty > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(29,78,216,0.06)',
                    border: '1px solid rgba(29,78,216,0.15)',
                    borderRadius: 12,
                    padding: 4,
                  }}
                >
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => updateCart(item, -1)}
                    style={{
                      padding: 8,
                      borderRadius: 9,
                      border: 'none',
                      background: 'transparent',
                      color: '#1d4ed8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Minus style={{ width: 15, height: 15 }} />
                  </motion.button>
                  <span style={{ fontWeight: 800, color: '#1d4ed8', fontSize: '0.9rem', minWidth: 24, textAlign: 'center' }}>
                    {qty}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => updateCart(item, 1)}
                    style={{
                      padding: 8,
                      borderRadius: 9,
                      border: 'none',
                      background: 'transparent',
                      color: '#1d4ed8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Plus style={{ width: 15, height: 15 }} />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(212,175,55,0.25)', transition: fluidSpring }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateCart(item, 1)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 12,
                    border: '1px solid rgba(212,175,55,0.3)',
                    background: 'rgba(255,251,235,0.8)',
                    color: '#92400e',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    fontFamily: 'Inter, sans-serif',
                    willChange: 'transform',
                  }}
                >
                  <Plus style={{ width: 15, height: 15 }} />
                  Add to Order
                </motion.button>
              )
            ) : (
              <div
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 12,
                  border: '1px dashed rgba(15,76,129,0.10)',
                  background: 'rgba(248,250,252,0.6)',
                  color: '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              >
                Sold Out
              </div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}