"use client";

import React from "react";
import {
  Pencil,
  Trash2,
  Building2,
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

/* Category → icon mapping */
const iconMap: Record<string, React.ReactNode> = {
  BBQ: <Flame size={16} className="text-[#ff5a1f]" />,
  Karahi: <Soup size={16} className="text-[#ff5a1f]" />,
  Burgers: <Beef size={16} className="text-[#ff5a1f]" />,
  Pizza: <Pizza size={16} className="text-[#ff5a1f]" />,
  Drinks: <GlassWater size={16} className="text-[#ff5a1f]" />,
  Desserts: <IceCreamCone size={16} className="text-[#ff5a1f]" />,
  Rice: <Wheat size={16} className="text-[#ff5a1f]" />,
  Sandwiches: <Sandwich size={16} className="text-[#ff5a1f]" />,
};

function getCatIcon(category: string) {
  return iconMap[category] ?? <Tag size={16} className="text-[#ff5a1f]" />;
}

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onEdit,
  onDelete,
}) => (
  <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 flex flex-col">
    {/* Top row: category badge + actions */}
    <div className="flex items-start justify-between mb-3">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ff5a1f]/8 text-[#ff5a1f] text-xs font-semibold">
        {getCatIcon(item.category)}
        {item.category}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-[#ff5a1f] hover:bg-orange-50 transition-colors cursor-pointer"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(item)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>

    {/* Name + description */}
    <h3 className="text-sm font-bold text-gray-800 leading-snug">
      {item.name}
    </h3>
    {item.description && (
      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
        {item.description}
      </p>
    )}

    {/* Spacer */}
    <div className="flex-1" />

    {/* Bottom row: price, branch, status */}
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
      <div className="flex flex-col">
        <span className="text-base font-bold text-gray-800">
          PKR {item.price.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
          <Building2 size={11} />
          {item.branchName}
        </span>
      </div>

      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
          item.status === "active"
            ? "bg-green-50 text-green-600"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {item.status === "active" ? "● Active" : "○ Inactive"}
      </span>
    </div>
  </div>
);

export default MenuItemCard;
