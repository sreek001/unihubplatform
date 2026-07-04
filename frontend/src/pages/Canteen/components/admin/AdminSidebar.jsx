import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, ToggleRight, ToggleLeft } from 'lucide-react';

export default function AdminSidebar({ menuItems, toggleStock }) {
  return (
    <div className="hidden lg:flex flex-col bg-zinc-900/40 border-l border-zinc-800/80 p-6 backdrop-blur-xl h-full">
      <div className="mb-8">
        <h2 className="text-xl font-black flex items-center gap-3 text-white">
          <LayoutGrid className="text-indigo-500" size={24} /> 
          Menu Stock
        </h2>
        <p className="text-zinc-500 text-sm mt-1 font-medium">Toggle availability live.</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {menuItems.map(item => (
          <div 
            key={item.id} 
            className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
              item.stock 
                ? 'bg-zinc-950/50 border-zinc-800/80' 
                : 'bg-red-950/20 border-red-900/30'
            }`}
          >
            <span className={`font-bold text-sm ${item.stock ? 'text-zinc-300' : 'text-red-400'}`}>
              {item.name}
            </span>
            <button 
              onClick={() => toggleStock(item.id)}
              className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
            >
              {item.stock ? (
                <ToggleRight size={32} className="text-emerald-500" />
              ) : (
                <ToggleLeft size={32} className="text-red-500/50" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}