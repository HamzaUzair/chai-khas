"use client";

import React from "react";
import { CreditCard, Banknote, Smartphone } from "lucide-react";
import type { PaymentBreakdown as PaymentBreakdownType } from "@/types/dayend";
import { formatPKR } from "@/lib/dayendData";

interface PaymentBreakdownProps {
  payments: PaymentBreakdownType[];
}

const iconMap: Record<string, React.ElementType> = {
  Cash: Banknote,
  Card: CreditCard,
  Online: Smartphone,
};

const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({ payments }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
      Payment Method Breakdown
    </h3>
    <div className="space-y-3">
      {payments.map((p) => {
        const Icon = iconMap[p.method] ?? CreditCard;
        return (
          <div
            key={p.method}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50/80 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center">
                <Icon size={14} className="text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-800">{p.method}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{formatPKR(p.amount)}</p>
              <p className="text-[11px] text-gray-400">{p.percentage.toFixed(1)}%</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default PaymentBreakdown;
