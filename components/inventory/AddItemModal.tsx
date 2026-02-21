"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Package, Loader2 } from "lucide-react";
import type {
  InventoryItem,
  InventoryItemFormData,
  InvBranch,
} from "@/types/inventory";
import { INV_CATEGORIES, INV_UNITS } from "@/types/inventory";

const emptyForm: InventoryItemFormData = {
  name: "",
  sku: "",
  category: "",
  branchId: "",
  unit: "",
  stock: "",
  minStock: "",
  costPerUnit: "",
  supplier: "",
  notes: "",
  status: "Active",
};

const inp =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";
const sel =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InventoryItemFormData) => void;
  editItem?: InventoryItem | null;
  branches: InvBranch[];
  branchesLoading: boolean;
  autoSku: string;
}

const AddItemModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  branches,
  branchesLoading,
  autoSku,
}) => {
  const [form, setForm] = useState<InventoryItemFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEdit = !!editItem;

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        sku: editItem.sku,
        category: editItem.category,
        branchId: editItem.branchId,
        unit: editItem.unit,
        stock: String(editItem.stock),
        minStock: String(editItem.minStock),
        costPerUnit: String(editItem.costPerUnit),
        supplier: editItem.supplier,
        notes: editItem.notes,
        status: editItem.status,
      });
    } else {
      setForm({ ...emptyForm, sku: autoSku });
    }
    setErrors({});
  }, [editItem, isOpen, autoSku]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );
  useEffect(() => {
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  const update = (key: keyof InventoryItemFormData, value: string | number) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.category) e.category = "Required";
    if (!form.branchId) e.branchId = "Required";
    if (!form.unit) e.unit = "Required";
    if (!form.stock || Number(form.stock) < 0) e.stock = "Required";
    if (!form.minStock || Number(form.minStock) < 0) e.minStock = "Required";
    if (!form.costPerUnit || Number(form.costPerUnit) <= 0) e.costPerUnit = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
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
              <Package size={18} className="text-[#ff5a1f]" />
            </div>
            <h2 className="text-base font-bold text-gray-800">
              {isEdit ? "Edit Inventory Item" : "Add Inventory Item"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer" aria-label="Close"><X size={20} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Name + SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Item Name <span className="text-red-500">*</span></label>
              <input type="text" className={inp} placeholder="e.g. Chicken" value={form.name} onChange={(e) => update("name", e.target.value)} />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
              <input type="text" className={inp} placeholder="Auto-generated" value={form.sku} onChange={(e) => update("sku", e.target.value)} />
            </div>
          </div>

          {/* Category + Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select className={sel} value={form.category} onChange={(e) => update("category", e.target.value)}>
                <option value="">Select category</option>
                {INV_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-[11px] text-red-500 mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Branch <span className="text-red-500">*</span></label>
              {branchesLoading ? (
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50">
                  <Loader2 size={14} className="animate-spin" /> Loading…
                </div>
              ) : (
                <select className={sel} value={form.branchId} onChange={(e) => update("branchId", Number(e.target.value) || "")} disabled={branches.length === 0}>
                  <option value="">Select branch</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}
              {errors.branchId && <p className="text-[11px] text-red-500 mt-1">{errors.branchId}</p>}
            </div>
          </div>

          {/* Unit + Starting Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit <span className="text-red-500">*</span></label>
              <select className={sel} value={form.unit} onChange={(e) => update("unit", e.target.value)}>
                <option value="">Select</option>
                {INV_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              {errors.unit && <p className="text-[11px] text-red-500 mt-1">{errors.unit}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{isEdit ? "Stock" : "Starting Stock"} <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="0.01" className={inp} value={form.stock} onChange={(e) => update("stock", e.target.value)} />
              {errors.stock && <p className="text-[11px] text-red-500 mt-1">{errors.stock}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Stock Alert <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="0.01" className={inp} value={form.minStock} onChange={(e) => update("minStock", e.target.value)} />
              {errors.minStock && <p className="text-[11px] text-red-500 mt-1">{errors.minStock}</p>}
            </div>
          </div>

          {/* Cost + Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cost per Unit (PKR) <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="0.01" className={inp} value={form.costPerUnit} onChange={(e) => update("costPerUnit", e.target.value)} />
              {errors.costPerUnit && <p className="text-[11px] text-red-500 mt-1">{errors.costPerUnit}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Supplier</label>
              <input type="text" className={inp} placeholder="Optional" value={form.supplier} onChange={(e) => update("supplier", e.target.value)} />
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select className={sel} value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} className={inp + " resize-none"} placeholder="Optional notes…" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={branchesLoading || branches.length === 0}>
            {isEdit ? "Update Item" : "Create Item"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
