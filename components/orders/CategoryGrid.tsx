"use client";

import React from "react";
import {
  Flame,
  Soup,
  Sandwich,
  Pizza,
  Coffee,
  IceCreamCone,
  CookingPot,
  UtensilsCrossed,
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  itemCount: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

export const mockCategories: Category[] = [
  { id: "bbq", name: "BBQ", itemCount: 12, icon: <Flame size={22} />, color: "text-[#ff5a1f]", bg: "bg-[#ff5a1f]/10" },
  { id: "karahi", name: "Karahi", itemCount: 8, icon: <CookingPot size={22} />, color: "text-red-600", bg: "bg-red-50" },
  { id: "burgers", name: "Burgers", itemCount: 6, icon: <Sandwich size={22} />, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "pizza", name: "Pizza", itemCount: 9, icon: <Pizza size={22} />, color: "text-yellow-600", bg: "bg-yellow-50" },
  { id: "drinks", name: "Drinks", itemCount: 15, icon: <Coffee size={22} />, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "desserts", name: "Desserts", itemCount: 5, icon: <IceCreamCone size={22} />, color: "text-pink-600", bg: "bg-pink-50" },
  { id: "rice", name: "Rice", itemCount: 7, icon: <Soup size={22} />, color: "text-green-600", bg: "bg-green-50" },
  { id: "sandwiches", name: "Sandwiches", itemCount: 4, icon: <UtensilsCrossed size={22} />, color: "text-purple-600", bg: "bg-purple-50" },
];

interface CategoryGridProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {mockCategories.map((c) => {
        const isActive = selected === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer group ${
              isActive
                ? "border-[#ff5a1f] bg-[#ff5a1f]/5 shadow-sm"
                : "border-gray-100 bg-white hover:border-[#ff5a1f]/40 hover:shadow-sm"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0 ${c.color} ${
                isActive ? "scale-110" : "group-hover:scale-105"
              } transition-transform`}
            >
              {c.icon}
            </div>
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold truncate ${
                  isActive ? "text-[#ff5a1f]" : "text-gray-800"
                }`}
              >
                {c.name}
              </p>
              <p className="text-xs text-gray-400">{c.itemCount} items</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
