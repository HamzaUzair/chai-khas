"use client";

import React from "react";
import type { BranchFormData } from "@/types/branch";

interface BranchFormProps {
  data: BranchFormData;
  onChange: (data: BranchFormData) => void;
  errors: Partial<Record<keyof BranchFormData, string>>;
}

const inputBase =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";

const BranchForm: React.FC<BranchFormProps> = ({ data, onChange, errors }) => {
  const update = (field: keyof BranchFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-5">
      {/* Branch Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Branch Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={`${inputBase} ${errors.branch_name ? "border-red-400 ring-2 ring-red-100" : ""}`}
          placeholder="Enter branch name"
          value={data.branch_name}
          onChange={(e) => update("branch_name", e.target.value)}
        />
        {errors.branch_name && (
          <p className="text-xs text-red-500 mt-1">{errors.branch_name}</p>
        )}
      </div>

      {/* Complete Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Complete Address <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`${inputBase} min-h-[100px] resize-y ${errors.address ? "border-red-400 ring-2 ring-red-100" : ""}`}
          placeholder="Enter complete address"
          value={data.address ?? ""}
          onChange={(e) => update("address", e.target.value)}
        />
        {errors.address && (
          <p className="text-xs text-red-500 mt-1">{errors.address}</p>
        )}
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          City <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={`${inputBase} ${errors.city ? "border-red-400 ring-2 ring-red-100" : ""}`}
          placeholder="Enter city"
          value={data.city ?? ""}
          onChange={(e) => update("city", e.target.value)}
        />
        {errors.city && (
          <p className="text-xs text-red-500 mt-1">{errors.city}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Status
        </label>
        <select
          className={`${inputBase} appearance-none bg-white cursor-pointer`}
          value={data.status}
          onChange={(e) =>
            update("status", e.target.value as "Active" | "Inactive")
          }
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
};

export default BranchForm;
