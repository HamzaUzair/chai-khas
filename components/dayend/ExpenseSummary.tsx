"use client";

import React from "react";
import { Wallet } from "lucide-react";
import type { ExpenseEntry } from "@/types/dayend";
import { formatPKR } from "@/lib/dayendFormat";

interface ExpenseSummaryProps {
  totalExpenses: number;
  expenses: ExpenseEntry[];
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ totalExpenses, expenses }) => {
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Expense Summary
        </h3>
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-amber-500" />
          <span className="text-lg font-bold text-gray-800">{formatPKR(totalExpenses)}</span>
        </div>
      </div>
      <div className="space-y-2">
        {expenses.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No expenses for this day</p>
        ) : (
          expenses.map((e) => (
            <div
              key={String(e.id)}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-amber-50/50 border border-amber-100"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{e.title}</p>
                <p className="text-[11px] text-gray-400">
                  {e.category} • {formatTime(e.createdAt)}
                </p>
              </div>
              <span className="text-sm font-semibold text-amber-700">{formatPKR(e.amount)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseSummary;
