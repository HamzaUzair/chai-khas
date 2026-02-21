"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Building2,
  ShoppingCart,
  Layers3,
  UtensilsCrossed,
  ClipboardList,
  Landmark,
  TrendingUp,
  DollarSign,
  Package,
  FolderOpen,
} from "lucide-react";

/* ── Static stat cards data ── */
interface StatCard {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const stats: StatCard[] = [
  {
    label: "Total Branches",
    value: "0",
    icon: <Building2 size={24} />,
    color: "text-[#ff5a1f]",
    bg: "bg-[#ff5a1f]/10",
  },
  {
    label: "Total Orders",
    value: "0",
    icon: <ShoppingCart size={24} />,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Total Sales",
    value: "PKR 0.00",
    icon: <DollarSign size={24} />,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    label: "Menu Items",
    value: "0",
    icon: <Package size={24} />,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Categories",
    value: "0",
    icon: <FolderOpen size={24} />,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

/* ── Quick action buttons data ── */
interface QuickAction {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const quickActions: QuickAction[] = [
  {
    label: "Branches",
    icon: <Building2 size={22} />,
    color: "text-[#ff5a1f]",
    bg: "bg-[#ff5a1f]/10",
  },
  {
    label: "Create Order",
    icon: <ShoppingCart size={22} />,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Categories",
    icon: <Layers3 size={22} />,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Menu Items",
    icon: <UtensilsCrossed size={22} />,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    label: "Orders",
    icon: <ClipboardList size={22} />,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Accounts",
    icon: <Landmark size={22} />,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

/* ── Branch table columns ── */
const branchTableCols = [
  "Branch Name",
  "Daily Sales",
  "Running Orders",
  "Complete Bills",
];

export default function DashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  // ── Route protection ──
  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (isAuth !== "true") {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* ── Page heading ── */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Super Admin Dashboard
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Viewing all branches &mdash; Global analytics
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0 ${s.color}`}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                {s.label}
              </p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Branch Daily Statistics Table ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <TrendingUp size={20} className="text-[#ff5a1f]" />
          <h3 className="text-base font-semibold text-gray-800">
            Branch Daily Statistics
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {branchTableCols.map((col) => (
                  <th
                    key={col}
                    className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={branchTableCols.length}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Building2 size={32} className="text-gray-300" />
                    <span className="text-sm">No data available</span>
                    <span className="text-xs text-gray-300">
                      Branch statistics will appear here once branches are added
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((a) => (
            <button
              key={a.label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-3 hover:shadow-md hover:border-[#ff5a1f]/30 transition-all cursor-pointer group"
            >
              <div
                className={`w-12 h-12 rounded-xl ${a.bg} flex items-center justify-center ${a.color} group-hover:scale-110 transition-transform`}
              >
                {a.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#ff5a1f] transition-colors">
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
