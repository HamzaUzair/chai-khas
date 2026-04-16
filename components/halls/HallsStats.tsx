"use client";

import React from "react";
import { DoorOpen, Filter, Users, Armchair } from "lucide-react";

interface HallsStatsProps {
  totalHalls: number;
  filteredCount: number;
  totalTables: number;
  totalCapacity: number;
}

const HallsStats: React.FC<HallsStatsProps> = ({
  totalHalls,
  filteredCount,
  totalTables,
  totalCapacity,
}) => {
  const cards = [
    {
      label: "Total Halls",
      value: totalHalls,
      icon: <DoorOpen size={20} />,
      bg: "bg-[#ff5a1f]/10",
      color: "text-[#ff5a1f]",
    },
    {
      label: "Filtered Results",
      value: filteredCount,
      icon: <Filter size={20} />,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      label: "Total Tables",
      value: totalTables,
      icon: <Users size={20} />,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      label: "Total Capacity",
      value: totalCapacity,
      icon: <Armchair size={20} />,
      bg: "bg-purple-50",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

export default HallsStats;
