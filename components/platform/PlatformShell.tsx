"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAuthSession } from "@/lib/auth-client";

interface PlatformShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
}

/**
 * Auth + role gate + chrome for every Platform Admin page.
 *
 * Only SUPER_ADMIN may render these pages; everyone else is bounced to
 * their own dashboard. The shell hosts the page heading + optional
 * contextual action (refresh, filters, etc.) so each page can stay lean
 * and only focus on its content.
 */
const PlatformShell: React.FC<PlatformShellProps> = ({
  title,
  subtitle,
  children,
  headerExtra,
}) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

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

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff5a1f]" />
      </div>
    );
  }

  return (
    <DashboardLayout title={title}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {headerExtra && <div className="shrink-0">{headerExtra}</div>}
      </div>
      {children}
    </DashboardLayout>
  );
};

export default PlatformShell;
