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

/** Fields sent when creating / updating a branch */
export interface BranchFormData {
  branch_name: string;
  branch_code: string;
  restaurant_id?: number;
  address?: string;
  city?: string;
  status: "Active" | "Inactive";
}

/** Generic API error shape */
export interface ApiError {
  error: string;
}
