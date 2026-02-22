"use client";

import React from "react";
import {
  Eye,
  SlidersHorizontal,
  Pencil,
  Trash2,
  Building2,
  Calendar,
  Loader2,
} from "lucide-react";
import type { InventoryItem } from "@/types/inventory";
import { format } from "date-fns";

const CAT_BADGE: Record<string, string> = {
  Meat: "bg-red-50 text-red-700",
  Veg: "bg-emerald-50 text-emerald-700",
  Dairy: "bg-blue-50 text-blue-700",
  Spices: "bg-amber-50 text-amber-700",
  Drinks: "bg-purple-50 text-purple-700",
  Packaging: "bg-gray-100 text-gray-600",
  Other: "bg-slate-100 text-slate-600",
};

function stockBadge(item: InventoryItem) {
  if (item.inStock === 0) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">Out of Stock</span>;
  if (item.inStock <= item.minStock) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Low Stock</span>;
  return null;
}

interface Props {
  items: InventoryItem[];
  loading: boolean;
  onView: (i: InventoryItem) => void;
  onAdjust: (i: InventoryItem) => void;
  onEdit: (i: InventoryItem) => void;
  onDelete: (i: InventoryItem) => void;
}

const InventoryTable: React.FC<Props> = ({ items, loading, onView, onAdjust, onEdit, onDelete }) => {
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
        <table className="w-full text-sm min-w-[1050px]">
          <thead>
            <tr className="bg-gray-50/90 border-b border-gray-100">
              {["Item", "SKU", "Category", "Branch", "Unit", "In Stock", "Min Stock", "Status", "Last Updated", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item, idx) => (
              <tr
                key={item.id}
                className={`hover:bg-[#ff5a1f]/[0.02] transition-colors ${idx % 2 === 1 ? "bg-gray-50/40" : ""}`}
              >
                {/* Item */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-semibold text-gray-800 text-xs">{item.name}</span>
                </td>

                {/* SKU */}
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-mono">{item.sku}</td>

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
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{item.unit}</td>

                {/* In Stock */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${item.inStock === 0 ? "text-red-600" : item.inStock <= item.minStock ? "text-amber-600" : "text-gray-800"}`}>
                      {item.inStock}
                    </span>
                    {stockBadge(item)}
                  </div>
                </td>

                {/* Min Stock */}
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{item.minStock}</td>

                {/* Status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${item.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {item.status}
                  </span>
                </td>

                {/* Last Updated */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar size={11} className="text-gray-400 shrink-0" />
                    {format(new Date(item.lastUpdated), "dd MMM yyyy")}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => onView(item)} title="View" className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => onAdjust(item)} title="Adjust Stock" className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer">
                      <SlidersHorizontal size={14} />
                    </button>
                    <button onClick={() => onEdit(item)} title="Edit" className="p-1.5 rounded-lg text-[#ff5a1f] hover:bg-orange-50 transition-colors cursor-pointer">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => onDelete(item)} title="Delete" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                      <Trash2 size={14} />
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
