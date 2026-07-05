import React from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import {
  GraduationCap,
  Inbox,
  CalendarDays,
  Utensils,
  Printer
} from 'lucide-react';

import './App.css';

import LostFound from './pages/LostFound/LostFound.jsx';
import CanteenDashboard from './pages/Canteen/dashboard.jsx';
import AdminDashboard from './pages/Canteen/AdminDashboard.jsx';
import BookingDashboard from './pages/Booking/BookingDashboard.jsx';
import PrintDashboard from './pages/Print/PrintDashboard.jsx';

import { UserProvider } from './pages/academics/UserContext.jsx';
import AcademicsLayout from './pages/academics/AcademicsLayout.jsx';
import Marketplace from './pages/academics/Marketplace.jsx';
import Vault from './pages/academics/Vault.jsx';
import Inventory from './pages/academics/Inventory.jsx';
import Settings from './pages/academics/Settings.jsx';

// Cinematic Components
import HeroGeometric from './components/HeroGeometric.jsx';
import DisplayCards from './components/DisplayCards.jsx';
import StackedCircularFooter from './components/StackedCircularFooter.jsx';

const NAV_ITEMS = [
  {
    to: "/academics/marketplace",
    label: "Academics",
    icon: GraduationCap,
    color: "#1d4ed8"
  },
  {
    to: "/bookings",
    label: "Bookings",
    icon: CalendarDays,
    color: "#14b8a6"
  },
  {
    to: "/lost-found",
    label: "Lost & Found",
    icon: Inbox,
    color: "#2563eb"
  },
  {
    to: "/canteen",
    label: "Canteen",
    icon: Utensils,
    color: "#d97706"
  },
  {
    to: "/print",
    label: "Print",
    icon: Printer,
    color: "#0891b2"
  }
];

function AppLayout() {
  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{
        background: "#fafafc",
        color: "#0f172a"
      }}
    >
      <nav
        className="sticky top-0 z-50 px-6 py-4"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(28px)",
          borderBottom: "1px solid rgba(15,76,129,0.06)",
          boxShadow: "0 1px 24px rgba(15,76,129,0.04)"
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <Link
            to="/"
            className="flex items-center gap-3 text-xl font-black"
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg,#1d4ed8,#14b8a6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <GraduationCap
                style={{
                  color: "#fff",
                  width: 18,
                  height: 18
                }}
              />
            </div>

            <span
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#1d4ed8,#0f766e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              UniHub
            </span>
          </Link>

          <div className="flex items-center gap-1">

            {NAV_ITEMS.map(({ to, label, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  textDecoration: "none"
                }}
              >
                <Icon
                  style={{
                    width: 15,
                    height: 15,
                    color
                  }}
                />

                <span
                  style={{
                    color: "#475569",
                    fontWeight: 600,
                    fontSize: 14
                  }}
                >
                  {label}
                </span>

              </Link>
            ))}

          </div>

        </div>
      </nav>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer
        className="text-center py-5"
        style={{
          borderTop: "1px solid rgba(15,76,129,.06)",
          color: "#94a3b8"
        }}
      >
        © {new Date().getFullYear()} UniHub
      </footer>

    </div>
  );
}
function Home() {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#fafafc"
      }}
    >
      <HeroGeometric
        badge="UniHub Platform"
        title1="One Platform."
        title2="Every Campus Need."
        description="Academics, bookings, food, printing, and lost items — all in one beautifully unified campus experience."
        ctaLabel="Explore Services"
        ctaHref="#features"
      />

      <DisplayCards />

      <StackedCircularFooter />
    </div>
  );
}
export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>

        <Routes>

          {/* Full Screen Admin */}
          <Route
            path="/canteen/admin"
            element={<AdminDashboard />}
          />

          {/* All other pages */}
          <Route element={<AppLayout />}>

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/bookings"
              element={<BookingDashboard />}
            />

            <Route
              path="/print"
              element={<PrintDashboard />}
            />

            <Route
              path="/lost-found"
              element={<LostFound />}
            />

            <Route
              path="/canteen"
              element={<CanteenDashboard />}
            />

            <Route
              path="/academics"
              element={<AcademicsLayout />}
            >
              <Route
                path="marketplace"
                element={<Marketplace />}
              />

              <Route
                path="vault"
                element={<Vault />}
              />

              <Route
                path="inventory"
                element={<Inventory />}
              />

              <Route
                path="settings"
                element={<Settings />}
              />
            </Route>

          </Route>

        </Routes>

      </BrowserRouter>
    </UserProvider>
  );
}