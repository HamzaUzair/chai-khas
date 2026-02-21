"use client";

import React from "react";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface CartPanelProps {
  items: CartItem[];
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
}

const CartPanel: React.FC<CartPanelProps> = ({
  items,
  onIncrease,
  onDecrease,
  onRemove,
}) => {
  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center">
          <ShoppingCart size={18} className="text-[#ff5a1f]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Shopping Cart</p>
          <p className="text-xs text-gray-400">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
              <ShoppingCart size={26} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">Your cart is empty</p>
            <p className="text-xs text-gray-300 max-w-[180px]">
              Add items from the menu to start building your order
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-gray-50 rounded-lg p-3 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#ff5a1f] font-semibold mt-0.5">
                    PKR {item.price.toLocaleString("en-PK")} × {item.qty}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Qty controls */}
              <div className="flex items-center gap-2 self-end">
                <button
                  onClick={() => onDecrease(item.id)}
                  className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Decrease"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-semibold text-gray-800 w-6 text-center">
                  {item.qty}
                </span>
                <button
                  onClick={() => onIncrease(item.id)}
                  className="w-7 h-7 rounded-md bg-[#ff5a1f] text-white flex items-center justify-center hover:bg-[#e04e18] transition-colors cursor-pointer"
                  aria-label="Increase"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="px-5 py-4 border-t border-gray-100 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="text-base font-bold text-gray-800">
              PKR {subtotal.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button className="w-full py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm">
            Place Order
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPanel;
