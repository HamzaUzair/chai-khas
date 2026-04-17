"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Store } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RestaurantTable from "@/components/restaurants/RestaurantTable";
import RestaurantModal, {
  type RestaurantEditAdmin,
} from "@/components/restaurants/RestaurantModal";
import type { ApiError } from "@/types/branch";
import type {
  Restaurant,
  RestaurantDetail,
  RestaurantFormData,
} from "@/types/restaurant";
import { apiFetch, getAuthSession } from "@/lib/auth-client";

export default function RestaurantsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<RestaurantEditAdmin | null>(
    null
  );
  const [loadingEdit, setLoadingEdit] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
      return;
    }
    setAuthorized(true);
  }, [router]);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await apiFetch("/api/restaurants");
      if (!res.ok) throw new Error("Failed to load restaurants");
      const data: Restaurant[] = await res.json();
      setRestaurants(data);
    } catch {
      setFetchError("Could not load restaurants. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) fetchRestaurants();
  }, [authorized, fetchRestaurants]);

  const openCreate = () => {
    setEditing(null);
    setEditingAdmin(null);
    setModalOpen(true);
  };

  const openEdit = async (r: Restaurant) => {
    setEditing(r);
    setEditingAdmin(null);
    setModalOpen(true);
    setLoadingEdit(true);
    try {
      const res = await apiFetch(`/api/restaurants/${r.restaurant_id}`);
      if (res.ok) {
        const detail: RestaurantDetail = await res.json();
        setEditingAdmin(detail.primary_admin ?? null);
      }
    } catch {
      // Silently ignore — the modal will still work, just without prefilled
      // admin credentials. The Super Admin can always re-enter them.
    } finally {
      setLoadingEdit(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setEditingAdmin(null);
  };

  const handleSubmit = async (data: RestaurantFormData) => {
    if (editing) {
      const res = await apiFetch(`/api/restaurants/${editing.restaurant_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiError = await res.json();
        throw new Error(body.error || "Failed to update restaurant");
      }
      const updated: Restaurant = await res.json();
      setRestaurants((prev) =>
        prev.map((r) =>
          r.restaurant_id === updated.restaurant_id ? { ...r, ...updated } : r
        )
      );
    } else {
      const res = await apiFetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body: ApiError = await res.json();
        throw new Error(body.error || "Failed to create restaurant");
      }
      const created: Restaurant = await res.json();
      setRestaurants((prev) => [created, ...prev]);
    }
    closeModal();
  };

  const handleDelete = async (r: Restaurant) => {
    const confirmed = window.confirm(
      `Delete restaurant "${r.name}"? All its branches and users will also be removed. This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await apiFetch(`/api/restaurants/${r.restaurant_id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body: ApiError = await res.json();
        alert(body.error || "Failed to delete restaurant");
        return;
      }
      setRestaurants((prev) =>
        prev.filter((x) => x.restaurant_id !== r.restaurant_id)
      );
    } catch {
      alert("Network error. Could not delete restaurant.");
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Restaurants">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center">
              <Store size={20} className="text-[#ff5a1f]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Restaurant Management
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Onboard restaurants (SaaS tenants) and assign their Restaurant
                Admin. Each restaurant can have many branches.
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm shrink-0"
          >
            <PlusCircle size={18} />
            Add Restaurant
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {fetchError}
          <button
            onClick={fetchRestaurants}
            className="ml-auto text-xs font-medium underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      <RestaurantTable
        restaurants={restaurants}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <RestaurantModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editRestaurant={editing}
        editAdmin={editingAdmin}
        editBranchCount={editing?.branch_count ?? 0}
      />
      {loadingEdit && modalOpen && editing && !editingAdmin && (
        <div className="fixed bottom-4 right-4 z-[120] bg-white shadow-lg border border-gray-200 rounded-lg px-4 py-2 text-xs text-gray-500">
          Loading admin details…
        </div>
      )}
    </DashboardLayout>
  );
}
