"use client";

import React from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Star,
  Building2,
} from "lucide-react";
import type { KpiData } from "@/lib/analyticsService";

interface Props {
  data: KpiData | null;
  loading: boolean;
}

const AnalyticsKpiCards: React.FC<Props> = ({ data, loading }) => {
  const cards = [
    {
      label: "Total Sales",
      value: data ? `PKR ${data.totalSales.toLocaleString()}` : "—",
      icon: <DollarSign size={20} />,
      bg: "bg-[#ff5a1f]/10",
      color: "text-[#ff5a1f]",
      tooltip: "Sum of all order totals in selected period",
    },
    {
      label: "Total Orders",
      value: data ? data.totalOrders.toLocaleString() : "—",
      icon: <ShoppingCart size={20} />,
      bg: "bg-blue-50",
      color: "text-blue-600",
      tooltip: "Number of orders placed in selected period",
    },
    {
      label: "Avg Order Value",
      value: data ? `PKR ${data.avgOrderValue.toLocaleString()}` : "—",
      icon: <TrendingUp size={20} />,
      bg: "bg-green-50",
      color: "text-green-600",
      tooltip: "Total Sales ÷ Total Orders",
    },
    {
      label: "Best Selling Item",
      value: data ? data.bestSellingItem : "—",
      icon: <Star size={20} />,
      bg: "bg-amber-50",
      color: "text-amber-600",
      tooltip: "Most sold menu item by quantity",
    },
    {
      label: "Active Branches",
      value: data ? data.activeBranches : "—",
      icon: <Building2 size={20} />,
      bg: "bg-purple-50",
      color: "text-purple-600",
      tooltip: "Branches with status Active",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 group relative"
        >
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-10 w-10 bg-gray-100 rounded-lg" />
              <div className="h-5 w-20 bg-gray-100 rounded" />
              <div className="h-3 w-16 bg-gray-50 rounded" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0 ${c.color}`}
              >
                {c.icon}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-gray-800 truncate">
                  {c.value}
                </p>
                <p className="text-[11px] text-gray-400 font-medium">
                  {c.label}
                </p>
              </div>
            </div>
          )}
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-gray-800 text-white text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 shadow-lg">
            {c.tooltip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsKpiCards;
