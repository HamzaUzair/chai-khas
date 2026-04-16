import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireAuth, requireSuperAdmin } from "@/lib/server-auth";

type ApiUserRole =
  | "SUPER_ADMIN"
  | "BRANCH_ADMIN"
  | "ORDER_TAKER"
  | "CASHIER"
  | "ACCOUNTANT";

const STAFF_ROLES: ApiUserRole[] = ["ORDER_TAKER", "CASHIER", "ACCOUNTANT"];

function normalizeRole(role?: string): ApiUserRole {
  const normalized = role?.toUpperCase();
  if (normalized === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (normalized === "ORDER_TAKER") return "ORDER_TAKER";
  if (normalized === "CASHIER") return "CASHIER";
  if (normalized === "ACCOUNTANT") return "ACCOUNTANT";
  return "BRANCH_ADMIN";
}

function canManageRole(authRole: ApiUserRole, targetRole: ApiUserRole) {
  if (authRole === "SUPER_ADMIN") return true;
  if (authRole === "BRANCH_ADMIN") return STAFF_ROLES.includes(targetRole);
  return false;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== "SUPER_ADMIN" && auth.role !== "BRANCH_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where:
        auth.role === "BRANCH_ADMIN"
          ? {
              branch_id: auth.branchId ?? -1,
              role: { in: STAFF_ROLES },
            }
          : undefined,
      include: {
        branch: {
          select: { branch_id: true, branch_name: true, branch_code: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(
      users.map((u) => ({
        id: String(u.id),
        userId: u.id,
        username: u.username,
        fullName: u.fullname ?? "",
        role: normalizeRole(u.role),
        branchId: u.branch_id,
        branchName: u.branch?.branch_name ?? "No Branch",
        branchCode: u.branch?.branch_code ?? "—",
        status: u.status === "Inactive" ? "Inactive" : "Active",
        terminal: u.terminal,
        createdAt: new Date(u.created_at).getTime(),
      }))
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/users error:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== "SUPER_ADMIN" && auth.role !== "BRANCH_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const fullName = String(body.fullName ?? "").trim();
    const password = String(body.password ?? "");
    const role = normalizeRole(body.role);
    const requestedBranchId =
      body.branchId === "" || body.branchId === null ? null : Number(body.branchId);
    const terminal = Math.max(1, Number(body.terminal) || 1);
    const status = body.status === "Inactive" ? "Inactive" : "Active";

    if (!username || !password || !fullName) {
      return NextResponse.json(
        { error: "Username, full name, and password are required" },
        { status: 400 }
      );
    }
    if (!canManageRole(auth.role, role)) {
      return NextResponse.json({ error: "You cannot create this role" }, { status: 403 });
    }

    const branchId = auth.role === "BRANCH_ADMIN" ? auth.branchId : requestedBranchId;
    if (role !== "SUPER_ADMIN" && !branchId) {
      return NextResponse.json(
        { error: "This role must have an assigned branch" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    const created = await prisma.user.create({
      data: {
        username,
        fullname: fullName,
        password,
        role,
        branch_id: role === "SUPER_ADMIN" ? null : branchId ?? null,
        terminal,
        status,
      },
      include: {
        branch: {
          select: { branch_id: true, branch_name: true, branch_code: true },
        },
      },
    });

    return NextResponse.json(
      {
        id: String(created.id),
        userId: created.id,
        username: created.username,
        fullName: created.fullname ?? "",
        role: normalizeRole(created.role),
        branchId: created.branch_id,
        branchName: created.branch?.branch_name ?? "No Branch",
        branchCode: created.branch?.branch_code ?? "—",
        status: created.status === "Inactive" ? "Inactive" : "Active",
        terminal: created.terminal,
        createdAt: new Date(created.created_at).getTime(),
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/users error:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

