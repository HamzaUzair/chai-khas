"use client";

import React from "react";
import {
  Flame,
  Soup,
  Beef,
  Pizza,
  GlassWater,
  IceCreamCone,
  Wheat,
  Sandwich,
  Tag,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Category } from "@/types/category";

/* Map well-known category names to icons */
const iconMap: Record<string, React.ReactNode> = {
  BBQ: <Flame size={22} className="text-[#ff5a1f]" />,
  Karahi: <Soup size={22} className="text-[#ff5a1f]" />,
  Burgers: <Beef size={22} className="text-[#ff5a1f]" />,
  Pizza: <Pizza size={22} className="text-[#ff5a1f]" />,
  Drinks: <GlassWater size={22} className="text-[#ff5a1f]" />,
  Desserts: <IceCreamCone size={22} className="text-[#ff5a1f]" />,
  Rice: <Wheat size={22} className="text-[#ff5a1f]" />,
  Sandwiches: <Sandwich size={22} className="text-[#ff5a1f]" />,
};

function getIcon(name: string) {
  return iconMap[name] ?? <Tag size={22} className="text-[#ff5a1f]" />;
}

interface CategoryGridProps {
  /** categories grouped per branch when "All Branches" */
  groups: { branchName: string; branchId: number; categories: Category[] }[];
  onEditCategory: (cat: Category, branchId: number) => void;
  onDeleteCategory: (catId: number, branchId: number, catName: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  groups,
  onEditCategory,
  onDeleteCategory,
}) => {
  if (groups.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Tag size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="font-medium">No categories found</p>
        <p className="text-sm mt-1">
          Create an active branch and add categories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.branchId}>
          {groups.length > 1 && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {g.branchName}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {g.categories.map((cat) => (
              <div
                key={cat.id}
                className="relative group rounded-xl border border-gray-100 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all p-4"
              >
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-[#ff5a1f] transition-all cursor-pointer"
                    onClick={() => onEditCategory(cat, g.branchId)}
                    title="Edit category"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="p-1 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                    onClick={() => onDeleteCategory(cat.id, g.branchId, cat.name)}
                    title="Delete category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center shrink-0">
                    {getIcon(cat.name)}
                  </div>
                </div>

                <p className="text-sm font-semibold text-gray-800 truncate">
                  {cat.name}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {cat.itemCount} items
                  </span>
                  {cat.isActive ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryGrid;
