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
import type { AppUser, UserFormData, UserRole } from "@/types/user";
import {
  getUsers,
  setUsers,
  nextUserId,
  generateDemoUsers,
  FALLBACK_BRANCHES,
} from "@/lib/usersStorage";

/* ── toast ── */
interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function UsersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── Branches ── */
  const [branches, setBranches] = useState<
    { branch_id: number; branch_name: string; branch_code: string; status: string }[]
  >([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchCount, setBranchCount] = useState(0);

  /* ── Users ── */
  const [users, setUsersState] = useState<AppUser[]>([]);

  /* ── Filters ── */
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [filterBranchId, setFilterBranchId] = useState<number | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"Active" | "Inactive" | "all">("all");

  /* ── Modal ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  /* ── Toast ── */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);

  /* ── Persist ── */
  const persist = useCallback((updated: AppUser[]) => {
    setUsersState(updated);
    setUsers(updated);
  }, []);

  /* ══════════ Auth ══════════ */
  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  /* ══════════ Fetch branches ══════════ */
  const fetchBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const res = await fetch("/api/branches");
      if (!res.ok) throw new Error();
      const data: Branch[] = await res.json();
      const active = data.filter((b) => b.status === "Active");
      const mapped = active.map((b) => ({
        branch_id: b.branch_id,
        branch_name: b.branch_name,
        branch_code: b.branch_code,
        status: b.status,
      }));
      setBranches(mapped.length > 0 ? mapped : FALLBACK_BRANCHES);
      setBranchCount(mapped.length > 0 ? mapped.length : FALLBACK_BRANCHES.length);
    } catch {
      setBranches(FALLBACK_BRANCHES);
      setBranchCount(FALLBACK_BRANCHES.length);
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) fetchBranches();
  }, [authorized, fetchBranches]);

  /* ══════════ Load / seed users ══════════ */
  const loadUsers = useCallback(() => {
    let stored = getUsers();
    if (stored.length === 0) {
      stored = generateDemoUsers(branches);
      setUsers(stored);
    }
    setUsersState(stored);
  }, [branches]);

  useEffect(() => {
    if (!authorized || branchesLoading) return;
    loadUsers();
  }, [authorized, branchesLoading, loadUsers]);

  /* ══════════ Filtered ══════════ */
  const filtered = useMemo(() => {
    let list = users;
    if (filterRole !== "all") list = list.filter((u) => u.role === filterRole);
    if (filterBranchId !== "all") list = list.filter((u) => u.branchId === filterBranchId);
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

  /* ══════════ CRUD ══════════ */
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
    const branch = branches.find((b) => b.branch_id === Number(data.branchId));
    const isSA = data.role === "Super Admin";
    const now = Date.now();

    if (editingUser) {
      const updated = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              username: data.username.trim(),
              fullName: data.fullName.trim(),
              role: data.role as UserRole,
              branchId: isSA ? null : Number(data.branchId),
              branchName: isSA ? "No Branch" : branch?.branch_name ?? "No Branch",
              branchCode: isSA ? "—" : branch?.branch_code ?? "—",
              terminal: Math.max(1, Number(data.terminal) || 1),
              status: data.status,
            }
          : u
      );
      persist(updated);
      pushToast(`User "${data.fullName.trim()}" updated successfully.`);
    } else {
      const newUser: AppUser = {
        id: crypto.randomUUID(),
        userId: nextUserId(users),
        username: data.username.trim(),
        fullName: data.fullName.trim(),
        role: data.role as UserRole,
        branchId: isSA ? null : Number(data.branchId),
        branchName: isSA ? "No Branch" : branch?.branch_name ?? "No Branch",
        branchCode: isSA ? "—" : branch?.branch_code ?? "—",
        status: data.status,
        terminal: Math.max(1, Number(data.terminal) || 1),
        createdAt: now,
      };
      persist([newUser, ...users]);
      pushToast(`User "${data.fullName.trim()}" created successfully.`);
    }
    closeModal();
  };

  const handleDelete = (user: AppUser) => {
    if (!window.confirm(`Delete user "${user.fullName}"? This action cannot be undone.`)) return;
    persist(users.filter((u) => u.id !== user.id));
    pushToast(`User "${user.fullName}" deleted.`, "error");
  };

  /* ══════════ Auth loading ══════════ */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Users">
      {/* ── Toast ── */}
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

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Account Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              Super Admin can add users with roles and assign them to branches
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                fetchBranches();
                pushToast("Branches refreshed");
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <RefreshCw size={15} />
              Refresh Branches
            </button>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
            >
              <PlusCircle size={16} />
              + Add User
            </button>
          </div>
        </div>
      </div>

      {/* ── Branch status banner ── */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 mb-6 text-sm text-blue-700">
        <span className="flex items-center gap-2">
          <Info size={16} className="shrink-0" />
          Branches Status: ✅{" "}
          <span className="font-semibold">{branchCount} branches loaded</span>
        </span>
        <button
          onClick={() => {
            fetchBranches();
            pushToast("Branches refreshed");
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* ── Toolbar ── */}
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
      />

      {/* ── Content ── */}
      {!branchesLoading && filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <UserCog size={28} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              {users.length === 0
                ? "No users yet. Click '+ Add User' to get started."
                : "No users match your current filters."}
            </p>
            {users.length === 0 && (
              <button
                onClick={openCreate}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
              >
                <PlusCircle size={16} />
                Add your first user
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

      {/* ── Modal ── */}
      <UserModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editUser={editingUser}
        branches={branches}
      />
    </DashboardLayout>
  );
}
