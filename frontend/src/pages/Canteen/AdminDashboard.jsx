import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import "./CanteenDashboard.css";

import AdminKanban from "./components/admin/AdminKanban";
import AdminSidebar from "./components/admin/AdminSidebar";

export default function AdminDashboard() {

  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {

    fetchMenu();
    fetchOrders();

    const interval = setInterval(() => {

      fetchMenu();
      fetchOrders();

    }, 3000);

    return () => clearInterval(interval);

  }, []);

  // ===============================
  // FETCH MENU
  // ===============================

  const fetchMenu = async () => {

    try {

      const response = await fetch(
        "http://localhost:4000/api/canteen/menu"
      );

      const data = await response.json();

      if (data.success) {

        const menu = data.menu.map(item => ({

          id: item.id,

          name: item.name,

          stock: item.stock > 0,

          stockCount: item.stock

        }));

        setMenuItems(menu);

      }

    } catch (err) {

      console.error(err);

    }

  };

  // ===============================
  // FETCH ORDERS
  // ===============================

  const fetchOrders = async () => {

    try {

      const response = await fetch(
        "http://localhost:4000/api/canteen/orders"
      );

      const data = await response.json();

      if (data.success) {

        const formattedOrders = data.orders.map(order => ({

          id: order.id,

          queue: order.token_number,

          status:

            order.status === "PENDING"
              ? "received"
              : order.status === "PREPARING"
              ? "preparing"
              : order.status === "READY"
              ? "ready"
              : "completed",

          time: new Date(order.created_at).toLocaleTimeString([], {

            hour: "2-digit",

            minute: "2-digit"

          }),

          items: order.items

        }));

        setOrders(formattedOrders);

      }

    } catch (err) {

      console.error(err);

    }

  };
    // ===============================
  // UPDATE ORDER STATUS
  // ===============================

  const advanceStatus = async (orderId, currentStatus) => {

    let nextStatus;

    if (currentStatus === "received") {

      nextStatus = "PREPARING";

    } else if (currentStatus === "preparing") {

      nextStatus = "READY";

    } else {

      nextStatus = "DELIVERED";

    }

    try {

      const response = await fetch(

        `http://localhost:4000/api/canteen/order/${orderId}/status`,

        {

          method: "PATCH",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            status: nextStatus
          })

        }

      );

      const data = await response.json();

      if (data.success) {

        fetchOrders();

      } else {

        alert(data.message);

      }

    } catch (err) {

      console.error(err);

    }

  };

  // ===============================
  // TOGGLE STOCK
  // ===============================

  const toggleStock = (item) => {

    console.log("Selected Menu Item:", item);

    // Stock popup will be connected in Part 3

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
  <AdminSidebar
    menuItems={menuItems}
    toggleStock={toggleStock}
  />
</div>

    </div>
  );
}