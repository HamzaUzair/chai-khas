"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Eye,
  PlayCircle,
  PauseCircle,
  Ban,
  Trash2,
  LifeBuoy,
  Loader2,
} from "lucide-react";

export type TenantAction =
  | "view"
  | "edit"
  | "activate"
  | "deactivate"
  | "suspend"
  | "delete"
  | "support";

export interface TenantActionsMenuProps {
  currentStatus: string;
  busy?: TenantAction | null;
  onAction: (action: TenantAction) => void;
}

/**
 * Actions dropdown for a tenant row. Buttons shown adapt to the
 * current status so we never offer, e.g., "Activate" when the tenant
 * is already active.
 */
const TenantActionsMenu: React.FC<TenantActionsMenuProps> = ({
  currentStatus,
  busy,
  onAction,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const items: Array<{
    key: TenantAction;
    label: string;
    icon: React.ReactNode;
    tone?: "default" | "danger";
    disabled?: boolean;
  }> = [
    { key: "view", label: "View details", icon: <Eye size={14} /> },
    { key: "edit", label: "Edit", icon: <Pencil size={14} /> },
  ];
  if (currentStatus !== "Active") {
    items.push({
      key: "activate",
      label: "Activate",
      icon: <PlayCircle size={14} />,
    });
  }
  if (currentStatus === "Active") {
    items.push({
      key: "deactivate",
      label: "Deactivate",
      icon: <PauseCircle size={14} />,
    });
  }
  if (currentStatus !== "Suspended") {
    items.push({
      key: "suspend",
      label: "Suspend",
      icon: <Ban size={14} />,
      tone: "danger",
    });
  }
  items.push({
    key: "support",
    label: "Open support view",
    icon: <LifeBuoy size={14} />,
  });
  items.push({
    key: "delete",
    label: "Delete tenant",
    icon: <Trash2 size={14} />,
    tone: "danger",
  });

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        aria-label="Row actions"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <MoreHorizontal size={16} />}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              disabled={item.disabled || busy === item.key}
              onClick={() => {
                setOpen(false);
                onAction(item.key);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                item.tone === "danger"
                  ? "text-rose-600 hover:bg-rose-50"
                  : "text-gray-700 hover:bg-gray-50"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TenantActionsMenu;
