"use client";

import React from "react";
import { UtensilsCrossed, Layers3, AlertTriangle, CheckCircle2 } from "lucide-react";

interface RecipesStatsProps {
  totalRecipes: number;
  totalIngredientsMapped: number;
  menuItemsWithRecipes: number;
  menuItemsMissingRecipes: number;
}

const RecipesStats: React.FC<RecipesStatsProps> = ({
  totalRecipes,
  totalIngredientsMapped,
  menuItemsWithRecipes,
  menuItemsMissingRecipes,
}) => {
  const cards = [
    {
      label: "Total Menu Recipes",
      value: totalRecipes,
      icon: <UtensilsCrossed size={20} />,
      bg: "bg-[#ff5a1f]/10",
      color: "text-[#ff5a1f]",
    },
    {
      label: "Ingredients Mapped",
      value: totalIngredientsMapped,
      icon: <Layers3 size={20} />,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      label: "Menu Items With Recipes",
      value: menuItemsWithRecipes,
      icon: <CheckCircle2 size={20} />,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      label: "Menu Items Missing Recipes",
      value: menuItemsMissingRecipes,
      icon: <AlertTriangle size={20} />,
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
        >
          <div
            className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0 ${c.color}`}
          >
            {c.icon}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{c.value}</p>
            <p className="text-[11px] text-gray-400 font-medium">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipesStats;

