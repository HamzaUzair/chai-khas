"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Printer, Plus } from "lucide-react";

export default function PrintersPage() {
  const authorized = useAuth();

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Printers">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Printer Management</h2>
          <p className="text-sm text-gray-500 mt-1">Configure and manage receipt printers</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#ff5a1f] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#e04e18] transition-colors cursor-pointer">
          <Plus size={18} />
          Add Printer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Printer size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Printers Configured</h3>
          <p className="text-sm text-gray-400 max-w-md">
            Add and configure receipt printers for each branch to enable automatic printing.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
