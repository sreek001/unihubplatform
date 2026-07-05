/**
 * frontend/src/context/AuthContext.jsx
 * ─────────────────────────────────────
 * Global authentication context for UniHub.
 *
 * Provides:
 *   user      — { id, name, role, department } | null
 *   token     — raw JWT string | null
 *   loading   — true while the token is being validated on mount
 *   login(token)  — stores token, decodes user, updates context
 *   logout()      — clears token, resets state
 *
 * Usage anywhere in the tree:
 *   import { useAuth } from '../context/AuthContext';
 *   const { user, logout } = useAuth();
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const TOKEN_KEY = 'unihub_token';
const API_BASE  = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Lightweight JWT payload decoder — does NOT verify the signature
 * (that happens on the server). Used only to optimistically populate
 * context from a stored token without a round-trip.
 */
function decodePayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json    = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * isTokenExpired — check exp claim without a library.
 */
function isTokenExpired(token) {
  const payload = decodePayload(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(null);
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);  // true until initial token check done

  /**
   * login(rawToken)
   * Persists the JWT and populates context from its payload.
   * Called by the Login page after a successful /api/auth/login response.
   */
  const login = useCallback((rawToken) => {
    localStorage.setItem(TOKEN_KEY, rawToken);
    setToken(rawToken);
    const payload = decodePayload(rawToken);
    if (payload) {
      setUser({
        id:         payload.id,
        name:       payload.name,
        role:       payload.role,
        department: payload.department,
      });
    }
  }, []);

  /**
   * logout()
   * Clears the JWT from storage and resets context.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  /**
   * On mount — restore session from localStorage.
   * Validates the token against GET /api/auth/me to handle expiry.
   */
  useEffect(() => {
    async function restoreSession() {
      const stored = localStorage.getItem(TOKEN_KEY);

      if (!stored) {
        setLoading(false);
        return;
      }

      // Fast-path: if the token is already expired client-side, skip the round-trip.
      if (isTokenExpired(stored)) {
        localStorage.removeItem(TOKEN_KEY);
        setLoading(false);
        return;
      }

      // Optimistically set user from the decoded payload for instant UI
      const payload = decodePayload(stored);
      if (payload) {
        setToken(stored);
        setUser({
          id:         payload.id,
          name:       payload.name,
          role:       payload.role,
          department: payload.department,
        });
      }

      // Then verify with the server (catches revocations / schema changes)
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${stored}` },
        });

        if (res.ok) {
          const { user: serverUser } = await res.json();
          // Update with authoritative server data
          setUser({
            id:         serverUser.id,
            name:       serverUser.name,
            role:       serverUser.role,
            department: serverUser.department,
          });
          setToken(stored);
        } else {
          // Server rejected token — clear session
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } catch {
        // Network error — keep optimistic state so offline apps don't break
        // The token may still be locally valid even if the server is unreachable
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useAuth()
 * Returns { user, token, loading, login, logout }
 * Throws if used outside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>. Wrap your app in <AuthProvider>.');
  }
  return ctx;
}
