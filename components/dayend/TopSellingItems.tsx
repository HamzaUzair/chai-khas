"use client";

import React from "react";
import { UtensilsCrossed } from "lucide-react";
import type { TopSellingItem } from "@/types/dayend";
import { formatPKR } from "@/lib/dayendFormat";

interface TopSellingItemsProps {
  items: TopSellingItem[];
}

const TopSellingItems: React.FC<TopSellingItemsProps> = ({ items }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
      Top Selling Items
    </h3>
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No sales data for this day</p>
      ) : (
        items.map((item, idx) => (
          <div
            key={item.name}
            className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="w-6 h-6 rounded-full bg-[#ff5a1f]/10 flex items-center justify-center text-xs font-bold text-[#ff5a1f] shrink-0">
              {idx + 1}
            </span>
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <UtensilsCrossed size={14} className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
              <p className="text-[11px] text-gray-400">{item.quantity} sold</p>
            </div>
            <span className="text-sm font-semibold text-gray-800 shrink-0">
              {formatPKR(item.revenue)}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
);

export default TopSellingItems;
