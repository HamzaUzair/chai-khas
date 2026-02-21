"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, DollarSign, TrendingUp, ShoppingCart, Download } from "lucide-react";

const kpiCards = [
  { label: "Total Revenue", value: "PKR 0", icon: <DollarSign size={22} />, color: "text-green-600", bg: "bg-green-50" },
  { label: "Total Orders", value: "0", icon: <ShoppingCart size={22} />, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Avg. Order Value", value: "PKR 0", icon: <TrendingUp size={22} />, color: "text-purple-600", bg: "bg-purple-50" },
];

export default function SalesReportPage() {
  const authorized = useAuth();

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Sales Report">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales Report</h2>
          <p className="text-sm text-gray-500 mt-1">Detailed sales analytics and reporting</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {kpiCards.map((s) => (
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

      {/* Chart Placeholder */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 mb-6">
        <h3 className="text-base font-semibold text-gray-800 mb-6">Revenue Overview</h3>
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <BarChart3 size={48} className="text-gray-300 mb-3" />
          <span className="text-sm font-medium">No sales data available</span>
          <span className="text-xs text-gray-300 mt-1">Charts will appear once sales data is recorded</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
