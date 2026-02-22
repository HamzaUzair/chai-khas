"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, ArrowDownCircle } from "lucide-react";
import type { InventoryItem, StockInFormData } from "@/types/inventory";

const emptyForm: StockInFormData = {
  itemId: "",
  qty: "",
  purchaseCost: "",
  supplier: "",
  invoiceNo: "",
  dateReceived: new Date().toISOString().slice(0, 10),
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StockInFormData) => void;
  items: InventoryItem[];
}

const inp = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";
const sel = inp + " appearance-none cursor-pointer bg-white";

const StockInModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, items }) => {
  const [form, setForm] = useState<StockInFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { if (isOpen) { setForm(emptyForm); setErrors({}); } }, [isOpen]);

  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => { if (isOpen) window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey); }, [isOpen, handleKey]);

  const upd = (key: keyof StockInFormData, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.itemId) e.itemId = "Select an item";
    if (!form.qty || Number(form.qty) <= 0) e.qty = "Enter a valid quantity";
    if (!form.dateReceived) e.dateReceived = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = (e: React.FormEvent) => { e.preventDefault(); if (validate()) onSubmit(form); };

  const selectedItem = items.find((i) => i.id === form.itemId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center"><ArrowDownCircle size={18} className="text-green-600 rotate-180" /></div>
            <h2 className="text-base font-bold text-gray-800">Stock In (Receiving)</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"><X size={20} /></button>
        </div>

        <form onSubmit={handle} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Select Item */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Select Item <span className="text-red-500">*</span></label>
            <select className={sel} value={form.itemId} onChange={(e) => upd("itemId", e.target.value)}>
              <option value="">— Choose item —</option>
              {items.filter((i) => i.status === "Active").map((i) => <option key={i.id} value={i.id}>{i.name} ({i.branchName}) — {i.inStock} {i.unit}</option>)}
            </select>
            {errors.itemId && <p className="text-[11px] text-red-500 mt-0.5">{errors.itemId}</p>}
          </div>

          {selectedItem && (
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
              Branch: <span className="font-semibold text-gray-700">{selectedItem.branchName}</span> · Current stock: <span className="font-semibold text-gray-700">{selectedItem.inStock} {selectedItem.unit}</span>
            </div>
          )}

          {/* Qty + Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity Received <span className="text-red-500">*</span></label>
              <input type="number" min="0.01" step="0.01" className={inp} placeholder="0" value={form.qty} onChange={(e) => upd("qty", e.target.value)} />
              {errors.qty && <p className="text-[11px] text-red-500 mt-0.5">{errors.qty}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Purchase Cost (PKR)</label>
              <input type="number" min="0" step="0.01" className={inp} placeholder="0" value={form.purchaseCost} onChange={(e) => upd("purchaseCost", e.target.value)} />
            </div>
          </div>

          {/* Supplier + Invoice */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Supplier</label>
              <input className={inp} placeholder="Optional" value={form.supplier} onChange={(e) => upd("supplier", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Invoice No</label>
              <input className={inp} placeholder="Optional" value={form.invoiceNo} onChange={(e) => upd("invoiceNo", e.target.value)} />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date Received <span className="text-red-500">*</span></label>
            <input type="date" className={inp} value={form.dateReceived} onChange={(e) => upd("dateReceived", e.target.value)} />
            {errors.dateReceived && <p className="text-[11px] text-red-500 mt-0.5">{errors.dateReceived}</p>}
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer">Cancel</button>
          <button type="submit" onClick={handle} className="px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 cursor-pointer shadow-sm">Receive Stock</button>
        </div>
      </div>
    </div>
  );
};

export default StockInModal;
