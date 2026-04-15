/* ── Menu Management types (database-backed /api/menu) ── */

export interface MenuVariation {
  id?: number;
  name: string;
  price: number;
  sortOrder?: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  branchId: number;
  branchName: string;
  categoryId?: number;
  categoryName: string;
  hasVariations: boolean;
  basePrice: number | null;
  variations: MenuVariation[];
  displayPrice: number;
  status: "active" | "inactive";
}

export interface MenuItemFormData {
  name: string;
  description: string;
  branchId: number | "";
  categoryName: string;
  hasVariations: boolean;
  basePrice: string;
  variations: Array<{
    name: string;
    price: string;
  }>;
  status: "active" | "inactive";
}
