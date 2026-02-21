"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Clock } from "lucide-react";
import type { PeakHourPoint } from "@/lib/analyticsService";

interface Props {
  data: PeakHourPoint[];
  loading: boolean;
}

const SEGMENT_COLORS: Record<string, string> = {
  Morning: "#f59e0b",
  Afternoon: "#ff5a1f",
  Evening: "#8b5cf6",
  Night: "#6366f1",
};

const PeakHoursChart: React.FC<Props> = ({ data, loading }) => {
  const peak = useMemo(() => {
    if (!data.length) return null;
    return data.reduce((best, cur) => (cur.orders > best.orders ? cur : best), data[0]);
  }, [data]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Clock size={16} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Peak Hours</h3>
            <p className="text-[11px] text-gray-400">
              Order distribution by hour
            </p>
          </div>
        </div>

        {/* Segments legend */}
        <div className="hidden sm:flex items-center gap-3">
          {Object.entries(SEGMENT_COLORS).map(([label, color]) => (
            <div key={label} className="flex items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: color }}
              />
              <span className="text-[10px] text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse flex items-end gap-2 h-48 px-2">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-100 rounded-t"
              style={{ height: `${20 + Math.random() * 60}%` }}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="min-h-[240px]">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={45}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #f0f0f0",
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  formatter={(value: number, _name: string, props: { payload: PeakHourPoint }) => [
                    `${value} orders`,
                    props.payload.label,
                  ]}
                />
                <Bar dataKey="orders" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {data.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={SEGMENT_COLORS[entry.label] || "#ff5a1f"}
                      fillOpacity={entry === peak ? 1 : 0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {peak && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              🔥 Peak hour:{" "}
              <span className="font-semibold text-gray-700">{peak.hour}</span>{" "}
              ({peak.orders} orders — {peak.label})
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default PeakHoursChart;
