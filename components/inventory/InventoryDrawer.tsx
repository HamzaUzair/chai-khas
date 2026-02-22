"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Package,
  Building2,
  DollarSign,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowDownCircle,
  Play,
} from "lucide-react";
import type { InventoryItem, ActivityEntry } from "@/types/inventory";
import { format } from "date-fns";

interface Props {
  isOpen: boolean;
  item: InventoryItem | null;
  log: ActivityEntry[];
  onClose: () => void;
  onSimulateUsage: (itemId: string, qty: number) => void;
}

const InventoryDrawer: React.FC<Props> = ({ isOpen, item, log, onClose, onSimulateUsage }) => {
  const [usageQty, setUsageQty] = useState("1");

  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => { if (isOpen) window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey); }, [isOpen, handleKey]);

  useEffect(() => { setUsageQty("1"); }, [item]);

  if (!isOpen || !item) return null;

  const itemLog = log.filter((e) => e.itemId === item.id).slice(0, 10);
  const totalValue = item.inStock * item.costPerUnit;
  const isLow = item.inStock > 0 && item.inStock <= item.minStock;
  const isOut = item.inStock === 0;

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col z-10 animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center">
              <Package size={18} className="text-[#ff5a1f]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">{item.name}</h2>
              <p className="text-[11px] text-gray-400">{item.sku}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer" aria-label="Close"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Status + Branch badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${item.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.status}</span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 flex items-center gap-1"><Building2 size={11} />{item.branchName}</span>
            {isOut && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700">Out of Stock</span>}
            {isLow && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">Low Stock</span>}
          </div>

          {/* Stock Summary */}
          <div>
            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-1.5"><Package size={13} /> Stock Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Current Stock", value: `${item.inStock} ${item.unit}`, danger: isOut, warn: isLow },
                { label: "Min Stock", value: `${item.minStock} ${item.unit}` },
                { label: "Unit Cost", value: `PKR ${item.costPerUnit.toLocaleString("en-PK")}` },
                { label: "Total Value", value: `PKR ${totalValue.toLocaleString("en-PK")}` },
                { label: "Category", value: item.category },
                { label: "Supplier", value: item.supplier || "—" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">{s.label}</p>
                  <p className={`text-sm font-bold ${s.danger ? "text-red-600" : s.warn ? "text-amber-600" : "text-gray-800"}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1"><Calendar size={10} /> Last Updated: {format(new Date(item.lastUpdated), "dd MMM yyyy, hh:mm a")}</p>
          </div>

          {/* Usage Simulation */}
          <div className="bg-orange-50/50 rounded-xl border border-orange-100 p-4">
            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2.5 flex items-center gap-1.5"><Play size={13} className="text-[#ff5a1f]" /> Usage Simulation</h3>
            <p className="text-[11px] text-gray-500 mb-3">Simulate using a quantity of this item to test stock deduction.</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.1"
                step="0.1"
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f]"
                value={usageQty}
                onChange={(e) => setUsageQty(e.target.value)}
              />
              <span className="text-xs text-gray-500">{item.unit}</span>
              <button
                disabled={!usageQty || Number(usageQty) <= 0 || Number(usageQty) > item.inStock}
                onClick={() => { onSimulateUsage(item.id, Number(usageQty)); setUsageQty("1"); }}
                className="ml-auto px-3 py-2 rounded-lg bg-[#ff5a1f] text-white text-xs font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Simulate Usage
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-1.5"><Clock size={13} /> Recent Activity</h3>
            {itemLog.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No activity yet.</p>
            ) : (
              <div className="space-y-2">
                {itemLog.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2.5 bg-gray-50 rounded-lg px-3 py-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      entry.type === "Stock In" ? "bg-green-100 text-green-600" :
                      entry.type === "Usage" || entry.type === "Order Deduction" ? "bg-red-50 text-red-500" :
                      "bg-purple-50 text-purple-600"
                    }`}>
                      <ArrowDownCircle size={13} className={entry.type === "Stock In" ? "rotate-180" : ""} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700">{entry.type}: {entry.qty} {entry.unit}</p>
                      {entry.reason && <p className="text-[10px] text-gray-400">Reason: {entry.reason}</p>}
                      <p className="text-[10px] text-gray-400">{format(new Date(entry.timestamp), "dd MMM yyyy, hh:mm a")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDrawer;
