/**
 * frontend/src/pages/Login.jsx
 * ─────────────────────────────
 * UniHub — Unified Login Page
 *
 * Design system:
 *   • Full-viewport deep-dark canvas (#07080d)
 *   • Two animated mesh blobs (indigo + teal) behind a glassmorphism card
 *   • Pill-segmented role selector with a sliding active indicator
 *   • Field swap via Framer Motion AnimatePresence
 *   • Password visibility toggle with Eye/EyeOff icons
 *   • Inline error toast inside the card
 *   • Post-login redirect driven by the `redirectTo` field from the API
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  ShieldCheck,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
  User,
  Lock,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ─── Role tab descriptor ──────────────────────────────────────────────────────

const ROLES = [
  {
    key:         'student',
    label:       'Student',
    icon:        GraduationCap,
    idLabel:     'College ID Number',
    idPlaceholder:'e.g.  CS2024001',
    idIcon:      BadgeCheck,
    accent:      '#6366f1',   // indigo
    glow:        'rgba(99,102,241,0.35)',
  },
  {
    key:         'admin',
    label:       'Admin / Operator',
    icon:        ShieldCheck,
    idLabel:     'Admin ID',
    idPlaceholder:'e.g.  ADM-CAN-001',
    idIcon:      User,
    accent:      '#14b8a6',   // teal
    glow:        'rgba(20,184,166,0.35)',
  },
];

// ─── Ambient blob ─────────────────────────────────────────────────────────────

function Blob({ style }) {
  return (
    <div
      style={{
        position:     'absolute',
        borderRadius: '50%',
        filter:       'blur(90px)',
        pointerEvents:'none',
        ...style,
      }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Login() {
  const { user, login: ctxLogin } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect away from login
  if (user) {
    return <Navigate to={resolveHome(user.role)} replace />;
  }

  const [activeTab, setActiveTab]   = useState(0);        // 0 = student, 1 = admin
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  // Sliding pill indicator refs
  const pillRefs   = [useRef(null), useRef(null)];
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  // Update the sliding indicator whenever the tab changes
  useEffect(() => {
    const el = pillRefs[activeTab].current;
    if (!el) return;
    const parent = el.parentElement;
    const parentRect = parent.getBoundingClientRect();
    const elRect     = el.getBoundingClientRect();
    setPillStyle({
      left:  elRect.left - parentRect.left,
      width: elRect.width,
    });
  }, [activeTab]);

  // Reset fields on tab switch
  const switchTab = (idx) => {
    setActiveTab(idx);
    setIdentifier('');
    setPassword('');
    setError('');
  };

  const role = ROLES[activeTab];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError(`Please enter your ${role.idLabel}.`);
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          identifier: identifier.trim(),
          password,
          loginType:  role.key,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Login failed. Please check your credentials.');
        return;
      }

      // Persist token + update context
      ctxLogin(data.token);

      // Navigate to the server-recommended route (role-aware)
      navigate(data.redirectTo || resolveHome(data.user.role), { replace: true });
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight:       '100vh',
        background:      '#07080d',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '24px 16px',
        position:        'relative',
        overflow:        'hidden',
        fontFamily:      "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── Ambient blobs ── */}
      <Blob
        style={{
          width:      600,
          height:     600,
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          top:        '-15%',
          left:       '-10%',
          animation:  'blobA 14s ease-in-out infinite alternate',
        }}
      />
      <Blob
        style={{
          width:      500,
          height:     500,
          background: 'radial-gradient(circle, rgba(20,184,166,0.14) 0%, transparent 70%)',
          bottom:     '-10%',
          right:      '-8%',
          animation:  'blobB 18s ease-in-out infinite alternate',
        }}
      />
      <Blob
        style={{
          width:      300,
          height:     300,
          background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
          top:        '40%',
          right:      '20%',
          animation:  'blobC 22s ease-in-out infinite alternate',
        }}
      />

      <style>{`
        @keyframes blobA {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes blobB {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-30px, -20px) scale(1.06); }
        }
        @keyframes blobC {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(20px, -25px) scale(1.04); }
        }
        @keyframes loginSpin { to { transform: rotate(360deg); } }

        /* Input autofill override for dark glass */
        .unihub-login-input:-webkit-autofill,
        .unihub-login-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(255,255,255,0.04) inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
          caret-color: #e2e8f0;
        }
      `}</style>

      {/* ── Glass card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position:        'relative',
          zIndex:          10,
          width:           '100%',
          maxWidth:        460,
          background:      'rgba(255,255,255,0.035)',
          backdropFilter:  'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius:    24,
          border:          '1px solid rgba(255,255,255,0.08)',
          boxShadow:       '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset',
          padding:         '40px 36px 36px',
          overflow:        'hidden',
        }}
      >
        {/* Card shimmer top edge */}
        <div
          style={{
            position:   'absolute',
            top:        0,
            left:       '10%',
            right:      '10%',
            height:     1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          }}
        />

        {/* ── Logo + wordmark ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: 'backOut' }}
            style={{
              width:          54,
              height:         54,
              borderRadius:   16,
              background:     'linear-gradient(135deg, #6366f1, #14b8a6)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              boxShadow:      '0 8px 28px rgba(99,102,241,0.4)',
              marginBottom:   14,
            }}
          >
            <GraduationCap style={{ width: 26, height: 26, color: '#fff' }} />
          </motion.div>

          <h1
            style={{
              margin:          0,
              fontSize:        '1.55rem',
              fontWeight:      800,
              letterSpacing:   '-0.03em',
              backgroundImage: 'linear-gradient(135deg, #e2e8f0 30%, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            UniHub
          </h1>
          <p
            style={{
              margin:       '4px 0 0',
              color:        'rgba(148,163,184,0.7)',
              fontSize:     '0.78rem',
              fontWeight:   500,
              letterSpacing:'0.06em',
              textTransform:'uppercase',
            }}
          >
            Campus Intelligence Platform
          </p>
        </div>

        {/* ── Role selector tabs ── */}
        <div
          style={{
            position:     'relative',
            display:      'flex',
            background:   'rgba(255,255,255,0.04)',
            borderRadius: 14,
            border:       '1px solid rgba(255,255,255,0.06)',
            padding:      4,
            marginBottom: 28,
          }}
        >
          {/* Sliding indicator */}
          <motion.div
            animate={{ left: pillStyle.left, width: pillStyle.width }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            style={{
              position:     'absolute',
              top:          4,
              bottom:       4,
              borderRadius: 10,
              background:   `linear-gradient(135deg, ${role.accent}22, ${role.accent}44)`,
              border:       `1px solid ${role.accent}55`,
              boxShadow:    `0 0 16px ${role.glow}`,
              pointerEvents:'none',
            }}
          />

          {ROLES.map((r, idx) => {
            const Icon    = r.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={r.key}
                ref={pillRefs[idx]}
                onClick={() => switchTab(idx)}
                style={{
                  flex:           1,
                  position:       'relative',
                  zIndex:         1,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            7,
                  padding:        '10px 12px',
                  borderRadius:   10,
                  border:         'none',
                  background:     'transparent',
                  color:          isActive ? '#e2e8f0' : 'rgba(148,163,184,0.55)',
                  fontSize:       '0.82rem',
                  fontWeight:     isActive ? 700 : 500,
                  cursor:         'pointer',
                  transition:     'color 0.2s ease',
                  fontFamily:     'inherit',
                  letterSpacing:  '0.01em',
                  whiteSpace:     'nowrap',
                }}
              >
                <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                {r.label}
              </button>
            );
          })}
        </div>

        {/* ── Login form ── */}
        <AnimatePresence mode="wait">
          <motion.form
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
          >
            {/* ID field */}
            <div>
              <label
                style={{
                  display:      'block',
                  marginBottom: 8,
                  fontSize:     '0.73rem',
                  fontWeight:   600,
                  color:        'rgba(148,163,184,0.8)',
                  letterSpacing:'0.07em',
                  textTransform:'uppercase',
                }}
              >
                {role.idLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <role.idIcon
                  style={{
                    position:   'absolute',
                    left:       14,
                    top:        '50%',
                    transform:  'translateY(-50%)',
                    width:      17,
                    height:     17,
                    color:      role.accent,
                    opacity:    0.7,
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                  placeholder={role.idPlaceholder}
                  autoComplete="username"
                  className="unihub-login-input"
                  style={{
                    width:         '100%',
                    paddingLeft:   44,
                    paddingRight:  16,
                    paddingTop:    13,
                    paddingBottom: 13,
                    background:    'rgba(255,255,255,0.05)',
                    border:        `1px solid rgba(255,255,255,0.09)`,
                    borderRadius:  12,
                    color:         '#e2e8f0',
                    fontSize:      '0.9rem',
                    fontFamily:    'inherit',
                    fontWeight:    500,
                    outline:       'none',
                    boxSizing:     'border-box',
                    transition:    'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = `${role.accent}80`;
                    e.target.style.boxShadow   = `0 0 0 3px ${role.glow}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.09)';
                    e.target.style.boxShadow   = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                style={{
                  display:      'block',
                  marginBottom: 8,
                  fontSize:     '0.73rem',
                  fontWeight:   600,
                  color:        'rgba(148,163,184,0.8)',
                  letterSpacing:'0.07em',
                  textTransform:'uppercase',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  style={{
                    position:   'absolute',
                    left:       14,
                    top:        '50%',
                    transform:  'translateY(-50%)',
                    width:      17,
                    height:     17,
                    color:      role.accent,
                    opacity:    0.7,
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="unihub-login-input"
                  style={{
                    width:         '100%',
                    paddingLeft:   44,
                    paddingRight:  46,
                    paddingTop:    13,
                    paddingBottom: 13,
                    background:    'rgba(255,255,255,0.05)',
                    border:        '1px solid rgba(255,255,255,0.09)',
                    borderRadius:  12,
                    color:         '#e2e8f0',
                    fontSize:      '0.9rem',
                    fontFamily:    'inherit',
                    fontWeight:    500,
                    outline:       'none',
                    boxSizing:     'border-box',
                    transition:    'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = `${role.accent}80`;
                    e.target.style.boxShadow   = `0 0 0 3px ${role.glow}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.09)';
                    e.target.style.boxShadow   = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    position:   'absolute',
                    right:      12,
                    top:        '50%',
                    transform:  'translateY(-50%)',
                    background: 'none',
                    border:     'none',
                    cursor:     'pointer',
                    padding:    4,
                    color:      'rgba(148,163,184,0.5)',
                    display:    'flex',
                    lineHeight: 0,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(148,163,184,0.5)'}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass
                    ? <EyeOff style={{ width: 17, height: 17 }} />
                    : <Eye    style={{ width: 17, height: 17 }} />
                  }
                </button>
              </div>
            </div>

            {/* ── Error message ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: -4 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                  exit={{    opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          9,
                    padding:      '11px 14px',
                    borderRadius: 10,
                    background:   'rgba(239,68,68,0.1)',
                    border:       '1px solid rgba(239,68,68,0.25)',
                  }}
                >
                  <AlertCircle style={{ width: 15, height: 15, color: '#f87171', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: '#fca5a5', fontWeight: 500 }}>
                    {error}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Submit button ── */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.015 } : {}}
              whileTap={!loading  ? { scale: 0.985 } : {}}
              style={{
                width:          '100%',
                padding:        '14px 20px',
                borderRadius:   13,
                border:         'none',
                background:     loading
                  ? 'rgba(255,255,255,0.06)'
                  : `linear-gradient(135deg, ${role.accent}, ${activeTab === 0 ? '#8b5cf6' : '#0f766e'})`,
                color:          loading ? 'rgba(255,255,255,0.4)' : '#fff',
                fontSize:       '0.88rem',
                fontWeight:     700,
                fontFamily:     'inherit',
                letterSpacing:  '0.02em',
                cursor:         loading ? 'not-allowed' : 'pointer',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            9,
                boxShadow:      loading ? 'none' : `0 8px 24px ${role.glow}`,
                transition:     'background 0.3s, box-shadow 0.3s, color 0.3s',
                marginTop:      4,
              }}
            >
              {loading ? (
                <>
                  <Loader2
                    style={{
                      width: 17, height: 17,
                      animation: 'loginSpin 0.7s linear infinite',
                    }}
                  />
                  Authenticating…
                </>
              ) : (
                <>
                  <LogIn style={{ width: 17, height: 17 }} />
                  Sign In
                </>
              )}
            </motion.button>
          </motion.form>
        </AnimatePresence>

        {/* ── Footer note ── */}
        <p
          style={{
            marginTop:  24,
            marginBottom: 0,
            textAlign:  'center',
            fontSize:   '0.73rem',
            color:      'rgba(100,116,139,0.6)',
            lineHeight: 1.6,
          }}
        >
          Protected by UniHub Auth  ·  Sessions expire after 24 hours
        </p>
      </motion.div>
    </div>
  );
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function resolveHome(role) {
  switch (role) {
    case 'CANTEEN_ADMIN':  return '/canteen/admin';
    case 'PRINT_OPERATOR': return '/print';
    case 'ADMIN':          return '/';
    default:               return '/';
  }
}
