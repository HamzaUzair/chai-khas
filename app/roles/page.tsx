"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  RefreshCw,
  UserCog,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UsersToolbar from "@/components/users/UsersToolbar";
import UsersTable from "@/components/users/UsersTable";
import UserCardList from "@/components/users/UserCardList";
import UserModal from "@/components/users/UserModal";
import type { Branch } from "@/types/branch";
import type { AppUser, UserFormData, UserRole } from "@/types/user";
import { STAFF_USER_ROLES } from "@/types/user";
import { apiFetch, getAuthSession } from "@/lib/auth-client";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

type BranchOption = {
  branch_id: number;
  branch_name: string;
  branch_code: string;
  status: string;
};

export default function RolesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [sessionBranchId, setSessionBranchId] = useState<number | null>(null);

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [users, setUsersState] = useState<AppUser[]>([]);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"Active" | "Inactive" | "all">("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== "BRANCH_ADMIN" || !session.branchId) {
      router.replace("/dashboard");
      return;
    }

    setSessionBranchId(session.branchId);
    setAuthorized(true);
  }, [router]);

  const fetchBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const res = await apiFetch("/api/branches");
      if (!res.ok) throw new Error();
      const data: Branch[] = await res.json();
      const active = data.filter((b) => b.status === "Active");
      const mapped = active.map((b) => ({
        branch_id: b.branch_id,
        branch_name: b.branch_name,
        branch_code: b.branch_code,
        status: b.status,
      }));
      setBranches(mapped);
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
    if (authorized) fetchBranches();
  }, [authorized, fetchBranches]);

  useEffect(() => {
    if (!authorized || branchesLoading) return;
    loadUsers();
  }, [authorized, branchesLoading, loadUsers]);

  const filtered = useMemo(() => {
    let list = users;
    if (filterRole !== "all") list = list.filter((u) => u.role === filterRole);
    if (filterStatus !== "all") list = list.filter((u) => u.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.fullName.toLowerCase().includes(q) ||
          u.branchName.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }, [users, filterRole, filterStatus, search]);

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
      if (!data.role || !STAFF_USER_ROLES.includes(data.role)) {
        pushToast("Invalid staff role selected.", "error");
        return;
      }
      try {
        const payload = {
          username: data.username.trim(),
          fullName: data.fullName.trim(),
          password: data.password,
          role: data.role,
          branchId: sessionBranchId,
          terminal: Math.max(1, Number(data.terminal) || 1),
          status: data.status,
        };

        const url = editingUser ? `/api/users/${editingUser.userId}` : "/api/users";
        const method = editingUser ? "PUT" : "POST";
        const res = await apiFetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to save staff user");
        }
        await loadUsers();
        pushToast(
          `Staff "${data.fullName.trim()}" ${editingUser ? "updated" : "created"} successfully.`
        );
        closeModal();
      } catch (e) {
        pushToast(e instanceof Error ? e.message : "Failed to save staff user", "error");
      }
    })();
  };

  const handleDelete = (user: AppUser) => {
    (async () => {
      if (!window.confirm(`Delete staff "${user.fullName}"? This action cannot be undone.`)) return;
      try {
        const res = await apiFetch(`/api/users/${user.userId}`, { method: "DELETE" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to delete staff user");
        }
        await loadUsers();
        pushToast(`Staff "${user.fullName}" deleted.`, "error");
      } catch (e) {
        pushToast(e instanceof Error ? e.message : "Failed to delete staff user", "error");
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

  return (
    <DashboardLayout title="Roles">
      <div className="fixed top-5 right-5 z-[200] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-[slideIn_0.25s_ease-out] ${
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
            <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage Order Takers, Cashiers, and Accountants for your branch
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                fetchBranches();
                loadUsers();
                pushToast("Staff list refreshed");
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
              + Add Staff
            </button>
          </div>
        </div>
      </div>

      <UsersToolbar
        branches={branches}
        search={search}
        onSearchChange={setSearch}
        filterRole={filterRole}
        onRoleChange={setFilterRole}
        filterBranchId={sessionBranchId ?? "all"}
        onBranchChange={() => {}}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        roleOptions={STAFF_USER_ROLES}
        branchLocked
      />

      {!branchesLoading && filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <UserCog size={28} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              {users.length === 0
                ? "No staff users yet. Click '+ Add Staff' to get started."
                : "No staff users match your current filters."}
            </p>
            {users.length === 0 && (
              <button
                onClick={openCreate}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
              >
                <PlusCircle size={16} />
                Add your first staff user
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
        roleOptions={STAFF_USER_ROLES}
        branchLocked
        fixedBranchId={sessionBranchId}
        title={editingUser ? "Edit Staff User" : "Add New Staff User"}
      />
    </DashboardLayout>
  );
}

