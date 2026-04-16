import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireAuth, requireSuperAdmin } from "@/lib/server-auth";

/* ── DELETE /api/branches/[id] ── */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    requireSuperAdmin(auth);

    const { id } = await params;
    const branchId = parseInt(id, 10);

    if (isNaN(branchId)) {
      return NextResponse.json(
        { error: "Invalid branch ID" },
        { status: 400 }
      );
    }

    // Check existence
    const branch = await prisma.branch.findUnique({
      where: { branch_id: branchId },
    });
    if (!branch) {
      return NextResponse.json(
        { error: "Branch not found" },
        { status: 404 }
      );
    }

    await prisma.branch.delete({
      where: { branch_id: branchId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("DELETE /api/branches/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete branch" },
      { status: 500 }
    );
  }
}

/* ── PUT /api/branches/[id] ── */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    requireSuperAdmin(auth);

    const { id } = await params;
    const branchId = parseInt(id, 10);

    if (isNaN(branchId)) {
      return NextResponse.json(
        { error: "Invalid branch ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { branch_name, branch_code, address, phone, email, status } = body;

    if (!branch_name?.trim()) {
      return NextResponse.json(
        { error: "Branch name is required" },
        { status: 400 }
      );
    }
    if (!branch_code?.trim()) {
      return NextResponse.json(
        { error: "Branch code is required" },
        { status: 400 }
      );
    }

    // Check duplicate code (exclude self)
    const existing = await prisma.branch.findUnique({
      where: { branch_code: branch_code.trim() },
    });
    if (existing && existing.branch_id !== branchId) {
      return NextResponse.json(
        { error: `Branch code "${branch_code}" already exists` },
        { status: 409 }
      );
    }

    const updated = await prisma.branch.update({
      where: { branch_id: branchId },
      data: {
        branch_name: branch_name.trim(),
        branch_code: branch_code.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        status: status === "Inactive" ? "Inactive" : "Active",
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("PUT /api/branches/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update branch" },
      { status: 500 }
    );
  }
}
