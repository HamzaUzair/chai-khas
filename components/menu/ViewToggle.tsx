"use client";

import React from "react";
import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "grid" | "table";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onChange }) => (
  <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
    <button
      onClick={() => onChange("grid")}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
        view === "grid"
          ? "bg-white text-[#ff5a1f] shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      }`}
      title="Grid view"
    >
      <LayoutGrid size={14} />
      Grid
    </button>
    <button
      onClick={() => onChange("table")}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
        view === "table"
          ? "bg-white text-[#ff5a1f] shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      }`}
      title="Table view"
    >
      <List size={14} />
      Table
    </button>
  </div>
);

export default ViewToggle;
