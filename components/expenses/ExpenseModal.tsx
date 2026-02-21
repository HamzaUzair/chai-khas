"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Loader2, Wallet } from "lucide-react";
import type {
  Expense,
  ExpenseFormData,
  ExpenseCategory,
  ExpensePaymentMethod,
  ExpenseBranch,
} from "@/types/expense";
import { EXPENSE_CATEGORIES, EXPENSE_PAYMENT_METHODS } from "@/types/expense";

const emptyForm: ExpenseFormData = {
  title: "",
  description: "",
  category: "",
  branchId: "",
  amount: "",
  paymentMethod: "",
  date: new Date().toISOString().slice(0, 10),
  status: "Active",
};

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => void;
  editExpense?: Expense | null;
  branches: ExpenseBranch[];
  branchesLoading: boolean;
}

const selectBase =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";
const inputBase =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editExpense,
  branches,
  branchesLoading,
}) => {
  const [form, setForm] = useState<ExpenseFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!editExpense;

  // Populate form on edit
  useEffect(() => {
    if (editExpense) {
      setForm({
        title: editExpense.title,
        description: editExpense.description,
        category: editExpense.category,
        branchId: editExpense.branchId,
        amount: String(editExpense.amount),
        paymentMethod: editExpense.paymentMethod,
        date: editExpense.date,
        status: editExpense.status,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [editExpense, isOpen]);

  // Close on Escape
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

  const update = (key: keyof ExpenseFormData, value: string | number) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => {
      const next = { ...p };
      delete next[key];
      return next;
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.category) errs.category = "Category is required";
    if (!form.branchId) errs.branchId = "Branch is required";
    if (!form.amount || Number(form.amount) <= 0) errs.amount = "Valid amount is required";
    if (!form.paymentMethod) errs.paymentMethod = "Payment method is required";
    if (!form.date) errs.date = "Date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center">
              <Wallet size={18} className="text-[#ff5a1f]" />
            </div>
            <h2 className="text-base font-bold text-gray-800">
              {isEdit ? "Edit Expense" : "Add New Expense"}
            </h2>
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
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Expense Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputBase}
              placeholder="e.g. Electricity Bill"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
            {errors.title && (
              <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Category + Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className={selectBase}
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                <option value="">Select category</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-[11px] text-red-500 mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Branch <span className="text-red-500">*</span>
              </label>
              {branchesLoading ? (
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50">
                  <Loader2 size={14} className="animate-spin" />
                  Loading…
                </div>
              ) : (
                <select
                  className={selectBase}
                  value={form.branchId}
                  onChange={(e) => update("branchId", Number(e.target.value) || "")}
                  disabled={branches.length === 0}
                >
                  <option value="">Select branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.branchId && (
                <p className="text-[11px] text-red-500 mt-1">{errors.branchId}</p>
              )}
            </div>
          </div>

          {/* Amount + Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Amount (PKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                className={inputBase}
                placeholder="0"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
              />
              {errors.amount && (
                <p className="text-[11px] text-red-500 mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                className={selectBase}
                value={form.paymentMethod}
                onChange={(e) => update("paymentMethod", e.target.value)}
              >
                <option value="">Select method</option>
                {EXPENSE_PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {errors.paymentMethod && (
                <p className="text-[11px] text-red-500 mt-1">{errors.paymentMethod}</p>
              )}
            </div>
          </div>

          {/* Date + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={inputBase}
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
              {errors.date && (
                <p className="text-[11px] text-red-500 mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className={selectBase}
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className={inputBase + " resize-none"}
              placeholder="Optional description…"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={branchesLoading || branches.length === 0}
          >
            {isEdit ? "Update Expense" : "Create Expense"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;
