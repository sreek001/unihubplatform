import React, { useRef, useState, useCallback } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';
import ButtonColorful from './ButtonColorful';
import { ArrowRight, Sparkles } from 'lucide-react';

// ─── ElegantShape ───────────────────────────────────────────────────────────
// Floating glassmorphism polygon primitives
function ElegantShape({
  className = '',
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = 'from-blue-600/[0.12]',
  animStyle = 'shapeFloat',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, rotate: rotate - 8 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 1.2, delay, ease: [0.23, 0.86, 0.39, 0.96] }}
      style={{ width, height }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, 2, -2, 0] }}
        transition={{
          duration: animStyle === 'shapeFloatAlt' ? 9 : 7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay * 0.5,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <div
          className={`
            w-full h-full rounded-full
            bg-gradient-to-r ${gradient} to-transparent
            border border-blue-900/[0.05]
            backdrop-blur-[1px]
          `}
          style={{
            boxShadow: '0 0 40px rgba(15,76,129,0.06) inset',
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── MeshBlob ────────────────────────────────────────────────────────────────
// Ambient keyframe-animated colored blur fields
function MeshBlob({ color, size, blurRadius, opacity, animDuration, style = {} }) {
  const animations = ['meshFloat', 'meshFloatB', 'meshFloatC'];
  const anim = animations[Math.floor(Math.random() * 3)];
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        filter: `blur(${blurRadius}px)`,
        opacity,
        animation: `${anim} ${animDuration}s ease-in-out infinite`,
        pointerEvents: 'none',
        willChange: 'transform',
        ...style,
      }}
    />
  );
}

// ─── HeroGeometric ──────────────────────────────────────────────────────────
/**
 * Full-viewport cinematic hero section.
 * - Ambient mesh light fields (Blue / Teal / Gold)
 * - 5 floating ElegantShape polygon primitives
 * - Mouse-tracking radial spotlight
 * - Gradient headline typography
 * - ButtonColorful CTA
 */
export default function HeroGeometric({
  badge = 'UniHub Platform',
  title1 = 'One Platform.',
  title2 = 'Every Campus Need.',
  description = 'Academics, bookings, food, printing, and lost items — all in one beautifully unified campus experience.',
  ctaLabel = 'Explore UniHub',
  ctaHref = '#features',
}) {
  const containerRef = useRef(null);
  const spotlightRef = useRef(null);

  // ── Mouse spotlight tracking ──
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || !spotlightRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.setProperty('--mx', `${x}px`);
    spotlightRef.current.style.setProperty('--my', `${y}px`);
    spotlightRef.current.style.opacity = '1';
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (spotlightRef.current) spotlightRef.current.style.opacity = '0';
  }, []);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      id="hero"
      style={{
        position: 'relative',
        height: '90vh',
        minHeight: 600,
        maxHeight: 1000,
        overflow: 'hidden',
        background: '#fafafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Mouse Spotlight ── */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.4s ease',
          background:
            'radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(15,76,129,0.05) 0%, transparent 65%)',
          mixBlendMode: 'multiply',
          zIndex: 1,
          '--mx': '50%',
          '--my': '50%',
        }}
      />

      {/* ── Ambient Mesh Blobs ── */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
      >
        {/* Deep Classic Blue — left center */}
        <MeshBlob
          color="#0f4c81"
          size={520}
          blurRadius={140}
          opacity={0.06}
          animDuration={18}
          style={{ top: '15%', left: '-8%' }}
        />
        {/* Translucent Turquoise — right top */}
        <MeshBlob
          color="#14b8a6"
          size={440}
          blurRadius={120}
          opacity={0.08}
          animDuration={22}
          style={{ top: '5%', right: '10%' }}
        />
        {/* Warm Liquid Gold — bottom left */}
        <MeshBlob
          color="#d4af37"
          size={380}
          blurRadius={100}
          opacity={0.05}
          animDuration={26}
          style={{ bottom: '10%', left: '20%' }}
        />
        {/* Supplemental blue — bottom right */}
        <MeshBlob
          color="#1d4ed8"
          size={300}
          blurRadius={110}
          opacity={0.04}
          animDuration={20}
          style={{ bottom: '5%', right: '5%' }}
        />
      </div>

      {/* ── Floating ElegantShapes ── */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
        {/* Shape 1: Primary backdrop — left center */}
        <ElegantShape
          delay={0.3}
          width={480}
          height={130}
          rotate={-18}
          gradient="from-blue-600/[0.12]"
          className="top-[18%] -left-[8%]"
        />
        {/* Shape 2: Luminous offset — bottom right */}
        <ElegantShape
          delay={0.5}
          width={380}
          height={110}
          rotate={12}
          gradient="from-teal-500/[0.15]"
          animStyle="shapeFloatAlt"
          className="bottom-[22%] right-[2%]"
        />
        {/* Shape 3: High contrast shimmer — left baseline */}
        <ElegantShape
          delay={0.7}
          width={260}
          height={80}
          rotate={-8}
          gradient="from-amber-500/[0.10]"
          className="bottom-[30%] left-[8%]"
        />
        {/* Shape 4: Support fill — upper right */}
        <ElegantShape
          delay={0.9}
          width={320}
          height={90}
          rotate={20}
          gradient="from-blue-400/[0.08]"
          animStyle="shapeFloatAlt"
          className="top-[8%] right-[18%]"
        />
        {/* Shape 5: Edge detail — center right mid */}
        <ElegantShape
          delay={1.1}
          width={180}
          height={60}
          rotate={-30}
          gradient="from-teal-300/[0.07]"
          className="top-[52%] right-[28%]"
        />
      </div>

      {/* ── Hero Content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: 760,
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
        }}
      >
        {/* Badge pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 18px',
              borderRadius: 9999,
              background: 'rgba(15,76,129,0.07)',
              border: '1px solid rgba(15,76,129,0.12)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0f4c81',
            }}
          >
            <Sparkles style={{ width: 13, height: 13, color: '#d4af37' }} />
            {badge}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ display: 'flex', flexDirection: 'column', gap: 4, lineHeight: 1.08 }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(3rem, 7vw, 5.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.035em',
              lineHeight: 1.05,
            }}
          >
            <span
              style={{
                display: 'block',
                backgroundImage: 'linear-gradient(180deg, #172554 0%, #1e3a8a 50%, #1d4ed8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {title1}
            </span>
            <span
              style={{
                display: 'block',
                backgroundImage:
                  'linear-gradient(90deg, #1d4ed8 0%, #14b8a6 45%, #d4af37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 900,
              }}
            >
              {title2}
            </span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          style={{
            margin: 0,
            fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
            color: '#475569',
            lineHeight: 1.75,
            fontWeight: 500,
            maxWidth: 580,
          }}
        >
          {description}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.72 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <ButtonColorful href={ctaHref}>
            {ctaLabel}
            <ArrowRight style={{ width: 16, height: 16 }} />
          </ButtonColorful>

          <motion.a
            href="/academics/marketplace"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              borderRadius: 16,
              border: '1.5px solid rgba(15,76,129,0.15)',
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(24px)',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#0f4c81',
              textDecoration: 'none',
              boxShadow: '0 2px 12px rgba(15,76,129,0.08)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
          >
            Browse Academics
          </motion.a>
        </motion.div>
      </div>

      {/* ── Subtle bottom fade ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background: 'linear-gradient(to bottom, transparent, rgba(250,250,252,0.95))',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />
    </section>
  );
}
