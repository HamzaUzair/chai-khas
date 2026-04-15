"use client";

import React from "react";
import { Building2, Calendar, User, Clock } from "lucide-react";
import type { DayEndSummary } from "@/types/dayend";

interface DayStatusCardProps {
  summary: DayEndSummary;
}

const DayStatusCard: React.FC<DayStatusCardProps> = ({ summary }) => {
  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-PK", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Day Status
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center shrink-0">
            <Building2 size={18} className="text-[#ff5a1f]" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Branch</p>
            <p className="text-sm font-semibold text-gray-800">{summary.branchName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Calendar size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Business Date</p>
            <p className="text-sm font-semibold text-gray-800">{formatDate(summary.businessDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <User size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Opened By</p>
            <p className="text-sm font-semibold text-gray-800">{summary.openedBy}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Clock size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">
              {summary.status === "closed" ? "Closed At" : "Opening Time"}
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {summary.status === "closed" ? summary.closedAt ?? "—" : summary.openingTime}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">Current Status</span>
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
            summary.status === "open"
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {summary.status === "open" ? "● Open" : "○ Closed"}
        </span>
      </div>
      {summary.status === "closed" && summary.closedBy && (
        <p className="text-xs text-gray-500 mt-2">
          Closed by {summary.closedBy}
          {summary.closedAt && ` at ${summary.closedAt}`}
        </p>
      )}
    </div>
  );
};

export default DayStatusCard;
