"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import type {
  InventoryItem,
  AdjustStockFormData,
  AdjustmentReason,
} from "@/types/inventory";
import { ADJUSTMENT_REASONS } from "@/types/inventory";

const inp =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";
const sel =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";

const emptyForm: AdjustStockFormData = {
  type: "Decrease",
  qty: "",
  reason: "",
  notes: "",
};

interface Props {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onSubmit: (item: InventoryItem, data: AdjustStockFormData) => void;
}

const AdjustStockModal: React.FC<Props> = ({ isOpen, item, onClose, onSubmit }) => {
  const [form, setForm] = useState<AdjustStockFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(emptyForm);
    setErrors({});
  }, [isOpen]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );
  useEffect(() => {
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  const update = (key: keyof AdjustStockFormData, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.qty || Number(form.qty) <= 0) e.qty = "Required";
    if (!form.reason) e.reason = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!item || !validate()) return;
    onSubmit(item, form);
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <SlidersHorizontal size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Adjust Stock</h2>
              <p className="text-[11px] text-gray-400">{item.name} — {item.stock} {item.unit} in stock</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Adjustment Type</label>
            <div className="flex gap-2">
              {(["Increase", "Decrease"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update("type", t)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    form.type === t
                      ? t === "Increase"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Quantity ({item.unit}) <span className="text-red-500">*</span></label>
            <input type="number" min="0.01" step="0.01" className={inp} value={form.qty} onChange={(e) => update("qty", e.target.value)} />
            {errors.qty && <p className="text-[11px] text-red-500 mt-1">{errors.qty}</p>}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
            <select className={sel} value={form.reason} onChange={(e) => update("reason", e.target.value)}>
              <option value="">Select reason</option>
              {ADJUSTMENT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.reason && <p className="text-[11px] text-red-500 mt-1">{errors.reason}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} className={inp + " resize-none"} placeholder="Optional…" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-sm">Apply Adjustment</button>
        </div>
      </div>
    </div>
  );
};

export default AdjustStockModal;
