import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Users,
  Sparkles,
  CalendarDays,
  LayoutGrid,
  Loader2,
  Building2,
  Zap,
} from 'lucide-react';
import './BookingDashboard.css';

// ─── API Base ───
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/booking';

// ─── Demo user for development ───
const DEMO_USER = { id: 1, name: 'SreeK.', role: 'Admin' };

// ─── Fallback venues when backend is offline ───
const FALLBACK_VENUES = [
  { id: 1, name: 'Main Seminar Hall', location: 'Block A — Ground Floor', capacity: 250, type: 'Seminar Hall', status: 'Open' },
  { id: 2, name: 'Department Seminar Hall', location: 'Block B — 2nd Floor', capacity: 120, type: 'Seminar Hall', status: 'Open' },
  { id: 3, name: 'Advanced IoT Lab', location: 'Block C — 3rd Floor', capacity: 40, type: 'Lab', status: 'Open' },
  { id: 4, name: 'Open Auditorium', location: 'Central Campus Grounds', capacity: 500, type: 'Seminar Hall', status: 'Open' },
  { id: 5, name: 'Mini Conference Room', location: 'Admin Block — Room 104', capacity: 20, type: 'Project Space', status: 'Open' },
  { id: 6, name: 'Robotics Research Lab', location: 'Block D — 1st Floor', capacity: 30, type: 'Lab', status: 'Open' },
  { id: 7, name: 'Innovation Hub', location: 'Library Building — 4th', capacity: 60, type: 'Project Space', status: 'Maintenance' },
];

// ─── Helper: format date to YYYY-MM-DD ───
function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

// ─── Time slot definitions matching the backend's mapSlotToTimes ───
const TIME_SLOTS = [
  { label: '08:00 to 09:00', display: '8:00 AM to 9:00 AM' },
  { label: '09:00 to 10:00', display: '9:00 AM to 10:00 AM' },
  { label: '10:00 to 11:00', display: '10:00 AM to 11:00 AM' },
  { label: '11:00 to 12:00', display: '11:00 AM to 12:00 PM' },
  { label: '12:00 to 13:00', display: '12:00 PM to 1:00 PM' },
  { label: '13:00 to 14:00', display: '1:00 PM to 2:00 PM' },
  { label: '14:00 to 15:00', display: '2:00 PM to 3:00 PM' },
  { label: '15:00 to 16:00', display: '3:00 PM to 4:00 PM' },
  { label: '16:00 to 17:00', display: '4:00 PM to 5:00 PM' },
];

// ─── Get venue type badge class ───
function getTypeBadgeClass(type) {
  if (!type) return 'seminar-hall';
  const t = type.toLowerCase();
  if (t.includes('lab')) return 'lab';
  if (t.includes('project')) return 'project-space';
  return 'seminar-hall';
}

// ─── Framer Motion Variants ───
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 130, damping: 17 },
  },
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalContentVariants = {
  hidden: { scale: 0.92, y: 24, opacity: 0 },
  visible: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 22 },
  },
  exit: {
    scale: 0.92,
    y: 24,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export default function BookingDashboard() {
  // ── State ──
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('grid');
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // ── Form state ──
  const [form, setForm] = useState({
    event_name: '',
    time_slot: TIME_SLOTS[0].label,
    user_name: DEMO_USER.name,
    user_role: DEMO_USER.role,
  });

  const user = DEMO_USER;

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedVenue) fetchAvailability();
  }, [selectedVenue, selectedDate]);

  async function fetchVenues() {
    setLoadingVenues(true);
    try {
      const res = await fetch(`${API}/venues`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setVenues(data);
        setSelectedVenue(data[0]);
      } else {
        setVenues(FALLBACK_VENUES);
        setSelectedVenue(FALLBACK_VENUES[0]);
      }
    } catch {
      setVenues(FALLBACK_VENUES);
      setSelectedVenue(FALLBACK_VENUES[0]);
    } finally {
      setLoadingVenues(false);
    }
  }

  async function fetchAvailability() {
    if (!selectedVenue) return;
    setLoadingSlots(true);
    setError(null);
    try {
      const res = await fetch(
        `${API}/availability?venueId=${selectedVenue.id}&date=${selectedDate}`
      );
      const data = await res.json();
      if (data && typeof data === 'object' && !data.error) {
        setAvailabilityMap(data);
      } else {
        setAvailabilityMap({});
      }
    } catch {
      setAvailabilityMap({});
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
  }

  function handleClickToSecure(slotLabel) {
    setForm({
      ...form,
      time_slot: slotLabel,
      event_name: '',
    });
    setIsModalOpen(true);
    setError(null);
  }

  async function handleSubmitBooking(e) {
    e.preventDefault();
    if (!selectedVenue || !form.event_name || !form.time_slot) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_id: selectedVenue.id,
          date: selectedDate,
          time_slot: form.time_slot,
          event_name: form.event_name,
          user_name: form.user_name,
          user_role: form.user_role,
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setError(data.error || 'This venue slot is already secured.');
      } else if (data.success) {
        setIsModalOpen(false);
        setForm({ ...form, event_name: '', time_slot: TIME_SLOTS[0].label });
        showToast('Slot secured successfully!');
        fetchAvailability();
      } else {
        setError(data.error || 'Failed to create booking.');
      }
    } catch {
      setError('Network error — could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="booking-root" style={{ padding: '32px 24px', maxWidth: 1280, margin: '0 auto' }}>

      {/* ── Success Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast-success"
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <CheckCircle style={{ width: 16, height: 16 }} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Intro — light mode ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 32,
          paddingBottom: 20,
          borderBottom: '1px solid rgba(15,76,129,0.07)',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.025em',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            margin: 0,
          }}>
            <CalendarDays
              style={{
                width: 28,
                height: 28,
                color: '#14b8a6',
              }}
            />
            Venue Booking
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4, marginBottom: 0, fontWeight: 500 }}>
            Reserve seminar halls, labs, and project spaces — zero scheduling conflicts.
          </p>
        </div>

        {/* User badge — light glass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255,255,255,0.75)',
            border: '1px solid rgba(15,76,129,0.10)',
            borderRadius: 12,
            padding: '10px 16px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 2px 12px rgba(15,76,129,0.06)',
          }}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1d4ed8, #14b8a6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#fff',
            boxShadow: '0 2px 8px rgba(29,78,216,0.22)',
          }}>
            {user.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#14b8a6',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>{user.role}</div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Tab Navigation — light glass ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ display: 'flex', gap: 4, marginBottom: 28, position: 'relative' }}
      >
        {[
          { key: 'grid', label: 'Availability Grid', icon: LayoutGrid },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                background: 'transparent',
                color: isActive ? '#1d4ed8' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                position: 'relative',
                fontFamily: 'Inter, sans-serif',
                transition: 'color 0.2s ease',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(29,78,216,0.06)',
                    border: '1px solid rgba(29,78,216,0.15)',
                    borderRadius: 10,
                  }}
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                />
              )}
              <Icon style={{ width: 15, height: 15, position: 'relative', zIndex: 1 }} />
              <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* ── TAB CONTENT ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'grid' && (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="booking-grid"
            style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 28, alignItems: 'start' }}
          >
            {/* ─ Left Panel: Venue Selector ─ */}
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', damping: 20, delay: 0.1 }}
              className="glass-card"
              style={{ padding: 24, position: 'relative', overflow: 'hidden' }}
            >
              <div className="accent-bar" />

              <h3 className="section-title" style={{ marginTop: 8 }}>
                <Building2 style={{ width: 13, height: 13, display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
                Campus Facilities
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {loadingVenues ? (
                  <>
                    <p className="loading-text">Loading campus facilities...</p>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="skeleton" style={{ height: 56, width: '100%' }} />
                    ))}
                  </>
                ) : (
                  venues.map((venue) => {
                    const isActive = selectedVenue?.id === venue.id;
                    const isMaintenance = venue.status === 'Maintenance';
                    return (
                      <button
                        key={venue.id}
                        onClick={() => !isMaintenance && setSelectedVenue(venue)}
                        className={`venue-btn ${isActive ? 'active' : ''}`}
                        style={isMaintenance ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
                        disabled={isMaintenance}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeVenueGlow"
                            className="venue-glow"
                            transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                          />
                        )}
                        <span style={{ position: 'relative', zIndex: 1 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 600 }}>{venue.name}</span>
                            <span className={`venue-type-badge ${getTypeBadgeClass(venue.type)}`}>
                              {venue.type || 'Seminar Hall'}
                            </span>
                          </span>
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: '0.7rem',
                            color: 'rgba(113,113,122,0.7)',
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <span className={`venue-status-dot ${isMaintenance ? 'maintenance' : 'open'}`} />
                              {venue.status || 'Open'}
                            </span>
                            <MapPin style={{ width: 10, height: 10 }} />
                            {venue.location}
                            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Users style={{ width: 10, height: 10 }} />
                              {venue.capacity}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Date Picker */}
              <div style={{ marginTop: 24 }}>
                <label className="form-label">Target Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Request Slot Button */}
              <motion.button
                whileHover={{ scale: 1.015, boxShadow: '0 0 24px rgba(139,92,246,0.25)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setForm({ ...form, event_name: '', time_slot: TIME_SLOTS[0].label });
                  setIsModalOpen(true);
                  setError(null);
                }}
                className="btn-primary"
                style={{ marginTop: 24 }}
              >
                <Sparkles style={{ width: 16, height: 16 }} />
                Request New Slot
                <ArrowRight style={{ width: 15, height: 15 }} />
              </motion.button>
            </motion.div>

            {/* ─ Right Panel: Time Slot Availability Grid ─ */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                paddingLeft: 4,
              }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  {selectedVenue?.name || 'Select a Venue'}
                  <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 8, fontSize: '0.85rem' }}>
                    / {selectedDate}
                  </span>
                </h2>
                <span
                  className="live-badge"
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    color: '#0f766e',
                    background: 'rgba(20,184,166,0.08)',
                    padding: '5px 12px',
                    borderRadius: 9999,
                    border: '1px solid rgba(20,184,166,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Live Grid
                </span>
              </div>

              {loadingSlots ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 64, width: '100%' }} />
                  ))}
                </div>
              ) : (
                <motion.div
                  key={`${selectedVenue?.id}-${selectedDate}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {TIME_SLOTS.map((slot) => {
                    const slotStatus = availabilityMap[slot.label] || null;
                    const isAvailable = !slotStatus;
                    const isApproved = slotStatus === 'APPROVED' || slotStatus === 'Open';
                    const isPending = slotStatus === 'PENDING';

                    return (
                      <motion.div
                        key={slot.label}
                        variants={itemVariants}
                        whileHover={isAvailable ? { x: 5, transition: { duration: 0.15 } } : {}}
                        className={`slot-row ${isAvailable ? 'clickable' : ''}`}
                        onClick={isAvailable ? () => handleClickToSecure(slot.label) : undefined}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <Clock style={{ width: 17, height: 17, color: 'rgba(113,113,122,0.5)' }} />
                          <div>
                            <p style={{
                              fontFamily: 'monospace',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: '#0f172a',
                              margin: 0,
                            }}>
                              {slot.display}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isAvailable && (
                            <>
                              <span className="status-pill status-open">
                                <CheckCircle style={{ width: 13, height: 13 }} />
                                Open
                              </span>
                              <button
                                className="btn-secure"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClickToSecure(slot.label);
                                }}
                              >
                                <Zap style={{ width: 11, height: 11 }} />
                                Click to secure
                              </button>
                            </>
                          )}
                          {isApproved && (
                            <span className="status-pill status-reserved">
                              <ShieldAlert style={{ width: 13, height: 13 }} />
                              Reserved
                            </span>
                          )}
                          {isPending && (
                            <span className="status-pill status-pending">
                              <AlertCircle style={{ width: 13, height: 13 }} />
                              Pending
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOOKING REQUEST MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="modal-backdrop"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="modal-content"
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 4px' }}>
                Secure This Slot
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 24, marginTop: 0 }}>
                Your reservation will be confirmed instantly upon submission.
              </p>

              <form onSubmit={handleSubmitBooking}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Venue (read-only) */}
                  <div>
                    <label className="form-label">Venue</label>
                    <div className="form-input" style={{ background: 'rgba(15,15,25,0.5)', color: 'rgba(161,161,170,0.8)', cursor: 'default' }}>
                      {selectedVenue?.name || '—'}
                    </div>
                  </div>

                  {/* Date (read-only) */}
                  <div>
                    <label className="form-label">Date</label>
                    <div className="form-input" style={{ background: 'rgba(15,15,25,0.5)', color: 'rgba(161,161,170,0.8)', cursor: 'default' }}>
                      {selectedDate}
                    </div>
                  </div>

                  {/* Time Slot Picker */}
                  <div>
                    <label className="form-label">Time Slot</label>
                    <select
                      value={form.time_slot}
                      onChange={(e) => setForm({ ...form, time_slot: e.target.value })}
                      className="form-input"
                      style={{ cursor: 'pointer' }}
                    >
                      {TIME_SLOTS.map((slot) => {
                        const taken = !!availabilityMap[slot.label];
                        return (
                          <option key={slot.label} value={slot.label} disabled={taken}>
                            {slot.display}{taken ? ' (Reserved)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Event Name */}
                  <div>
                    <label className="form-label">Event Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Mini Project Evaluation"
                      value={form.event_name}
                      onChange={(e) => setForm({ ...form, event_name: e.target.value })}
                      className="form-input"
                      required
                      autoFocus
                    />
                  </div>

                  {/* User Name + Role */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="form-label">Your Name</label>
                      <input
                        type="text"
                        value={form.user_name}
                        onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Role</label>
                      <select
                        value={form.user_role}
                        onChange={(e) => setForm({ ...form, user_role: e.target.value })}
                        className="form-input"
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="Student">Student</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  {/* Error message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(244,63,94,0.1)',
                        border: '1px solid rgba(244,63,94,0.2)',
                        color: '#fb7185',
                        fontSize: '0.78rem',
                        fontWeight: 500,
                      }}
                    >
                      {error}
                    </motion.div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setError(null); }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 10,
                      border: 'none',
                      background: 'transparent',
                      color: 'rgba(161,161,170,0.7)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(161,161,170,0.7)'}
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(15,76,129,0.28)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '10px 24px',
                      borderRadius: 10,
                      border: 'none',
                      background: 'linear-gradient(135deg, #1d4ed8, #14b8a6)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontFamily: 'Inter, sans-serif',
                      boxShadow: '0 4px 16px rgba(15,76,129,0.22)',
                      willChange: 'transform',
                    }}
                  >
                    {submitting && <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />}
                    Submit Request
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}