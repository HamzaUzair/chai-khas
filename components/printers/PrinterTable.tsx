"use client";

import React from "react";
import {
  Pencil,
  Trash2,
  Printer,
  Building2,
  Wifi,
  Loader2,
} from "lucide-react";
import type { Printer as PrinterType } from "@/types/printer";
import { getPrinterTypeLabel, getConnectionTypeLabel, getPurposeLabel } from "@/lib/constants/printerConfig";

interface PrinterTableProps {
  printers: PrinterType[];
  loading: boolean;
  onEdit: (p: PrinterType) => void;
  onDelete: (p: PrinterType) => void;
  onTestPrint: (p: PrinterType) => void;
}

const PrinterTable: React.FC<PrinterTableProps> = ({
  printers,
  loading,
  onEdit,
  onDelete,
  onTestPrint,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-[#ff5a1f] animate-spin" />
          <p className="text-sm text-gray-400">Loading printers…</p>
        </div>
      </div>
    );
  }

  if (printers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Printer size={28} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 max-w-xs">
            No printers found matching your filters. Click{" "}
            <span className="font-semibold text-[#ff5a1f]">&quot;Add Printer&quot;</span>{" "}
            to add your first printer.
          </p>
        </div>
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    active: "bg-green-50 text-green-600",
    inactive: "bg-gray-100 text-gray-500",
    offline: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              {[
                "Printer Name",
                "Type",
                "Branch",
                "Assigned Area",
                "Connection",
                "IP / Port",
                "Paper",
                "Status",
                "Purposes",
                "Actions",
              ].map((col) => (
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
            {printers.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center shrink-0">
                      <Printer size={14} className="text-[#ff5a1f]" />
                    </div>
                    <span className="font-semibold text-gray-800">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-gray-600">
                  {getPrinterTypeLabel(p.type)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <Building2 size={12} className="text-gray-400" />
                    {p.branchName}
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-gray-600">
                  {p.assignedArea}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-gray-600">
                  {getConnectionTypeLabel(p.connectionType)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 font-mono text-xs">
                  {p.connectionType === "network" && p.ipAddress
                    ? `${p.ipAddress}${p.port ? `:${p.port}` : ""}`
                    : p.usbPort || "—"}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-gray-600">
                  {p.paperSize}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      statusStyles[p.status] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {p.status === "active" && "● "}
                    {p.status === "inactive" && "○ "}
                    {p.status === "offline" && "◐ "}
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {p.assignedPurposes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.assignedPurposes.slice(0, 3).map((purp) => (
                        <span
                          key={purp}
                          className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-[10px] font-medium text-gray-600"
                        >
                          {getPurposeLabel(purp)}
                        </span>
                      ))}
                      {p.assignedPurposes.length > 3 && (
                        <span className="text-[10px] text-gray-400">
                          +{p.assignedPurposes.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onTestPrint(p)}
                      className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Test Print"
                    >
                      <Wifi size={15} />
                    </button>
                    <button
                      onClick={() => onEdit(p)}
                      className="p-2 rounded-lg text-gray-500 hover:text-[#ff5a1f] hover:bg-orange-50 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(p)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={15} />
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

export default PrinterTable;
