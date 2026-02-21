"use client";

import React from "react";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Tag,
  Undo2,
  Banknote,
  CreditCard,
  Globe,
} from "lucide-react";
import type { DailySummary } from "@/types/salesReport";

function fmtPkr(n: number) {
  return "PKR " + n.toLocaleString("en-PK");
}

interface DailySummaryCardsProps {
  rows: DailySummary[];
}

const DailySummaryCards: React.FC<DailySummaryCardsProps> = ({ rows }) => (
  <div className="space-y-3">
    {rows.map((r) => (
      <div
        key={r.date}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-800">
            <Calendar size={14} className="text-gray-400" />
            {r.dateLabel}
          </span>
          <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
            {r.orders} orders
          </span>
        </div>

        {/* Main figures */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <DollarSign size={13} className="text-orange-400" />
            <span>
              Gross: <span className="font-bold text-gray-800">{fmtPkr(r.gross)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <TrendingUp size={13} className="text-green-500" />
            <span>
              Net: <span className="font-bold text-green-700">{fmtPkr(r.net)}</span>
            </span>
          </div>
          {r.discounts > 0 && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <Tag size={13} />
              <span>Discounts: -{fmtPkr(r.discounts)}</span>
            </div>
          )}
          {r.refunds > 0 && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <Undo2 size={13} />
              <span>Refunds: -{fmtPkr(r.refunds)}</span>
            </div>
          )}
        </div>

        {/* Payment breakdown */}
        <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-gray-50">
          {r.cash > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
              <Banknote size={12} className="text-emerald-500" />
              {fmtPkr(r.cash)}
            </span>
          )}
          {r.card > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
              <CreditCard size={12} className="text-sky-500" />
              {fmtPkr(r.card)}
            </span>
          )}
          {r.online > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
              <Globe size={12} className="text-violet-500" />
              {fmtPkr(r.online)}
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default DailySummaryCards;
