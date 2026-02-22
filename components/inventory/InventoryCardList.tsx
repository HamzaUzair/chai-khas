"use client";

import React from "react";
import {
  Eye,
  SlidersHorizontal,
  Pencil,
  Trash2,
  Building2,
  DollarSign,
} from "lucide-react";
import type { InventoryItem } from "@/types/inventory";

const CAT_BADGE: Record<string, string> = {
  Meat: "bg-red-50 text-red-700",
  Veg: "bg-emerald-50 text-emerald-700",
  Dairy: "bg-blue-50 text-blue-700",
  Spices: "bg-amber-50 text-amber-700",
  Drinks: "bg-purple-50 text-purple-700",
  Packaging: "bg-gray-100 text-gray-600",
  Other: "bg-slate-100 text-slate-600",
};

interface Props {
  items: InventoryItem[];
  onView: (i: InventoryItem) => void;
  onAdjust: (i: InventoryItem) => void;
  onEdit: (i: InventoryItem) => void;
  onDelete: (i: InventoryItem) => void;
}

const InventoryCardList: React.FC<Props> = ({ items, onView, onAdjust, onEdit, onDelete }) => (
  <div className="space-y-3">
    {items.map((item) => (
      <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        {/* Top: name + category */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm text-gray-800 truncate mr-2">{item.name}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${CAT_BADGE[item.category] ?? "bg-gray-100 text-gray-600"}`}>
            {item.category}
          </span>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-mono text-[10px]">{item.sku}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 size={11} className="text-gray-400" />
            {item.branchName}
          </div>
          <div>
            <span className="text-gray-400">Stock:</span>{" "}
            <span className={`font-bold ${item.inStock === 0 ? "text-red-600" : item.inStock <= item.minStock ? "text-amber-600" : "text-gray-800"}`}>
              {item.inStock} {item.unit}
            </span>
            {item.inStock === 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[9px] font-bold">OUT</span>}
            {item.inStock > 0 && item.inStock <= item.minStock && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold">LOW</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign size={11} className="text-gray-400" />
            PKR {item.costPerUnit.toLocaleString("en-PK")}/{item.unit}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
          <button onClick={() => onView(item)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer" title="View"><Eye size={15} /></button>
          <button onClick={() => onAdjust(item)} className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 cursor-pointer" title="Adjust"><SlidersHorizontal size={15} /></button>
          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-[#ff5a1f] hover:bg-orange-50 cursor-pointer" title="Edit"><Pencil size={15} /></button>
          <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer" title="Delete"><Trash2 size={15} /></button>
        </div>
      </div>
    ))}
  </div>
);

export default InventoryCardList;
