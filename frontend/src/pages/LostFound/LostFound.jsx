import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Phone, Mail, MapPin, Search, Plus, X, CheckSquare, Calendar, Sparkles, Filter, Check, Trash2 } from 'lucide-react'

const initialLostFoundListings = [
  {
    id: 'lf-1',
    itemName: 'Blue commuter backpack',
    category: 'Found',
    location: 'Library Commons',
    description: 'Black and blue backpack with a silver water bottle sleeve and campus ID badge attached.',
    contactEmail: 'backpack-owner@campus.edu',
    contactPhone: '+18005551234',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Available',
  },
  {
    id: 'lf-2',
    itemName: 'Silver key ring',
    category: 'Lost',
    location: 'Chemistry Building',
    description: 'Metal key ring with three keys, one red plastic tag, and a handwritten name label inside.',
    contactEmail: 'chemkeys@campus.edu',
    contactPhone: '+18005559876',
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&q=80',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Claim pending',
  },
  {
    id: 'lf-3',
    itemName: 'Student ID wallet',
    category: 'Found',
    location: 'Student Center',
    description: 'Brown leather wallet with student ID, library card, and a few receipts inside.',
    contactEmail: 'id-wallet@campus.edu',
    contactPhone: '+18005553421',
    image: 'https://images.unsplash.com/photo-1627124089633-8fc6d5d05aa2?w=500&q=80',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Ready for pickup',
  },
  {
    id: 'lf-4',
    itemName: 'Noise-cancelling earphones',
    category: 'Lost',
    location: 'Engineering Quad',
    description: 'Black over-ear earphones in a branded carrying pouch with a zipper pull.',
    contactEmail: 'earphones-owner@campus.edu',
    contactPhone: '+18005555678',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Available',
  },
]

function LostFound() {
  // --- Listings & Locations State ---
  const [listings, setListings] = useState(() => {
    const saved = localStorage.getItem('lost_found_listings')
    return saved ? JSON.parse(saved) : initialLostFoundListings
  })
  
  const [locations, setLocations] = useState(['Library Commons', 'Student Center', 'Chemistry Building', 'Engineering Quad', 'Campus Canteen', 'Sports Complex', 'Other Area'])
  const [apiOnline, setApiOnline] = useState(false)

  // --- API Fetch ---
  useEffect(() => {
    // 1. Fetch posts
    fetch('http://localhost:4000/api/lostfound/posts')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setListings(data.posts)
          setApiOnline(true)
        }
      })
      .catch(err => {
        console.warn('Lost & Found API offline, running in simulation mode:', err)
        setApiOnline(false)
      })

    // 2. Fetch locations
    fetch('http://localhost:4000/api/lostfound/locations')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.locations.length > 0) {
          setLocations(data.locations.map(l => l.name))
        }
      })
      .catch(err => {
        console.warn('Failed to fetch campus locations from API:', err)
      })
  }, [])

  // --- Filtering & Searching State ---
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterLocation, setFilterLocation] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  // --- Modal Modifiers ---
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [activeClaimItem, setActiveClaimItem] = useState(null)
  const [claimSuccess, setClaimSuccess] = useState(false)

  // --- Form States ---
  // Report form
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState('Lost')
  const [location, setLocation] = useState('Library Commons')
  const [description, setDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [image, setImage] = useState(null) // Base64 Image string

  // Claim form
  const [claimProof, setClaimProof] = useState('')
  const [claimEmail, setClaimEmail] = useState('')
  const [claimPhone, setClaimPhone] = useState('')

  // Unique locations in listings for filtering dropdown
  const uniqueLocationsList = useMemo(() => {
    return ['All', ...new Set(locations)]
  }, [locations])

  // Filter listings based on criteria
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      const matchesSearch = 
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory
      const matchesLocation = filterLocation === 'All' || item.location === filterLocation
      const matchesStatus = filterStatus === 'All' || item.status === filterStatus

      return matchesSearch && matchesCategory && matchesLocation && matchesStatus
    })
  }, [listings, searchQuery, filterCategory, filterLocation, filterStatus])

  // Process selected image file into Base64 Data URL
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Enforce 1.5MB size limit to avoid database bloat
    if (file.size > 1.5 * 1024 * 1024) {
      alert('Selected image is too large! Please choose an image smaller than 1.5MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Form submit for reporting a new item
  const handleReportSubmit = (e) => {
    e.preventDefault()
    if (!itemName.trim() || !description.trim() || !contactEmail.trim()) return

    const payload = {
      category,
      itemName: itemName.trim(),
      description: description.trim(),
      location,
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      contactInfo: `Email: ${contactEmail.trim()}. Phone: ${contactPhone.trim() || 'N/A'}`,
      image // Base64 string payload
    }

    if (apiOnline) {
      fetch('http://localhost:4000/api/lostfound/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // reload listings
          fetch('http://localhost:4000/api/lostfound/posts')
            .then(res => res.json())
            .then(d => {
              if (d.success) setListings(d.posts)
            })
        }
      })
      .catch(err => {
        console.error('API post failed, adding locally:', err)
        addLocalListing(payload)
      })
    } else {
      addLocalListing(payload)
    }

    // Reset form
    setItemName('')
    setDescription('')
    setContactEmail('')
    setContactPhone('')
    setImage(null)
    setIsReportModalOpen(false)
  }

  const addLocalListing = (payload) => {
    const newItem = {
      id: `lf-custom-${Date.now()}`,
      itemName: payload.itemName,
      category: payload.category,
      location: payload.location,
      description: payload.description,
      contactEmail: payload.contactEmail,
      contactPhone: payload.contactPhone || '+18005550000',
      image: payload.image || null,
      postedAt: new Date().toISOString(),
      status: 'Available',
    }
    const updated = [newItem, ...listings]
    setListings(updated)
    localStorage.setItem('lost_found_listings', JSON.stringify(updated))
  }

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false)
    setItemName('')
    setDescription('')
    setContactEmail('')
    setContactPhone('')
    setImage(null)
  }

  // Open claim modal
  const handleOpenClaimModal = (item) => {
    setActiveClaimItem(item)
    setIsClaimModalOpen(true)
    setClaimSuccess(false)
  }

  // Claim submission
  const handleClaimSubmit = (e) => {
    e.preventDefault()
    if (!claimProof.trim() || !claimEmail.trim()) return

    if (apiOnline) {
      fetch(`http://localhost:4000/api/lostfound/posts/${activeClaimItem.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Claim pending' })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // reload listings
          fetch('http://localhost:4000/api/lostfound/posts')
            .then(res => res.json())
            .then(d => {
              if (d.success) setListings(d.posts)
            })
        }
      })
      .catch(err => {
        console.error('API claim update failed, updating locally:', err)
        updateLocalStatus(activeClaimItem.id, 'Claim pending')
      })
    } else {
      updateLocalStatus(activeClaimItem.id, 'Claim pending')
    }

    setClaimSuccess(true)
    setClaimProof('')
    setClaimEmail('')
    setClaimPhone('')
    
    // Close modal after delay to let user see success checkmark
    setTimeout(() => {
      setIsClaimModalOpen(false)
      setActiveClaimItem(null)
      setClaimSuccess(false)
    }, 2500)
  }

  const updateLocalStatus = (id, newStatus) => {
    const updated = listings.map(item => {
      if (item.id === id) {
        return { ...item, status: newStatus }
      }
      return item
    })
    setListings(updated)
    localStorage.setItem('lost_found_listings', JSON.stringify(updated))
  }

  const handleDeleteListing = (id) => {
    if (apiOnline) {
      fetch(`http://localhost:4000/api/lostfound/posts/${id}`, {
        method: 'DELETE'
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setListings(listings.filter(l => l.id !== id))
        }
      })
      .catch(err => {
        console.error('API delete post failed, removing locally:', err)
        removeLocalListing(id)
      })
    } else {
      removeLocalListing(id)
    }
  }

  const removeLocalListing = (id) => {
    const updated = listings.filter(l => l.id !== id)
    setListings(updated)
    localStorage.setItem('lost_found_listings', JSON.stringify(updated))
  }

  // Helper: compute days ago string
  const formatTimeAgo = (isoString) => {
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return 'Just now'
  }

  return (
    <div className="bulletin-container">
      {/* Inline styles to ensure CSS captures layout perfectly regardless of browser reset overrides */}
      <style>{`
        .bulletin-container {
          max-width: 1024px;
          margin: 0 auto;
          padding: 32px 16px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #0f172a;
          background: #fafafc;
        }

        .bulletin-header {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(15,76,129,0.07);
          margin-bottom: 28px;
        }

        .bulletin-header-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .bulletin-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.025em;
        }

        .bulletin-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .report-button {
          background: linear-gradient(135deg, #1d4ed8, #14b8a6);
          color: white;
          font-weight: 700;
          font-size: 0.82rem;
          padding: 11px 20px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s, box-shadow 0.2s, transform 0.15s;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(15,76,129,0.22);
          will-change: transform;
        }
        .report-button:hover {
          opacity: 0.9;
          box-shadow: 0 6px 24px rgba(15,76,129,0.3);
          transform: translateY(-1px);
        }

        .filter-container {
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(15,76,129,0.07);
          border-radius: 16px;
          padding: 14px 16px;
          box-shadow: 0 2px 16px rgba(15,76,129,0.05);
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          backdrop-filter: blur(16px);
        }

        .search-input-wrapper {
          position: relative;
          flex-grow: 1;
        }

        .search-input {
          width: 100%;
          padding: 10px 16px 10px 40px;
          border: 1px solid rgba(15,76,129,0.12);
          border-radius: 12px;
          font-size: 0.875rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          background: rgba(255,255,255,0.9);
          color: #0f172a;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input::placeholder { color: #94a3b8; }
        .search-input:focus {
          border-color: rgba(15,76,129,0.4);
          box-shadow: 0 0 0 3px rgba(15,76,129,0.07);
        }

        .filter-select {
          padding: 10px 12px;
          border: 1px solid rgba(15,76,129,0.10);
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          background: rgba(255,255,255,0.9);
          color: #475569;
          cursor: pointer;
          outline: none;
          height: 40px;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .filter-select:hover { border-color: rgba(15,76,129,0.2); }
        .filter-select:focus {
          border-color: rgba(15,76,129,0.4);
          box-shadow: 0 0 0 3px rgba(15,76,129,0.07);
        }

        .cards-list {
          display: flex;
          flex-direction: column;
          margin-bottom: 32px;
        }

        .item-card {
          background: rgba(255,255,255,0.75);
          border-radius: 18px;
          border: 1px solid rgba(15,76,129,0.07);
          padding: 22px;
          box-shadow: 0 2px 16px rgba(15,76,129,0.05);
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          backdrop-filter: blur(16px);
          will-change: transform;
        }
        .item-card:hover {
          transform: translateY(-4px);
          border-color: rgba(20,184,166,0.22);
          box-shadow: 0 8px 32px rgba(15,76,129,0.08);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 16px;
        }

        .item-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.4;
          letter-spacing: -0.015em;
        }

        .pill-badge {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 12px;
          border-radius: 9999px;
          white-space: nowrap;
        }
        .badge-found {
          background: rgba(20,184,166,0.1);
          color: #0f766e;
          border: 1px solid rgba(20,184,166,0.22);
        }
        .badge-lost {
          background: rgba(244,63,94,0.08);
          color: #be123c;
          border: 1px solid rgba(244,63,94,0.18);
        }

        .item-description {
          margin-top: 8px;
          color: #64748b;
          font-size: 0.875rem;
          line-height: 1.65;
        }

        .item-metadata {
          margin-top: 12px;
          display: flex;
          align-items: baseline;
          gap: 6px;
          color: #94a3b8;
          font-size: 0.75rem;
        }

        .metadata-icon {
          align-self: center;
          color: #14b8a6;
        }

        .card-footer {
          margin-top: 18px;
          border-top: 1px solid rgba(15,76,129,0.06);
          padding-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
        }

        .status-label {
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-size: 0.65rem;
        }

        .status-badge {
          font-weight: 800;
          padding: 3px 12px;
          border-radius: 9999px;
          font-size: 10px;
        }

        .actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .action-button-outline {
          padding: 8px 14px;
          border: 1px solid rgba(15,76,129,0.12);
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          font-family: 'Inter', sans-serif;
          background: rgba(255,255,255,0.7);
          text-decoration: none;
          text-align: center;
          transition: background 0.2s, border-color 0.2s;
          cursor: pointer;
        }
        .action-button-outline:hover {
          background: rgba(255,255,255,0.95);
          border-color: rgba(15,76,129,0.25);
          color: #0f172a;
        }

        .action-button-primary {
          padding: 8px 14px;
          border: none;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #1d4ed8, #14b8a6);
          cursor: pointer;
          text-align: center;
          transition: opacity 0.2s;
          box-shadow: 0 2px 10px rgba(15,76,129,0.18);
        }
        .action-button-primary:hover { opacity: 0.88; }
      `}</style>

      {/* Header Banner */}
      <header className="bulletin-header">
        <div className="bulletin-header-text">
          <h1 className="bulletin-title">Campus Lost &amp; Found</h1>
          <p className="bulletin-subtitle">
            Browse items lost or found on campus. Submit listings or request claims.
          </p>
        </div>
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="report-button"
        >
          <Plus style={{ width: 15, height: 15 }} />
          Report New Item
        </button>
      </header>

      {/* Filter and Search Bar Row */}
      <div className="filter-container">
        {/* Search Input wrapper */}
        <div className="search-input-wrapper">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search item name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Dropdown Filters */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Categories</option>
          <option value="Lost">Lost</option>
          <option value="Found">Found</option>
        </select>

        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Locations</option>
          {uniqueLocationsList.filter(loc => loc !== 'All').map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available / New</option>
          <option value="Claim pending">Claim pending</option>
          <option value="Ready for pickup">Ready for pickup</option>
        </select>
      </div>

      {/* Listings */}
      <div className="cards-list">
        {filteredListings.length === 0 ? (
          <div className="py-16 bg-white border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
            <Search className="h-12 w-12 text-slate-300 mb-3" />
            <p className="font-bold text-lg">No listings matches your filters</p>
            <p className="text-sm mt-1">Try modifying your filters or search terms.</p>
          </div>
        ) : (
          filteredListings.map((listing) => (
            <div key={listing.id} className="item-card">
              <div>
                {/* Image Banner */}
                {listing.image && (
                  <div className="w-full h-48 rounded-lg overflow-hidden mb-4 bg-slate-100 border border-slate-100">
                    <img 
                      src={listing.image} 
                      alt={listing.itemName} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Header with Title and pill badges */}
                <div className="card-header">
                  <h2 className="item-title">
                    {listing.itemName}
                  </h2>
                  <span className={`pill-badge ${
                    listing.category === 'Found' ? 'badge-found' : 'badge-lost'
                  }`}>
                    {listing.category}
                  </span>
                </div>

                {/* Details */}
                <p className="item-description">{listing.description}</p>
                
                {/* Location baseline metadata */}
                <div className="item-metadata">
                  <MapPin className="metadata-icon h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">{listing.location}</span>
                  <span className="text-slate-300 mx-1">•</span>
                  <span className="text-slate-400 font-semibold">{formatTimeAgo(listing.postedAt || new Date())}</span>
                </div>

              </div>

              {/* Status Section and Actions footer */}
              <div className="card-footer">
                <div className="status-row">
                  <span className="status-label">Status</span>
                  <span className={`status-badge font-extrabold ${
                    listing.status === 'Available' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                      : listing.status === 'Ready for pickup'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {listing.status}
                  </span>
                </div>

                <div className="actions-row">
                  <a 
                    href={`mailto:${listing.contactEmail}?subject=Inquiry: ${encodeURIComponent(listing.itemName)}`} 
                    className="action-button-outline"
                  >
                    Email Owner
                  </a>
                  
                  {listing.category === 'Found' && listing.status !== 'Claim pending' ? (
                    <button 
                      onClick={() => handleOpenClaimModal(listing)}
                      className="action-button-primary"
                    >
                      Claim Item
                    </button>
                  ) : (
                    <a 
                      href={`tel:${listing.contactPhone}`} 
                      className="action-button-outline"
                    >
                      Call Contact
                    </a>
                  )}
                </div>
                
                {/* Delete listing (for development/testing) */}
                <div className="flex justify-end pt-1">
                  <button 
                    onClick={() => handleDeleteListing(listing.id)}
                    className="text-[9px] text-slate-300 hover:text-red-500 font-medium transition flex items-center gap-0.5"
                    style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 className="h-2.5 w-2.5" /> Remove Post
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Info Banner at Bottom */}
      <div
        style={{
          borderRadius: '1.5rem',
          border: '1px solid rgba(15,76,129,0.08)',
          background: 'rgba(255,255,255,0.75)',
          padding: '28px 32px',
          boxShadow: '0 4px 24px rgba(15,76,129,0.06)',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 24,
          backdropFilter: 'blur(20px)',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', margin: '0 0 4px', letterSpacing: '-0.015em' }}>
            Reported an item and want to check details?
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
            All submitted items are tracked on the server database or client cache.
          </p>
        </div>
        <button
          onClick={() => setIsReportModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 12,
            border: '1px solid rgba(15,76,129,0.12)',
            background: 'rgba(15,76,129,0.05)',
            padding: '11px 20px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#1d4ed8',
            cursor: 'pointer',
            transition: 'background 0.2s',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          File new report <ArrowRight style={{ width: 15, height: 15 }} />
        </button>
      </div>

      {/* --- REPORT ITEM MODAL --- */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(8px)' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.97)',
              borderRadius: '1.5rem',
              border: '1px solid rgba(15,76,129,0.09)',
              width: '100%',
              maxWidth: 520,
              padding: 32,
              boxShadow: '0 25px 60px rgba(15,76,129,0.12)',
              position: 'relative',
              color: '#0f172a',
            }}
          >
            <button
              onClick={handleCloseReportModal}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                padding: 6,
                border: '1px solid rgba(15,76,129,0.10)',
                background: 'rgba(15,76,129,0.04)',
                borderRadius: 10,
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.2s',
              }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>Report Lost/Found Item</h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Provide details to post this item on the campus bulletin board.</p>
            </div>

            <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Item Name / Title</label>
                <input
                  type="text"
                  placeholder="e.g., Calculus Textbook, Leather Keyholder"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(15,76,129,0.12)', borderRadius: 10, fontSize: '0.875rem', color: '#0f172a', background: 'rgba(255,255,255,0.9)', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(15,76,129,0.12)', borderRadius: 10, fontSize: '0.875rem', color: '#0f172a', background: 'rgba(255,255,255,0.9)', outline: 'none', cursor: 'pointer', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Campus Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid rgba(15,76,129,0.12)', borderRadius: 10, fontSize: '0.875rem', color: '#0f172a', background: 'rgba(255,255,255,0.9)', outline: 'none', cursor: 'pointer', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Item Description</label>
                <textarea
                  placeholder="e.g., color, markings, brand name"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(15,76,129,0.12)', borderRadius: 10, fontSize: '0.875rem', color: '#0f172a', background: 'rgba(255,255,255,0.9)', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Contact Email</label>
                  <input
                    type="email"
                    placeholder="e.g., name@campus.edu"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(15,76,129,0.12)', borderRadius: 10, fontSize: '0.875rem', color: '#0f172a', background: 'rgba(255,255,255,0.9)', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g., +1 800 555"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(15,76,129,0.12)', borderRadius: 10, fontSize: '0.875rem', color: '#0f172a', background: 'rgba(255,255,255,0.9)', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>

              {/* Image Uploader Field */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Upload Item Picture</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-uploader"
                  />
                  <label 
                    htmlFor="image-uploader" 
                    className="px-4 py-2.5 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer bg-slate-950"
                  >
                    Choose Picture File
                  </label>
                  {image ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-indigo-400 font-semibold truncate max-w-[200px]">Picture Selected!</span>
                      <button type="button" onClick={() => setImage(null)} className="text-rose-500 text-xs font-bold hover:underline cursor-pointer">Clear</button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">No image chosen (optional)</span>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseReportModal}
                  className="w-1/2 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 font-bold text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow cursor-pointer"
                >
                  Submit Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CLAIM ITEM MODAL --- */}
      {isClaimModalOpen && activeClaimItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-[2rem] border border-slate-800 w-full max-w-lg p-8 shadow-2xl relative text-slate-100">
            
            {!claimSuccess ? (
              <>
                <button 
                  onClick={() => setIsClaimModalOpen(false)}
                  className="absolute top-6 right-6 p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="space-y-2 mb-6">
                  <span className="inline-flex rounded-full bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400">Claim Validation</span>
                  <h2 className="text-2xl font-bold text-white mt-1">Claim: {activeClaimItem.itemName}</h2>
                  <p className="text-xs text-slate-400">Prove ownership of this found item.</p>
                </div>

                <form onSubmit={handleClaimSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Proof of Ownership</label>
                    <textarea
                      placeholder="Describe unique identifiers, lock screens, or purchase receipt details..."
                      value={claimProof}
                      onChange={(e) => setClaimProof(e.target.value)}
                      rows="4"
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 outline-none focus:border-indigo-500/50 resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Your Email</label>
                      <input
                        type="email"
                        placeholder="e.g., claimant@campus.edu"
                        value={claimEmail}
                        onChange={(e) => setClaimEmail(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 outline-none focus:border-indigo-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Your Phone</label>
                      <input
                        type="text"
                        placeholder="e.g., +1 800 555"
                        value={claimPhone}
                        onChange={(e) => setClaimPhone(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsClaimModalOpen(false)}
                      className="w-1/2 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 font-bold text-sm transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow cursor-pointer"
                    >
                      Submit Claim Request
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center animate-bounce border border-emerald-500/20">
                  <Check className="h-8 w-8" style={{ strokeWidth: 3 }} />
                </div>
                <h3 className="text-xl font-bold text-white">Claim Request Submitted</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Your claim details for <strong>{activeClaimItem.itemName}</strong> have been submitted.
                </p>
                <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider animate-pulse pt-2">
                  Closing dialog in a moment...
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}

export default LostFound
