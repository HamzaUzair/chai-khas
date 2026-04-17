"use client";

import React from "react";
import { Pencil, Trash2, Tag } from "lucide-react";
import type { Category } from "@/types/category";

interface CategoryTableProps {
  items: Category[];
  onEditCategory: (cat: Category, branchId: number) => void;
  onDeleteCategory: (catId: number, branchId: number, catName: string) => void;
  /** Hide row-level edit/delete actions. */
  readOnly?: boolean;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  items,
  onEditCategory,
  onDeleteCategory,
  readOnly = false,
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Tag size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="font-medium">No categories found</p>
        <p className="text-sm mt-1">Create an active branch and add categories.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 overflow-x-auto">
      <table className="w-full text-sm min-w-[760px]">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            {(readOnly
              ? ["Category Name", "Branch", "Items", "Status"]
              : ["Category Name", "Branch", "Items", "Status", "Actions"]
            ).map((col) => (
              <th
                key={col}
                className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((cat) => (
            <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors">
              <td className="px-5 py-3.5">
                <p className="font-semibold text-gray-800">{cat.name}</p>
              </td>
              <td className="px-5 py-3.5 text-gray-600">{cat.branchName}</td>
              <td className="px-5 py-3.5 text-gray-600">{cat.itemCount}</td>
              <td className="px-5 py-3.5">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    cat.isActive
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {cat.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              {!readOnly && (
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      className="p-2 rounded-lg text-gray-400 hover:text-[#ff5a1f] hover:bg-orange-50 transition-colors cursor-pointer"
                      onClick={() => onEditCategory(cat, cat.branchId)}
                      title="Edit category"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      onClick={() => onDeleteCategory(cat.id, cat.branchId, cat.name)}
                      title="Delete category"
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
  );
};

export default CategoryTable;

