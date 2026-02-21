"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { CalendarCheck, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";

const dayEndStats = [
  { label: "Total Sales", value: "PKR 0", icon: <DollarSign size={22} />, color: "text-green-600", bg: "bg-green-50" },
  { label: "Orders Completed", value: "0", icon: <ShoppingCart size={22} />, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Net Revenue", value: "PKR 0", icon: <TrendingUp size={22} />, color: "text-[#ff5a1f]", bg: "bg-[#ff5a1f]/10" },
];

export default function DayEndPage() {
  const authorized = useAuth();

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Day End">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Day End Summary</h2>
        <p className="text-sm text-gray-500 mt-1">Review daily performance and close the business day</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {dayEndStats.map((s) => (
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
            <CalendarCheck size={32} className="text-[#ff5a1f]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Day End Data</h3>
          <p className="text-sm text-gray-400 max-w-md mb-6">
            Day end summaries will be generated automatically based on the day&apos;s transactions.
          </p>
          <button className="inline-flex items-center gap-2 bg-[#ff5a1f] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#e04e18] transition-colors cursor-pointer">
            <CalendarCheck size={18} />
            Close Day
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
