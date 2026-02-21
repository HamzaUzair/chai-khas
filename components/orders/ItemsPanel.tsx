"use client";

import React from "react";
import { UtensilsCrossed, Plus } from "lucide-react";
import { mockCategories } from "./CategoryGrid";

export interface MockItem {
  id: string;
  name: string;
  price: number;
}

/** Generate mock items per category */
const mockItemsByCategory: Record<string, MockItem[]> = {
  bbq: [
    { id: "bbq-1", name: "Chicken Tikka", price: 999 },
    { id: "bbq-2", name: "Seekh Kabab", price: 799 },
    { id: "bbq-3", name: "Malai Boti", price: 1199 },
    { id: "bbq-4", name: "Fish Tikka", price: 1599 },
    { id: "bbq-5", name: "Grill Fish", price: 1999 },
  ],
  karahi: [
    { id: "kar-1", name: "Chicken Karahi", price: 1800 },
    { id: "kar-2", name: "Mutton Karahi", price: 2800 },
    { id: "kar-3", name: "Prawn Karahi", price: 2200 },
    { id: "kar-4", name: "Daal Karahi", price: 800 },
  ],
  burgers: [
    { id: "brg-1", name: "Zinger Burger", price: 550 },
    { id: "brg-2", name: "Beef Burger", price: 650 },
    { id: "brg-3", name: "Chicken Cheese", price: 600 },
  ],
  pizza: [
    { id: "piz-1", name: "Tikka Pizza", price: 1200 },
    { id: "piz-2", name: "Pepperoni", price: 1400 },
    { id: "piz-3", name: "Fajita Pizza", price: 1300 },
    { id: "piz-4", name: "Margherita", price: 900 },
  ],
  drinks: [
    { id: "drk-1", name: "Chai Khas Special", price: 250 },
    { id: "drk-2", name: "Fresh Juice", price: 350 },
    { id: "drk-3", name: "Cold Coffee", price: 450 },
    { id: "drk-4", name: "Lassi", price: 200 },
  ],
  desserts: [
    { id: "des-1", name: "Gulab Jamun", price: 300 },
    { id: "des-2", name: "Kheer", price: 350 },
    { id: "des-3", name: "Ras Malai", price: 400 },
  ],
  rice: [
    { id: "ric-1", name: "Chicken Biryani", price: 450 },
    { id: "ric-2", name: "Mutton Pulao", price: 650 },
    { id: "ric-3", name: "Veg Fried Rice", price: 350 },
  ],
  sandwiches: [
    { id: "snd-1", name: "Club Sandwich", price: 500 },
    { id: "snd-2", name: "Grilled Sandwich", price: 400 },
    { id: "snd-3", name: "Chicken Wrap", price: 550 },
  ],
};

interface ItemsPanelProps {
  selectedCategory: string | null;
  onAddItem: (item: MockItem) => void;
}

const ItemsPanel: React.FC<ItemsPanelProps> = ({
  selectedCategory,
  onAddItem,
}) => {
  if (!selectedCategory) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-5">
        <div className="px-6 py-20 flex flex-col items-center gap-3 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <UtensilsCrossed size={32} className="text-gray-300" />
          </div>
          <p className="text-base font-medium text-gray-400">
            Select a Category
          </p>
          <p className="text-xs text-gray-300 max-w-xs">
            Choose a food category above to browse available items
          </p>
        </div>
      </div>
    );
  }

  const categoryName =
    mockCategories.find((c) => c.id === selectedCategory)?.name ??
    selectedCategory;
  const items = mockItemsByCategory[selectedCategory] ?? [];

  return (
    <div className="mt-5">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        {categoryName} — {items.length} items
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3 hover:shadow-md transition-shadow"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {item.name}
              </p>
              <p className="text-sm font-bold text-[#ff5a1f] mt-0.5">
                PKR {item.price.toLocaleString("en-PK")}
              </p>
            </div>
            <button
              onClick={() => onAddItem(item)}
              className="shrink-0 w-9 h-9 rounded-lg bg-[#ff5a1f] text-white flex items-center justify-center hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
              aria-label={`Add ${item.name}`}
            >
              <Plus size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemsPanel;
