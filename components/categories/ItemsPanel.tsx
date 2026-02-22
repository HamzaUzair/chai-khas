"use client";

import React from "react";
import { PlusCircle, Pencil, Trash2, Package } from "lucide-react";
import type { Category, CategoryMenuItem } from "@/types/category";

interface ItemsPanelProps {
  category: Category | null;
  branchName: string;
  onAddItem: () => void;
  onEditItem: (item: CategoryMenuItem) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleItem: (itemId: string) => void;
}

const ItemsPanel: React.FC<ItemsPanelProps> = ({
  category,
  branchName,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleItem,
}) => {
  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
        <Package size={48} className="mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-500">Select a Category</p>
        <p className="text-sm mt-1">
          Click on a category card to view its items
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            {category.name}{" "}
            <span className="text-sm font-normal text-gray-400">
              — {category.items.length} items
            </span>
          </h3>
          {branchName && (
            <p className="text-xs text-gray-400 mt-0.5">{branchName}</p>
          )}
        </div>
        <button
          onClick={onAddItem}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
        >
          <PlusCircle size={16} />
          Add Item
        </button>
      </div>

      {/* Items list */}
      {category.items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Package size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No items in this category yet.</p>
          <p className="text-xs mt-1">Click &ldquo;Add Item&rdquo; to get started.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {category.items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-3 rounded-lg border p-3.5 transition-all ${
                item.isActive
                  ? "border-gray-100 bg-white"
                  : "border-gray-100 bg-gray-50 opacity-70"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  PKR {item.price.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Active/Inactive toggle */}
                <button
                  onClick={() => onToggleItem(item.id)}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium cursor-pointer transition-colors ${
                    item.isActive
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </button>

                <button
                  onClick={() => onEditItem(item)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-[#ff5a1f] hover:bg-orange-50 transition-colors cursor-pointer"
                  title="Edit item"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemsPanel;
