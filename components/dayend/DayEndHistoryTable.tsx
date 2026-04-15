"use client";

import React from "react";
import { Search, Building2, Loader2 } from "lucide-react";
import type { DayEndRecord } from "@/types/dayend";
import { formatPKR } from "@/lib/dayendData";

interface DayEndHistoryTableProps {
  records: DayEndRecord[];
  loading: boolean;
  onView: (record: DayEndRecord) => void;
}

const DayEndHistoryTable: React.FC<DayEndHistoryTableProps> = ({
  records,
  loading,
  onView,
}) => {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatDateTime = (d?: string) =>
    d ? new Date(d).toLocaleString("en-PK", { hour: "2-digit", minute: "2-digit" }) : "—";

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-[#ff5a1f] animate-spin" />
          <p className="text-sm text-gray-400">Loading history…</p>
        </div>
      </div>
    );
  }

  /* ── Empty state ── */
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Search size={28} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 max-w-xs">
            No day-end records found for the selected filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Previous Day Ends
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              {["Date", "Branch", "Total Sales", "Expenses", "Net Revenue", "Status", "Closed"].map(
                (col) => (
                  <th
                    key={col}
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                )
              )}
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">
                  {formatDate(r.date)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <Building2 size={12} className="text-gray-400" />
                    {r.branchName}
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-gray-600">
                  {formatPKR(r.totalSales)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-amber-600">
                  {formatPKR(r.totalExpenses)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-[#ff5a1f]">
                  {formatPKR(r.netRevenue)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      r.status === "open"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {r.status === "open" ? "● Open" : "○ Closed"}
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-500">
                  {r.closedBy ?? "—"}
                  {r.closedAt && ` • ${formatDateTime(r.closedAt)}`}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-right">
                  <button
                    onClick={() => onView(r)}
                    className="text-xs font-semibold text-[#ff5a1f] hover:text-[#e04e18] hover:bg-orange-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DayEndHistoryTable;
