"use client";

import React, { useCallback, useEffect } from "react";
import {
  X,
  UtensilsCrossed,
  Building2,
  Layers3,
  StickyNote,
  AlertCircle,
} from "lucide-react";
import type { MenuRecipe } from "@/types/recipe";

interface RecipeDrawerProps {
  isOpen: boolean;
  recipe: MenuRecipe | null;
  onClose: () => void;
}

const RecipeDrawer: React.FC<RecipeDrawerProps> = ({ isOpen, recipe, onClose }) => {
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

  if (!isOpen || !recipe) return null;

  const totalIngredients = recipe.ingredients.length;

  return (
    <div className="fixed inset-0 z-[110] flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col z-10 animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-bottom border-gray-100 shrink-0 border-b">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center">
              <UtensilsCrossed size={18} className="text-[#ff5a1f]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">{recipe.menuItemName}</h2>
              <p className="text-[11px] text-gray-400">
                {recipe.categoryName} •{" "}
                <span className="inline-flex items-center gap-1">
                  <Building2 size={11} className="text-gray-400" />
                  {recipe.branchName || "All branches"}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 uppercase">Ingredients</p>
              <p className="text-sm font-bold text-gray-800">{totalIngredients}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 uppercase">Status</p>
              <p className="text-xs font-semibold text-green-700">Recipe Added</p>
            </div>
          </div>

          {/* Ingredient list */}
          <div>
            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Layers3 size={13} /> Ingredients per serving
            </h3>
            {recipe.ingredients.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertCircle size={14} />
                No ingredients added yet for this recipe.
              </div>
            ) : (
              <div className="space-y-2">
                {recipe.ingredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="flex items-start justify-between text-xs bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{ing.inventoryName}</p>
                      {ing.notes && (
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <StickyNote size={11} className="text-gray-300" />
                          {ing.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {ing.quantity} {ing.unit}
                      </p>
                      {typeof ing.wastagePercent === "number" && ing.wastagePercent > 0 && (
                        <p className="text-[11px] text-amber-600 mt-0.5">
                          Wastage: {ing.wastagePercent}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-[11px] text-blue-700 flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <p>
              These recipes are configured per serving. When an order is completed, stock
              deduction can multiply each ingredient by the quantity sold to automatically
              update inventory levels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDrawer;

