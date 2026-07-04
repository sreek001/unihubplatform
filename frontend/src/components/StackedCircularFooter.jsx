import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, CalendarDays, Printer, Utensils, Inbox, ArrowRight } from 'lucide-react';

// ─── Navigation links ────────────────────────────────────────────────────────
const NAV_LINKS = [
  {
    category: 'Academics',
    icon: GraduationCap,
    color: '#1d4ed8',
    links: [
      { label: 'Marketplace', to: '/academics/marketplace' },
      { label: 'Digital Vault', to: '/academics/vault' },
      { label: 'My Inventory', to: '/academics/inventory' },
      { label: 'Settings', to: '/academics/settings' },
    ],
  },
  {
    category: 'Campus Services',
    icon: CalendarDays,
    color: '#14b8a6',
    links: [
      { label: 'Venue Booking', to: '/bookings' },
      { label: 'Live Canteen', to: '/canteen' },
      { label: 'Print Hub', to: '/print' },
      { label: 'Lost & Found', to: '/lost-found' },
    ],
  },
];

// ─── Concentric ring SVG ─────────────────────────────────────────────────────
function ConcentricRings() {
  const rings = [
    { r: 220, opacity: 0.06 },
    { r: 160, opacity: 0.08 },
    { r: 100, opacity: 0.11 },
    { r: 52, opacity: 0.14 },
  ];

  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        right: '10%',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 480,
        height: 480,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      viewBox="-240 -240 480 480"
      fill="none"
    >
      {rings.map((ring, i) => (
        <motion.circle
          key={i}
          cx={0}
          cy={0}
          r={ring.r}
          stroke="#0f4c81"
          strokeWidth={1.5}
          strokeOpacity={ring.opacity}
          fill="none"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 + i * 0.15, ease: 'easeOut' }}
        />
      ))}
      {/* Center dot */}
      <motion.circle
        cx={0}
        cy={0}
        r={6}
        fill="#0f4c81"
        fillOpacity={0.12}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      />
    </svg>
  );
}

// ─── StackedCircularFooter ───────────────────────────────────────────────────
/**
 * Home-page-specific footer with concentric SVG ring decoration,
 * navigation link grid, and copyright.
 * Uses #fafafc canvas seamlessly matching the page background.
 */
export default function StackedCircularFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        position: 'relative',
        background: '#fafafc',
        borderTop: '1px solid rgba(15,76,129,0.06)',
        overflow: 'hidden',
        padding: '72px 24px 48px',
      }}
    >
      {/* Decorative rings */}
      <ConcentricRings />

      {/* Ambient tint */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 400,
          height: 300,
          background: 'radial-gradient(ellipse at bottom left, rgba(20,184,166,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 5 }}>
        {/* Brand row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: 56 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #1d4ed8, #14b8a6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GraduationCap style={{ width: 20, height: 20, color: '#fff' }} />
            </div>
            <span
              style={{
                fontSize: '1.4rem',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                backgroundImage: 'linear-gradient(90deg, #1d4ed8, #14b8a6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              UniHub
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#94a3b8',
              maxWidth: 320,
              lineHeight: 1.65,
              fontWeight: 500,
            }}
          >
            Campus Intelligence Platform — built for students who move fast.
          </p>
        </motion.div>

        {/* Nav link grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px 48px',
            marginBottom: 56,
          }}
        >
          {NAV_LINKS.map((group, gi) => {
            const GroupIcon = group.icon;
            return (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: gi * 0.12 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  <GroupIcon
                    style={{ width: 14, height: 14, color: group.color }}
                  />
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: group.color,
                    }}
                  >
                    {group.category}
                  </span>
                </div>

                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        style={{ textDecoration: 'none' }}
                      >
                        <motion.span
                          whileHover={{ x: 4, color: group.color }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#64748b',
                            transition: 'color 0.2s',
                          }}
                        >
                          {link.label}
                          <ArrowRight
                            style={{ width: 12, height: 12, opacity: 0.4 }}
                          />
                        </motion.span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Divider */}
        <div
          aria-hidden="true"
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(15,76,129,0.08), rgba(20,184,166,0.08), transparent)',
            marginBottom: 28,
          }}
        />

        {/* Copyright row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
            &copy; {year} UniHub. Built for premium campus experiences.
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500 }}>
            Campus Intelligence Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
