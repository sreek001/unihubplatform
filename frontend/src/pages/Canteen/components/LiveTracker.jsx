import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, CheckCircle2, ChefHat, Sparkles } from 'lucide-react';

const fluidSpring = { type: 'spring', stiffness: 280, damping: 28, mass: 0.8 };

export default function LiveTracker({ activeOrder }) {
  if (!activeOrder) return null;

const currentStep =
  activeOrder.status === "received"
    ? 0
    : activeOrder.status === "preparing"
    ? 1
    : 2;

const steps = [
  {
    step: "Received",
    icon: CheckCircle2,
    active: currentStep >= 0
  },
  {
    step: "Preparing",
    icon: ChefHat,
    active: currentStep >= 1
  },
  {
    step: "Ready",
    icon: Sparkles,
    active: currentStep >= 2
  }
];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={fluidSpring}
      style={{
        background: 'rgba(255,255,255,0.82)',
        border: '1px solid rgba(15,76,129,0.08)',
        borderRadius: 24,
        padding: 32,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(15,76,129,0.06)',
        willChange: 'transform, opacity',
      }}
    >
      {/* Top accent bar — Blue→Teal→Gold */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #1d4ed8 0%, #14b8a6 55%, #d4af37 100%)',
          borderRadius: '24px 24px 0 0',
        }}
      />

      {/* Order header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#94a3b8',
              marginBottom: 4,
            }}
          >
            Order Token
          </p>
          <h2
            style={{
              margin: 0,
              fontSize: '1.8rem',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.03em',
            }}
          >
            {activeOrder.id}
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#94a3b8',
              marginBottom: 4,
            }}
          >
            Queue Position
          </p>
          <h2
            style={{
              margin: 0,
              fontSize: '2rem',
              fontWeight: 900,
              color: '#1d4ed8',
              letterSpacing: '-0.03em',
            }}
          >
            #{activeOrder.queue}
          </h2>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'relative', marginBottom: 40 }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            height: 4,
            background: 'rgba(15,76,129,0.08)',
            transform: 'translateY(-50%)',
            borderRadius: 9999,
          }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: activeOrder.status === 'ready' ? '100%' : '50%' }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            height: 4,
            background: 'linear-gradient(90deg, #1d4ed8, #14b8a6)',
            boxShadow: '0 0 12px rgba(20,184,166,0.3)',
            transform: 'translateY(-50%)',
            borderRadius: 9999,
          }}
        />

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...fluidSpring, delay: i * 0.12 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid',
                    borderColor: s.active ? '#14b8a6' : 'rgba(15,76,129,0.12)',
                    background: s.active
                      ? 'linear-gradient(135deg, #1d4ed8, #14b8a6)'
                      : 'rgba(255,255,255,0.8)',
                    color: s.active ? '#fff' : '#94a3b8',
                    boxShadow: s.active ? '0 4px 16px rgba(20,184,166,0.25)' : 'none',
                    transition: 'all 0.5s ease',
                  }}
                >
                  <Icon style={{ width: 18, height: 18 }} />
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: s.active ? '#0f172a' : '#94a3b8',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {s.step}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Order summary */}
      <div
        style={{
          background: 'rgba(15,76,129,0.03)',
          border: '1px solid rgba(15,76,129,0.07)',
          borderRadius: 16,
          padding: 20,
        }}
      >
        <h3
          style={{
            margin: '0 0 16px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Utensils style={{ width: 14, height: 14 }} />
          Order Summary
        </h3>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {activeOrder.items.map(item => (
            <li
              key={item.id}
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600 }}
            >
              <span style={{ color: '#475569' }}>
                <span style={{ color: '#94a3b8', marginRight: 8, fontWeight: 700 }}>
                  {item.quantity}x
                </span>
                {item.name}
              </span>
              <span style={{ color: '#0f172a', fontWeight: 800 }}>₹{item.price * item.quantity}</span>
            </li>
          ))}
        </ul>
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid rgba(15,76,129,0.07)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#64748b' }}>Total</span>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              backgroundImage: 'linear-gradient(90deg, #d97706, #d4af37)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
            }}
          >
            ₹{activeOrder.total}
          </span>
        </div>
      </div>
    </motion.div>
  );
}