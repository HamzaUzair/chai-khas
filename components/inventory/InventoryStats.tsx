"use client";

import React from "react";
import {
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import type { InventoryItem, ActivityEntry } from "@/types/inventory";

function fmtPkr(n: number) {
  return "PKR " + n.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Props {
  items: InventoryItem[];
  filtered: InventoryItem[];
  log: ActivityEntry[];
}

const InventoryStats: React.FC<Props> = ({ items, filtered, log }) => {
  const total = filtered.length;
  const lowStock = filtered.filter((i) => i.inStock > 0 && i.inStock <= i.minStock).length;
  const outOfStock = filtered.filter((i) => i.inStock === 0).length;
  const totalValue = filtered.reduce((s, i) => s + i.inStock * i.costPerUnit, 0);

  // Today usage from log
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayUsage = log
    .filter((e) => (e.type === "Usage" || e.type === "Order Deduction") && e.timestamp >= todayStart.getTime())
    .reduce((s, e) => s + e.qty, 0);

  const cards = [
    { label: "Total Items", value: String(total), icon: <Package size={22} />, bg: "bg-orange-50", color: "text-[#ff5a1f]" },
    { label: "Low Stock Items", value: String(lowStock), icon: <AlertTriangle size={22} />, bg: "bg-amber-50", color: "text-amber-600" },
    { label: "Out of Stock", value: String(outOfStock), icon: <XCircle size={22} />, bg: "bg-red-50", color: "text-red-600" },
    { label: "Total Stock Value", value: fmtPkr(totalValue), icon: <DollarSign size={22} />, bg: "bg-green-50", color: "text-green-600" },
    { label: "Today Usage", value: `${todayUsage.toFixed(1)} units`, icon: <TrendingDown size={22} />, bg: "bg-blue-50", color: "text-blue-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className={`w-11 h-11 rounded-full ${c.bg} ${c.color} flex items-center justify-center shrink-0`}>
            {c.icon}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">{c.label}</p>
            <p className="text-base font-bold text-gray-800 truncate">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryStats;
