"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Package, Plus, Search, AlertTriangle, CheckCircle2, Archive } from "lucide-react";

const inventoryStats = [
  { label: "Total Items", value: "0", icon: <Package size={22} />, color: "text-[#ff5a1f]", bg: "bg-[#ff5a1f]/10" },
  { label: "In Stock", value: "0", icon: <CheckCircle2 size={22} />, color: "text-green-600", bg: "bg-green-50" },
  { label: "Low Stock", value: "0", icon: <AlertTriangle size={22} />, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Out of Stock", value: "0", icon: <Archive size={22} />, color: "text-red-600", bg: "bg-red-50" },
];

export default function InventoryPage() {
  const authorized = useAuth();

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Inventory">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
          <p className="text-sm text-gray-500 mt-1">Track stock levels and manage inventory items</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#ff5a1f] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#e04e18] transition-colors cursor-pointer">
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {inventoryStats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0 ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</p>
              <p className="text-lg font-bold text-gray-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Package size={36} className="text-gray-300" />
                    <span className="text-sm font-medium">No inventory items</span>
                    <span className="text-xs text-gray-300">Add items to start tracking your inventory</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
