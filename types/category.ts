/* ── Category Management types ── */

export interface CategoryMenuItem {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  itemCount: number;
  isActive: boolean;
  items: CategoryMenuItem[];
}

export interface BranchCategoryData {
  branchId: number;
  branchName: string;
  categories: Category[];
}

export interface CategoryFormData {
  name: string;
  itemCount: number;
  isActive: boolean;
  branchId?: number; // required when filter is "All Branches"
}

export interface ItemFormData {
  name: string;
  price: string; // string for form input
  isActive: boolean;
}
