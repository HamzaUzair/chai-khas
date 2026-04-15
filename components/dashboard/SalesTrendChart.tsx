"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface DataPoint {
  date: string;
  sales: number;
}

interface SalesTrendChartProps {
  data: DataPoint[];
  loading: boolean;
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data, loading }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center">
        <BarChart3 size={16} className="text-[#ff5a1f]" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-800">Sales Last 7 Days</h3>
        <p className="text-[11px] text-gray-400">Total sales per day</p>
      </div>
    </div>

    {loading ? (
      <div className="flex-1 min-h-[260px] flex items-center justify-center">
        <div className="animate-pulse flex items-end gap-3 h-40">
          {[60, 80, 45, 90, 70, 100, 50].map((h, i) => (
            <div
              key={i}
              className="w-8 bg-gray-100 rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    ) : data.length === 0 ? (
      <div className="flex-1 min-h-[260px] flex flex-col items-center justify-center text-center">
        <BarChart3 size={40} className="text-gray-200 mb-2" />
        <p className="text-sm text-gray-400">No sales data available yet</p>
        <p className="text-xs text-gray-300 mt-1">Add branches and start taking orders</p>
      </div>
    ) : (
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
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
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #f0f0f0",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value: number | undefined) => [
                value !== undefined ? `PKR ${value.toLocaleString()}` : "N/A",
                "Sales",
              ]}
            />
            <Bar
              dataKey="sales"
              fill="#ff5a1f"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

export default SalesTrendChart;
