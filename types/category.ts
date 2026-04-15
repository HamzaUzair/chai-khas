/* ── Category Management types ── */

export interface Category {
  id: number;
  name: string;
  itemCount: number;
  isActive: boolean;
  branchId: number;
  branchName: string;
}

export interface BranchCategoryData {
  branchId: number;
  branchName: string;
  categories: Category[];
}

// API response types (category-only, no items)
export interface ApiCategory {
  category_id: number;
  name: string;
  description: string | null;
  branch_id: number;
  branch_name: string;
  is_active: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  name: string;
  isActive: boolean;
  branchId?: number; // required when filter is "All Branches"
}
