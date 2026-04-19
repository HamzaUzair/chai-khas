/* ── Branch — matches the Prisma "branches" table ── */

export interface Branch {
  branch_id: number;
  branch_name: string;
  branch_code: string;
  restaurant_id: number;
  restaurant_name?: string;
  address: string | null;
  city: string | null;
  status: "Active" | "Inactive";
  created_at: string;
  updated_at: string;
}

/**
 * Fields collected by the branch create / edit form. `branch_code` is no
 * longer captured here — it is generated server-side per-restaurant and kept
 * internal so two tenants can both have their own "first branch" without a
 * global collision.
 */
export interface BranchFormData {
  branch_name: string;
  restaurant_id?: number;
  address?: string;
  city?: string;
  status: "Active" | "Inactive";
}

/** Generic API error shape */
export interface ApiError {
  error: string;
}
