"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import type { Branch } from "@/types/branch";
import type { MenuItem, MenuItemFormData } from "@/types/menu";
import type { ApiCategory } from "@/types/category";
import { apiFetch } from "@/lib/auth-client";

const emptyForm: MenuItemFormData = {
  name: "",
  description: "",
  branchId: "",
  categoryName: "",
  hasVariations: false,
  basePrice: "",
  variations: [{ name: "", price: "" }],
  status: "active",
};

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MenuItemFormData) => Promise<void>;
  editItem?: MenuItem | null;
  activeBranches: Branch[];
  branchesLoading: boolean;
  /**
   * When set, the branch selector is hidden and the form auto-scopes to this
   * branch. Used for single-branch tenants and branch-pinned roles where the
   * tenant has exactly one operational branch.
   */
  lockedBranchId?: number | null;
}

const inputBase =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
  activeBranches,
  branchesLoading,
  lockedBranchId = null,
}) => {
  const branchLocked = lockedBranchId !== null;
  const [form, setForm] = useState<MenuItemFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof MenuItemFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const isEditing = !!editItem;

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setForm({
          name: editItem.name,
          description: editItem.description ?? "",
          branchId: editItem.branchId,
          categoryName: editItem.categoryName,
          hasVariations: editItem.hasVariations,
          basePrice: editItem.basePrice === null ? "" : String(editItem.basePrice),
          variations:
            editItem.variations.length > 0
              ? editItem.variations.map((v) => ({
                  name: v.name,
                  price: String(v.price),
                }))
              : [{ name: "", price: "" }],
          status: editItem.status,
        });
      } else {
        setForm({
          ...emptyForm,
          branchId: lockedBranchId ?? "",
        });
      }
      setErrors({});
    }
  }, [isOpen, editItem, lockedBranchId]);

  useEffect(() => {
    if (!isOpen) return;
    if (!form.branchId) {
      setCategories([]);
      return;
    }

    const run = async () => {
      setCategoriesLoading(true);
      try {
        const res = await apiFetch(`/api/categories?branch_id=${form.branchId}`);
        if (!res.ok) throw new Error();
        const data: ApiCategory[] = await res.json();
        const names = Array.from(
          new Set(
            data
              .map((c) => c.name)
              .filter((n) => n.trim().length > 0)
          )
        ).sort((a, b) => a.localeCompare(b));
        setCategories(names);
      } catch {
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    run();
  }, [isOpen, form.branchId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    },
    [onClose, submitting]
  );
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const update = <K extends keyof MenuItemFormData>(
    field: K,
    value: MenuItemFormData[K]
  ) => {
    setForm((p) => {
      const next = { ...p, [field]: value };
      if (field === "branchId" && value !== p.branchId) {
        next.categoryName = "";
      }
      if (field === "hasVariations" && value === false) {
        next.variations = [{ name: "", price: "" }];
      }
      return next;
    });
  };

  const updateVariation = (
    idx: number,
    field: "name" | "price",
    value: string
  ) => {
    setForm((prev) => {
      const next = [...prev.variations];
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, variations: next };
    });
  };

  const addVariation = () => {
    setForm((prev) => ({
      ...prev,
      variations: [...prev.variations, { name: "", price: "" }],
    }));
  };

  const removeVariation = (idx: number) => {
    setForm((prev) => {
      const next = prev.variations.filter((_, i) => i !== idx);
      return {
        ...prev,
        variations: next.length > 0 ? next : [{ name: "", price: "" }],
      };
    });
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof MenuItemFormData, string>> = {};
    if (!form.name.trim()) e.name = "Item name is required";
    if (form.branchId === "") e.branchId = "Branch is required";
    if (!form.categoryName.trim()) e.categoryName = "Category is required";
    if (!form.hasVariations) {
      const price = parseFloat(form.basePrice);
      if (!form.basePrice || isNaN(price) || price < 0) {
        e.basePrice = "Valid price is required";
      }
    } else {
      const filledRows = form.variations.filter(
        (v) => v.name.trim().length > 0 || v.price.trim().length > 0
      );
      if (filledRows.length === 0) {
        e.variations = "At least one variation is required";
      } else {
        const hasInvalid = filledRows.some((v) => {
          const p = parseFloat(v.price);
          return !v.name.trim() || !v.price.trim() || isNaN(p) || p < 0;
        });
        if (hasInvalid) {
          e.variations = "Each variation needs a name and valid price";
        } else {
          const names = filledRows.map((v) => v.name.trim().toLowerCase());
          if (new Set(names).size !== names.length) {
            e.variations = "Duplicate variation names are not allowed";
          }
        }
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSave(form);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={submitting ? undefined : onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-[#ff5a1f] rounded-full" />
            <h2 className="text-lg font-bold text-gray-800">
              {isEditing ? "Edit Menu Item" : "Add New Menu Item"}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`${inputBase} ${errors.name ? "border-red-400 ring-2 ring-red-100" : ""}`}
              placeholder="e.g., Chicken Tikka"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <input
              type="text"
              className={inputBase}
              placeholder="Brief description of the item"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          {!branchLocked && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                className={`${inputBase} appearance-none bg-white cursor-pointer ${
                  errors.branchId ? "border-red-400 ring-2 ring-red-100" : ""
                }`}
                value={form.branchId}
                onChange={(e) => {
                  const val = e.target.value;
                  update("branchId", val === "" ? "" : Number(val));
                }}
                disabled={branchesLoading || activeBranches.length === 0}
              >
                {branchesLoading ? (
                  <option value="">Loading branches…</option>
                ) : activeBranches.length === 0 ? (
                  <option value="">No active branches</option>
                ) : (
                  <>
                    <option value="">Select a branch</option>
                    {activeBranches.map((b) => (
                      <option key={b.branch_id} value={b.branch_id}>
                        {b.branch_name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {errors.branchId && (
                <p className="text-xs text-red-500 mt-1">{errors.branchId}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              className={`${inputBase} appearance-none bg-white cursor-pointer ${
                errors.categoryName ? "border-red-400 ring-2 ring-red-100" : ""
              }`}
              value={form.categoryName}
              onChange={(e) => update("categoryName", e.target.value)}
              disabled={!form.branchId || categoriesLoading || categories.length === 0}
            >
              <option value="">
                {!form.branchId
                  ? branchLocked
                    ? "Loading..."
                    : "Select branch first"
                  : categoriesLoading
                  ? "Loading categories..."
                  : categories.length === 0
                  ? "No categories available. Please create a category first."
                  : "Select a category"}
              </option>
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {errors.categoryName && (
              <p className="text-xs text-red-500 mt-1">{errors.categoryName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Has Variations
            </label>
            <select
              className={`${inputBase} appearance-none bg-white cursor-pointer`}
              value={form.hasVariations ? "yes" : "no"}
              onChange={(e) => update("hasVariations", e.target.value === "yes")}
            >
              <option value="no">No (single price)</option>
              <option value="yes">Yes (multiple variations)</option>
            </select>
          </div>

          {!form.hasVariations ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Price (PKR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={`${inputBase} ${errors.basePrice ? "border-red-400 ring-2 ring-red-100" : ""}`}
              placeholder="0"
              value={form.basePrice}
              onChange={(e) => update("basePrice", e.target.value)}
            />
            {errors.basePrice && (
              <p className="text-xs text-red-500 mt-1">{errors.basePrice}</p>
            )}
          </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Variations <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addVariation}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#ff5a1f]/10 text-[#ff5a1f] text-xs font-semibold hover:bg-[#ff5a1f]/20 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  Add Variation
                </button>
              </div>

              {form.variations.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    placeholder={idx === 0 ? "Small" : idx === 1 ? "Medium" : idx === 2 ? "Large" : "Variation name"}
                    className={`${inputBase} col-span-7`}
                    value={row.name}
                    onChange={(e) => updateVariation(idx, "name", e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    className={`${inputBase} col-span-4`}
                    value={row.price}
                    onChange={(e) => updateVariation(idx, "price", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeVariation(idx)}
                    className="col-span-1 p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove variation"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}

              {errors.variations && (
                <p className="text-xs text-red-500">{errors.variations}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <select
              className={`${inputBase} appearance-none bg-white cursor-pointer`}
              value={form.status}
              onChange={(e) =>
                update("status", e.target.value as "active" | "inactive")
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {isEditing ? "Save Changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemModal;
