import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat } from 'lucide-react';
import './CanteenDashboard.css';

import AdminKanban from './components/admin/AdminKanban';
import AdminSidebar from './components/admin/AdminSidebar';

// ─── MOCK INITIAL STATE ───
const INITIAL_MENU = [
  { id: 'm1', name: 'Chicken Biryani', stock: true },
  { id: 'm2', name: 'Veg Meals', stock: false },
  { id: 's1', name: 'Hot Samosa', stock: true },
  { id: 'd1', name: 'Cold Coffee', stock: true },
];

const INITIAL_ORDERS = [
  { id: 'ORD-8432', queue: 1, status: 'preparing', time: '10:42 AM', items: [{ name: 'Chicken Biryani', quantity: 2 }] },
  { id: 'ORD-8433', queue: 2, status: 'received', time: '10:45 AM', items: [{ name: 'Cold Coffee', quantity: 1 }, { name: 'Hot Samosa', quantity: 2 }] },
  { id: 'ORD-8434', queue: 3, status: 'ready', time: '10:30 AM', items: [{ name: 'Veg Meals', quantity: 1 }] },
];

export default function AdminDashboard() {
  const [menuItems, setMenuItems] = useState(INITIAL_MENU);
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // ─── LOGIC ───
  const toggleStock = (id) => {
    setMenuItems(prev => prev.map(item => 
      item.id === id ? { ...item, stock: !item.stock } : item
    ));
  };

  const advanceStatus = (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'received' ? 'preparing' : currentStatus === 'preparing' ? 'ready' : 'completed';
    
    if (nextStatus === 'completed') {
      setOrders(prev => prev.filter(o => o.id !== orderId)); // Remove from board
    } else {
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: nextStatus } : o
      ));
    }
  };

  return (
    <div className="h-screen bg-[#09090b] text-zinc-100 flex font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* MAIN KANBAN AREA */}
      <div className="flex-1 flex flex-col p-6 md:p-8 h-full">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-800"
        >
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <ChefHat className="text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" size={32} />
              Kitchen Display System
            </h1>
            <p className="text-zinc-500 text-sm mt-1 font-medium">{orders.length} Active Tickets in Queue</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-sm tracking-wide">SYSTEM LIVE</span>
          </div>
        </motion.header>

        <div className="flex-1 overflow-hidden">
          <AdminKanban orders={orders} advanceStatus={advanceStatus} />
        </div>
      </div>

      {/* RIGHT SIDEBAR: MENU TOGGLES */}
      <div className="w-80 border-l border-zinc-800/80 bg-zinc-950/30">
        <AdminSidebar menuItems={menuItems} toggleStock={toggleStock} />
      </div>

    </div>
  );
}