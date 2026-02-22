"use client";

import React from "react";
import {
  Receipt,
  Tag,
  Undo2,
  Percent,
} from "lucide-react";
import type { ReportKPIs } from "@/types/salesReport";

function fmtPkr(n: number) {
  return "PKR " + n.toLocaleString("en-PK");
}

interface AccountingBreakdownProps {
  kpis: ReportKPIs;
}

const AccountingBreakdown: React.FC<AccountingBreakdownProps> = ({ kpis }) => {
  const cards = [
    {
      label: "Tax Collected",
      value: fmtPkr(kpis.taxCollected),
      sub: "5% tax rate",
      icon: <Percent size={20} />,
      bg: "bg-amber-50",
      color: "text-amber-600",
      border: "border-amber-100",
    },
    {
      label: "Discounts Given",
      value: fmtPkr(kpis.discountsGiven),
      sub: `${kpis.discountCount} discounted orders`,
      icon: <Tag size={20} />,
      bg: "bg-pink-50",
      color: "text-pink-600",
      border: "border-pink-100",
    },
    {
      label: "Refunds",
      value: fmtPkr(kpis.refundsAmount),
      sub: `${kpis.refundCount} refunded orders`,
      icon: <Undo2 size={20} />,
      bg: "bg-red-50",
      color: "text-red-500",
      border: "border-red-100",
    },
    {
      label: "Service Charges",
      value: fmtPkr(kpis.serviceCharges),
      sub: "Applied to select orders",
      icon: <Receipt size={20} />,
      bg: "bg-teal-50",
      color: "text-teal-600",
      border: "border-teal-100",
    },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <Receipt size={15} className="text-gray-400" />
        Accounting Breakdown
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`bg-white rounded-xl border ${c.border} shadow-sm p-5 flex items-center gap-4`}
          >
            <div
              className={`w-11 h-11 rounded-full ${c.bg} ${c.color} flex items-center justify-center shrink-0`}
            >
              {c.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">{c.label}</p>
              <p className="text-lg font-bold text-gray-800 truncate">{c.value}</p>
              <p className="text-[11px] text-gray-400">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountingBreakdown;
