import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, assertBranchAccess, requireAuth } from "@/lib/server-auth";

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== "SUPER_ADMIN" && auth.role !== "BRANCH_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const userId = Number(id);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, branch_id: true, role: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (auth.role === "BRANCH_ADMIN") {
      assertBranchAccess(auth, existing.branch_id);
      if (!canManageRole(auth.role, normalizeRole(existing.role))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const body = await request.json();
    const role = normalizeRole(body.role);
    if (!canManageRole(auth.role, role)) {
      return NextResponse.json({ error: "You cannot assign this role" }, { status: 403 });
    }

    const requestedBranchId =
      body.branchId === "" || body.branchId === null ? null : Number(body.branchId);
    const branchId = auth.role === "BRANCH_ADMIN" ? auth.branchId : requestedBranchId;

    if (role !== "SUPER_ADMIN" && !branchId) {
      return NextResponse.json(
        { error: "This role must have an assigned branch" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        username: String(body.username ?? "").trim(),
        fullname: String(body.fullName ?? "").trim(),
        role,
        branch_id: role === "SUPER_ADMIN" ? null : branchId ?? null,
        terminal: Math.max(1, Number(body.terminal) || 1),
        status: body.status === "Inactive" ? "Inactive" : "Active",
        ...(body.password ? { password: String(body.password) } : {}),
      },
      include: {
        branch: {
          select: { branch_id: true, branch_name: true, branch_code: true },
        },
      },
    });

    return NextResponse.json({
      id: String(updated.id),
      userId: updated.id,
      username: updated.username,
      fullName: updated.fullname ?? "",
      role: normalizeRole(updated.role),
      branchId: updated.branch_id,
      branchName: updated.branch?.branch_name ?? "No Branch",
      branchCode: updated.branch?.branch_code ?? "—",
      status: updated.status === "Inactive" ? "Inactive" : "Active",
      terminal: updated.terminal,
      createdAt: new Date(updated.created_at).getTime(),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("PUT /api/users/[id] error:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== "SUPER_ADMIN" && auth.role !== "BRANCH_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const userId = Number(id);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, branch_id: true, role: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (auth.role === "BRANCH_ADMIN") {
      assertBranchAccess(auth, existing.branch_id);
      if (!canManageRole(auth.role, normalizeRole(existing.role))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("DELETE /api/users/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

