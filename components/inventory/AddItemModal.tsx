"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Package, Loader2 } from "lucide-react";
import type { InventoryItem, InvBranch, AddItemFormData } from "@/types/inventory";
import { INV_CATEGORIES, INV_UNITS } from "@/types/inventory";

const emptyForm: AddItemFormData = {
  name: "",
  sku: "",
  category: "",
  branchId: "",
  unit: "",
  inStock: "",
  minStock: "",
  costPerUnit: "",
  supplier: "",
  notes: "",
  status: "Active",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddItemFormData) => void;
  editItem?: InventoryItem | null;
  branches: InvBranch[];
  branchesLoading: boolean;
}

const inp = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";
const sel = inp + " appearance-none cursor-pointer bg-white";

const AddItemModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, editItem, branches, branchesLoading }) => {
  const [form, setForm] = useState<AddItemFormData>(emptyForm);
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
        inStock: String(editItem.inStock),
        minStock: String(editItem.minStock),
        costPerUnit: String(editItem.costPerUnit),
        supplier: editItem.supplier,
        notes: editItem.notes,
        status: editItem.status,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [editItem, isOpen]);

  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => { if (isOpen) window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey); }, [isOpen, handleKey]);

  const upd = (key: keyof AddItemFormData, value: string | number) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.category) e.category = "Required";
    if (!form.branchId) e.branchId = "Required";
    if (!form.unit) e.unit = "Required";
    if (!form.inStock || Number(form.inStock) < 0) e.inStock = "Required";
    if (!form.minStock || Number(form.minStock) < 0) e.minStock = "Required";
    if (!form.costPerUnit || Number(form.costPerUnit) <= 0) e.costPerUnit = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = (e: React.FormEvent) => { e.preventDefault(); if (validate()) onSubmit(form); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center"><Package size={18} className="text-[#ff5a1f]" /></div>
            <h2 className="text-base font-bold text-gray-800">{isEdit ? "Edit Item" : "Add Inventory Item"}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer" aria-label="Close"><X size={20} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handle} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Name + SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Item Name <span className="text-red-500">*</span></label>
              <input className={inp} placeholder="e.g. Chicken Breast" value={form.name} onChange={(e) => upd("name", e.target.value)} />
              {errors.name && <p className="text-[11px] text-red-500 mt-0.5">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SKU <span className="text-[10px] text-gray-400">(auto if empty)</span></label>
              <input className={inp} placeholder="MEA-0001" value={form.sku} onChange={(e) => upd("sku", e.target.value)} />
            </div>
          </div>

          {/* Category + Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select className={sel} value={form.category} onChange={(e) => upd("category", e.target.value)}>
                <option value="">Select category</option>
                {INV_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-[11px] text-red-500 mt-0.5">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Branch <span className="text-red-500">*</span></label>
              {branchesLoading ? (
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-gray-50"><Loader2 size={14} className="animate-spin" /> Loading…</div>
              ) : (
                <select className={sel} value={form.branchId} onChange={(e) => upd("branchId", Number(e.target.value) || "")} disabled={branches.length === 0}>
                  <option value="">Select branch</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}
              {errors.branchId && <p className="text-[11px] text-red-500 mt-0.5">{errors.branchId}</p>}
            </div>
          </div>

          {/* Unit + Starting Stock + Min Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit <span className="text-red-500">*</span></label>
              <select className={sel} value={form.unit} onChange={(e) => upd("unit", e.target.value)}>
                <option value="">Select unit</option>
                {INV_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              {errors.unit && <p className="text-[11px] text-red-500 mt-0.5">{errors.unit}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Starting Stock <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="0.01" className={inp} placeholder="0" value={form.inStock} onChange={(e) => upd("inStock", e.target.value)} />
              {errors.inStock && <p className="text-[11px] text-red-500 mt-0.5">{errors.inStock}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Stock Alert <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="0.01" className={inp} placeholder="0" value={form.minStock} onChange={(e) => upd("minStock", e.target.value)} />
              {errors.minStock && <p className="text-[11px] text-red-500 mt-0.5">{errors.minStock}</p>}
            </div>
          </div>

          {/* Cost + Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cost per Unit (PKR) <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="0.01" className={inp} placeholder="0" value={form.costPerUnit} onChange={(e) => upd("costPerUnit", e.target.value)} />
              {errors.costPerUnit && <p className="text-[11px] text-red-500 mt-0.5">{errors.costPerUnit}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Supplier</label>
              <input className={inp} placeholder="e.g. PK Meats" value={form.supplier} onChange={(e) => upd("supplier", e.target.value)} />
            </div>
          </div>

          {/* Status + Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select className={sel} value={form.status} onChange={(e) => upd("status", e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <input className={inp} placeholder="Optional notes" value={form.notes} onChange={(e) => upd("notes", e.target.value)} />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors">Cancel</button>
          <button type="submit" onClick={handle} disabled={branchesLoading || branches.length === 0} className="px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] cursor-pointer shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isEdit ? "Update Item" : "Create Item"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
