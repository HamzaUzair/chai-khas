"use client";

import React from "react";

export type PlatformBadgeTone =
  | "active"
  | "trial"
  | "inactive"
  | "suspended"
  | "canceled"
  | "warning"
  | "info"
  | "neutral"
  | "success"
  | "danger";

interface StatusBadgeProps {
  label: string;
  tone: PlatformBadgeTone;
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

const TONE_MAP: Record<PlatformBadgeTone, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
  trial: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  inactive: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200",
  suspended: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100",
  canceled: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  info: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100",
  neutral: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
  danger: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100",
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  tone,
  size = "sm",
  icon,
}) => {
  const sizeCls =
    size === "md" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeCls} ${TONE_MAP[tone]}`}
    >
      {icon}
      {label}
    </span>
  );
};

export default StatusBadge;
