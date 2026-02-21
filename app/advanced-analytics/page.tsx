"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, BarChart3, PieChart, Activity } from "lucide-react";

export default function AdvancedAnalyticsPage() {
  const authorized = useAuth();

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Advanced Analytics">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Advanced Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">In-depth business insights and performance metrics</p>
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Revenue Trend</h3>
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <TrendingUp size={40} className="text-gray-300 mb-3" />
            <span className="text-sm">No revenue data yet</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Weekly Performance</h3>
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <BarChart3 size={40} className="text-gray-300 mb-3" />
            <span className="text-sm">No performance data yet</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Peak Hours</h3>
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Activity size={40} className="text-gray-300 mb-3" />
            <span className="text-sm">No peak hour data yet</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Category Breakdown</h3>
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <PieChart size={40} className="text-gray-300 mb-3" />
            <span className="text-sm">No category data yet</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
