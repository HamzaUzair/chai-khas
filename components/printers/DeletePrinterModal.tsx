"use client";

import React from "react";
import { X, AlertTriangle } from "lucide-react";
import type { Printer } from "@/types/printer";

interface DeletePrinterModalProps {
  isOpen: boolean;
  printer: Printer | null;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}

const DeletePrinterModal: React.FC<DeletePrinterModalProps> = ({
  isOpen,
  printer,
  onClose,
  onConfirm,
  deleting,
}) => {
  if (!isOpen || !printer) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={deleting ? undefined : onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Delete Printer</h2>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-800">&quot;{printer.name}&quot;</span>?
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {printer.type} at {printer.assignedArea} — {printer.branchName}
          </p>
          <p className="text-xs text-amber-600 mt-2">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="px-5 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePrinterModal;
