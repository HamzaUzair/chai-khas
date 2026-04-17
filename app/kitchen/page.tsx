"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChefHat,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  Store,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiFetch, getAuthSession } from "@/lib/auth-client";
import type { AppRole } from "@/types/auth";
import type { Order } from "@/types/order";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatElapsed(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(mins).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

type KitchenStatus = "Pending" | "Running" | "Served";

const STATUS_STYLES: Record<KitchenStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-100",
  Running: "bg-blue-50 text-blue-700 border-blue-100",
  Served: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export default function KitchenPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [sessionRole, setSessionRole] = useState<AppRole>("SUPER_ADMIN");
  const [sessionBranchId, setSessionBranchId] = useState<number | null>(null);
  const [sessionBranchName, setSessionBranchName] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [nowTs, setNowTs] = useState(Date.now());
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  const canUpdateKitchenStatus =
    sessionRole === "LIVE_KITCHEN" || sessionRole === "SUPER_ADMIN";

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    const allowedRoles: AppRole[] = [
      "SUPER_ADMIN",
      "RESTAURANT_ADMIN",
      "BRANCH_ADMIN",
      "LIVE_KITCHEN",
    ];
    if (!allowedRoles.includes(session.role)) {
      router.replace("/dashboard");
      return;
    }

    setSessionRole(session.role);
    setSessionBranchId(session.branchId ?? null);
    setSessionBranchName(session.branchName ?? null);
    setAuthorized(true);
  }, [router]);

  const loadOrders = useCallback(
    async (silent = false) => {
      if (!authorized) return;
      if (!silent) setLoading(true);
      if (silent) setRefreshing(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (sessionBranchId) params.set("branchId", String(sessionBranchId));
        const res = await apiFetch(`/api/orders?${params.toString()}`);
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || "Failed to fetch kitchen orders");
        }
        const data = (await res.json()) as Order[];
        const kitchenOrders = data.filter(
          (o) =>
            o.status === "Pending" ||
            o.status === "Running" ||
            o.status === "Served"
        );
        setOrders(kitchenOrders);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch kitchen orders");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [authorized, sessionBranchId]
  );

  useEffect(() => {
    if (!authorized) return;
    void loadOrders();
  }, [authorized, loadOrders]);

  useEffect(() => {
    if (!authorized) return;
    const poll = setInterval(() => {
      void loadOrders(true);
    }, 10000);
    return () => clearInterval(poll);
  }, [authorized, loadOrders]);

  useEffect(() => {
    const tick = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const handleStatusUpdate = async (
    orderId: string,
    status: "Running" | "Served"
  ) => {
    if (!canUpdateKitchenStatus) return;
    setBusyOrderId(orderId);
    setError("");
    try {
      const res = await apiFetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || "Failed to update kitchen status");
      }
      await loadOrders(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update kitchen status");
    } finally {
      setBusyOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((order) => {
      const itemText = order.items
        .map((i) => `${i.name} ${i.variationName ?? ""}`)
        .join(" ")
        .toLowerCase();
      return (
        order.orderNo.toLowerCase().includes(q) ||
        (order.hall ?? "").toLowerCase().includes(q) ||
        (order.table ?? "").toLowerCase().includes(q) ||
        itemText.includes(q)
      );
    });
  }, [orders, search]);

  const pendingOrders = filteredOrders.filter((o) => o.status === "Pending");
  const runningOrders = filteredOrders.filter((o) => o.status === "Running");
  const servedOrders = filteredOrders.filter((o) => o.status === "Served");

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Live Kitchen">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Live Kitchen Board</h2>
            <p className="text-sm text-gray-500 mt-1">
              Monitor incoming branch orders and progress them through kitchen workflow.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {sessionBranchName
                ? `Scoped to ${sessionBranchName}`
                : "Scoped by your role permissions"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order, table, item..."
                className="border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm w-64"
              />
            </div>
            <button
              onClick={() => void loadOrders(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#ff5a1f] text-[#ff5a1f] text-sm font-semibold hover:bg-[#ff5a1f]/5"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={30} className="animate-spin text-[#ff5a1f]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <KitchenColumn
            title="Pending Orders"
            status="Pending"
            orders={pendingOrders}
            nowTs={nowTs}
            canUpdateKitchenStatus={canUpdateKitchenStatus}
            busyOrderId={busyOrderId}
            onMarkRunning={(id) => void handleStatusUpdate(id, "Running")}
            onMarkServed={(id) => void handleStatusUpdate(id, "Served")}
          />
          <KitchenColumn
            title="Running Orders"
            status="Running"
            orders={runningOrders}
            nowTs={nowTs}
            canUpdateKitchenStatus={canUpdateKitchenStatus}
            busyOrderId={busyOrderId}
            onMarkRunning={(id) => void handleStatusUpdate(id, "Running")}
            onMarkServed={(id) => void handleStatusUpdate(id, "Served")}
          />
          <KitchenColumn
            title="Served Orders"
            status="Served"
            orders={servedOrders}
            nowTs={nowTs}
            canUpdateKitchenStatus={canUpdateKitchenStatus}
            busyOrderId={busyOrderId}
            onMarkRunning={(id) => void handleStatusUpdate(id, "Running")}
            onMarkServed={(id) => void handleStatusUpdate(id, "Served")}
          />
        </div>
      )}
    </DashboardLayout>
  );
}

function KitchenColumn({
  title,
  status,
  orders,
  nowTs,
  canUpdateKitchenStatus,
  busyOrderId,
  onMarkRunning,
  onMarkServed,
}: {
  title: string;
  status: KitchenStatus;
  orders: Order[];
  nowTs: number;
  canUpdateKitchenStatus: boolean;
  busyOrderId: string | null;
  onMarkRunning: (id: string) => void;
  onMarkServed: (id: string) => void;
}) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat size={16} className="text-[#ff5a1f]" />
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {orders.length}
        </span>
      </div>

      <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
        {orders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
            No orders in this queue.
          </div>
        ) : (
          orders.map((order) => {
            const isBusy = busyOrderId === order.id;
            return (
              <article
                key={order.id}
                className="rounded-lg border border-gray-100 p-3 bg-gray-50/30"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-gray-800">{order.orderNo}</p>
                    <p className="text-xs text-gray-500">{order.type}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${STATUS_STYLES[status]}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p className="inline-flex items-center gap-1">
                    <Store size={12} />
                    {order.branchName}
                  </p>
                  <p>
                    {order.hall ? `Hall: ${order.hall}` : "Hall: -"}{" "}
                    {order.table ? `| Table: ${order.table}` : ""}
                  </p>
                  <p className="inline-flex items-center gap-1">
                    <Clock3 size={12} />
                    Placed {formatTime(order.createdAt)} · Elapsed{" "}
                    {formatElapsed(nowTs - order.createdAt)}
                  </p>
                </div>

                <div className="mt-3 space-y-1.5">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="text-xs bg-white rounded border border-gray-100 px-2.5 py-2"
                    >
                      <p className="font-medium text-gray-700">
                        {item.name}
                        {item.variationName ? ` (${item.variationName})` : ""} x{item.qty}
                      </p>
                    </div>
                  ))}
                </div>

                {order.notes ? (
                  <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-2.5 py-2">
                    Note: {order.notes}
                  </p>
                ) : null}

                {canUpdateKitchenStatus ? (
                  <div className="mt-3 flex gap-2">
                    {status === "Pending" && (
                      <button
                        onClick={() => onMarkRunning(order.id)}
                        disabled={isBusy}
                        className="flex-1 rounded-lg bg-blue-600 text-white text-xs font-semibold py-2 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isBusy ? "Updating..." : "Mark Running"}
                      </button>
                    )}
                    {status === "Running" && (
                      <button
                        onClick={() => onMarkServed(order.id)}
                        disabled={isBusy}
                        className="flex-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold py-2 hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {isBusy ? "Updating..." : "Mark Served"}
                      </button>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
