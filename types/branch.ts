/* ── Branch — matches the Prisma "branches" table ── */

export interface Branch {
  branch_id: number;
  branch_name: string;
  branch_code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: "Active" | "Inactive";
  created_at: string;   // ISO string from API
  updated_at: string;
}

/** Fields sent when creating / updating a branch */
export interface BranchFormData {
  branch_name: string;
  branch_code: string;
  address?: string;
  phone?: string;
  email?: string;
  status: "Active" | "Inactive";
}

/** Shape returned by GET /api/stats/dashboard */
export interface DashboardStats {
  totalBranches: number;
  totalActiveBranches: number;
}

/** Generic API error shape */
export interface ApiError {
  error: string;
}
