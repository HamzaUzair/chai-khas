"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  X,
  ClipboardList,
  Search,
  Building2,
  Calendar,
  FileDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { InventoryActivity, InvBranch } from "@/types/inventory";
import { format } from "date-fns";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  log: InventoryActivity[];
  branches: InvBranch[];
}

const UsageLogModal: React.FC<Props> = ({ isOpen, onClose, log, branches }) => {
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState<number | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setBranchId("all");
      setDateFrom("");
      setDateTo("");
    }
  }, [isOpen]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );
  useEffect(() => {
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  const filtered = useMemo(() => {
    let list = [...log];
    if (branchId !== "all") list = list.filter((l) => l.branchId === branchId);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((l) => l.itemName.toLowerCase().includes(q) || l.type.toLowerCase().includes(q) || (l.orderId && l.orderId.toLowerCase().includes(q)));
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      list = list.filter((l) => l.createdAt >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86_400_000;
      list = list.filter((l) => l.createdAt < to);
    }
    return list;
  }, [log, branchId, search, dateFrom, dateTo]);

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const rows = [
      ["Date/Time", "Branch", "Item", "Type", "Qty", "Unit", "Order ID", "Notes"].join(","),
      ...filtered.map((l) =>
        [
          `"${format(new Date(l.createdAt), "yyyy-MM-dd HH:mm")}"`,
          `"${l.branchName}"`,
          `"${l.itemName}"`,
          `"${l.type}"`,
          l.qty,
          l.unit,
          `"${l.orderId || ""}"`,
          `"${l.notes}"`,
        ].join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_usage_log.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <ClipboardList size={18} className="text-purple-600" />
            </div>
            <h2 className="text-base font-bold text-gray-800">Usage &amp; Activity Log</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCsv} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors cursor-pointer">
              <FileDown size={13} /> Export CSV
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"><X size={20} /></button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-50 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="text" className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f]" placeholder="Search item…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f]" value={branchId} onChange={(e) => setBranchId(e.target.value === "all" ? "all" : Number(e.target.value))}>
            <option value="all">All Branches</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f]" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f]" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ClipboardList size={32} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">No activity entries found.</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr>
                  {["Date/Time", "Branch", "Item", "Type", "Qty", "Order ID", "Notes"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-500">
                      <div className="flex items-center gap-1"><Calendar size={10} className="text-gray-400" />{format(new Date(l.createdAt), "dd MMM yy HH:mm")}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1"><Building2 size={10} className="text-gray-400" />{l.branchName}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap font-semibold text-gray-700">{l.itemName}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${l.qty > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {l.qty > 0 ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />} {l.type}
                      </span>
                    </td>
                    <td className={`px-4 py-2.5 whitespace-nowrap font-bold ${l.qty > 0 ? "text-green-600" : "text-red-600"}`}>
                      {l.qty > 0 ? "+" : ""}{l.qty} {l.unit}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-400 font-mono">{l.orderId || "—"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-400">{l.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400 shrink-0">
          Showing {filtered.length} of {log.length} entries
        </div>
      </div>
    </div>
  );
};

export default UsageLogModal;
