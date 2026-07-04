import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Utensils, Plus, Minus, ChevronRight } from 'lucide-react';

const fluidSpring = { type: 'spring', stiffness: 280, damping: 28, mass: 0.8 };

export default function CartSidebar({ cart, cartTotal, updateCart, placeOrder }) {
  return (
    <div className="hidden lg:block relative">
      <motion.div
        style={{
          position: 'sticky',
          top: 88,
          background: 'rgba(255,255,255,0.82)',
          border: '1px solid rgba(15,76,129,0.08)',
          borderRadius: 24,
          padding: 24,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 8px 40px rgba(15,76,129,0.07)',
          height: 'calc(100vh - 112px)',
          display: 'flex',
          flexDirection: 'column',
          willChange: 'transform',
        }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={fluidSpring}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: 'rgba(212,175,55,0.10)',
              border: '1px solid rgba(212,175,55,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingCart style={{ width: 17, height: 17, color: '#d97706' }} />
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
            }}
          >
            Your Tray
          </h2>
          {cart.length > 0 && (
            <span
              style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1d4ed8, #14b8a6)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 800,
              }}
            >
              {cart.length}
            </span>
          )}
        </div>

        {/* Items list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnimatePresence mode="popLayout">
            {cart.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  color: '#94a3b8',
                  padding: '40px 0',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'rgba(15,76,129,0.04)',
                    border: '1px solid rgba(15,76,129,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Utensils style={{ width: 26, height: 26, opacity: 0.35 }} />
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>
                  Your tray is empty
                </p>
              </motion.div>
            ) : (
              cart.map(item => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: -16 }}
                  key={item.id}
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(15,76,129,0.07)',
                    borderRadius: 14,
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    willChange: 'transform, opacity',
                  }}
                  transition={fluidSpring}
                >
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      {item.name}
                    </h4>
                    <p
                      style={{
                        margin: '3px 0 0',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: '#d97706',
                      }}
                    >
                      ₹{item.price}
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(15,76,129,0.05)',
                      borderRadius: 9,
                      padding: '2px 4px',
                      border: '1px solid rgba(15,76,129,0.08)',
                    }}
                  >
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => updateCart(item, -1)}
                      style={{
                        padding: '4px 6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Minus style={{ width: 13, height: 13 }} />
                    </motion.button>
                    <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', minWidth: 16, textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => updateCart(item, 1)}
                      style={{
                        padding: '4px 6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Plus style={{ width: 13, height: 13 }} />
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Checkout footer */}
        <div style={{ paddingTop: 20, borderTop: '1px solid rgba(15,76,129,0.08)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <span style={{ color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Total
            </span>
            <span
              style={{
                fontSize: '1.8rem',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                backgroundImage: 'linear-gradient(90deg, #1d4ed8, #0f766e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ₹{cartTotal}
            </span>
          </div>
          <motion.button
            whileHover={cart.length > 0 ? { scale: 1.02, boxShadow: '0 10px 32px rgba(15,76,129,0.28)', transition: fluidSpring } : {}}
            whileTap={cart.length > 0 ? { scale: 0.98 } : {}}
            onClick={placeOrder}
            disabled={cart.length === 0}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 16,
              border: 'none',
              background: cart.length > 0
                ? 'linear-gradient(135deg, #1d4ed8 0%, #14b8a6 100%)'
                : 'rgba(226,232,240,0.7)',
              color: cart.length > 0 ? '#fff' : '#94a3b8',
              fontSize: '0.875rem',
              fontWeight: 800,
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontFamily: 'Inter, sans-serif',
              boxShadow: cart.length > 0 ? '0 4px 20px rgba(15,76,129,0.22)' : 'none',
              willChange: 'transform',
              transition: 'background 0.3s',
            }}
          >
            Place Order
            <ChevronRight style={{ width: 17, height: 17 }} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}