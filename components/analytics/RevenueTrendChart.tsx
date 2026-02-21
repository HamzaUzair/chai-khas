"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { RevenueTrendPoint } from "@/lib/analyticsService";

interface Props {
  data: RevenueTrendPoint[];
  loading: boolean;
}

const RevenueTrendChart: React.FC<Props> = ({ data, loading }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center">
        <TrendingUp size={16} className="text-[#ff5a1f]" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-800">Revenue Trend</h3>
        <p className="text-[11px] text-gray-400">Daily sales over time</p>
      </div>
    </div>

    {loading ? (
      <div className="flex-1 min-h-[260px] flex items-center justify-center">
        <div className="animate-pulse space-y-3 w-full px-4">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-50 rounded w-5/6" />
          <div className="h-3 bg-gray-100 rounded w-4/6" />
          <div className="h-3 bg-gray-50 rounded w-3/6" />
          <div className="h-3 bg-gray-100 rounded w-full" />
        </div>
      </div>
    ) : (
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #f0f0f0",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, "Revenue"]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#ff5a1f"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#ff5a1f", stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

export default RevenueTrendChart;
