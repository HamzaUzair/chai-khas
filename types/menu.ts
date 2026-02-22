/* ── Menu Management types ── */

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  branchId: number;
  branchName: string;
  category: string;
  price: number;
  status: "active" | "inactive";
  createdAt: number;
}

export interface MenuItemFormData {
  name: string;
  description: string;
  branchId: number | "";
  category: string;
  price: string;
  status: "active" | "inactive";
}
