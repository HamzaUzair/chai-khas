"use client";

import React from "react";
import { Eye, Pencil, Trash2, Building2, Layers3, BadgeInfo } from "lucide-react";

export interface RecipeRow {
  id: string;
  menuItemId: number;
  menuItemName: string;
  categoryName: string;
  branchName: string;
  ingredientCount: number;
  hasRecipe: boolean;
}

interface RecipesTableProps {
  rows: RecipeRow[];
  loading: boolean;
  onView: (row: RecipeRow) => void;
  onEdit: (row: RecipeRow) => void;
  onDelete: (row: RecipeRow) => void;
}

const RecipesTable: React.FC<RecipesTableProps> = ({
  rows,
  loading,
  onView,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading recipes…</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <BadgeInfo size={28} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 max-w-xs">
            No recipe mappings created yet. Map ingredients to menu items to enable automatic
            stock deduction.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-gray-50/90 border-b border-gray-100">
              {[
                "Menu Item",
                "Category",
                "Branch",
                "Ingredients",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row, idx) => (
              <tr
                key={row.id}
                className={`hover:bg-[#ff5a1f]/[0.02] transition-colors ${
                  idx % 2 === 1 ? "bg-gray-50/40" : ""
                }`}
              >
                {/* Menu item */}
                <td className="px-5 py-3.5">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 text-sm">
                      {row.menuItemName}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      ID #{row.menuItemId}
                    </span>
                  </div>
                </td>

                {/* Category */}
                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600">
                  {row.categoryName || "—"}
                </td>

                {/* Branch */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <Building2 size={13} className="text-gray-400" />
                    {row.branchName || "—"}
                  </span>
                </td>

                {/* Ingredients count */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <Layers3 size={13} className="text-gray-400" />
                    {row.ingredientCount} ingredient
                    {row.ingredientCount === 1 ? "" : "s"}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      row.hasRecipe
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {row.hasRecipe ? "Recipe Added" : "Missing Recipe"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onView(row)}
                      disabled={!row.hasRecipe}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                      title={row.hasRecipe ? "View recipe" : "No recipe yet"}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => onEdit(row)}
                      className="p-1.5 rounded-lg text-[#ff5a1f] hover:bg-orange-50 transition-colors cursor-pointer"
                      title={row.hasRecipe ? "Edit recipe" : "Add recipe"}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(row)}
                      disabled={!row.hasRecipe}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                      title="Delete recipe mapping"
                    >
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

export default RecipesTable;

