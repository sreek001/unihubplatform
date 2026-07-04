import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  CalendarDays,
  Printer,
  Utensils,
  Inbox,
  ArrowRight,
} from 'lucide-react';

// ─── Card theme map ─────────────────────────────────────────────────────────
const CARDS = [
  {
    to: '/academics/marketplace',
    icon: GraduationCap,
    title: 'Academics Hub',
    description:
      'Explore subject syllabi, textbooks, and notes for every semester. Powered by your digital vault.',
    label: 'Open Academics Hub',
    iconColor: '#1d4ed8',
    iconBg: 'rgba(29,78,216,0.08)',
    glowColor: 'rgba(29,78,216,0.12)',
    borderHover: 'rgba(59,130,246,0.4)',
    gradientFrom: 'rgba(239,246,255,0.85)',
    accentBar: '#1d4ed8',
  },
  {
    to: '/bookings',
    icon: CalendarDays,
    title: 'Venue Booking',
    description:
      'Reserve seminar halls, labs, and project spaces. Check live availability and secure your slot instantly.',
    label: 'Open Venue Booking',
    iconColor: '#14b8a6',
    iconBg: 'rgba(20,184,166,0.08)',
    glowColor: 'rgba(20,184,166,0.12)',
    borderHover: 'rgba(20,184,166,0.4)',
    gradientFrom: 'rgba(240,253,250,0.85)',
    accentBar: '#14b8a6',
  },
  {
    to: '/print',
    icon: Printer,
    title: 'Print Hub',
    description:
      'Upload documents, choose print settings, pay online, and collect your prints without queues.',
    label: 'Open Print Hub',
    iconColor: '#0891b2',
    iconBg: 'rgba(8,145,178,0.08)',
    glowColor: 'rgba(8,145,178,0.12)',
    borderHover: 'rgba(6,182,212,0.4)',
    gradientFrom: 'rgba(236,254,255,0.85)',
    accentBar: '#0891b2',
  },
  {
    to: '/canteen',
    icon: Utensils,
    title: 'Live Canteen',
    description:
      'Skip the queue. Order from your classroom, track your food live, and pick up when ready.',
    label: 'Open Live Canteen',
    iconColor: '#d97706',
    iconBg: 'rgba(217,119,6,0.08)',
    glowColor: 'rgba(217,119,6,0.12)',
    borderHover: 'rgba(245,158,11,0.4)',
    gradientFrom: 'rgba(255,251,235,0.85)',
    accentBar: '#d97706',
  },
  {
    to: '/lost-found',
    icon: Inbox,
    title: 'Lost & Found',
    description:
      'Browse reported items lost or found on campus, submit new listings, or claim found objects online.',
    label: 'Open Lost & Found',
    iconColor: '#2563eb',
    iconBg: 'rgba(37,99,235,0.08)',
    glowColor: 'rgba(37,99,235,0.12)',
    borderHover: 'rgba(96,165,250,0.4)',
    gradientFrom: 'rgba(239,246,255,0.85)',
    accentBar: '#2563eb',
  },
];

// ─── Card item component ─────────────────────────────────────────────────────
function FeatureCard({ card, index }) {
  const Icon = card.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        whileHover={{
          y: -10,
          filter: 'grayscale(0)',
          boxShadow: `0 24px 60px ${card.glowColor}, 0 8px 24px rgba(15,76,129,0.06)`,
          borderColor: card.borderHover,
          transition: { type: 'spring', stiffness: 240, damping: 22 },
        }}
        initial={{ filter: 'grayscale(0.2)' }}
        style={{
          background: `linear-gradient(145deg, ${card.gradientFrom}, rgba(255,255,255,0.9))`,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(15,76,129,0.08)',
          borderRadius: 24,
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          minHeight: 260,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(15,76,129,0.05)',
          transition: 'border-color 0.3s',
        }}
      >
        {/* Accent bar */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: card.accentBar,
            borderRadius: '24px 24px 0 0',
            opacity: 0.8,
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.12, rotate: 6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: card.iconBg,
              border: `1px solid ${card.iconColor}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: card.iconColor,
              boxShadow: `0 0 18px ${card.glowColor}`,
            }}
          >
            <Icon style={{ width: 24, height: 24 }} />
          </motion.div>

          {/* Title + Description */}
          <div>
            <h3
              style={{
                margin: '0 0 8px',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
              }}
            >
              {card.title}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: '#64748b',
                lineHeight: 1.65,
                fontWeight: 500,
              }}
            >
              {card.description}
            </p>
          </div>
        </div>

        {/* CTA row */}
        <Link
          to={card.to}
          style={{ textDecoration: 'none' }}
        >
          <motion.div
            whileHover={{ x: 4 }}
            style={{
              marginTop: 20,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.82rem',
              fontWeight: 700,
              color: card.iconColor,
              transition: 'color 0.2s',
            }}
          >
            {card.label}
            <ArrowRight style={{ width: 15, height: 15 }} />
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ─── DisplayCards ────────────────────────────────────────────────────────────
/**
 * Feature metric card stack with a skewed container reveal.
 * Each card uses the production-ready color theme map.
 */
export default function DisplayCards() {
  return (
    <section
      id="features"
      style={{
        position: 'relative',
        background: '#fafafc',
        paddingBottom: '6rem',
        overflow: 'hidden',
      }}
    >
      {/* Skewed background slab — creates the peek-above-fold effect */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -48,
          left: 0,
          right: 0,
          height: 120,
          background:
            'linear-gradient(180deg, rgba(250,250,252,0) 0%, rgba(15,76,129,0.03) 100%)',
          transform: 'skewY(-4deg)',
          transformOrigin: 'top left',
        }}
      />

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{
          textAlign: 'center',
          padding: '64px 24px 48px',
          position: 'relative',
          zIndex: 5,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            marginBottom: 16,
            padding: '5px 16px',
            borderRadius: 9999,
            background: 'rgba(20,184,166,0.08)',
            border: '1px solid rgba(20,184,166,0.2)',
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#0f766e',
          }}
        >
          Campus Services
        </span>
        <h2
          style={{
            margin: '0 0 14px',
            fontSize: 'clamp(1.75rem, 4vw, 2.8rem)',
            fontWeight: 900,
            color: '#0f172a',
            letterSpacing: '-0.03em',
          }}
        >
          Everything you need,{' '}
          <span
            style={{
              backgroundImage: 'linear-gradient(90deg, #1d4ed8, #14b8a6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            unified
          </span>
        </h2>
        <p
          style={{
            margin: '0 auto',
            maxWidth: 480,
            fontSize: '1rem',
            color: '#64748b',
            lineHeight: 1.7,
            fontWeight: 500,
          }}
        >
          Five intelligent modules, one cohesive platform. Select any service to get started.
        </p>
      </motion.div>

      {/* Card grid */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          position: 'relative',
          zIndex: 5,
        }}
      >
        {/* Top row — 3 cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginBottom: 20,
          }}
        >
          {CARDS.slice(0, 3).map((card, i) => (
            <FeatureCard key={card.to} card={card} index={i} />
          ))}
        </div>

        {/* Bottom row — 2 cards (centered) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 20,
            maxWidth: 760,
            margin: '0 auto',
          }}
        >
          {CARDS.slice(3).map((card, i) => (
            <FeatureCard key={card.to} card={card} index={i + 3} />
          ))}
        </div>
      </div>
    </section>
  );
}
