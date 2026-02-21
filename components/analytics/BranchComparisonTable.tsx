"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Building2,
  ArrowUpDown,
  GitCompareArrows,
} from "lucide-react";
import type { BranchCompRow } from "@/lib/analyticsService";

interface Props {
  data: BranchCompRow[];
  loading: boolean;
}

type SortKey = "totalSales" | "orders" | "avgOrderValue";

const BranchComparisonTable: React.FC<Props> = ({ data, loading }) => {
  const [sortBy, setSortBy] = useState<SortKey>("totalSales");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    let list = data;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((b) => b.branchName.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [data, sortBy, searchTerm]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <GitCompareArrows size={16} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">
              Branch Comparison
            </h3>
            <p className="text-[11px] text-gray-400">
              Compare performance across branches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              className="border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 w-40 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
              placeholder="Search branch…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ArrowUpDown size={13} />
            <select
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 transition-all"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
            >
              <option value="totalSales">Sales</option>
              <option value="orders">Orders</option>
              <option value="avgOrderValue">AOV</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-50 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-2 text-center">
          <Building2 size={28} className="text-gray-300" />
          <p className="text-sm text-gray-400">
            No branches yet — create branches to compare performance.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["Branch", "Total Sales", "Orders", "AOV", "Status"].map(
                  (col) => (
                    <th
                      key={col}
                      className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((row) => (
                <tr
                  key={row.branchId}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 font-medium text-gray-800">
                      <Building2 size={13} className="text-gray-400" />
                      {row.branchName}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-bold text-[#ff5a1f]">
                    PKR {row.totalSales.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {row.orders}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    PKR {row.avgOrderValue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        row.active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {row.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BranchComparisonTable;
