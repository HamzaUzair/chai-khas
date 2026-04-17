"use client";

import React from "react";
import {
  Pencil,
  Trash2,
  Building2,
  UtensilsCrossed,
  Loader2,
  Flame,
  Soup,
  Beef,
  Pizza,
  GlassWater,
  IceCreamCone,
  Wheat,
  Sandwich,
  Tag,
} from "lucide-react";
import type { MenuItem } from "@/types/menu";

/* Category → icon */
const iconMap: Record<string, React.ReactNode> = {
  BBQ: <Flame size={14} />,
  Karahi: <Soup size={14} />,
  Burgers: <Beef size={14} />,
  Pizza: <Pizza size={14} />,
  Drinks: <GlassWater size={14} />,
  Desserts: <IceCreamCone size={14} />,
  Rice: <Wheat size={14} />,
  Sandwiches: <Sandwich size={14} />,
};

function getCatIcon(category: string) {
  return iconMap[category] ?? <Tag size={14} />;
}

interface MenuTableProps {
  items: MenuItem[];
  loading: boolean;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  readOnly?: boolean;
}

const MenuTable: React.FC<MenuTableProps> = ({
  items,
  loading,
  onEdit,
  onDelete,
  readOnly = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-[#ff5a1f] animate-spin" />
          <p className="text-sm text-gray-400">Loading menu items…</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <UtensilsCrossed size={28} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 max-w-xs">
            No menu items found matching your filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              {(readOnly
                ? ["Name", "Category", "Branch", "Price", "Status"]
                : ["Name", "Category", "Branch", "Price", "Status", "Actions"]
              ).map(
                (col) => (
                  <th
                    key={col}
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50/60 transition-colors"
              >
                {/* Name */}
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-gray-800 truncate max-w-[200px]">
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="text-[11px] text-gray-400 truncate max-w-[200px]">
                      {item.description}
                    </p>
                  )}
                </td>

                {/* Category */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-[#ff5a1f]">
                    {getCatIcon(item.categoryName)}
                    <span className="text-xs font-medium text-gray-600">
                      {item.categoryName}
                    </span>
                  </span>
                </td>

                {/* Branch */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-gray-500">
                    <Building2 size={13} className="text-gray-400" />
                    <span className="text-xs">{item.branchName}</span>
                  </span>
                </td>

                {/* Price */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="font-semibold text-gray-800">
                    {item.hasVariations && item.variations.length > 0 ? (
                      (() => {
                        const prices = item.variations.map((v) => v.price);
                        const min = Math.min(...prices);
                        const max = Math.max(...prices);
                        return min === max
                          ? `PKR ${min.toLocaleString()}`
                          : `PKR ${min.toLocaleString()} - ${max.toLocaleString()}`;
                      })()
                    ) : (
                      `PKR ${item.displayPrice.toLocaleString()}`
                    )}
                  </span>
                  {item.hasVariations && item.variations.length > 0 && (
                    <p className="text-[11px] text-[#ff5a1f] mt-0.5">
                      {item.variations.length} Variations
                    </p>
                  )}
                </td>

                {/* Status */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      item.status === "active"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {item.status === "active" ? "● Active" : "○ Inactive"}
                  </span>
                </td>

                {/* Actions */}
                {!readOnly && (
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg text-gray-400 hover:text-[#ff5a1f] hover:bg-orange-50 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuTable;
