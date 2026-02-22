"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import type { InventoryItem, AdjustFormData } from "@/types/inventory";
import { ADJUST_REASONS } from "@/types/inventory";

const emptyForm: AdjustFormData = { type: "Decrease", qty: "", reason: "", notes: "" };

interface Props {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onSubmit: (data: AdjustFormData) => void;
}

const inp = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";
const sel = inp + " appearance-none cursor-pointer bg-white";

const AdjustStockModal: React.FC<Props> = ({ isOpen, item, onClose, onSubmit }) => {
  const [form, setForm] = useState<AdjustFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { if (isOpen) { setForm(emptyForm); setErrors({}); } }, [isOpen]);

  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => { if (isOpen) window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey); }, [isOpen, handleKey]);

  const upd = (key: keyof AdjustFormData, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.qty || Number(form.qty) <= 0) e.qty = "Enter a valid quantity";
    if (!form.reason) e.reason = "Select a reason";
    if (form.type === "Decrease" && item && Number(form.qty) > item.inStock) e.qty = "Cannot exceed current stock";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = (e: React.FormEvent) => { e.preventDefault(); if (validate()) onSubmit(form); };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center"><SlidersHorizontal size={18} className="text-purple-600" /></div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Adjust Stock</h2>
              <p className="text-[11px] text-gray-400">{item.name} · {item.inStock} {item.unit} in stock</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"><X size={20} /></button>
        </div>

        <form onSubmit={handle} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Adjustment Type</label>
            <div className="flex gap-3">
              {(["Increase", "Decrease"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => upd("type", t)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
                    form.type === t
                      ? t === "Increase" ? "bg-green-50 border-green-300 text-green-700" : "bg-red-50 border-red-300 text-red-700"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Quantity <span className="text-red-500">*</span></label>
            <input type="number" min="0.01" step="0.01" className={inp} placeholder="0" value={form.qty} onChange={(e) => upd("qty", e.target.value)} />
            {errors.qty && <p className="text-[11px] text-red-500 mt-0.5">{errors.qty}</p>}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
            <select className={sel} value={form.reason} onChange={(e) => upd("reason", e.target.value)}>
              <option value="">Select reason</option>
              {ADJUST_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.reason && <p className="text-[11px] text-red-500 mt-0.5">{errors.reason}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} className={inp + " resize-none"} placeholder="Optional notes…" value={form.notes} onChange={(e) => upd("notes", e.target.value)} />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer">Cancel</button>
          <button type="submit" onClick={handle} className="px-5 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 cursor-pointer shadow-sm">Apply Adjustment</button>
        </div>
      </div>
    </div>
  );
};

export default AdjustStockModal;
