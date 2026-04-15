"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import type { HourlySales as HourlySalesType } from "@/types/dayend";

interface HourlySalesProps {
  data: HourlySalesType[];
  maxRevenue: number;
}

const HourlySales: React.FC<HourlySalesProps> = ({ data, maxRevenue }) => {
  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-[#ff5a1f]" />
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Hourly Sales Trend
        </h3>
      </div>
      <div className="flex items-end gap-1 h-32">
        {data.map((h) => {
          const height = maxRevenue > 0 ? (h.revenue / maxRevenue) * 100 : 0;
          return (
            <div className="flex-1 flex flex-col items-center gap-1" key={h.hour}>
              <div
                className="w-full bg-[#ff5a1f]/20 hover:bg-[#ff5a1f]/40 rounded-t transition-colors min-h-[4px]"
                style={{ height: `${Math.max(height, 4)}%` }}
                title={`${h.hour}: PKR ${h.revenue.toLocaleString()} (${h.orders} orders)`}
              />
              <span className="text-[10px] text-gray-400 rotate-0">{h.hour}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlySales;
