"use client";

import React, { useState } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import {
  BRANCH_ADMIN_ALLOWED_PATHS,
  ORDER_TAKER_ALLOWED_PATHS,
  STAFF_ALLOWED_PATHS,
  getAuthSession,
} from "@/lib/auth-client";

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.role === "BRANCH_ADMIN" && !BRANCH_ADMIN_ALLOWED_PATHS.has(pathname)) {
      router.replace("/dashboard");
      return;
    }

    if (session.role === "ORDER_TAKER" && !ORDER_TAKER_ALLOWED_PATHS.has(pathname)) {
      router.replace("/create-order");
      return;
    }

    if (
      (session.role === "CASHIER" || session.role === "ACCOUNTANT") &&
      !STAFF_ALLOWED_PATHS.has(pathname)
    ) {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area pushed right of sidebar on desktop */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header
          title={title}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
