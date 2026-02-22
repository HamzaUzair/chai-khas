"use client";

import React from "react";
import { Receipt, DollarSign, Filter, BarChart3 } from "lucide-react";
import type { Expense } from "@/types/expense";

function fmtPkr(n: number) {
  return (
    "PKR " +
    n.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

interface ExpenseSummaryCardsProps {
  allExpenses: Expense[];
  filteredExpenses: Expense[];
}

const ExpenseSummaryCards: React.FC<ExpenseSummaryCardsProps> = ({
  allExpenses,
  filteredExpenses,
}) => {
  const totalExpenses = allExpenses.length;
  const totalAmount = allExpenses.reduce((s, e) => s + e.amount, 0);
  const filteredResults = filteredExpenses.length;
  const avgExpense =
    filteredExpenses.length > 0
      ? filteredExpenses.reduce((s, e) => s + e.amount, 0) / filteredExpenses.length
      : 0;

  const cards = [
    {
      label: "Total Expenses",
      value: String(totalExpenses),
      icon: <Receipt size={22} />,
      bg: "bg-orange-50",
      color: "text-[#ff5a1f]",
    },
    {
      label: "Total Amount",
      value: fmtPkr(totalAmount),
      icon: <DollarSign size={22} />,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      label: "Filtered Results",
      value: String(filteredResults),
      icon: <Filter size={22} />,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      label: "Average Expense",
      value: fmtPkr(avgExpense),
      icon: <BarChart3 size={22} />,
      bg: "bg-purple-50",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
        >
          <div
            className={`w-12 h-12 rounded-full ${c.bg} ${c.color} flex items-center justify-center shrink-0`}
          >
            {c.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-xl font-bold text-gray-800 truncate">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseSummaryCards;
