"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  ClipboardList,
  Building2,
  Search,
  Calendar,
  Download,
} from "lucide-react";
import type { ActivityEntry, InvBranch } from "@/types/inventory";
import { format } from "date-fns";

const TYPE_BADGE: Record<string, string> = {
  "Stock In": "bg-green-50 text-green-700",
  Usage: "bg-red-50 text-red-700",
  Adjustment: "bg-purple-50 text-purple-700",
  "Order Deduction": "bg-amber-50 text-amber-700",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  log: ActivityEntry[];
  branches: InvBranch[];
}

const UsageLogModal: React.FC<Props> = ({ isOpen, onClose, log, branches }) => {
  const [branchId, setBranchId] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (isOpen) { setBranchId("all"); setSearch(""); setDateFrom(""); setDateTo(""); }
  }, [isOpen]);

  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => { if (isOpen) window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey); }, [isOpen, handleKey]);

  const filtered = useMemo(() => {
    let list = [...log];
    if (branchId !== "all") list = list.filter((e) => e.branchId === branchId);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.itemName.toLowerCase().includes(q) || e.type.toLowerCase().includes(q));
    }
    if (dateFrom) { const from = new Date(dateFrom).getTime(); list = list.filter((e) => e.timestamp >= from); }
    if (dateTo) { const to = new Date(dateTo).getTime() + 86_400_000; list = list.filter((e) => e.timestamp < to); }
    return list;
  }, [log, branchId, search, dateFrom, dateTo]);

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const header = "Date/Time,Branch,Item,Type,Qty,Unit,Reason,Notes,Linked Order\n";
    const rows = filtered.map((e) =>
      [
        format(new Date(e.timestamp), "yyyy-MM-dd HH:mm"),
        `"${e.branchName}"`,
        `"${e.itemName}"`,
        e.type,
        e.qty,
        e.unit,
        e.reason ?? "",
        `"${e.notes ?? ""}"`,
        e.linkedOrderId ?? "",
      ].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
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
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><ClipboardList size={18} className="text-blue-600" /></div>
            <h2 className="text-base font-bold text-gray-800">Usage &amp; Activity Log</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCsv} disabled={filtered.length === 0} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              <Download size={13} /> Export CSV
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"><X size={20} /></button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-50 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30" value={branchId} onChange={(e) => setBranchId(e.target.value === "all" ? "all" : Number(e.target.value))}>
            <option value="all">All Branches</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input className="w-full border border-gray-200 rounded-lg pl-8 pr-2 py-2 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30" placeholder="Search item…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 py-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <ClipboardList size={32} className="mb-2" />
              <p className="text-sm font-medium">No log entries found.</p>
            </div>
          ) : (
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {["Date/Time", "Branch", "Item", "Type", "Qty", "Unit", "Reason", "Notes"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/60">
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500 flex items-center gap-1"><Calendar size={10} className="text-gray-300" />{format(new Date(e.timestamp), "dd MMM yy, HH:mm")}</td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className="flex items-center gap-1 text-gray-600"><Building2 size={10} className="text-gray-400" />{e.branchName}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap font-semibold text-gray-800">{e.itemName}</td>
                    <td className="px-3 py-2 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${TYPE_BADGE[e.type] ?? "bg-gray-100 text-gray-500"}`}>{e.type}</span></td>
                    <td className="px-3 py-2 whitespace-nowrap font-bold text-gray-800">{e.qty}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">{e.unit}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">{e.reason ?? "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-400 truncate max-w-[120px]">{e.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-100 text-[11px] text-gray-400 text-right shrink-0">
          Showing {filtered.length} of {log.length} entries
        </div>
      </div>
    </div>
  );
};

export default UsageLogModal;
