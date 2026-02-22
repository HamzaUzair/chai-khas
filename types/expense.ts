/* ── Expense Management types ── */

export type ExpenseCategory =
  | "Utilities"
  | "Supplies"
  | "Maintenance"
  | "Salary"
  | "Food"
  | "Rent"
  | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Utilities",
  "Supplies",
  "Maintenance",
  "Salary",
  "Food",
  "Rent",
  "Other",
];

export type ExpensePaymentMethod = "Cash" | "Card" | "Online";

export const EXPENSE_PAYMENT_METHODS: ExpensePaymentMethod[] = [
  "Cash",
  "Card",
  "Online",
];

export interface Expense {
  id: number;
  title: string;
  description: string;
  category: ExpenseCategory;
  branchId: number;
  branchName: string;
  amount: number;
  paymentMethod: ExpensePaymentMethod;
  date: string; // YYYY-MM-DD
  addedBy: string;
  status: "Active" | "Inactive";
  createdAt: number; // epoch ms
}

export interface ExpenseFormData {
  title: string;
  description: string;
  category: ExpenseCategory | "";
  branchId: number | "";
  amount: string; // string for input
  paymentMethod: ExpensePaymentMethod | "";
  date: string;
  status: "Active" | "Inactive";
}

export interface ExpenseBranch {
  id: number;
  name: string;
}
