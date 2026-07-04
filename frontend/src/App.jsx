import React from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import { GraduationCap, Inbox, ArrowRight, Utensils, CalendarDays, Printer } from 'lucide-react';
import './App.css';

import LostFound from './pages/LostFound/LostFound.jsx';

// ─── CANTEEN IMPORTS ───
import CanteenDashboard from './pages/Canteen/dashboard.jsx';
import AdminDashboard from './pages/Canteen/AdminDashboard.jsx';

// ─── BOOKING IMPORT ───
import BookingDashboard from './pages/Booking/BookingDashboard.jsx';
import PrintDashboard from './pages/Print/PrintDashboard.jsx';
import { UserProvider } from './pages/academics/UserContext.jsx';
import AcademicsLayout from './pages/academics/AcademicsLayout.jsx';
import Marketplace from './pages/academics/Marketplace.jsx';
import Vault from './pages/academics/Vault.jsx';
import Inventory from './pages/academics/Inventory.jsx';
import Settings from './pages/academics/Settings.jsx';

// ─── CINEMATIC COMPONENTS ───
import HeroGeometric from './components/HeroGeometric.jsx';
import DisplayCards from './components/DisplayCards.jsx';
import StackedCircularFooter from './components/StackedCircularFooter.jsx';

// ─── NAV ITEMS ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/academics/marketplace', label: 'Academics', icon: GraduationCap, color: '#1d4ed8' },
  { to: '/bookings', label: 'Bookings', icon: CalendarDays, color: '#14b8a6' },
  { to: '/lost-found', label: 'Lost & Found', icon: Inbox, color: '#2563eb' },
  { to: '/canteen', label: 'Canteen', icon: Utensils, color: '#d97706' },
  { to: '/print', label: 'Print', icon: Printer, color: '#0891b2' },
];

// ─── GLOBAL LAYOUT (LIGHT GLASSMORPHISM NAV) ─────────────────────────────────
function AppLayout() {
  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{ background: '#fafafc', color: '#0f172a' }}
    >
      {/* ── Navigation ── */}
      <nav
        className="sticky top-0 z-50 px-6 py-4"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderBottom: '1px solid rgba(15,76,129,0.06)',
          boxShadow: '0 1px 24px rgba(15,76,129,0.04)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-xl font-black hover:opacity-80 transition-all duration-300"
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #1d4ed8, #14b8a6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(29,78,216,0.25)',
              }}
            >
              <GraduationCap style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <span
              style={{
                backgroundImage: 'linear-gradient(90deg, #1d4ed8, #0f766e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.03em',
              }}
            >
              UniHub
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 py-2 px-3 rounded-xl transition-all duration-200"
                style={{ textDecoration: 'none' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${color}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon
                  style={{ width: 15, height: 15, color, flexShrink: 0 }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: '#475569' }}
                  onMouseEnter={(e) => { e.target.style.color = color; }}
                  onMouseLeave={(e) => { e.target.style.color = '#475569'; }}
                >
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Page Content ── */}
      <main className="flex-grow w-full mx-auto">
        <Outlet />
      </main>

      {/* ── Minimal global footer (for non-home pages) ── */}
      <footer
        className="text-center text-sm py-5 px-6"
        style={{
          background: '#fafafc',
          borderTop: '1px solid rgba(15,76,129,0.06)',
          color: '#94a3b8',
          fontWeight: 500,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <p>&copy; {new Date().getFullYear()} UniHub. Campus Intelligence Platform.</p>
        </div>
      </footer>
    </div>
  );
}

// ─── HOME DASHBOARD (CINEMATIC LANDING) ──────────────────────────────────────
function Home() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: '#fafafc' }}>
      {/* Hero — 90vh cinematic viewport */}
      <HeroGeometric
        badge="UniHub Platform"
        title1="One Platform."
        title2="Every Campus Need."
        description="Academics, bookings, food, printing, and lost items — all in one beautifully unified campus experience."
        ctaLabel="Explore Services"
        ctaHref="#features"
      />

      {/* Feature card stack — peeks above fold via HeroGeometric bottom fade */}
      <DisplayCards />

      {/* Home-specific cinematic footer with concentric rings */}
      <StackedCircularFooter />
    </div>
  );
}

// ─── MAIN APP ROUTER ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* KIOSK MODE (FULL SCREEN) */}
          <Route path="/canteen/admin" element={<AdminDashboard />} />

          {/* CONSUMER MODE (WITH NAVBAR) */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/bookings" element={<BookingDashboard />} />
            <Route path="/print" element={<PrintDashboard />} />
            <Route path="/lost-found" element={<LostFound />} />
            <Route path="/canteen" element={<CanteenDashboard />} />

            {/* NESTED ACADEMICS ROUTES */}
            <Route path="/academics" element={<AcademicsLayout />}>
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="vault" element={<Vault />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}