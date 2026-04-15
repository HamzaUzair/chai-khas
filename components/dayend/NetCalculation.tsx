"use client";

import React from "react";
import { Minus, Equal } from "lucide-react";
import { formatPKR } from "@/lib/dayendData";

interface NetCalculationProps {
  totalSales: number;
  totalExpenses: number;
  netRevenue: number;
}

const NetCalculation: React.FC<NetCalculationProps> = ({
  totalSales,
  totalExpenses,
  netRevenue,
}) => (
  <div className="bg-white rounded-xl border-2 border-[#ff5a1f]/20 shadow-sm p-6 bg-gradient-to-br from-[#ff5a1f]/5 to-transparent">
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
      Net Calculation
    </h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Total Sales</span>
        <span className="text-lg font-bold text-gray-800">{formatPKR(totalSales)}</span>
      </div>
      <div className="flex items-center gap-2 text-amber-600">
        <Minus size={16} />
        <span className="text-sm">Total Expenses</span>
        <span className="ml-auto font-semibold">{formatPKR(totalExpenses)}</span>
      </div>
      <div className="pt-3 border-t-2 border-[#ff5a1f]/30 flex items-center justify-between">
        <span className="flex items-center gap-2 text-[#ff5a1f] font-semibold">
          <Equal size={18} />
          Net Revenue
        </span>
        <span className="text-2xl font-bold text-[#ff5a1f]">{formatPKR(netRevenue)}</span>
      </div>
    </div>
  </div>
);

export default NetCalculation;
