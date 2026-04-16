import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export type ServerAuthUser = {
  id: number;
  username: string;
  role: "SUPER_ADMIN" | "BRANCH_ADMIN" | "ORDER_TAKER" | "CASHIER" | "ACCOUNTANT";
  branchId: number | null;
  status: string;
};

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

function normalizeRole(
  role?: string
): "SUPER_ADMIN" | "BRANCH_ADMIN" | "ORDER_TAKER" | "CASHIER" | "ACCOUNTANT" {
  const normalized = role?.toUpperCase();
  if (normalized === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (normalized === "ORDER_TAKER") return "ORDER_TAKER";
  if (normalized === "CASHIER") return "CASHIER";
  if (normalized === "ACCOUNTANT") return "ACCOUNTANT";
  return "BRANCH_ADMIN";
}

function isBranchScopedRole(role: ServerAuthUser["role"]) {
  return role !== "SUPER_ADMIN";
}

export async function requireAuth(request: NextRequest): Promise<ServerAuthUser> {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) throw new AuthError("Unauthorized", 401);

  const user = await prisma.user.findFirst({
    where: { token },
    select: {
      id: true,
      username: true,
      role: true,
      branch_id: true,
      status: true,
    },
  });
  if (!user) throw new AuthError("Unauthorized", 401);
  if (user.status !== "Active") throw new AuthError("User inactive", 403);

  return {
    id: user.id,
    username: user.username,
    role: normalizeRole(user.role),
    branchId: user.branch_id ?? null,
    status: user.status,
  };
}

export function requireSuperAdmin(user: ServerAuthUser) {
  if (user.role !== "SUPER_ADMIN") {
    throw new AuthError("Forbidden", 403);
  }
}

export function getScopedBranchId(
  user: ServerAuthUser,
  requestedBranchId?: number | null
): number | undefined {
  if (isBranchScopedRole(user.role)) {
    if (!user.branchId) throw new AuthError("Branch assignment missing", 403);
    return user.branchId;
  }
  if (requestedBranchId === null || requestedBranchId === undefined) return undefined;
  return requestedBranchId;
}

export function assertBranchAccess(user: ServerAuthUser, branchId: number | null | undefined) {
  if (!isBranchScopedRole(user.role)) return;
  if (!user.branchId) throw new AuthError("Branch assignment missing", 403);
  if (branchId !== user.branchId) throw new AuthError("Forbidden branch access", 403);
}

