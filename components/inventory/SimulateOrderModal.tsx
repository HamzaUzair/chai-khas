"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Zap } from "lucide-react";
import type { InvBranch } from "@/types/inventory";
import { RECIPES } from "@/lib/inventoryData";

const sel =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";
const inp =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (branchId: number, recipeName: string, qty: number) => void;
  branches: InvBranch[];
}

const SimulateOrderModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, branches }) => {
  const [branchId, setBranchId] = useState<number | "">("");
  const [recipe, setRecipe] = useState("");
  const [qty, setQty] = useState("1");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setBranchId("");
    setRecipe("");
    setQty("1");
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

  const selectedRecipe = RECIPES.find((r) => r.menuItemName === recipe);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!branchId) e.branchId = "Required";
    if (!recipe) e.recipe = "Required";
    if (!qty || Number(qty) <= 0) e.qty = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit(Number(branchId), recipe, Number(qty));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Zap size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Simulate Order Deduction</h2>
              <p className="text-[11px] text-gray-400">Demo: deduct stock as if an order was placed</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Branch */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Branch <span className="text-red-500">*</span></label>
            <select className={sel} value={branchId} onChange={(e) => { setBranchId(Number(e.target.value) || ""); setErrors((p) => { const n = {...p}; delete n.branchId; return n; }); }}>
              <option value="">Select branch</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            {errors.branchId && <p className="text-[11px] text-red-500 mt-1">{errors.branchId}</p>}
          </div>

          {/* Menu Item (recipe) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Menu Item <span className="text-red-500">*</span></label>
            <select className={sel} value={recipe} onChange={(e) => { setRecipe(e.target.value); setErrors((p) => { const n = {...p}; delete n.recipe; return n; }); }}>
              <option value="">Select menu item</option>
              {RECIPES.map((r) => <option key={r.menuItemName} value={r.menuItemName}>{r.menuItemName}</option>)}
            </select>
            {errors.recipe && <p className="text-[11px] text-red-500 mt-1">{errors.recipe}</p>}
          </div>

          {/* Recipe preview */}
          {selectedRecipe && (
            <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
              <p className="font-semibold text-gray-700 mb-1.5">Ingredients per serving:</p>
              {selectedRecipe.ingredients.map((ing, i) => (
                <p key={i} className="text-gray-500">
                  • {ing.itemName}: {ing.qty} {ing.unit}
                </p>
              ))}
            </div>
          )}

          {/* Qty */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Servings / Qty <span className="text-red-500">*</span></label>
            <input type="number" min="1" className={inp} value={qty} onChange={(e) => { setQty(e.target.value); setErrors((p) => { const n = {...p}; delete n.qty; return n; }); }} />
            {errors.qty && <p className="text-[11px] text-red-500 mt-1">{errors.qty}</p>}
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
          <button type="submit" onClick={handleSubmit} className="px-5 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors cursor-pointer shadow-sm">Deduct Stock</button>
        </div>
      </div>
    </div>
  );
};

export default SimulateOrderModal;
