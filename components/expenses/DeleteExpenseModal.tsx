"use client";

import React, { useEffect, useCallback } from "react";
import { X, AlertTriangle } from "lucide-react";
import type { Expense } from "@/types/expense";

interface DeleteExpenseModalProps {
  isOpen: boolean;
  expense: Expense | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteExpenseModal: React.FC<DeleteExpenseModalProps> = ({
  isOpen,
  expense,
  onClose,
  onConfirm,
}) => {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );
  useEffect(() => {
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <h2 className="text-base font-bold text-gray-800">Delete Expense</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800">&quot;{expense.title}&quot;</strong>?
          </p>
          <p className="text-xs text-gray-400 mt-1.5">
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteExpenseModal;
