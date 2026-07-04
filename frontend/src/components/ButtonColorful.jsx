import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ─── Framer Motion Variants ───
const buttonVariants = {
  rest: {
    scale: 1,
    boxShadow: '0 4px 16px rgba(15,76,129,0.18)',
  },
  hover: {
    scale: 1.04,
    boxShadow: '0 10px 36px rgba(15,76,129,0.32)',
    transition: { type: 'spring', stiffness: 280, damping: 20 },
  },
  tap: {
    scale: 0.97,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
};

const borderVariants = {
  rest: { opacity: 0, scale: 0.92 },
  hover: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.22, ease: 'easeOut' },
  },
};

/**
 * ButtonColorful
 * Ultra-premium CTA button with gradient shimmer sweep,
 * Framer Motion spring micro-interactions, and focus expansion ring.
 *
 * @param {string}   children   - Button label text
 * @param {Function} onClick    - Click handler
 * @param {string}   className  - Extra Tailwind classes
 * @param {string}   href       - Optional link href (renders as anchor)
 * @param {object}   props      - Any additional HTML button props
 */
export default function ButtonColorful({
  children = 'Get Started',
  onClick,
  className = '',
  href,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <motion.button
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={[
        'relative inline-flex items-center justify-center gap-2.5',
        'px-8 py-3.5 rounded-2xl overflow-hidden cursor-pointer',
        'text-sm font-bold tracking-wide text-white',
        'border border-transparent',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        className,
      ].join(' ')}
      style={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, #14b8a6 55%, #d97706 100%)',
      }}
      {...props}
    >
      {/* ── Shimmer sweep layer ── */}
      <span
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ overflow: 'hidden', borderRadius: 'inherit' }}
      >
        <span
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%)',
            animation: isHovered ? 'shimmerSweep 0.7s ease forwards' : 'none',
            transform: isHovered ? undefined : 'translateX(-100%)',
          }}
        />
      </span>

      {/* ── Focus expansion ring ── */}
      <motion.span
        aria-hidden="true"
        variants={borderVariants}
        className="absolute inset-[-2px] rounded-[18px] pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(29,78,216,0.5), rgba(20,184,166,0.5), rgba(217,119,6,0.5))',
          zIndex: -1,
        }}
      />

      {/* ── Label ── */}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );

  if (href) {
    return (
      <a href={href} style={{ textDecoration: 'none', display: 'inline-block' }}>
        {content}
      </a>
    );
  }

  return content;
}
