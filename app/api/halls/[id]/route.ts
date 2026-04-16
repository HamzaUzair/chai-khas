import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertBranchAccess, AuthError, requireAuth } from "@/lib/server-auth";

type IncomingTableRow = {
  name?: string;
  capacity?: number | string;
  status?: string;
};

function normalizeTableRows(input: unknown) {
  if (!Array.isArray(input)) return [];
  const rows = input
    .map((row) => {
      const name = typeof row?.name === "string" ? row.name.trim() : "";
      const capacityNum =
        typeof row?.capacity === "number"
          ? row.capacity
          : typeof row?.capacity === "string"
          ? Number(row.capacity)
          : NaN;
      const status = typeof row?.status === "string" ? row.status : "Available";
      return {
        name,
        capacity: Number.isNaN(capacityNum) ? 0 : Math.max(0, capacityNum),
        status,
      };
    })
    .filter((r) => r.name.length > 0);

  const seen = new Set<string>();
  return rows.filter((r) => {
    const key = r.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function serializeHall(hall: {
  hall_id: number;
  name: string;
  capacity: number;
  terminal: number;
  branch_id: number;
  created_at: Date;
  updated_at: Date;
  branch: { branch_name: string };
  tables: Array<{
    table_id: number;
    table_number: string;
    capacity: number;
    status: string;
    terminal: number;
    created_at: Date;
    updated_at: Date;
  }>;
}) {
  const totalCapacity = hall.tables.reduce((sum, t) => sum + Number(t.capacity || 0), 0);
  return {
    id: String(hall.hall_id),
    hallId: hall.hall_id,
    name: hall.name,
    tableCount: hall.tables.length,
    totalCapacity,
    status: "active",
    capacity: hall.capacity,
    terminal: hall.terminal,
    branchId: hall.branch_id,
    branchName: hall.branch.branch_name,
    tables: hall.tables.map((t) => ({
      id: String(t.table_id),
      tableId: t.table_id,
      name: t.table_number,
      capacity: t.capacity,
      status: t.status,
      terminal: t.terminal,
      createdAt: new Date(t.created_at).getTime(),
      updatedAt: new Date(t.updated_at).getTime(),
    })),
    createdAt: new Date(hall.created_at).getTime(),
    updatedAt: new Date(hall.updated_at).getTime(),
  };
}

/* ── PUT /api/halls/[id] ── */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const hallId = Number(id);
    if (Number.isNaN(hallId)) {
      return NextResponse.json({ error: "Invalid hall id" }, { status: 400 });
    }

    const existing = await prisma.hall.findUnique({
      where: { hall_id: hallId },
      select: { hall_id: true, branch_id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Hall not found" }, { status: 404 });
    }
    assertBranchAccess(auth, existing.branch_id);

    const body = await request.json();
    const {
      name,
      branchId,
      terminal,
      tables,
    } = body as {
      name?: string;
      branchId?: number | string;
      terminal?: number | string;
      tables?: IncomingTableRow[];
    };

    if (!name?.trim()) {
      return NextResponse.json({ error: "Hall name is required" }, { status: 400 });
    }

    const nextBranchId = Number(branchId ?? existing.branch_id);
    if (Number.isNaN(nextBranchId)) {
      return NextResponse.json({ error: "Invalid branch" }, { status: 400 });
    }
    assertBranchAccess(auth, nextBranchId);

    const terminalNum = Math.max(1, Number(terminal) || 1);
    const normalizedTables = normalizeTableRows(tables);
    const totalCapacity = normalizedTables.reduce((sum, t) => sum + t.capacity, 0);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.table.deleteMany({ where: { hall_id: hallId } });

      const hall = await tx.hall.update({
        where: { hall_id: hallId },
        data: {
          name: name.trim(),
          branch_id: nextBranchId,
          terminal: terminalNum,
          capacity: totalCapacity,
          tables: normalizedTables.length
            ? {
                create: normalizedTables.map((t) => ({
                  table_number: t.name,
                  capacity: t.capacity,
                  status: t.status,
                  branch_id: nextBranchId,
                  terminal: terminalNum,
                })),
              }
            : undefined,
        },
        include: {
          branch: { select: { branch_name: true } },
          tables: { orderBy: { table_number: "asc" } },
        },
      });
      return hall;
    });

    return NextResponse.json(serializeHall(updated));
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("PUT /api/halls/[id] error:", err);
    return NextResponse.json({ error: "Failed to update hall" }, { status: 500 });
  }
}

/* ── DELETE /api/halls/[id] ── */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const hallId = Number(id);
    if (Number.isNaN(hallId)) {
      return NextResponse.json({ error: "Invalid hall id" }, { status: 400 });
    }

    const existing = await prisma.hall.findUnique({
      where: { hall_id: hallId },
      select: { hall_id: true, branch_id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Hall not found" }, { status: 404 });
    }
    assertBranchAccess(auth, existing.branch_id);

    await prisma.$transaction(async (tx) => {
      await tx.table.deleteMany({ where: { hall_id: hallId } });
      await tx.hall.delete({ where: { hall_id: hallId } });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("DELETE /api/halls/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete hall" }, { status: 500 });
  }
}

