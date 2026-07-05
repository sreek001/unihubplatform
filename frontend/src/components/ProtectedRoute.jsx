/**
 * frontend/src/components/ProtectedRoute.jsx
 * ────────────────────────────────────────────
 * Route guard that combines authentication + role-based access control.
 *
 * Props:
 *   allowedRoles  {string[]}  — roles permitted to view child routes.
 *                               Omit (or pass []) to allow any authenticated user.
 *   redirectTo    {string}    — where to send unauthenticated visitors (default: '/login').
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']} />}>
 *     <Route path="/bookings" element={<BookingDashboard />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute allowedRoles={['CANTEEN_ADMIN', 'ADMIN']} />}>
 *     <Route path="/canteen/admin" element={<AdminDashboard />} />
 *   </Route>
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── Tiny loading spinner ─────────────────────────────────────────────────────

function FullScreenLoader() {
  return (
    <div
      style={{
        minHeight:       '100vh',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        background:      '#07080d',
        flexDirection:   'column',
        gap:             16,
      }}
    >
      {/* Spinner ring */}
      <div
        style={{
          width:       44,
          height:      44,
          borderRadius:'50%',
          border:      '3px solid rgba(255,255,255,0.08)',
          borderTop:   '3px solid #6366f1',
          animation:   'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p
        style={{
          color:       'rgba(255,255,255,0.35)',
          fontSize:    '0.8rem',
          fontWeight:  500,
          letterSpacing:'0.08em',
          textTransform:'uppercase',
          margin:       0,
          fontFamily:  'Inter, system-ui, sans-serif',
        }}
      >
        Verifying session…
      </p>
    </div>
  );
}

// ─── ProtectedRoute ───────────────────────────────────────────────────────────

export default function ProtectedRoute({ allowedRoles = [], redirectTo = '/login' }) {
  const { user, loading } = useAuth();

  // While the auth context is bootstrapping, show a neutral loader
  if (loading) {
    return <FullScreenLoader />;
  }

  // Not authenticated at all → send to login
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Authenticated, but the role isn't allowed for this route
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks pass — render child routes
  return <Outlet />;
}
