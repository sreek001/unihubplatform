import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChefHat, CheckCircle2, ChevronRight } from 'lucide-react';

const COLUMNS = [
  { id: 'received', label: 'Incoming', icon: Clock, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  { id: 'preparing', label: 'Preparing', icon: ChefHat, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { id: 'ready', label: 'Ready', icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' }
];

export default function AdminKanban({ orders, advanceStatus }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">
      {COLUMNS.map(col => {
        const columnOrders = orders.filter(o => o.status === col.id);
        const Icon = col.icon;

        return (
          <div key={col.id} className="flex flex-col h-full bg-zinc-900/20 rounded-3xl border border-zinc-800/50 overflow-hidden">
            {/* Column Header */}
            <div className={`p-4 border-b border-zinc-800/50 flex items-center justify-between ${col.bg}`}>
              <div className="flex items-center gap-2">
                <Icon size={18} className={col.color} />
                <h3 className={`font-black tracking-wide ${col.color}`}>{col.label}</h3>
              </div>
              <span className="bg-zinc-950 px-3 py-1 rounded-full text-xs font-bold text-zinc-400">
                {columnOrders.length}
              </span>
            </div>

            {/* Column Body (Cards) */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
              <AnimatePresence>
                {columnOrders.map(order => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    key={order.id}
                    className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group"
                  >
                    {/* Accent line on the left */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${col.bg.replace('/10', '')}`} />

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black text-lg text-white">{order.id}</h4>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">{order.time}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">Queue</span>
                        <span className="font-black text-indigo-400 text-lg">#{order.queue}</span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-sm font-medium text-zinc-300 flex gap-2">
                          <span className="text-zinc-600">{item.quantity}x</span> {item.name}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => advanceStatus(order.id, order.status)}
                      className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all active:scale-95 ${
                        col.id === 'received' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' :
                        col.id === 'preparing' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' :
                        'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      {col.id === 'received' ? 'Start Preparing' :
                       col.id === 'preparing' ? 'Mark Ready' :
                       'Clear Ticket'}
                      {col.id !== 'ready' && <ChevronRight size={16} />}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}