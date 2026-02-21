"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Package,
  Building2,
  Calendar,
  DollarSign,
  AlertTriangle,
  Minus,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import type { InventoryItem, InventoryActivity } from "@/types/inventory";
import { getStockStatus } from "@/lib/inventoryData";
import { format } from "date-fns";

function fmtPkr(n: number) {
  return "PKR " + n.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Props {
  isOpen: boolean;
  item: InventoryItem | null;
  log: InventoryActivity[];
  onClose: () => void;
  onSimulateUsage: (item: InventoryItem, qty: number) => void;
}

const InventoryDrawer: React.FC<Props> = ({ isOpen, item, log, onClose, onSimulateUsage }) => {
  const [simQty, setSimQty] = useState("1");

  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );
  useEffect(() => {
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  useEffect(() => { setSimQty("1"); }, [item]);

  if (!isOpen || !item) return null;

  const status = getStockStatus(item);
  const recentActivity = log
    .filter((l) => l.itemId === item.id)
    .slice(0, 10);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 z-[100] h-screen w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center shrink-0">
              <Package size={18} className="text-[#ff5a1f]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-800 truncate">{item.name}</h2>
              <p className="text-[11px] text-gray-400">{item.sku}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
              <Building2 size={10} /> {item.branchName}
            </span>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${item.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {item.status}
            </span>
            {status === "low" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                <AlertTriangle size={10} /> Low Stock
              </span>
            )}
            {status === "out" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
                <AlertTriangle size={10} /> Out of Stock
              </span>
            )}
          </div>

          {/* Stock Summary */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Stock Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] text-gray-400 mb-0.5">Current Stock</p>
                <p className="text-lg font-bold text-gray-800">{item.stock} <span className="text-xs font-normal text-gray-500">{item.unit}</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] text-gray-400 mb-0.5">Min Stock Alert</p>
                <p className="text-lg font-bold text-gray-800">{item.minStock} <span className="text-xs font-normal text-gray-500">{item.unit}</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] text-gray-400 mb-0.5">Cost per Unit</p>
                <p className="text-sm font-bold text-gray-800">{fmtPkr(item.costPerUnit)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] text-gray-400 mb-0.5">Total Value</p>
                <p className="text-sm font-bold text-[#ff5a1f]">{fmtPkr(item.stock * item.costPerUnit)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar size={12} />
              Last updated: {format(new Date(item.updatedAt), "dd MMM yyyy, HH:mm")}
            </div>
            {item.supplier && (
              <p className="text-xs text-gray-400 mt-1">Supplier: <span className="text-gray-600">{item.supplier}</span></p>
            )}
          </div>

          {/* Simulate Usage */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Usage Simulation</h3>
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs text-gray-600 mb-3">
                Simulate a stock deduction to test low-stock alerts. Enter the quantity of <strong>{item.unit}</strong> to deduct.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f]"
                  value={simQty}
                  onChange={(e) => setSimQty(e.target.value)}
                />
                <span className="text-xs text-gray-500">{item.unit}</span>
                <button
                  onClick={() => {
                    const q = Number(simQty);
                    if (q > 0) onSimulateUsage(item, q);
                  }}
                  className="ml-auto px-4 py-2 rounded-lg bg-[#ff5a1f] text-white text-xs font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
                >
                  Simulate Usage
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Recent Activity ({recentActivity.length})
            </h3>
            {recentActivity.length === 0 ? (
              <p className="text-xs text-gray-400">No activity recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${a.qty > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                      {a.qty > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-700">{a.type}</p>
                      <p className="text-[10px] text-gray-400">{format(new Date(a.createdAt), "dd MMM yyyy HH:mm")}</p>
                    </div>
                    <span className={`text-xs font-bold ${a.qty > 0 ? "text-green-600" : "text-red-600"}`}>
                      {a.qty > 0 ? "+" : ""}{a.qty} {a.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InventoryDrawer;
