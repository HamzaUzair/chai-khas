 "use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, X } from "lucide-react";
 import type { Branch } from "@/types/branch";
 import type { Deal, DealFormData, DealFormDataItem } from "@/types/deal";
import { apiFetch } from "@/lib/auth-client";

 interface DealModalProps {
   isOpen: boolean;
   onClose: () => void;
  onSave: (data: DealFormData) => void | Promise<void>;
   editDeal?: Deal | null;
   branches: Branch[];
   branchesLoading: boolean;
 }

 const inputBase =
   "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";

 const DealModal: React.FC<DealModalProps> = ({
   isOpen,
   onClose,
   onSave,
   editDeal,
   branches,
   branchesLoading,
 }) => {
  type ApiCategory = {
    category_id: number;
    name: string;
    branch_id: number;
  };

  type ApiMenuVariation = {
    name: string;
    price: number;
  };

  type ApiMenuRow = {
    id: number;
    itemName: string;
    category: string;
    price: number;
    hasVariations: boolean;
    variations: ApiMenuVariation[];
    status: "active" | "inactive";
  };

  type MenuOption = {
    id: string;
    name: string;
    category: string;
    price: number;
    hasVariations: boolean;
    variations: ApiMenuVariation[];
  };

   const [form, setForm] = useState<DealFormData>({
     name: "",
     type: "",
     branchId: "",
     description: "",
     status: "active",
     price: "",
     items: [],
   });
   const [errors, setErrors] = useState<Partial<Record<keyof DealFormData, string>>>(
     {}
   );
  const [menuGroups, setMenuGroups] = useState<
    Array<{ category: string; items: MenuOption[] }>
  >([]);
  const [loadingMenuOptions, setLoadingMenuOptions] = useState(false);
  const [menuOptionsError, setMenuOptionsError] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

   const isEditing = !!editDeal;

   useEffect(() => {
     if (!isOpen) return;
     if (editDeal) {
       const items: DealFormDataItem[] = editDeal.items.map((i) => ({
         id: i.id,
         name: i.name,
         quantity: i.quantity,
       }));
       setForm({
         name: editDeal.name,
         type: editDeal.type,
         branchId: editDeal.branchId,
         description: editDeal.description ?? "",
         status: editDeal.status,
         price: String(editDeal.price),
         items,
       });
     } else {
       setForm({
         name: "",
         type: "",
         branchId: branches[0]?.branch_id ?? "",
         description: "",
         status: "active",
         price: "",
         items: [],
       });
     }
     setErrors({});
   }, [isOpen, editDeal, branches]);

  const selectedById = useMemo(
    () => new Map(form.items.map((item) => [item.id, item])),
    [form.items]
  );

  useEffect(() => {
    if (!isOpen) return;
    if (typeof form.branchId !== "number") {
      setMenuGroups([]);
      setMenuOptionsError("");
      return;
    }

    let cancelled = false;
    const loadMenuOptions = async () => {
      setLoadingMenuOptions(true);
      setMenuOptionsError("");
      try {
        const [categoriesRes, menuRes] = await Promise.all([
          apiFetch(`/api/categories?branch_id=${form.branchId}`),
          apiFetch(`/api/menu?branchId=${form.branchId}&status=active`),
        ]);

        if (!categoriesRes.ok || !menuRes.ok) {
          throw new Error("Failed to load menu options");
        }

        const categories: ApiCategory[] = await categoriesRes.json();
        const menuRows: ApiMenuRow[] = await menuRes.json();
        const activeMenuRows = menuRows.filter((m) => m.status === "active");

        const itemsByCategory = new Map<string, MenuOption[]>();
        for (const row of activeMenuRows) {
          const existing = itemsByCategory.get(row.category) ?? [];
          existing.push({
            id: String(row.id),
            name: row.itemName,
            category: row.category,
            price: Number(row.price),
            hasVariations: row.hasVariations,
            variations: row.variations ?? [],
          });
          itemsByCategory.set(row.category, existing);
        }

        const categoryOrder = categories
          .map((c) => c.name)
          .filter((name, idx, arr) => arr.indexOf(name) === idx);

        const groups = categoryOrder
          .map((category) => ({
            category,
            items: (itemsByCategory.get(category) ?? []).sort((a, b) =>
              a.name.localeCompare(b.name)
            ),
          }))
          .filter((g) => g.items.length > 0);

        if (cancelled) return;

        setMenuGroups(groups);
        setExpandedCategories((prev) => {
          const next: Record<string, boolean> = {};
          for (const group of groups) {
            next[group.category] = prev[group.category] ?? true;
          }
          return next;
        });

        const optionsById = new Map(
          groups.flatMap((g) => g.items.map((item) => [item.id, item] as const))
        );
        const optionsByName = new Map(
          groups.flatMap((g) =>
            g.items.map((item) => [item.name.toLowerCase(), item] as const)
          )
        );

        setForm((prev) => {
          const normalized = prev.items
            .map((item) => {
              const byId = optionsById.get(item.id);
              const byName = optionsByName.get(item.name.toLowerCase());
              const resolved = byId ?? byName;
              if (!resolved) return null;
              return {
                id: resolved.id,
                name: resolved.name,
                quantity: Math.max(1, item.quantity || 1),
              };
            })
            .filter((item): item is DealFormDataItem => item !== null);

          return { ...prev, items: normalized };
        });
      } catch (error) {
        if (cancelled) return;
        console.error("Error fetching menu options for deal form:", error);
        setMenuGroups([]);
        setMenuOptionsError("Failed to load active menu items for this branch.");
      } finally {
        if (!cancelled) setLoadingMenuOptions(false);
      }
    };

    loadMenuOptions();
    return () => {
      cancelled = true;
    };
  }, [isOpen, form.branchId]);

   const toggleItem = (id: string, name: string) => {
     setForm((prev) => {
       const exists = prev.items.find((i) => i.id === id);
       if (exists) {
         return { ...prev, items: prev.items.filter((i) => i.id !== id) };
       }
       return {
         ...prev,
         items: [...prev.items, { id, name, quantity: 1 }],
       };
     });
   };

   const updateItemQty = (id: string, quantity: number) => {
     setForm((prev) => ({
       ...prev,
       items: prev.items.map((i) =>
         i.id === id ? { ...i, quantity: Math.max(1, quantity || 1) } : i
       ),
     }));
   };

  const toggleCategoryExpanded = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

   const validate = (): boolean => {
     const e: Partial<Record<keyof DealFormData, string>> = {};
     if (!form.name.trim()) e.name = "Deal name is required";
     if (!form.type.trim()) e.type = "Deal type is required";
     if (form.branchId === "") e.branchId = "Branch is required";
     if (!form.price || isNaN(Number(form.price))) {
       e.price = "Valid price is required";
     } else if (Number(form.price) < 0) {
       e.price = "Price must be zero or greater";
     }
     if (form.items.length === 0) {
       e.items = "Select at least one menu item";
     }
     setErrors(e);
     return Object.keys(e).length === 0;
   };

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!validate()) return;
    try {
      setSubmitting(true);
      await onSave(form);
    } finally {
      setSubmitting(false);
    }
   };

   if (!isOpen) return null;

   return (
     <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
       <div className="fixed inset-0 bg-black/40" onClick={onClose} />
       <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10">
         {/* Header */}
         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
           <h2 className="text-lg font-bold text-gray-800">
             {isEditing ? "Edit Deal" : "Add Deal"}
           </h2>
           <button
             onClick={onClose}
             className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
           >
             <X size={18} />
           </button>
         </div>

         {/* Body */}
         <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
           {errors.name && (
             <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
               {errors.name}
             </p>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Deal name */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Deal Name <span className="text-red-500">*</span>
               </label>
               <input
                 type="text"
                 className={inputBase}
                 value={form.name}
                 onChange={(e) =>
                   setForm((p) => ({ ...p, name: e.target.value }))
                 }
                 placeholder="e.g. Family Deal"
               />
             </div>

             {/* Deal type */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Deal Type <span className="text-red-500">*</span>
               </label>
               <input
                 type="text"
                 className={inputBase}
                 value={form.type}
                 onChange={(e) =>
                   setForm((p) => ({ ...p, type: e.target.value }))
                 }
                 placeholder="e.g. Combo, Student, Family"
               />
             </div>

             {/* Branch */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Branch <span className="text-red-500">*</span>
               </label>
               <select
                 className={inputBase}
                 value={form.branchId}
                 onChange={(e) =>
                   setForm((p) => ({
                     ...p,
                     branchId: e.target.value === "" ? "" : Number(e.target.value),
                   }))
                 }
                 disabled={branchesLoading || branches.length === 0}
               >
                 {branchesLoading ? (
                   <option value="">Loading branches…</option>
                 ) : branches.length === 0 ? (
                   <option value="">No active branches</option>
                 ) : (
                   <>
                     <option value="">Select a branch</option>
                     {branches.map((b) => (
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

             {/* Price */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Deal Price (PKR) <span className="text-red-500">*</span>
               </label>
               <input
                 type="number"
                 min="0"
                 step="0.01"
                 className={inputBase}
                 value={form.price}
                 onChange={(e) =>
                   setForm((p) => ({ ...p, price: e.target.value }))
                 }
                 placeholder="0"
               />
               {errors.price && (
                 <p className="text-xs text-red-500 mt-1">{errors.price}</p>
               )}
             </div>
           </div>

           {/* Description */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Description
             </label>
             <textarea
               rows={3}
               className={`${inputBase} resize-none`}
               value={form.description}
               onChange={(e) =>
                 setForm((p) => ({ ...p, description: e.target.value }))
               }
               placeholder="Short description of the deal"
             />
           </div>

           {/* Items selection */}
           <div>
             <div className="flex items-center justify-between mb-2">
               <label className="block text-sm font-medium text-gray-700">
                 Included Menu Items <span className="text-red-500">*</span>
               </label>
               <span className="text-xs text-gray-400">
                Active items only, grouped by category
               </span>
             </div>
            <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/60 p-3 space-y-2">
              {typeof form.branchId !== "number" ? (
                <div className="text-sm text-gray-500 bg-white rounded-lg border border-dashed border-gray-200 px-3 py-3">
                  Select a branch to load categories and active menu items.
                </div>
              ) : loadingMenuOptions ? (
                <div className="text-sm text-gray-500 bg-white rounded-lg border border-dashed border-gray-200 px-3 py-3">
                  Loading menu items...
                </div>
              ) : menuOptionsError ? (
                <div className="text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 px-3 py-3">
                  {menuOptionsError}
                </div>
              ) : menuGroups.length === 0 ? (
                <div className="text-sm text-gray-500 bg-white rounded-lg border border-dashed border-gray-200 px-3 py-3">
                  No active menu items found for the selected branch.
                </div>
              ) : (
                menuGroups.map((group) => (
                  <div key={group.category} className="rounded-lg border border-gray-200 bg-white">
                    <button
                      type="button"
                      onClick={() => toggleCategoryExpanded(group.category)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                    >
                      <span className="text-sm font-semibold text-gray-800">
                        {group.category}
                        <span className="ml-2 text-xs font-medium text-gray-400">
                          ({group.items.length} items)
                        </span>
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform ${
                          expandedCategories[group.category] ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedCategories[group.category] && (
                      <div className="border-t border-gray-100 px-3 py-2 space-y-2">
                        {group.items.map((item) => {
                          const selected = selectedById.get(item.id);
                          return (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                                selected
                                  ? "bg-[#ff5a1f]/5 border border-[#ff5a1f]/30"
                                  : "bg-gray-50 border border-transparent"
                              }`}
                            >
                              <label className="flex items-start gap-2.5 text-gray-700 cursor-pointer min-w-0">
                                <input
                                  type="checkbox"
                                  className="mt-0.5 rounded border-gray-300 text-[#ff5a1f] focus:ring-[#ff5a1f]"
                                  checked={!!selected}
                                  onChange={() => toggleItem(item.id, item.name)}
                                />
                                <div className="min-w-0">
                                  <p className="truncate">{item.name}</p>
                                  <p className="text-[11px] text-gray-500">
                                    PKR {item.price.toLocaleString()}
                                    {item.hasVariations && item.variations.length > 0
                                      ? ` • ${item.variations.length} variations`
                                      : ""}
                                  </p>
                                </div>
                              </label>
                              <input
                                type="number"
                                min={1}
                                disabled={!selected}
                                value={selected?.quantity ?? 1}
                                onChange={(e) =>
                                  updateItemQty(item.id, Number(e.target.value))
                                }
                                className="w-16 border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
             </div>
             {errors.items && (
               <p className="text-xs text-red-500 mt-1">{errors.items}</p>
             )}
           </div>

           {/* Status */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Status
               </label>
               <select
                 className={inputBase}
                 value={form.status}
                 onChange={(e) =>
                   setForm((p) => ({
                     ...p,
                     status: e.target.value as "active" | "inactive",
                   }))
                 }
               >
                 <option value="active">Active</option>
                 <option value="inactive">Inactive</option>
               </select>
             </div>
           </div>

           {/* Buttons */}
           <div className="flex items-center justify-end gap-3 pt-2">
             <button
               type="button"
               onClick={onClose}
              disabled={submitting}
               className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
             >
               Cancel
             </button>
             <button
               type="submit"
              disabled={submitting}
               className="px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
             >
              {submitting
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                ? "Save Changes"
                : "Create Deal"}
             </button>
           </div>
         </form>
       </div>
     </div>
   );
 };

 export default DealModal;

