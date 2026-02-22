"use client";

import React from "react";
import { ArrowUpDown, Loader2 } from "lucide-react";
import type { DailySummary, SortField, SortDir } from "@/types/salesReport";

function fmtPkr(n: number) {
  return "PKR " + n.toLocaleString("en-PK");
}

interface DailySummaryTableProps {
  rows: DailySummary[];
  loading: boolean;
  sortField: SortField | null;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
}

const DailySummaryTable: React.FC<DailySummaryTableProps> = ({
  rows,
  loading,
  sortField,
  sortDir,
  onSort,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 flex flex-col items-center gap-3">
        <Loader2 size={28} className="text-[#ff5a1f] animate-spin" />
        <p className="text-sm text-gray-400">Calculating daily summaries…</p>
      </div>
    );
  }

  const sortIcon = (field: SortField) => (
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

  const cols = [
    { key: "date", label: "Date", sortable: true },
    { key: "orders", label: "Orders" },
    { key: "gross", label: "Gross Sales" },
    { key: "discounts", label: "Discounts" },
    { key: "refunds", label: "Refunds" },
    { key: "tax", label: "Tax" },
    { key: "net", label: "Net Revenue", sortable: true },
    { key: "cash", label: "Cash" },
    { key: "card", label: "Card" },
    { key: "online", label: "Online" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[920px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50/90 border-b border-gray-100">
              {cols.map((c) => (
                <th
                  key={c.key}
                  className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {c.sortable && sortIcon(c.key as SortField)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((r, idx) => (
              <tr
                key={r.date}
                className={`hover:bg-[#ff5a1f]/[0.02] transition-colors ${idx % 2 === 1 ? "bg-gray-50/40" : ""}`}
              >
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-800 text-xs">
                  {r.dateLabel}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600 text-center">
                  {r.orders}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-gray-800">
                  {fmtPkr(r.gross)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-red-500">
                  {r.discounts > 0 ? `-${fmtPkr(r.discounts)}` : "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-red-500">
                  {r.refunds > 0 ? `-${fmtPkr(r.refunds)}` : "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                  {fmtPkr(r.tax)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-green-700">
                  {fmtPkr(r.net)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                  {fmtPkr(r.cash)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                  {fmtPkr(r.card)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                  {fmtPkr(r.online)}
                </td>
              </tr>
            ))}

            {/* Totals row */}
            {rows.length > 0 && (
              <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                <td className="px-4 py-3 text-xs text-gray-800">TOTAL</td>
                <td className="px-4 py-3 text-xs text-gray-800 text-center">
                  {rows.reduce((s, r) => s + r.orders, 0)}
                </td>
                <td className="px-4 py-3 text-xs text-gray-800">
                  {fmtPkr(rows.reduce((s, r) => s + r.gross, 0))}
                </td>
                <td className="px-4 py-3 text-xs text-red-600">
                  -{fmtPkr(rows.reduce((s, r) => s + r.discounts, 0))}
                </td>
                <td className="px-4 py-3 text-xs text-red-600">
                  -{fmtPkr(rows.reduce((s, r) => s + r.refunds, 0))}
                </td>
                <td className="px-4 py-3 text-xs text-gray-800">
                  {fmtPkr(rows.reduce((s, r) => s + r.tax, 0))}
                </td>
                <td className="px-4 py-3 text-xs text-green-700">
                  {fmtPkr(rows.reduce((s, r) => s + r.net, 0))}
                </td>
                <td className="px-4 py-3 text-xs text-gray-800">
                  {fmtPkr(rows.reduce((s, r) => s + r.cash, 0))}
                </td>
                <td className="px-4 py-3 text-xs text-gray-800">
                  {fmtPkr(rows.reduce((s, r) => s + r.card, 0))}
                </td>
                <td className="px-4 py-3 text-xs text-gray-800">
                  {fmtPkr(rows.reduce((s, r) => s + r.online, 0))}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailySummaryTable;
