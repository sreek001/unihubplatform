import React, { useState, useEffect } from 'react';
import { FolderHeart, BookOpen, Inbox, Check, CheckCircle2, Clock, Trash2, Mail, Loader2 } from 'lucide-react';
import { useActiveUser } from './UserContext';

export default function Inventory() {
  const { activeUser } = useActiveUser();
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'requests'
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);

  // Fetch student's books and requests
  const loadInventoryData = async () => {
    if (!activeUser) return;
    setLoading(true);
    try {
      // 1. Fetch all textbooks
      const booksRes = await fetch('http://localhost:4000/api/academics/textbooks');
      if (booksRes.ok) {
        const allBooks = await booksRes.json();
        // Filter books owned by this user
        setBooks(allBooks.filter((b) => b.ownerId === activeUser.id));
      }

      // 2. Fetch handover requests for this user
      const reqRes = await fetch(`http://localhost:4000/api/academics/handover?studentId=${activeUser.id}`);
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData);
      }
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, [activeUser]);

  // Handle delete book listing
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`http://localhost:4000/api/academics/textbooks/${bookId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBooks(prev => prev.filter(b => b.id !== bookId));
      }
    } catch (err) {
      console.error('Failed to delete textbook', err);
      // Fallback local deletion
      setBooks(prev => prev.filter(b => b.id !== bookId));
    }
  };

  // Handle update request status (Accept / Complete)
  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:4000/api/academics/handover/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadInventoryData();
      }
    } catch (err) {
      console.error('Failed to update request status', err);
    }
  };

  if (!activeUser) {
    return (
      <div className="text-center py-20 border border-dashed border-blue-900/[0.12] rounded-3xl bg-white/40">
        <FolderHeart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-500">No active profile</h3>
        <p className="text-xs text-slate-400 mt-1">Please select a student profile at the bottom of the sidebar first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-blue-900/[0.05]">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <FolderHeart className="w-6 h-6 text-blue-600" /> My Inventory
        </h1>
        <p className="text-sm text-slate-500 font-medium">Manage your active textbook listings and track handover requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-blue-900/[0.05] gap-2">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-5 py-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'listings'
              ? 'border-blue-600 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-blue-700'
          }`}
        >
          My Listings ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-blue-700'
          }`}
        >
          Handover Requests ({requests.incoming.length + requests.outgoing.length})
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading your inventory...</p>
        </div>
      ) : activeTab === 'listings' ? (
        /* LISTINGS TAB */
        books.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-blue-900/[0.12] rounded-3xl bg-white/40">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-500">No active listings</h3>
            <p className="text-xs text-slate-400 mt-1">List drawing notebooks or syllabus books in the Marketplace to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white/85 backdrop-blur-md border border-blue-900/[0.04] rounded-2xl p-5 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {book.type || 'Textbook'}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        book.status === 'Available'
                          ? 'bg-teal-50 text-teal-700 border-teal-200/45'
                          : book.status === 'Requested'
                          ? 'bg-amber-50 text-amber-700 border-amber-200/45'
                          : book.status === 'Accepted'
                          ? 'bg-blue-50 text-blue-700 border-blue-200/45'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {book.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{book.title}</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">by {book.author}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Price</span>
                    <span className="text-sm font-bold text-blue-900">
                      {book.price === 0 ? 'FREE' : `₹${book.price}`}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="p-2 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* REQUESTS TAB */
        <div className="space-y-8">
          {/* Incoming Requests */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Incoming Requests (For your items)</h3>
            {requests.incoming.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-white/40 p-4 rounded-xl border border-blue-900/[0.05]">
                No incoming requests yet. When students ask for your listed books, they will show up here.
              </p>
            ) : (
              <div className="space-y-3">
                {requests.incoming.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/85 border border-blue-900/[0.04] rounded-2xl gap-4 shadow-sm"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{req.textbookTitle}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">Requested by: <span className="text-slate-600 font-semibold">{req.buyerName}</span></p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {req.status === 'Pending' ? (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'Accepted')}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Accept Request
                        </button>
                      ) : req.status === 'Accepted' ? (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'Completed')}
                          className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-teal-500/10"
                        >
                          <Check className="w-3.5 h-3.5" /> Confirm Handover
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate-500 bg-teal-50 border border-teal-200/50 px-3 py-1.5 rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Outgoing Requests (Your requests)</h3>
            {requests.outgoing.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-white/40 p-4 rounded-xl border border-blue-900/[0.05]">
                You have not requested any books yet.
              </p>
            ) : (
              <div className="space-y-3">
                {requests.outgoing.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/85 border border-blue-900/[0.04] rounded-2xl gap-4 shadow-sm"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{req.textbookTitle}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">Owner: <span className="text-slate-600 font-semibold">{req.ownerName}</span></p>
                    </div>

                    <div className="flex items-center gap-3">
                      {req.status === 'Pending' ? (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/40 px-3 py-1.5 rounded-xl flex items-center gap-1 animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> Pending Approval
                        </span>
                      ) : req.status === 'Accepted' ? (
                        <div className="flex flex-col items-end gap-1 text-right bg-white p-3.5 rounded-xl border border-blue-900/[0.08] shadow-sm">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/40 px-3 py-1 rounded-xl flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Request Accepted
                          </span>
                          <div className="text-[11px] text-slate-500 mt-2 space-y-1 font-medium">
                            <p className="font-semibold text-slate-700">Owner Contact Info:</p>
                            <p>Email: <span className="text-blue-600 font-bold">{req.ownerEmail}</span></p>
                            <p>Phone: <span className="text-blue-600 font-bold">{req.ownerPhone}</span></p>
                            <p className="text-[10px] text-slate-400 italic mt-1.5">
                              {req.textbookPrice === 0 
                                ? 'Meet the owner on campus to collect your free item!'
                                : `Meet the owner on campus to pay ₹${req.textbookPrice} in person.`
                              }
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Received
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}