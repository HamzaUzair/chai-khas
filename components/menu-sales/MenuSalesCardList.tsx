"use client";

import React from "react";
import {
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Package,
  DollarSign,
  Building2,
} from "lucide-react";
import type { ItemPerformance } from "@/types/menuSales";

const CAT_BADGE: Record<string, string> = {
  BBQ: "bg-red-50 text-red-700",
  Karahi: "bg-orange-50 text-orange-700",
  Burgers: "bg-amber-50 text-amber-700",
  Pizza: "bg-yellow-50 text-yellow-700",
  Drinks: "bg-sky-50 text-sky-700",
  Desserts: "bg-pink-50 text-pink-700",
  Rice: "bg-emerald-50 text-emerald-700",
  Sandwiches: "bg-teal-50 text-teal-700",
  Starters: "bg-violet-50 text-violet-700",
  Soups: "bg-blue-50 text-blue-700",
};

function fmtPkr(n: number) {
  return "PKR " + n.toLocaleString("en-PK");
}

function TrendBadge({ pct }: { pct: number }) {
  if (pct > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-green-600">
        <TrendingUp size={12} /> +{pct}%
      </span>
    );
  }
  if (pct < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-red-500">
        <TrendingDown size={12} /> {pct}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-gray-400">
      <Minus size={12} /> 0%
    </span>
  );
}

interface MenuSalesCardListProps {
  rows: ItemPerformance[];
  onView: (row: ItemPerformance) => void;
}

const MenuSalesCardList: React.FC<MenuSalesCardListProps> = ({ rows, onView }) => (
  <div className="space-y-3">
    {rows.map((r) => (
      <div
        key={r.itemId}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
      >
        {/* Top */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-sm text-gray-800 truncate">{r.itemName}</span>
            {!r.isActive && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-medium shrink-0">
                Inactive
              </span>
            )}
          </div>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${CAT_BADGE[r.category] ?? "bg-gray-50 text-gray-600"}`}
          >
            {r.category}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Package size={12} className="text-orange-400" />
            <span className="font-bold text-gray-800">{r.soldQty}</span> sold
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <DollarSign size={12} className="text-green-500" />
            <span className="font-bold text-gray-800">{fmtPkr(r.revenue)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <TrendBadge pct={r.trendPct} />
          </div>
        </div>

        {/* Branch + action */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <Building2 size={11} />
            {r.branchBreakdown.length > 1
              ? `${r.branchBreakdown[0].branchName} +${r.branchBreakdown.length - 1}`
              : r.branchBreakdown[0]?.branchName ?? "—"}
          </span>
          <button
            onClick={() => onView(r)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ff5a1f]/30 text-[#ff5a1f] text-xs font-semibold hover:bg-[#ff5a1f]/5 transition-colors cursor-pointer"
          >
            <Eye size={13} />
            View
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default MenuSalesCardList;
