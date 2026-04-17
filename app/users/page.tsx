"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  RefreshCw,
  UserCog,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UsersToolbar from "@/components/users/UsersToolbar";
import UsersTable from "@/components/users/UsersTable";
import UserCardList from "@/components/users/UserCardList";
import UserModal from "@/components/users/UserModal";
import type { Branch } from "@/types/branch";
import type { Restaurant } from "@/types/restaurant";
import type { AppUser, UserFormData, UserRole } from "@/types/user";
import { ADMIN_USER_ROLES, STAFF_USER_ROLES, USER_ROLES } from "@/types/user";
import { apiFetch, getAuthSession } from "@/lib/auth-client";
import type { AuthSession } from "@/types/auth";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function UsersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [branches, setBranches] = useState<
    {
      branch_id: number;
      branch_name: string;
      branch_code: string;
      restaurant_id: number;
      status: string;
    }[]
  >([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [users, setUsersState] = useState<AppUser[]>([]);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [filterBranchId, setFilterBranchId] = useState<number | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"Active" | "Inactive" | "all">("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      const id = Date.now();
      setToasts((p) => [...p, { id, message, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
    },
    []
  );

  useEffect(() => {
    const s = getAuthSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    if (s.role === "RESTAURANT_ADMIN" || s.role === "BRANCH_ADMIN") {
      router.replace("/roles");
      return;
    }
    if (s.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
      return;
    }
    setSession(s);
    setAuthorized(true);
  }, [router]);

  const isSuperAdmin = session?.role === "SUPER_ADMIN";
  const isMultiBranchRa =
    session?.role === "RESTAURANT_ADMIN" &&
    session?.restaurantHasMultipleBranches === true;

  const roleOptions: UserRole[] = useMemo(() => {
    if (isSuperAdmin) return ["RESTAURANT_ADMIN"];
    if (isMultiBranchRa) return ["BRANCH_ADMIN"];
    return STAFF_USER_ROLES;
  }, [isSuperAdmin, isMultiBranchRa]);

  const filterRoleOptions: UserRole[] = useMemo(() => {
    if (isSuperAdmin) return ["RESTAURANT_ADMIN"];
    if (isMultiBranchRa) return ["BRANCH_ADMIN", ...STAFF_USER_ROLES];
    return [...ADMIN_USER_ROLES, ...STAFF_USER_ROLES];
  }, [isSuperAdmin, isMultiBranchRa]);

  const fetchRestaurants = useCallback(async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await apiFetch("/api/restaurants");
      if (!res.ok) throw new Error();
      const data: Restaurant[] = await res.json();
      setRestaurants(data);
    } catch {
      setRestaurants([]);
    }
  }, [isSuperAdmin]);

  const fetchBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const res = await apiFetch("/api/branches");
      if (!res.ok) throw new Error();
      const data: Branch[] = await res.json();
      const active = data.filter((b) => b.status === "Active");
      setBranches(
        active.map((b) => ({
          branch_id: b.branch_id,
          branch_name: b.branch_name,
          branch_code: b.branch_code,
          restaurant_id: b.restaurant_id,
          status: b.status,
        }))
      );
    } catch {
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await apiFetch("/api/users");
      if (!res.ok) throw new Error();
      const data: AppUser[] = await res.json();
      setUsersState(data);
    } catch {
      setUsersState([]);
    }
  }, []);

  useEffect(() => {
    if (!authorized) return;
    fetchRestaurants();
    fetchBranches();
  }, [authorized, fetchRestaurants, fetchBranches]);

  useEffect(() => {
    if (!authorized || branchesLoading) return;
    loadUsers();
  }, [authorized, branchesLoading, loadUsers]);

  const filtered = useMemo(() => {
    let list = users;
    if (filterRole !== "all") list = list.filter((u) => u.role === filterRole);
    if (filterBranchId !== "all")
      list = list.filter((u) => u.branchId === filterBranchId);
    if (filterStatus !== "all") list = list.filter((u) => u.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.fullName.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }, [users, filterRole, filterBranchId, filterStatus, search]);

  const openCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };
  const openEdit = (user: AppUser) => {
    setEditingUser(user);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = (data: UserFormData) => {
    (async () => {
      if (!data.role || !USER_ROLES.includes(data.role)) {
        pushToast("Invalid role selected.", "error");
        return;
      }
      try {
        const effectiveRole = isSuperAdmin ? "RESTAURANT_ADMIN" : data.role;
        const isRoleBranchPinned =
          effectiveRole === "BRANCH_ADMIN" ||
          effectiveRole === "ORDER_TAKER" ||
          effectiveRole === "CASHIER" ||
          effectiveRole === "ACCOUNTANT";
        const payload = {
          username: data.username.trim(),
          fullName: data.fullName.trim(),
          password: data.password,
          role: effectiveRole,
          restaurantId:
            effectiveRole === "SUPER_ADMIN"
              ? null
              : data.restaurantId === ""
              ? null
              : Number(data.restaurantId),
          branchId: isRoleBranchPinned
            ? data.branchId === ""
              ? null
              : Number(data.branchId)
            : null,
          terminal: isSuperAdmin ? 1 : Math.max(1, Number(data.terminal) || 1),
          status: data.status,
        };

        const url = editingUser
          ? `/api/users/${editingUser.userId}`
          : "/api/users";
        const method = editingUser ? "PUT" : "POST";
        const res = await apiFetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to save user");
        }
        await loadUsers();
        pushToast(
          `User "${data.fullName.trim()}" ${editingUser ? "updated" : "created"} successfully.`
        );
        closeModal();
      } catch (e) {
        pushToast(e instanceof Error ? e.message : "Failed to save user", "error");
      }
    })();
  };

  const handleDelete = (user: AppUser) => {
    (async () => {
      if (!window.confirm(`Delete user "${user.fullName}"? This cannot be undone.`))
        return;
      try {
        const res = await apiFetch(`/api/users/${user.userId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to delete user");
        }
        await loadUsers();
        pushToast(`User "${user.fullName}" deleted.`, "error");
      } catch (e) {
        pushToast(e instanceof Error ? e.message : "Failed to delete user", "error");
      }
    })();
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  const restaurantOptions = isSuperAdmin
    ? restaurants.map((r) => ({
        restaurant_id: r.restaurant_id,
        name: r.name,
        slug: r.slug,
      }))
    : session?.restaurantId && session?.restaurantName
    ? [{ restaurant_id: session.restaurantId, name: session.restaurantName }]
    : [];

  return (
    <DashboardLayout title="Users">
      <div className="fixed top-5 right-5 z-[200] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
              t.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {t.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {t.message}
            <button
              onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
              className="ml-1 p-0.5 rounded hover:bg-black/5 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Account Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isSuperAdmin
                ? "Create Restaurant Admins and assign them to Restaurants."
                : isMultiBranchRa
                ? "Create Branch Admins and assign them to branches of your restaurant."
                : "Manage staff for your restaurant and assign them to branches."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                fetchRestaurants();
                fetchBranches();
                pushToast("Lookups refreshed");
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
            >
              <PlusCircle size={16} />
              {isSuperAdmin
                ? "+ Add Restaurant Admin"
                : isMultiBranchRa
                ? "+ Add Branch Admin"
                : "+ Add User"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 mb-6 text-sm text-blue-700">
        <span className="flex items-center gap-2">
          <Info size={16} className="shrink-0" />
          {isSuperAdmin ? (
            <>
              Managing <span className="font-semibold">{users.length}</span> Restaurant
              Admins across <span className="font-semibold">{restaurants.length}</span>{" "}
              restaurants
            </>
          ) : isMultiBranchRa ? (
            <>
              <span className="font-semibold">{branches.length}</span> branches · assign
              a dedicated Branch Admin to each
            </>
          ) : (
            <>
              <span className="font-semibold">{branches.length}</span> branches in your
              restaurant
            </>
          )}
        </span>
      </div>

      <UsersToolbar
        branches={branches}
        search={search}
        onSearchChange={setSearch}
        filterRole={filterRole}
        onRoleChange={setFilterRole}
        filterBranchId={filterBranchId}
        onBranchChange={setFilterBranchId}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        roleOptions={filterRoleOptions}
        hideBranchFilter={isSuperAdmin}
      />

      {!branchesLoading && filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <UserCog size={28} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              {users.length === 0
                ? isSuperAdmin
                  ? "No Restaurant Admins yet. Click '+ Add Restaurant Admin' to get started."
                  : isMultiBranchRa
                  ? "No Branch Admins yet. Click '+ Add Branch Admin' to get started."
                  : "No users yet. Click '+ Add User' to get started."
                : "No users match your current filters."}
            </p>
            {users.length === 0 && (
              <button
                onClick={openCreate}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
              >
                <PlusCircle size={16} />
                {isSuperAdmin
                  ? "Add your first Restaurant Admin"
                  : isMultiBranchRa
                  ? "Add your first Branch Admin"
                  : "Add your first user"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <UsersTable
              users={filtered}
              loading={branchesLoading}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          </div>
          <div className="md:hidden">
            <UserCardList
              users={filtered}
              loading={branchesLoading}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          </div>
        </>
      )}

      <UserModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editUser={editingUser}
        branches={branches}
        restaurants={restaurantOptions}
        roleOptions={roleOptions}
        restaurantLocked={!isSuperAdmin}
        fixedRestaurantId={isSuperAdmin ? null : session?.restaurantId ?? null}
        hideBranchFields={isSuperAdmin}
        hideTerminalField={isSuperAdmin}
        title={
          isSuperAdmin
            ? editingUser
              ? "Edit Restaurant Admin"
              : "Add Restaurant Admin"
            : isMultiBranchRa
            ? editingUser
              ? "Edit Branch Admin"
              : "Add Branch Admin"
            : undefined
        }
      />
    </DashboardLayout>
  );
}
