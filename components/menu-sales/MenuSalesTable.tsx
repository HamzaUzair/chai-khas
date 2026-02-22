"use client";

import React from "react";
import {
  ArrowUpDown,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
} from "lucide-react";
import type { ItemPerformance, MSSortField, MSSortDir } from "@/types/menuSales";

/* ── category colour map ── */
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
        <TrendingUp size={13} />
        +{pct}%
      </span>
    );
  }
  if (pct < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-red-500">
        <TrendingDown size={13} />
        {pct}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-gray-400">
      <Minus size={13} />
      0%
    </span>
  );
}

interface MenuSalesTableProps {
  rows: ItemPerformance[];
  loading: boolean;
  sortField: MSSortField;
  sortDir: MSSortDir;
  onSort: (f: MSSortField) => void;
  onView: (row: ItemPerformance) => void;
  branchFilter: number | "all";
}

const MenuSalesTable: React.FC<MenuSalesTableProps> = ({
  rows,
  loading,
  sortField,
  sortDir,
  onSort,
  onView,
  branchFilter,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 flex flex-col items-center gap-3">
        <Loader2 size={28} className="text-[#ff5a1f] animate-spin" />
        <p className="text-sm text-gray-400">Calculating item performance…</p>
      </div>
    );
  }

  const sortIcon = (field: MSSortField) => (
    <button
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-0.5 cursor-pointer hover:text-[#ff5a1f] transition-colors"
      title={`Sort by ${field}`}
    >
      <ArrowUpDown
        size={13}
        className={sortField === field ? "text-[#ff5a1f]" : "text-gray-300"}
      />
      {sortField === field && (
        <span className="text-[9px] font-bold text-[#ff5a1f]">
          {sortDir === "asc" ? "↑" : "↓"}
        </span>
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[780px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50/90 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Item
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <span className="inline-flex items-center gap-1">
                  Sold Qty {sortIcon("soldQty")}
                </span>
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <span className="inline-flex items-center gap-1">
                  Revenue {sortIcon("revenue")}
                </span>
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Branch
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Trend
              </th>
              <th className="text-center px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((r, idx) => {
              // branch display
              let branchLabel = "—";
              if (branchFilter !== "all" && r.branchBreakdown.length > 0) {
                branchLabel = r.branchBreakdown[0].branchName;
              } else if (r.branchBreakdown.length === 1) {
                branchLabel = r.branchBreakdown[0].branchName;
              } else if (r.branchBreakdown.length > 1) {
                branchLabel = `${r.branchBreakdown[0].branchName} +${r.branchBreakdown.length - 1}`;
              }

              return (
                <tr
                  key={r.itemId}
                  className={`hover:bg-[#ff5a1f]/[0.02] transition-colors ${idx % 2 === 1 ? "bg-gray-50/40" : ""}`}
                >
                  {/* Item */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-xs">
                        {r.itemName}
                      </span>
                      {!r.isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${CAT_BADGE[r.category] ?? "bg-gray-50 text-gray-600"}`}
                    >
                      {r.category}
                    </span>
                  </td>

                  {/* Sold Qty */}
                  <td className="px-5 py-3.5 whitespace-nowrap font-bold text-gray-800 text-xs">
                    {r.soldQty.toLocaleString("en-PK")}
                  </td>

                  {/* Revenue */}
                  <td className="px-5 py-3.5 whitespace-nowrap font-bold text-gray-800 text-xs">
                    {fmtPkr(r.revenue)}
                  </td>

                  {/* Branch */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600">
                    {branchLabel}
                  </td>

                  {/* Trend */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <TrendBadge pct={r.trendPct} />
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <button
                      onClick={() => onView(r)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ff5a1f]/30 text-[#ff5a1f] text-xs font-semibold hover:bg-[#ff5a1f]/5 transition-colors cursor-pointer"
                    >
                      <Eye size={13} />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuSalesTable;
