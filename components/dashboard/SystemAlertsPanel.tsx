"use client";

import React from "react";
import { AlertTriangle, Package, Printer, Clock } from "lucide-react";

interface Alert {
  type: string;
  message: string;
}

interface SystemAlertsPanelProps {
  alerts: Alert[];
}

const iconMap: Record<string, React.ElementType> = {
  inventory: Package,
  printer: Printer,
  orders: Clock,
};

const SystemAlertsPanel: React.FC<SystemAlertsPanelProps> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <AlertTriangle size={16} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-800">System Alerts</h3>
          <p className="text-[11px] text-gray-400">Requires attention</p>
        </div>
      </div>
      <div className="space-y-2">
        {alerts.map((a, i) => {
          const Icon = iconMap[a.type] ?? AlertTriangle;
          const color =
            a.type === "inventory"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : a.type === "printer"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-orange-50 border-orange-200 text-orange-800";
          return (
            <div
              key={i}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${color}`}
            >
              <Icon size={14} className="shrink-0" />
              <span className="text-sm font-medium">⚠ {a.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemAlertsPanel;
