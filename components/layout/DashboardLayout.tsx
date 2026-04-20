"use client";

import React, { useState } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BranchInactiveBanner from "./BranchInactiveBanner";
import {
  SUPER_ADMIN_ALLOWED_PATHS,
  getRestaurantAdminAllowedPaths,
  BRANCH_ADMIN_ALLOWED_PATHS,
  ORDER_TAKER_ALLOWED_PATHS,
  LIVE_KITCHEN_ALLOWED_PATHS,
  CASHIER_ALLOWED_PATHS,
  ACCOUNTANT_ALLOWED_PATHS,
  getAuthSession,
} from "@/lib/auth-client";
import { useBranchStatus } from "@/lib/use-branch-status";

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  // One source of truth for branch / tenant activity. Keeping it at the
  // layout level means Head Office (multi-branch Restaurant Admin),
  // Branch Admin, and all operational staff see the same banner with
  // identical copy — and pages don't need to re-declare it individually.
  // SUPER_ADMIN running the Restenzo panel has no tenant in scope, so
  // the hook resolves `reason === null` and renders nothing.
  const branchStatus = useBranchStatus(authChecked);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.role === "SUPER_ADMIN" && !SUPER_ADMIN_ALLOWED_PATHS.has(pathname)) {
      router.replace("/dashboard");
      return;
    }

    if (
      session.role === "RESTAURANT_ADMIN" &&
      !getRestaurantAdminAllowedPaths(session).has(pathname)
    ) {
      router.replace(pathname === "/create-order" ? "/orders" : "/dashboard");
      return;
    }

    if (
      session.role === "BRANCH_ADMIN" &&
      !BRANCH_ADMIN_ALLOWED_PATHS.has(pathname)
    ) {
      router.replace(pathname === "/create-order" ? "/orders" : "/dashboard");
      return;
    }

    if (session.role === "ORDER_TAKER" && !ORDER_TAKER_ALLOWED_PATHS.has(pathname)) {
      router.replace("/create-order");
      return;
    }

    if (
      session.role === "LIVE_KITCHEN" &&
      !LIVE_KITCHEN_ALLOWED_PATHS.has(pathname)
    ) {
      router.replace("/kitchen");
      return;
    }

    if (session.role === "CASHIER" && !CASHIER_ALLOWED_PATHS.has(pathname)) {
      router.replace("/orders");
      return;
    }

    if (
      session.role === "ACCOUNTANT" &&
      !ACCOUNTANT_ALLOWED_PATHS.has(pathname)
    ) {
      router.replace("/sales-list");
      return;
    }

    // Mark auth as resolved so the inactive-status hook can start polling
    // without racing the redirect logic above.
    setAuthChecked(true);
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header
          title={title}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {branchStatus.isInactive && branchStatus.reason && (
            <BranchInactiveBanner
              reason={branchStatus.reason}
              branchName={branchStatus.branchName ?? undefined}
              restaurantName={branchStatus.restaurantName ?? undefined}
            />
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
