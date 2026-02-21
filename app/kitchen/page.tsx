"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { ChefHat, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const statCards = [
  { label: "Pending", value: "0", icon: <Clock size={22} />, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "In Progress", value: "0", icon: <AlertCircle size={22} />, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Completed", value: "0", icon: <CheckCircle2 size={22} />, color: "text-green-600", bg: "bg-green-50" },
];

export default function KitchenPage() {
  const authorized = useAuth();

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Kitchen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Kitchen Display</h2>
        <p className="text-sm text-gray-500 mt-1">Monitor and manage active kitchen orders</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#ff5a1f]/10 flex items-center justify-center mb-4">
            <ChefHat size={32} className="text-[#ff5a1f]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Active Orders</h3>
          <p className="text-sm text-gray-400 max-w-md">
            Kitchen orders will appear here in real-time when customers place new orders.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
