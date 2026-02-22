"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Zap, Building2 } from "lucide-react";
import type { InvBranch } from "@/types/inventory";
import { MOCK_RECIPES } from "@/lib/inventoryData";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  branches: InvBranch[];
  onSimulate: (branchId: number, menuItemName: string, qty: number) => void;
}

const inp = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";
const sel = inp + " appearance-none cursor-pointer bg-white";

const SimulateOrderModal: React.FC<Props> = ({ isOpen, onClose, branches, onSimulate }) => {
  const [branchId, setBranchId] = useState<number | "">("");
  const [menuItem, setMenuItem] = useState("");
  const [qty, setQty] = useState("1");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { if (isOpen) { setBranchId(""); setMenuItem(""); setQty("1"); setErrors({}); } }, [isOpen]);

  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => { if (isOpen) window.addEventListener("keydown", handleKey); return () => window.removeEventListener("keydown", handleKey); }, [isOpen, handleKey]);

  const selectedRecipe = MOCK_RECIPES.find((r) => r.menuItemName === menuItem);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!branchId) e.branchId = "Select a branch";
    if (!menuItem) e.menuItem = "Select a menu item";
    if (!qty || Number(qty) <= 0) e.qty = "Enter a valid quantity";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = () => {
    if (!validate()) return;
    onSimulate(Number(branchId), menuItem, Number(qty));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center"><Zap size={18} className="text-amber-600" /></div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Simulate Order Deduction</h2>
              <p className="text-[11px] text-gray-400">Test stock reduction from a mock order</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Branch */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Branch <span className="text-red-500">*</span></label>
            <select className={sel} value={branchId} onChange={(e) => setBranchId(Number(e.target.value) || "")}>
              <option value="">Select branch</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            {errors.branchId && <p className="text-[11px] text-red-500 mt-0.5">{errors.branchId}</p>}
          </div>

          {/* Menu Item */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Menu Item <span className="text-red-500">*</span></label>
            <select className={sel} value={menuItem} onChange={(e) => setMenuItem(e.target.value)}>
              <option value="">Select menu item</option>
              {MOCK_RECIPES.map((r) => <option key={r.menuItemName} value={r.menuItemName}>{r.menuItemName}</option>)}
            </select>
            {errors.menuItem && <p className="text-[11px] text-red-500 mt-0.5">{errors.menuItem}</p>}
          </div>

          {/* Qty */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Servings <span className="text-red-500">*</span></label>
            <input type="number" min="1" className={inp} value={qty} onChange={(e) => setQty(e.target.value)} />
            {errors.qty && <p className="text-[11px] text-red-500 mt-0.5">{errors.qty}</p>}
          </div>

          {/* Recipe preview */}
          {selectedRecipe && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Recipe — Ingredients per serving:</h4>
              <div className="space-y-1.5">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{ing.itemName}</span>
                    <span className="font-semibold text-gray-800">{(ing.qtyPerServing * Number(qty || 1)).toFixed(3)} {ing.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer">Cancel</button>
          <button onClick={handle} className="px-5 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 cursor-pointer shadow-sm">
            Deduct Stock
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulateOrderModal;
