import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  assertBranchWriteAccess,
  AuthError,
  buildBranchScopeFilter,
  requireAuth,
} from "@/lib/server-auth";

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

/* ── GET /api/halls ── */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const branchIdParam = searchParams.get("branchId");
    const search = searchParams.get("search")?.trim();

    const requestedBranchId =
      branchIdParam && branchIdParam !== "all" ? Number(branchIdParam) : null;
    const scope = await buildBranchScopeFilter(auth, requestedBranchId);

    const halls = await prisma.hall.findMany({
      where: {
        ...scope,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                {
                  tables: {
                    some: {
                      table_number: { contains: search, mode: "insensitive" },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        branch: { select: { branch_name: true } },
        tables: {
          orderBy: { table_number: "asc" },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(halls.map(serializeHall));
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/halls error:", err);
    return NextResponse.json({ error: "Failed to fetch halls" }, { status: 500 });
  }
}

/* ── POST /api/halls ── */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.role === "ORDER_TAKER") {
      return NextResponse.json(
        { error: "Order Taker cannot manage halls" },
        { status: 403 }
      );
    }
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
    if (branchId === undefined || branchId === null || branchId === "") {
      return NextResponse.json({ error: "Branch is required" }, { status: 400 });
    }

    const branchIdNum = Number(branchId);
    if (Number.isNaN(branchIdNum)) {
      return NextResponse.json({ error: "Invalid branch" }, { status: 400 });
    }
    await assertBranchWriteAccess(auth, branchIdNum);

    const branch = await prisma.branch.findUnique({
      where: { branch_id: branchIdNum },
      select: { branch_id: true },
    });
    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const terminalNum = Math.max(1, Number(terminal) || 1);
    const normalizedTables = normalizeTableRows(tables);
    const totalCapacity = normalizedTables.reduce((sum, t) => sum + t.capacity, 0);

    const created = await prisma.hall.create({
      data: {
        name: name.trim(),
        branch_id: branchIdNum,
        terminal: terminalNum,
        capacity: totalCapacity,
        tables: normalizedTables.length
          ? {
              create: normalizedTables.map((t) => ({
                table_number: t.name,
                capacity: t.capacity,
                status: t.status,
                branch_id: branchIdNum,
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

    return NextResponse.json(serializeHall(created), { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/halls error:", err);
    return NextResponse.json({ error: "Failed to create hall" }, { status: 500 });
  }
}

