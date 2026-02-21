"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { CategoryMenuItem } from "@/types/category";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; price: number; isActive: boolean }) => void;
  editItem: CategoryMenuItem | null;
}

const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setName(editItem.name);
        setPrice(String(editItem.price));
        setIsActive(editItem.isActive);
      } else {
        setName("");
        setPrice("");
        setIsActive(true);
      }
      setError("");
    }
  }, [isOpen, editItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Item name is required");
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Please enter a valid price");
      return;
    }
    onSave({ name: name.trim(), price: parsedPrice, isActive });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {editItem ? "Edit Item" : "Add Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Item name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken Tikka"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (PKR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
              value={isActive ? "active" : "inactive"}
              onChange={(e) => setIsActive(e.target.value === "active")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
            >
              {editItem ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemModal;
