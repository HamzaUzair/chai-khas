"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  ClipboardList,
  Activity,
  CheckCircle2,
  Clock,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import OrdersToolbar from "@/components/orders/OrdersToolbar";
import OrdersTable from "@/components/orders/OrdersTable";
import OrderCardList from "@/components/orders/OrderCardList";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import PaidReceiptModal from "@/components/orders/PaidReceiptModal";
import type { Branch } from "@/types/branch";
import type { Order, OrderStatus } from "@/types/order";
import { ORDER_STATUSES } from "@/types/order";
import { getOrders, setOrders, generateDemoOrders } from "@/lib/ordersStorage";

export default function OrdersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── Branches ── */
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  /* ── Orders (localStorage) ── */
  const [orders, setOrdersState] = useState<Order[]>([]);

  /* ── Filters ── */
  const [filterBranchId, setFilterBranchId] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");

  /* ── Modals ── */
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  /* ══════════════ Auth guard ══════════════ */
  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  /* ══════════════ Fetch branches ══════════════ */
  const fetchBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const res = await fetch("/api/branches");
      if (!res.ok) throw new Error();
      const data: Branch[] = await res.json();
      setBranches(data.filter((b) => b.status === "Active"));
    } catch {
      // silent
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) fetchBranches();
  }, [authorized, fetchBranches]);

  /* ══════════════ Load / init localStorage ══════════════ */
  const loadOrders = useCallback(() => {
    let stored = getOrders();
    if (stored.length === 0 && branches.length > 0) {
      stored = generateDemoOrders(
        branches.map((b) => ({
          branchId: b.branch_id,
          branchName: b.branch_name,
        }))
      );
      setOrders(stored);
    }
    setOrdersState(stored);
  }, [branches]);

  useEffect(() => {
    if (!authorized || branchesLoading) return;
    loadOrders();
  }, [authorized, branchesLoading, loadOrders]);

  /* ══════════════ Refresh handler ══════════════ */
  const handleRefresh = () => {
    loadOrders();
  };

  /* ══════════════ Branch-filtered orders (for counts) ══════════════ */
  const branchFiltered = useMemo(() => {
    if (filterBranchId === "all") return orders;
    return orders.filter((o) => o.branchId === filterBranchId);
  }, [orders, filterBranchId]);

  /* ══════════════ Status counts (after branch filter) ══════════════ */
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ORDER_STATUSES.forEach((s) => {
      counts[s] = branchFiltered.filter((o) => o.status === s).length;
    });
    return counts;
  }, [branchFiltered]);

  /* ══════════════ Fully filtered orders ══════════════ */
  const filteredOrders = useMemo(() => {
    let result = branchFiltered;

    // Status
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.orderNo.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      );
    }

    return result;
  }, [branchFiltered, statusFilter, search]);

  /* ══════════════ Quick stats ══════════════ */
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = today.getTime();

    const todayOrders = branchFiltered.filter((o) => o.createdAt >= todayTs);
    return {
      total: todayOrders.length,
      running: todayOrders.filter((o) => o.status === "Running").length,
      complete: todayOrders.filter((o) => o.status === "Complete").length,
      pending: todayOrders.filter((o) => o.status === "Pending").length,
    };
  }, [branchFiltered]);

  /* ══════════════ Loading ══════════════ */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Today's Orders",
      value: stats.total,
      icon: <ClipboardList size={20} />,
      bg: "bg-[#ff5a1f]/10",
      color: "text-[#ff5a1f]",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <Clock size={20} />,
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
    {
      label: "Running",
      value: stats.running,
      icon: <Activity size={20} />,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      label: "Complete",
      value: stats.complete,
      icon: <CheckCircle2 size={20} />,
      bg: "bg-green-50",
      color: "text-green-600",
    },
  ];

  return (
    <DashboardLayout title="Orders">
      {/* ── Page Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Order Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              View and manage all orders with a clean overview
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#ff5a1f] text-[#ff5a1f] text-sm font-semibold hover:bg-[#ff5a1f]/5 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      {!branchesLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0 ${s.color}`}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">{s.value}</p>
                <p className="text-[11px] text-gray-400 font-medium">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Toolbar ── */}
      <OrdersToolbar
        branches={branches}
        branchesLoading={branchesLoading}
        filterBranchId={filterBranchId}
        onBranchChange={setFilterBranchId}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        search={search}
        onSearchChange={setSearch}
        statusCounts={statusCounts}
        totalCount={branchFiltered.length}
      />

      {/* ── Desktop: Table | Mobile: Card list ── */}
      <div className="hidden md:block">
        <OrdersTable
          orders={filteredOrders}
          loading={branchesLoading}
          onView={setViewOrder}
        />
      </div>
      <div className="md:hidden">
        <OrderCardList
          orders={filteredOrders}
          loading={branchesLoading}
          onView={setViewOrder}
        />
      </div>

      {/* ── Order Details Modal ── */}
      <OrderDetailsModal
        isOpen={!!viewOrder}
        onClose={() => setViewOrder(null)}
        order={viewOrder}
        onViewReceipt={() => {
          if (viewOrder) {
            setReceiptOrder(viewOrder);
          }
        }}
      />

      {/* ── Paid Receipt Modal ── */}
      <PaidReceiptModal
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
        order={receiptOrder}
      />
    </DashboardLayout>
  );
}
