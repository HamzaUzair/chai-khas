"use client";

import React from "react";
import { Pencil, Trash2, Building2, Loader2 } from "lucide-react";
import type { Branch } from "@/types/branch";

interface BranchTableProps {
  branches: Branch[];
  loading: boolean;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
}

const cols = ["Branch Name", "Complete Address", "City", "Status", "Actions"];

const BranchTable: React.FC<BranchTableProps> = ({
  branches,
  loading,
  onEdit,
  onDelete,
}) => {
  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-[#ff5a1f] animate-spin" />
          <p className="text-sm text-gray-400">Loading branches…</p>
        </div>
      </div>
    );
  }

  /* ── Empty state ── */
  if (branches.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Building2 size={28} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 max-w-xs">
            No branches yet. Click{" "}
            <span className="font-semibold text-[#ff5a1f]">&quot;Add Branch&quot;</span>{" "}
            to create your first branch.
          </p>
        </div>
      </div>
    );
  }

  /* ── Table ── */
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
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
            {branches.map((b) => (
              <tr
                key={b.branch_id}
                className="hover:bg-gray-50/60 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                  {b.branch_name}
                </td>
                <td className="px-6 py-4 text-gray-600 max-w-[220px] truncate">
                  {b.address || "—"}
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {b.city || "—"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      b.status === "Active"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(b)}
                      className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                      aria-label={`Edit ${b.branch_name}`}
                      title="Edit"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      onClick={() => onDelete(b)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      aria-label={`Delete ${b.branch_name}`}
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

export default BranchTable;
