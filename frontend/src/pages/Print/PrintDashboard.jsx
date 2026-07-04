import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  Printer,
  Layers,
  Copy,
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Eye,
  ArrowRight,
  TrendingUp,
  X,
  FileCheck,
  Briefcase
} from "lucide-react";
import "./PrintDashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API = `${API_BASE}/api/print`;

// Client-side PDF page counter (scans PDF structures for page objects)
const countPdfPagesLocally = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const arr = new Uint8Array(reader.result);
        const str = new TextDecoder("utf-8").decode(arr);
        const matches = str.match(/\/Type\s*\/Page\b/g);
        if (matches) {
          resolve(matches.length);
        } else {
          const matchesCount = str.match(/\/Count\s+(\d+)/g);
          if (matchesCount) {
            const counts = matchesCount.map((m) => parseInt(m.match(/\d+/)[0], 10));
            resolve(Math.max(...counts, 1));
          } else {
            resolve(1);
          }
        }
      } catch (err) {
        resolve(1); // Default to 1 on failure
      }
    };
    reader.onerror = () => resolve(1);
    reader.readAsArrayBuffer(file);
  });
};

export default function PrintDashboard() {
  // Navigation role state: 'student' | 'operator'
  const [role, setRole] = useState("student");
  
  // Shared state
  const [jobs, setJobs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [notification, setNotification] = useState(null);

  // Student Form states
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [copies, setCopies] = useState(1);
  const [printType, setPrintType] = useState("B&W"); // 'Color' or 'B&W'
  const [layout, setLayout] = useState("Single Side"); // 'Single Side' or 'Double Side'
  const [studentName, setStudentName] = useState("Arjun K."); // Demo User
  
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Operator states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // 'All' | 'Pending' | 'Printing' | 'Completed'
  const [activeJobForView, setActiveJobForView] = useState(null); // For PDF viewing modal
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch print jobs history
  const fetchJobs = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch(`${API}/history`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to fetch print history:", err);
      showNotification("Error loading print logs. Please ensure the backend is running.", "error");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        await processSelectedFile(droppedFile);
      } else {
        showNotification("Only PDF documents are supported.", "error");
      }
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      await processSelectedFile(selected);
    }
  };

  const processSelectedFile = async (selectedFile) => {
    setUploading(true);
    setFile(selectedFile);
    
    // Auto-detect page count locally
    const countedPages = await countPdfPagesLocally(selectedFile);
    setPageCount(countedPages);
    setUploading(false);
    showNotification(`PDF loaded: ${selectedFile.name} (${countedPages} pages detected)`);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  // Price Calculation Rules
  // B&W = ₹2/page, Color = ₹5/page
  const ratePerPage = printType === "Color" ? 5 : 2;
  const estimatedPrice = pageCount * ratePerPage * copies;

  // Submit Student Order
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showNotification("Please upload a PDF document first.", "error");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("studentName", studentName);
      formData.append("copies", copies);
      formData.append("printType", printType);
      formData.append("layout", layout);

      const res = await fetch(`${API}/submit`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        showNotification(`Order placed! Total: ₹${data.price}`);
        // Reset form
        setFile(null);
        setPageCount(0);
        setCopies(1);
        setPrintType("B&W");
        setLayout("Single Side");
        // Re-fetch jobs
        fetchJobs();
      } else {
        showNotification(data.message || "Failed to submit print order.", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Network error submitting print order.", "error");
    } finally {
      setUploading(false);
    }
  };

  // Operator: Update Order Status
  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      setActionLoadingId(jobId);
      const res = await fetch(`${API}/${jobId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Order updated to '${newStatus}' successfully!`);
        // Refresh local cache
        setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      } else {
        showNotification(data.message || "Failed to update order status.", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error communicating with print server.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Operator statistics helper
  const stats = React.useMemo(() => {
    const pending = jobs.filter(j => j.status === "Pending").length;
    const printing = jobs.filter(j => j.status === "Printing").length;
    const completed = jobs.filter(j => j.status === "Completed").length;
    const revenue = jobs
      .filter(j => j.status === "Completed")
      .reduce((sum, j) => sum + parseFloat(j.price || 0), 0);

    return { pending, printing, completed, revenue };
  }, [jobs]);

  // Operator list filtering
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      (job.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.fileName || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="print-root p-6 md:p-10 min-h-screen" style={{ background: '#fafafc', color: '#0f172a' }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 backdrop-blur-xl border ${
              notification.type === 'error'
                ? 'bg-red-50/95 border-red-200 text-red-700'
                : 'bg-teal-50/95 border-teal-200 text-teal-700'
            }`}
          >
            {notification.type === "error" ? (
              <X className="w-5 h-5 text-red-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            <span className="font-medium text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto print-content">
        {/* ── Page Intro — light mode ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 24,
            marginBottom: 28,
            paddingBottom: 20,
            borderBottom: '1px solid rgba(15,76,129,0.07)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div
                style={{
                  padding: 10,
                  background: 'rgba(20,184,166,0.08)',
                  borderRadius: 14,
                  border: '1px solid rgba(20,184,166,0.18)',
                }}
              >
                <Printer style={{ width: 24, height: 24, color: '#14b8a6' }} />
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.025em',
                }}
              >
                Print Hub
              </h1>
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>
              Submit printing orders or manage the print operations queue.
            </p>
          </div>

          {/* Toggle Role Selector — light glass */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(15,76,129,0.08)',
              padding: 5,
              borderRadius: 14,
              backdropFilter: 'blur(16px)',
              boxShadow: '0 2px 12px rgba(15,76,129,0.05)',
            }}
          >
            <button
              onClick={() => setRole('student')}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                role === 'student'
                  ? 'text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              style={{
                background: role === 'student'
                  ? 'linear-gradient(135deg, #1d4ed8, #14b8a6)'
                  : 'transparent',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Student Portal
            </button>
            <button
              onClick={() => setRole('operator')}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                role === 'operator'
                  ? 'text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              style={{
                background: role === 'operator'
                  ? 'linear-gradient(135deg, #1d4ed8, #14b8a6)'
                  : 'transparent',
              }}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Xerox Operator
            </button>
          </div>
        </div>

        {/* ========================================================
            STUDENT PORTAL
            ======================================================== */}
        <AnimatePresence mode="wait">
          {role === "student" && (
            <motion.div
              key="student-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-5 gap-8"
            >
              {/* Form Section */}
              <div className="md:col-span-3 flex flex-col gap-6">
                <div className="print-glass-card p-6 md:p-8">
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <FileCheck className="text-violet-400 w-5 h-5" />
                    New Print Order
                  </h2>

                  <form onSubmit={handleOrderSubmit} className="space-y-6">
                    {/* Student Name (Simulated auth input) */}
                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                        Student Name
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Enter student name..."
                        required
                        className="print-input"
                      />
                    </div>

                    {/* PDF Upload Area */}
                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                        Upload Document (PDF Only)
                      </label>
                      
                      <div
                        className={`upload-zone p-8 text-center flex flex-col items-center justify-center min-h-[180px] ${
                          dragActive ? "drag-active" : ""
                        }`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={triggerFileSelect}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />

                        {uploading ? (
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-zinc-300 font-semibold text-sm">Processing document...</p>
                            <p className="text-zinc-500 text-xs mt-1">Reading page count client-side</p>
                          </div>
                        ) : file ? (
                          <div className="flex flex-col items-center">
                            <div className="p-3.5 bg-violet-600/10 rounded-2xl border border-violet-500/20 mb-3">
                              <FileText className="w-10 h-10 text-violet-400 animate-pulse" />
                            </div>
                            <p className="text-white font-semibold text-sm max-w-xs truncate">{file.name}</p>
                            <p className="text-violet-400 text-xs font-bold mt-1.5 uppercase tracking-wide bg-violet-500/10 px-3 py-1 rounded-full">
                              {pageCount} Pages Counted
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                                setPageCount(0);
                              }}
                              className="mt-4 text-zinc-500 hover:text-red-400 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              Remove File
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 mb-3">
                              <UploadCloud className="w-8 h-8 text-zinc-400" />
                            </div>
                            <p className="text-zinc-300 font-semibold text-sm">
                              Drag and drop your PDF here
                            </p>
                            <p className="text-zinc-500 text-xs mt-1">
                              or click to browse local files
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Specification Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Copies */}
                      <div>
                        <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                          Copies
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            value={copies}
                            onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="print-input pl-10"
                            required
                          />
                          <Copy className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                        </div>
                      </div>

                      {/* Color Option */}
                      <div>
                        <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                          Print Type
                        </label>
                        <div className="relative">
                          <select
                            value={printType}
                            onChange={(e) => setPrintType(e.target.value)}
                            className="print-select pl-10"
                          >
                            <option value="B&W">Black & White (₹2)</option>
                            <option value="Color">Color (₹5)</option>
                          </select>
                          <Printer className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                        </div>
                      </div>

                      {/* Layout Option */}
                      <div>
                        <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                          Layout
                        </label>
                        <div className="relative">
                          <select
                            value={layout}
                            onChange={(e) => setLayout(e.target.value)}
                            className="print-select pl-10"
                          >
                            <option value="Single Side">Single Side</option>
                            <option value="Double Side">Double Side</option>
                          </select>
                          <Layers className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={uploading || !file}
                      className="w-full print-btn-primary py-3.5 rounded-xl flex items-center justify-center gap-2 border-0 outline-none"
                    >
                      <Sparkles className="w-4 h-4" />
                      Submit Print Order
                    </button>
                  </form>
                </div>
              </div>

              {/* Price Estimation Card */}
              <div className="md:col-span-2 flex flex-col gap-6">
                <div className="print-glass-card price-tag-glow p-6 md:p-8 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-zinc-300 font-extrabold text-md uppercase tracking-wider">
                        Estimate
                      </span>
                      <span className="text-violet-400 text-xs font-bold bg-violet-500/15 px-2.5 py-1 rounded-md border border-violet-500/25">
                        Live Calculator
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* File Info */}
                      <div className="flex justify-between border-b border-zinc-800/50 pb-3">
                        <span className="text-zinc-400 text-sm">File Name</span>
                        <span className="text-white text-sm font-semibold max-w-[160px] truncate">
                          {file ? file.name : "No file uploaded"}
                        </span>
                      </div>

                      {/* Pages Info */}
                      <div className="flex justify-between border-b border-zinc-800/50 pb-3">
                        <span className="text-zinc-400 text-sm">Total Pages</span>
                        <span className="text-white text-sm font-semibold">
                          {pageCount > 0 ? `${pageCount} pages` : "0 pages"}
                        </span>
                      </div>

                      {/* Print Type Rate */}
                      <div className="flex justify-between border-b border-zinc-800/50 pb-3">
                        <span className="text-zinc-400 text-sm">Rate ({printType})</span>
                        <span className="text-white text-sm font-semibold">
                          ₹{ratePerPage} / page
                        </span>
                      </div>

                      {/* Copies */}
                      <div className="flex justify-between border-b border-zinc-800/50 pb-3">
                        <span className="text-zinc-400 text-sm">Copies</span>
                        <span className="text-white text-sm font-semibold">
                          × {copies}
                        </span>
                      </div>

                      {/* Layout */}
                      <div className="flex justify-between border-b border-zinc-800/50 pb-3">
                        <span className="text-zinc-400 text-sm">Layout Mode</span>
                        <span className="text-white text-sm font-semibold">
                          {layout}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-zinc-800/60 pt-6">
                    {pageCount > 0 && (
                      <div className="text-zinc-500 text-xs mb-3 italic font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {pageCount} pages × ₹{ratePerPage} × {copies} copies
                      </div>
                    )}
                    
                    <div className="flex justify-between items-baseline mb-4">
                      <span className="text-zinc-300 font-bold text-sm">Total Price</span>
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">
                        ₹{estimatedPrice}
                      </span>
                    </div>

                    <p className="text-zinc-500 text-xs leading-relaxed m-0">
                      Pricing is automatically calculated. Payment must be cleared at the print station upon collection.
                    </p>
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div className="md:col-span-5 mt-4">
                <div className="print-glass-card p-6 md:p-8">
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Clock className="text-violet-400 w-5 h-5" />
                    My Print History
                  </h2>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800/80 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                          <th className="py-4 px-4">Order ID</th>
                          <th className="py-4 px-4">File Name</th>
                          <th className="py-4 px-4">Pages</th>
                          <th className="py-4 px-4">Copies</th>
                          <th className="py-4 px-4">Specifications</th>
                          <th className="py-4 px-4">Price</th>
                          <th className="py-4 px-4">Status</th>
                          <th className="py-4 px-4 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/40 text-zinc-300 text-sm">
                        {loadingHistory ? (
                          [1, 2, 3].map((n) => (
                            <tr key={n}>
                              <td colSpan="8" className="py-5 px-4">
                                <div className="shimmer h-5 w-full rounded-md" />
                              </td>
                            </tr>
                          ))
                        ) : jobs.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="py-8 px-4 text-center text-zinc-500 italic">
                              No printing orders placed yet.
                            </td>
                          </tr>
                        ) : (
                          jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-zinc-900/10 transition-colors">
                              <td className="py-4 px-4 text-zinc-500 font-mono">#{job.id}</td>
                              <td className="py-4 px-4 font-semibold text-white truncate max-w-[200px]">
                                {job.fileName}
                              </td>
                              <td className="py-4 px-4">{job.pageCount}</td>
                              <td className="py-4 px-4">{job.copies}</td>
                              <td className="py-4 px-4">
                                <div className="flex flex-wrap gap-1.5">
                                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                    {job.printType}
                                  </span>
                                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                    {job.layout}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4 font-bold text-violet-400">₹{job.price}</td>
                              <td className="py-4 px-4">
                                <span className={`status-badge ${job.status.toLowerCase()}`}>
                                  {job.status === "Pending" && <Clock className="w-3 h-3" />}
                                  {job.status === "Printing" && <Printer className="w-3 h-3 animate-spin" />}
                                  {job.status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
                                  {job.status}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right text-zinc-500 text-xs">
                                {new Date(job.createdAt).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================
              XEROX OPERATOR CONSOLE
              ======================================================== */}
          {role === "operator" && (
            <motion.div
              key="operator-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Stat 1 */}
                <div className="print-glass-card p-5 flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">
                      Pending
                    </span>
                    <span className="text-2xl font-black text-white">{stats.pending}</span>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="print-glass-card p-5 flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                    <Printer className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">
                      Printing
                    </span>
                    <span className="text-2xl font-black text-white">{stats.printing}</span>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="print-glass-card p-5 flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">
                      Completed
                    </span>
                    <span className="text-2xl font-black text-white">{stats.completed}</span>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="print-glass-card p-5 flex items-center gap-4">
                  <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 text-violet-400">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">
                      Revenue
                    </span>
                    <span className="text-2xl font-black text-violet-400">₹{stats.revenue}</span>
                  </div>
                </div>
              </div>

              {/* Filters & Control Board */}
              <div className="print-glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by student or file..."
                    className="print-input pl-10"
                  />
                  <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-zinc-500" />
                </div>

                {/* Status Filter Pills */}
                <div className="flex gap-2 flex-wrap">
                  {["All", "Pending", "Printing", "Completed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                        statusFilter === status
                          ? "bg-zinc-800 text-violet-400 border border-violet-500/25"
                          : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Print Queue Table */}
              <div className="print-glass-card p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 m-0">
                    <Printer className="text-violet-400 w-5 h-5" />
                    Operator Live Queue
                  </h3>
                  <span className="text-zinc-500 text-xs font-medium">
                    Showing {filteredJobs.length} active jobs
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800/80 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                        <th className="py-4 px-4">ID</th>
                        <th className="py-4 px-4">Student</th>
                        <th className="py-4 px-4">File Details</th>
                        <th className="py-4 px-4">Pages</th>
                        <th className="py-4 px-4">Copies</th>
                        <th className="py-4 px-4">Print Options</th>
                        <th className="py-4 px-4">Price</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40 text-zinc-300 text-sm">
                      {loadingHistory ? (
                        [1, 2, 3, 4].map((n) => (
                          <tr key={n}>
                            <td colSpan="9" className="py-5 px-4">
                              <div className="shimmer h-6 w-full rounded-md" />
                            </td>
                          </tr>
                        ))
                      ) : filteredJobs.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="py-12 px-4 text-center text-zinc-500 italic">
                            No print requests found matching the filters.
                          </td>
                        </tr>
                      ) : (
                        filteredJobs.map((job) => (
                          <tr key={job.id} className="hover:bg-zinc-900/10 transition-colors">
                            <td className="py-4 px-4 text-zinc-500 font-mono">#{job.id}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                                  {job.studentName.charAt(0)}
                                </div>
                                <span className="font-semibold text-white block">
                                  {job.studentName}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 max-w-[180px] truncate font-medium text-white">
                              {job.fileName}
                            </td>
                            <td className="py-4 px-4">{job.pageCount}</td>
                            <td className="py-4 px-4 font-medium">{job.copies}</td>
                            <td className="py-4 px-4">
                              <div className="flex gap-1">
                                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                  {job.printType}
                                </span>
                                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                  {job.layout}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-bold text-violet-400">₹{job.price}</td>
                            <td className="py-4 px-4">
                              <span className={`status-badge ${job.status.toLowerCase()}`}>
                                {job.status === "Pending" && <Clock className="w-3 h-3" />}
                                {job.status === "Printing" && <Printer className="w-3 h-3 animate-spin" />}
                                {job.status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
                                {job.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center gap-2">
                                {/* Action: View PDF */}
                                <button
                                  onClick={() => setActiveJobForView(job)}
                                  title="View PDF Document"
                                  className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors border-0 cursor-pointer"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Action: Update statuses */}
                                {job.status === "Pending" && (
                                  <button
                                    onClick={() => handleUpdateStatus(job.id, "Printing")}
                                    disabled={actionLoadingId === job.id}
                                    className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg transition-colors text-xs font-bold flex items-center gap-1.5 border-0 cursor-pointer"
                                  >
                                    <Play className="w-3 h-3" />
                                    Print
                                  </button>
                                )}

                                {job.status === "Printing" && (
                                  <button
                                    onClick={() => handleUpdateStatus(job.id, "Completed")}
                                    disabled={actionLoadingId === job.id}
                                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-colors text-xs font-bold flex items-center gap-1.5 border-0 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    Complete
                                  </button>
                                )}

                                {job.status === "Completed" && (
                                  <button
                                    onClick={() => handleUpdateStatus(job.id, "Pending")}
                                    disabled={actionLoadingId === job.id}
                                    className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors border-0 cursor-pointer"
                                    title="Reset order status"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================
          DOCUMENT VIEWER MODAL
          ======================================================== */}
      <AnimatePresence>
        {activeJobForView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
                <div>
                  <h4 className="text-white font-bold text-md m-0">
                    PDF Document Viewer
                  </h4>
                  <p className="text-zinc-500 text-xs mt-0.5 mb-0">
                    {activeJobForView.fileName} — Ordered by {activeJobForView.studentName}
                  </p>
                </div>
                <button
                  onClick={() => setActiveJobForView(null)}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors border-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content / Preview Area */}
              <div className="p-6 bg-zinc-900/20 overflow-y-auto flex-1 flex flex-col items-center justify-center min-h-[300px]">
                {/* Document Information panel */}
                <div className="print-glass-card p-6 w-full max-w-md text-center mb-6">
                  <div className="p-4 bg-violet-600/10 rounded-2xl border border-violet-500/20 w-fit mx-auto mb-4">
                    <FileText className="w-12 h-12 text-violet-400" />
                  </div>
                  <h5 className="text-white text-lg font-bold truncate max-w-full mb-1">
                    {activeJobForView.fileName}
                  </h5>
                  <p className="text-zinc-500 text-xs font-mono break-all mb-4">
                    Stored Location: {activeJobForView.fileUrl}
                  </p>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-zinc-800 py-4 my-4 text-left">
                    <div>
                      <span className="text-zinc-500 text-xs block">Page Count</span>
                      <span className="text-white font-bold text-sm">
                        {activeJobForView.pageCount} Pages
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs block">Copies</span>
                      <span className="text-white font-bold text-sm">
                        {activeJobForView.copies} Copies
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs block">Print Options</span>
                      <span className="text-white font-bold text-sm">
                        {activeJobForView.printType} • {activeJobForView.layout}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs block">Estimated Fee</span>
                      <span className="text-violet-400 font-extrabold text-sm">
                        ₹{activeJobForView.price}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`${API_BASE}${activeJobForView.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer no-underline"
                  >
                    Open Document in New Tab
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="w-full border border-zinc-800 rounded-xl p-4 bg-zinc-950/80 text-zinc-500 text-xs text-center flex flex-col items-center justify-center">
                  <div className="flex gap-1.5 mb-2">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                    ))}
                  </div>
                  <span>This system renders PDF file previews natively inside the browser via the new tab command.</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3">
                <button
                  onClick={() => setActiveJobForView(null)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-xl font-bold text-xs border-0 cursor-pointer"
                >
                  Close Preview
                </button>

                {activeJobForView.status === "Pending" && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(activeJobForView.id, "Printing");
                      setActiveJobForView(null);
                    }}
                    className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 border-0 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Send to Printer
                  </button>
                )}

                {activeJobForView.status === "Printing" && (
                  <button
                    onClick={() => {
                      handleUpdateStatus(activeJobForView.id, "Completed");
                      setActiveJobForView(null);
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 border-0 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Complete Job
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
