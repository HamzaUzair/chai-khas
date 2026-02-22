"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, ChefHat, Users, Activity, LayoutGrid } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KitchenToolbar from "@/components/kitchen/KitchenToolbar";
import StationGrid from "@/components/kitchen/StationGrid";
import StaffList from "@/components/kitchen/StaffList";
import StationModal from "@/components/kitchen/StationModal";
import StaffModal from "@/components/kitchen/StaffModal";
import AssignStaffModal from "@/components/kitchen/AssignStaffModal";
import type { StatusFilter, KitchenView } from "@/components/kitchen/KitchenToolbar";
import type { Branch } from "@/types/branch";
import type {
  KitchenStation,
  KitchenStaff,
  StationFormData,
  StaffFormData,
} from "@/types/kitchen";
import {
  getStations,
  setStations,
  getStaff,
  setStaff,
  generateDemoData,
} from "@/lib/kitchenStorage";

export default function KitchenPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── API branches ── */
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  /* ── localStorage data ── */
  const [stations, setStationsState] = useState<KitchenStation[]>([]);
  const [staff, setStaffState] = useState<KitchenStaff[]>([]);

  /* ── Filters ── */
  const [filterBranchId, setFilterBranchId] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<KitchenView>("stations");

  /* ── Station modals ── */
  const [stationModalOpen, setStationModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<KitchenStation | null>(null);

  /* ── Staff modals ── */
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<KitchenStaff | null>(null);

  /* ── Assign staff modal ── */
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignStation, setAssignStation] = useState<KitchenStation | null>(null);

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
  useEffect(() => {
    if (!authorized || branchesLoading) return;

    let storedStations = getStations();
    let storedStaff = getStaff();

    if (storedStations.length === 0 && storedStaff.length === 0 && branches.length > 0) {
      const demo = generateDemoData(
        branches.map((b) => ({ branchId: b.branch_id, branchName: b.branch_name }))
      );
      storedStations = demo.stations;
      storedStaff = demo.staff;
      setStations(storedStations);
      setStaff(storedStaff);
    }

    setStationsState(storedStations);
    setStaffState(storedStaff);
  }, [authorized, branchesLoading, branches]);

  /* ══════════════ Persist helpers ══════════════ */
  const persistStations = useCallback((updated: KitchenStation[]) => {
    setStationsState(updated);
    setStations(updated);
  }, []);

  const persistStaff = useCallback((updated: KitchenStaff[]) => {
    setStaffState(updated);
    setStaff(updated);
  }, []);

  /* ══════════════ Filtered data ══════════════ */
  const filteredStations = useMemo(() => {
    let result = stations;
    if (filterBranchId !== "all") result = result.filter((s) => s.branchId === filterBranchId);
    if (statusFilter !== "all") result = result.filter((s) => s.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.branchName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [stations, filterBranchId, statusFilter, search]);

  const filteredStaff = useMemo(() => {
    let result = staff;
    if (filterBranchId !== "all") result = result.filter((s) => s.branchId === filterBranchId);
    if (statusFilter !== "all") result = result.filter((s) => s.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q) ||
          s.branchName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [staff, filterBranchId, statusFilter, search]);

  /* ══════════════ Stats (filtered by branch) ══════════════ */
  const stats = useMemo(() => {
    const branchStations =
      filterBranchId === "all"
        ? stations
        : stations.filter((s) => s.branchId === filterBranchId);
    const branchStaff =
      filterBranchId === "all"
        ? staff
        : staff.filter((s) => s.branchId === filterBranchId);

    return {
      totalStations: branchStations.length,
      activeStations: branchStations.filter((s) => s.status === "active").length,
      totalStaff: branchStaff.length,
      activeStaff: branchStaff.filter((s) => s.status === "active").length,
    };
  }, [stations, staff, filterBranchId]);

  /* ══════════════ Station CRUD ══════════════ */
  const openAddStation = () => {
    setEditingStation(null);
    setStationModalOpen(true);
  };

  const openEditStation = (station: KitchenStation) => {
    setEditingStation(station);
    setStationModalOpen(true);
  };

  const handleStationSave = (data: StationFormData) => {
    const branchId = typeof data.branchId === "number" ? data.branchId : Number(data.branchId);
    const branch = branches.find((b) => b.branch_id === branchId);

    if (editingStation) {
      const updated = stations.map((s) =>
        s.id === editingStation.id
          ? {
              ...s,
              title: data.title.trim(),
              code: data.code.trim(),
              printerName: data.printerName.trim() || undefined,
              status: data.status,
            }
          : s
      );
      persistStations(updated);
    } else {
      const newStation: KitchenStation = {
        id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`),
        branchId,
        branchName: branch?.branch_name ?? "",
        title: data.title.trim(),
        code: data.code.trim(),
        printerName: data.printerName.trim() || undefined,
        status: data.status,
        staffIds: [],
        createdAt: Date.now(),
      };
      persistStations([newStation, ...stations]);
    }
    setStationModalOpen(false);
    setEditingStation(null);
  };

  const handleStationDelete = (station: KitchenStation) => {
    if (!window.confirm(`Delete station "${station.title}" (${station.code})?`)) return;
    persistStations(stations.filter((s) => s.id !== station.id));
  };

  /* ══════════════ Assign staff ══════════════ */
  const openAssignStaff = (station: KitchenStation) => {
    setAssignStation(station);
    setAssignModalOpen(true);
  };

  const handleAssignSave = (staffIds: string[]) => {
    if (!assignStation) return;
    const updated = stations.map((s) =>
      s.id === assignStation.id ? { ...s, staffIds } : s
    );
    persistStations(updated);
    setAssignModalOpen(false);
    setAssignStation(null);
  };

  const assignBranchStaff = useMemo(() => {
    if (!assignStation) return [];
    return staff.filter((s) => s.branchId === assignStation.branchId);
  }, [staff, assignStation]);

  /* ══════════════ Staff CRUD ══════════════ */
  const openAddStaff = () => {
    setEditingStaff(null);
    setStaffModalOpen(true);
  };

  const openEditStaff = (s: KitchenStaff) => {
    setEditingStaff(s);
    setStaffModalOpen(true);
  };

  const handleStaffSave = (data: StaffFormData) => {
    const branchId = typeof data.branchId === "number" ? data.branchId : Number(data.branchId);
    const branch = branches.find((b) => b.branch_id === branchId);

    if (editingStaff) {
      const updated = staff.map((s) =>
        s.id === editingStaff.id
          ? {
              ...s,
              name: data.name.trim(),
              role: data.role,
              phone: data.phone.trim() || undefined,
              status: data.status,
            }
          : s
      );
      persistStaff(updated);
    } else {
      const newStaff: KitchenStaff = {
        id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`),
        branchId,
        branchName: branch?.branch_name ?? "",
        name: data.name.trim(),
        role: data.role,
        phone: data.phone.trim() || undefined,
        status: data.status,
      };
      persistStaff([newStaff, ...staff]);
    }
    setStaffModalOpen(false);
    setEditingStaff(null);
  };

  const handleStaffDelete = (s: KitchenStaff) => {
    if (!window.confirm(`Delete staff member "${s.name}"?`)) return;
    // Also remove from all station assignments
    const updatedStations = stations.map((st) => ({
      ...st,
      staffIds: st.staffIds.filter((id) => id !== s.id),
    }));
    persistStations(updatedStations);
    persistStaff(staff.filter((x) => x.id !== s.id));
  };

  /* ══════════════ Loading ══════════════ */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  const noBranches = !branchesLoading && branches.length === 0;

  /* ══════════════ Stat cards config ══════════════ */
  const statCards = [
    {
      label: "Total Stations",
      value: stats.totalStations,
      icon: <LayoutGrid size={20} />,
      bg: "bg-[#ff5a1f]/10",
      color: "text-[#ff5a1f]",
    },
    {
      label: "Active Stations",
      value: stats.activeStations,
      icon: <Activity size={20} />,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      label: "Total Staff",
      value: stats.totalStaff,
      icon: <Users size={20} />,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      label: "Active Staff",
      value: stats.activeStaff,
      icon: <ChefHat size={20} />,
      bg: "bg-purple-50",
      color: "text-purple-600",
    },
  ];

  return (
    <DashboardLayout title="Kitchen">
      {/* ── Page Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Kitchen Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage kitchen stations, assign staff, and monitor activity across
              branches
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {view === "staff" && (
              <button
                onClick={openAddStaff}
                disabled={noBranches}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#ff5a1f] text-[#ff5a1f] text-sm font-semibold hover:bg-[#ff5a1f]/5 transition-colors cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusCircle size={16} />
                + Add Staff
              </button>
            )}
            <button
              onClick={openAddStation}
              disabled={noBranches}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle size={16} />
              + Add Kitchen Station
            </button>
          </div>
        </div>
        {noBranches && (
          <p className="text-xs text-red-500 mt-2">
            Create an active branch first to add kitchen stations and staff.
          </p>
        )}
      </div>

      {/* ── Stats Row ── */}
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
      <KitchenToolbar
        branches={branches}
        branchesLoading={branchesLoading}
        filterBranchId={filterBranchId}
        onBranchChange={setFilterBranchId}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        search={search}
        onSearchChange={setSearch}
        view={view}
        onViewChange={setView}
      />

      {/* ── Content ── */}
      {branchesLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
        </div>
      ) : view === "stations" ? (
        <StationGrid
          stations={filteredStations}
          allStaff={staff}
          onEdit={openEditStation}
          onDelete={handleStationDelete}
          onManageStaff={openAssignStaff}
        />
      ) : (
        <StaffList
          staff={filteredStaff}
          stations={stations}
          loading={false}
          onEdit={openEditStaff}
          onDelete={handleStaffDelete}
        />
      )}

      {/* ── Station Modal ── */}
      <StationModal
        isOpen={stationModalOpen}
        onClose={() => {
          setStationModalOpen(false);
          setEditingStation(null);
        }}
        onSave={handleStationSave}
        editStation={editingStation}
        activeBranches={branches}
        showBranchSelect={filterBranchId === "all"}
        currentBranchId={filterBranchId}
        existingStations={stations}
      />

      {/* ── Staff Modal ── */}
      <StaffModal
        isOpen={staffModalOpen}
        onClose={() => {
          setStaffModalOpen(false);
          setEditingStaff(null);
        }}
        onSave={handleStaffSave}
        editStaff={editingStaff}
        activeBranches={branches}
        showBranchSelect={filterBranchId === "all"}
        currentBranchId={filterBranchId}
      />

      {/* ── Assign Staff Modal ── */}
      <AssignStaffModal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setAssignStation(null);
        }}
        onSave={handleAssignSave}
        station={assignStation}
        branchStaff={assignBranchStaff}
      />
    </DashboardLayout>
  );
}
