"use client";

import type {
  Expense,
  ExpenseCategory,
  ExpensePaymentMethod,
  ExpenseBranch,
} from "@/types/expense";

/* ═══════════ Helpers ═══════════ */

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[rnd(0, arr.length - 1)];
}

/* ═══════════ Mock expense bank ═══════════ */

const EXPENSE_TEMPLATES: { title: string; category: ExpenseCategory; amountRange: [number, number] }[] = [
  { title: "Pepsi Bill", category: "Utilities", amountRange: [5000, 25000] },
  { title: "Electricity Bill", category: "Utilities", amountRange: [8000, 35000] },
  { title: "Water Bill", category: "Utilities", amountRange: [2000, 8000] },
  { title: "Gas Bill", category: "Utilities", amountRange: [3000, 12000] },
  { title: "Internet Bill", category: "Utilities", amountRange: [3000, 6000] },
  { title: "Cleaning Supplies", category: "Supplies", amountRange: [1000, 5000] },
  { title: "Kitchen Utensils", category: "Supplies", amountRange: [2000, 15000] },
  { title: "Paper Napkins & Bags", category: "Supplies", amountRange: [500, 3000] },
  { title: "Disposable Containers", category: "Supplies", amountRange: [1500, 8000] },
  { title: "AC Repair", category: "Maintenance", amountRange: [5000, 20000] },
  { title: "Plumbing Fix", category: "Maintenance", amountRange: [2000, 10000] },
  { title: "Furniture Repair", category: "Maintenance", amountRange: [3000, 15000] },
  { title: "Kitchen Equipment Service", category: "Maintenance", amountRange: [5000, 25000] },
  { title: "Chef Salary", category: "Salary", amountRange: [25000, 60000] },
  { title: "Waiter Salary", category: "Salary", amountRange: [15000, 30000] },
  { title: "Manager Salary", category: "Salary", amountRange: [35000, 70000] },
  { title: "Guard Salary", category: "Salary", amountRange: [15000, 25000] },
  { title: "Raw Material Purchase", category: "Food", amountRange: [10000, 50000] },
  { title: "Vegetable Stock", category: "Food", amountRange: [5000, 20000] },
  { title: "Meat & Chicken Stock", category: "Food", amountRange: [15000, 45000] },
  { title: "Spices & Condiments", category: "Food", amountRange: [2000, 8000] },
  { title: "Monthly Rent", category: "Rent", amountRange: [50000, 150000] },
  { title: "Parking Rent", category: "Rent", amountRange: [5000, 15000] },
  { title: "Delivery Fuel", category: "Other", amountRange: [3000, 10000] },
  { title: "Marketing Flyers", category: "Other", amountRange: [2000, 8000] },
  { title: "Staff Uniforms", category: "Other", amountRange: [5000, 20000] },
];

const PAYMENTS: ExpensePaymentMethod[] = ["Cash", "Card", "Online"];
const ADDED_BY_OPTIONS = ["Admin", "Branch Admin", "Manager", "Accountant"];

/**
 * Generate mock expenses using real branches from API.
 * Returns [] if no branches provided.
 */
export function generateMockExpenses(branches: ExpenseBranch[]): Expense[] {
  if (branches.length === 0) return [];

  const now = Date.now();
  const expenses: Expense[] = [];

  // Generate 13-20 mock expenses
  const count = rnd(13, 20);
  let nextId = 1;

  for (let i = 0; i < count; i++) {
    const template = pick(EXPENSE_TEMPLATES);
    const branch = pick(branches);
    const daysAgo = rnd(0, 30);
    const createdAt = now - daysAgo * 86_400_000 - rnd(0, 23) * 3_600_000;
    const d = new Date(createdAt);
    const dateStr = d.toISOString().slice(0, 10);

    expenses.push({
      id: nextId++,
      title: template.title,
      description: `${template.title} for ${branch.name}`,
      category: template.category,
      branchId: branch.id,
      branchName: branch.name,
      amount: rnd(template.amountRange[0], template.amountRange[1]),
      paymentMethod: pick(PAYMENTS),
      date: dateStr,
      addedBy: pick(ADDED_BY_OPTIONS),
      status: rnd(1, 10) <= 9 ? "Active" : "Inactive",
      createdAt,
    });
  }

  return expenses.sort((a, b) => b.createdAt - a.createdAt);
}

/** Get next available expense ID from list */
export function nextExpenseId(expenses: Expense[]): number {
  if (expenses.length === 0) return 1;
  return Math.max(...expenses.map((e) => e.id)) + 1;
}
