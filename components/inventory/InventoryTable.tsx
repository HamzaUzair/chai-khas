"use client";

import React from "react";
import {
  Eye,
  SlidersHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Building2,
  Calendar,
  Package,
} from "lucide-react";
import type { InventoryItem } from "@/types/inventory";
import { getStockStatus } from "@/lib/inventoryData";
import { format } from "date-fns";

/* ── badge colors ── */
const CAT_BADGE: Record<string, string> = {
  Meat: "bg-red-50 text-red-700",
  Veg: "bg-green-50 text-green-700",
  Dairy: "bg-yellow-50 text-yellow-700",
  Spices: "bg-orange-50 text-orange-700",
  Drinks: "bg-sky-50 text-sky-700",
  Packaging: "bg-indigo-50 text-indigo-700",
  Other: "bg-gray-100 text-gray-600",
};

const STATUS_BADGE: Record<string, string> = {
  Active: "bg-green-50 text-green-700",
  Inactive: "bg-gray-100 text-gray-500",
};

function stockBadge(item: InventoryItem) {
  const s = getStockStatus(item);
  if (s === "out") return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">Out of Stock</span>;
  if (s === "low") return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">Low Stock</span>;
  return null;
}

interface Props {
  items: InventoryItem[];
  loading: boolean;
  onView: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

const InventoryTable: React.FC<Props> = ({
  items,
  loading,
  onView,
  onAdjust,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 flex flex-col items-center gap-3">
        <Loader2 size={28} className="text-[#ff5a1f] animate-spin" />
        <p className="text-sm text-gray-400">Loading inventory…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1100px]">
          <thead>
            <tr className="bg-gray-50/90 border-b border-gray-100">
              {["Item", "SKU", "Category", "Branch", "Unit", "In Stock", "Min Stock", "Status", "Last Updated", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item, idx) => (
              <tr
                key={item.id}
                className={`hover:bg-[#ff5a1f]/[0.02] transition-colors ${idx % 2 === 1 ? "bg-gray-50/40" : ""}`}
              >
                {/* Name */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-gray-400 shrink-0" />
                    <span className="font-semibold text-gray-800 text-xs">{item.name}</span>
                  </div>
                </td>

                {/* SKU */}
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">
                  {item.sku}
                </td>

                {/* Category */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${CAT_BADGE[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                    {item.category}
                  </span>
                </td>

                {/* Branch */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Building2 size={12} className="text-gray-400 shrink-0" />
                    {item.branchName}
                  </div>
                </td>

                {/* Unit */}
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                  {item.unit}
                </td>

                {/* In Stock */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{item.stock}</span>
                    {stockBadge(item)}
                  </div>
                </td>

                {/* Min Stock */}
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                  {item.minStock}
                </td>

                {/* Status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_BADGE[item.status]}`}>
                    {item.status}
                  </span>
                </td>

                {/* Last Updated */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={11} className="text-gray-400 shrink-0" />
                    {format(new Date(item.updatedAt), "dd MMM yyyy")}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => onView(item)} title="View" className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                      <Eye size={13} />
                    </button>
                    <button onClick={() => onAdjust(item)} title="Adjust Stock" className="p-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                      <SlidersHorizontal size={13} />
                    </button>
                    <button onClick={() => onEdit(item)} title="Edit" className="p-1.5 rounded-lg border border-[#ff5a1f]/30 text-[#ff5a1f] hover:bg-[#ff5a1f]/5 transition-colors cursor-pointer">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => onDelete(item)} title="Delete" className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
