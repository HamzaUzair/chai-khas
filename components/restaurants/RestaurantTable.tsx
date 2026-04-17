"use client";

import React from "react";
import Link from "next/link";
import { Pencil, Trash2, Store, Loader2, Eye } from "lucide-react";
import type { Restaurant } from "@/types/restaurant";

interface RestaurantTableProps {
  restaurants: Restaurant[];
  loading: boolean;
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (restaurant: Restaurant) => void;
}

const cols = ["Name", "Code", "Type", "Branches", "Admins", "Status", "Actions"];

const RestaurantTable: React.FC<RestaurantTableProps> = ({
  restaurants,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-[#ff5a1f] animate-spin" />
          <p className="text-sm text-gray-400">Loading restaurants…</p>
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Store size={28} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 max-w-xs">
            No restaurants yet. Click{" "}
            <span className="font-semibold text-[#ff5a1f]">
              &quot;Add Restaurant&quot;
            </span>{" "}
            to onboard a tenant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {cols.map((col) => (
                <th
                  key={col}
                  className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {restaurants.map((r) => (
              <tr
                key={r.restaurant_id}
                className="hover:bg-gray-50/60 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                  {r.name}
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {r.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      r.has_multiple_branches
                        ? "bg-[#ff5a1f]/10 text-[#ff5a1f]"
                        : "bg-blue-50 text-blue-600"
                    }`}
                    title={
                      r.has_multiple_branches
                        ? "This restaurant can manage multiple branches"
                        : "Single-branch restaurant — Branches module is hidden for its admin"
                    }
                  >
                    {r.has_multiple_branches ? "Multi Branch" : "Single Branch"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {r.branch_count ?? 0}
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {r.admin_count ?? 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      r.status === "Active"
                        ? "bg-green-50 text-green-600"
                        : r.status === "Suspended"
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/restaurants/${r.restaurant_id}`}
                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                      aria-label={`View ${r.name}`}
                      title="View branches & analytics"
                    >
                      <Eye size={17} />
                    </Link>
                    <button
                      onClick={() => onEdit(r)}
                      className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                      aria-label={`Edit ${r.name}`}
                      title="Edit"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      onClick={() => onDelete(r)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      aria-label={`Delete ${r.name}`}
                      title="Delete"
                    >
                      <Trash2 size={17} />
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

export default RestaurantTable;
