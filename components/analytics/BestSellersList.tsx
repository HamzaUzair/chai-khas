"use client";

import React from "react";
import { Star, UtensilsCrossed } from "lucide-react";
import type { BestSellerRow } from "@/lib/analyticsService";

interface Props {
  data: BestSellerRow[];
  loading: boolean;
}

const BestSellersList: React.FC<Props> = ({ data, loading }) => {
  const maxQty = data.length > 0 ? Math.max(...data.map((d) => d.qtySold)) : 1;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <Star size={16} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-800">
            Best Selling Items
          </h3>
          <p className="text-[11px] text-gray-400">Top 5 menu items by quantity</p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                <div className="h-2 bg-gray-50 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="py-10 flex flex-col items-center gap-2 text-center">
          <UtensilsCrossed size={28} className="text-gray-300" />
          <p className="text-sm text-gray-400">No menu sales data yet.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {data.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-3">
              {/* Rank */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  idx === 0
                    ? "bg-amber-100 text-amber-700"
                    : idx === 1
                      ? "bg-gray-200 text-gray-600"
                      : idx === 2
                        ? "bg-orange-100 text-orange-600"
                        : "bg-gray-50 text-gray-500"
                }`}
              >
                #{idx + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {item.name}
                  </span>
                  <span className="text-xs font-bold text-[#ff5a1f] shrink-0 ml-2">
                    PKR {item.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium text-gray-500">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {item.qtySold} sold
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#ff5a1f] transition-all"
                    style={{ width: `${(item.qtySold / maxQty) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BestSellersList;
