"use client";

import React from "react";
import {
  Eye,
  SlidersHorizontal,
  Pencil,
  Trash2,
  Building2,
  Package,
} from "lucide-react";
import type { InventoryItem } from "@/types/inventory";
import { getStockStatus } from "@/lib/inventoryData";

const CAT_BADGE: Record<string, string> = {
  Meat: "bg-red-50 text-red-700",
  Veg: "bg-green-50 text-green-700",
  Dairy: "bg-yellow-50 text-yellow-700",
  Spices: "bg-orange-50 text-orange-700",
  Drinks: "bg-sky-50 text-sky-700",
  Packaging: "bg-indigo-50 text-indigo-700",
  Other: "bg-gray-100 text-gray-600",
};

function stockBadge(item: InventoryItem) {
  const s = getStockStatus(item);
  if (s === "out") return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">Out of Stock</span>;
  if (s === "low") return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">Low Stock</span>;
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700">In Stock</span>;
}

interface Props {
  items: InventoryItem[];
  onView: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

const InventoryCardList: React.FC<Props> = ({ items, onView, onAdjust, onEdit, onDelete }) => {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          {/* Top */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Package size={14} className="text-gray-400 shrink-0" />
              <span className="font-bold text-sm text-gray-800 truncate">{item.name}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${CAT_BADGE[item.category] ?? "bg-gray-100 text-gray-600"}`}>
              {item.category}
            </span>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">SKU:</span>
              <span className="font-mono">{item.sku}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 size={12} className="text-gray-400" />
              {item.branchName}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Stock:</span>
              <span className="font-bold text-gray-800">{item.stock} {item.unit}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Min:</span>
              <span>{item.minStock} {item.unit}</span>
            </div>
          </div>

          {/* Status row */}
          <div className="flex items-center gap-2 mb-3">
            {stockBadge(item)}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {item.status}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-gray-50">
            <button onClick={() => onView(item)} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer" title="View"><Eye size={14} /></button>
            <button onClick={() => onAdjust(item)} className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer" title="Adjust"><SlidersHorizontal size={14} /></button>
            <button onClick={() => onEdit(item)} className="p-2 rounded-lg border border-[#ff5a1f]/30 text-[#ff5a1f] hover:bg-[#ff5a1f]/5 transition-colors cursor-pointer" title="Edit"><Pencil size={14} /></button>
            <button onClick={() => onDelete(item)} className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Delete"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryCardList;
