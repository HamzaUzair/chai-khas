"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { MenuItem } from "@/types/menu";
import type { InventoryItem, InvUnit } from "@/types/inventory";
import type { RecipeFormData, RecipeFormRow } from "@/types/recipe";

const inputBase =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";
const selectBase = inputBase + " appearance-none cursor-pointer";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RecipeFormData) => void;
  menuItems: MenuItem[];
  inventoryItems: InventoryItem[];
  initialMenuItemId?: number;
  existing?: RecipeFormData | null;
}

const emptyRow = (unit: InvUnit = "kg"): RecipeFormRow => ({
  tempId: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  inventoryItemId: "",
  quantity: "",
  unit,
  wastagePercent: "",
  notes: "",
});

const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  menuItems,
  inventoryItems,
  initialMenuItemId,
  existing,
}) => {
  const [form, setForm] = useState<RecipeFormData>({ menuItemId: "", rows: [emptyRow()] });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!existing;

  useEffect(() => {
    if (!isOpen) return;
    if (existing) {
      setForm(existing);
    } else {
      setForm({
        menuItemId: initialMenuItemId ?? "",
        rows: [emptyRow()],
      });
    }
    setErrors({});
  }, [isOpen, existing, initialMenuItemId]);

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

  const updateRow = (id: string, patch: Partial<RecipeFormRow>) => {
    setForm((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => (r.tempId === id ? { ...r, ...patch } : r)),
    }));
  };

  const addRow = () => {
    setForm((prev) => ({ ...prev, rows: [...prev.rows, emptyRow()] }));
  };

  const removeRow = (id: string) => {
    setForm((prev) => ({
      ...prev,
      rows: prev.rows.length <= 1 ? prev.rows : prev.rows.filter((r) => r.tempId !== id),
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.menuItemId) e.menuItemId = "Select a menu item";
    const validRows = form.rows.filter(
      (r) => r.inventoryItemId && r.quantity && Number(r.quantity) > 0
    );
    if (validRows.length === 0) e.rows = "Add at least one valid ingredient row";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-[#ff5a1f] rounded-full" />
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {isEdit ? "Edit Recipe Mapping" : "Add Recipe Mapping"}
              </h2>
              <p className="text-[11px] text-gray-400">
                Define ingredients and quantities used per serving for this menu item.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Menu item select */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Menu Item <span className="text-red-500">*</span>
            </label>
            <select
              className={selectBase}
              value={form.menuItemId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  menuItemId: e.target.value ? Number(e.target.value) : "",
                }))
              }
            >
              <option value="">Select menu item</option>
              {menuItems.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.branchName}
                </option>
              ))}
            </select>
            {errors.menuItemId && (
              <p className="text-[11px] text-red-500 mt-1">{errors.menuItemId}</p>
            )}
          </div>

          {/* Ingredient rows */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Ingredients
              </h3>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff5a1f]/10 text-[#ff5a1f] text-xs font-semibold hover:bg-[#ff5a1f]/20 cursor-pointer"
              >
                <Plus size={14} />
                Add ingredient
              </button>
            </div>
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
              {form.rows.map((row) => (
                <div key={row.tempId} className="grid grid-cols-12 gap-3 p-3 items-start">
                  {/* Inventory item */}
                  <div className="col-span-4">
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                      Inventory Item
                    </label>
                    <select
                      className={selectBase}
                      value={row.inventoryItemId}
                      onChange={(e) =>
                        updateRow(row.tempId, { inventoryItemId: e.target.value })
                      }
                    >
                      <option value="">Select ingredient</option>
                      {inventoryItems.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} — {i.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-3">
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                      Quantity per serving
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      className={inputBase}
                      value={row.quantity}
                      onChange={(e) => updateRow(row.tempId, { quantity: e.target.value })}
                    />
                  </div>

                  {/* Unit (read-only from inventory) */}
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      className={inputBase + " bg-gray-50 cursor-not-allowed"}
                      value={
                        inventoryItems.find((i) => i.id === row.inventoryItemId)?.unit ?? row.unit
                      }
                      readOnly
                    />
                  </div>

                  {/* Wastage */}
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                      Wastage % (optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className={inputBase}
                      value={row.wastagePercent}
                      onChange={(e) =>
                        updateRow(row.tempId, { wastagePercent: e.target.value })
                      }
                    />
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 flex items-center justify-end pt-5">
                    <button
                      type="button"
                      onClick={() => removeRow(row.tempId)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      aria-label="Remove ingredient"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Notes (full-width row) */}
                  <div className="col-span-12">
                    <textarea
                      rows={2}
                      className={inputBase + " mt-1 text-xs"}
                      placeholder="Notes / instructions (optional)"
                      value={row.notes}
                      onChange={(e) => updateRow(row.tempId, { notes: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
            {errors.rows && <p className="text-[11px] text-red-500 mt-1">{errors.rows}</p>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] cursor-pointer shadow-sm"
            >
              {isEdit ? "Save Changes" : "Save Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeModal;

