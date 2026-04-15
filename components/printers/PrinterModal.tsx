"use client";

import React, { useEffect, useState, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import type { Branch } from "@/types/branch";
import type { Printer, PrinterFormData } from "@/types/printer";
import {
  PRINTER_TYPES,
  CONNECTION_TYPES,
  PAPER_SIZES,
  ASSIGNED_AREAS,
} from "@/lib/constants/printerConfig";

const emptyForm: PrinterFormData = {
  name: "",
  type: "receipt",
  branchId: "",
  assignedArea: "",
  connectionType: "network",
  ipAddress: "",
  port: "9100",
  usbPort: "",
  paperSize: "80mm",
  status: "active",
  autoPrintReceipts: false,
  autoPrintKitchenTickets: false,
  autoPrintInvoices: false,
};

interface PrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PrinterFormData) => void;
  editPrinter: Printer | null;
  activeBranches: Branch[];
  branchesLoading: boolean;
}

const inputBase =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";

const PrinterModal: React.FC<PrinterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editPrinter,
  activeBranches,
  branchesLoading,
}) => {
  const [form, setForm] = useState<PrinterFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof PrinterFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!editPrinter;

  useEffect(() => {
    if (isOpen) {
      if (editPrinter) {
        setForm({
          name: editPrinter.name,
          type: editPrinter.type,
          branchId: editPrinter.branchId,
          assignedArea: editPrinter.assignedArea,
          connectionType: editPrinter.connectionType,
          ipAddress: editPrinter.ipAddress ?? "",
          port: editPrinter.port ? String(editPrinter.port) : "9100",
          usbPort: editPrinter.usbPort ?? "",
          paperSize: editPrinter.paperSize,
          status: editPrinter.status,
          autoPrintReceipts: editPrinter.autoPrintReceipts,
          autoPrintKitchenTickets: editPrinter.autoPrintKitchenTickets,
          autoPrintInvoices: editPrinter.autoPrintInvoices,
        });
      } else {
        setForm({
          ...emptyForm,
          branchId: activeBranches[0]?.branch_id ?? "",
        });
      }
      setErrors({});
    }
  }, [isOpen, editPrinter, activeBranches]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    },
    [onClose, submitting]
  );
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const update = <K extends keyof PrinterFormData>(
    field: K,
    value: PrinterFormData[K]
  ) => setForm((p) => ({ ...p, [field]: value }));

  const validate = (): boolean => {
    const e: Partial<Record<keyof PrinterFormData, string>> = {};
    if (!form.name.trim()) e.name = "Printer name is required";
    if (form.branchId === "") e.branchId = "Branch is required";
    if (!form.assignedArea.trim()) e.assignedArea = "Assigned area is required";
    if (form.connectionType === "network" && !form.ipAddress.trim()) {
      e.ipAddress = "IP address is required for network printers";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    onSave(form);
    setSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={submitting ? undefined : onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-[#ff5a1f] rounded-full" />
            <h2 className="text-lg font-bold text-gray-800">
              {isEditing ? "Edit Printer" : "Add Printer"}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Printer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`${inputBase} ${errors.name ? "border-red-400 ring-2 ring-red-100" : ""}`}
              placeholder="e.g., Kitchen Printer 1"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Printer Type <span className="text-red-500">*</span>
            </label>
            <select
              className={`${inputBase} appearance-none bg-white cursor-pointer`}
              value={form.type}
              onChange={(e) => update("type", e.target.value as PrinterFormData["type"])}
            >
              {PRINTER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              className={`${inputBase} appearance-none bg-white cursor-pointer ${
                errors.branchId ? "border-red-400 ring-2 ring-red-100" : ""
              }`}
              value={form.branchId}
              onChange={(e) =>
                update("branchId", e.target.value === "" ? "" : Number(e.target.value))
              }
              disabled={branchesLoading || activeBranches.length === 0}
            >
              {branchesLoading ? (
                <option value="">Loading branches…</option>
              ) : activeBranches.length === 0 ? (
                <option value="">No active branches</option>
              ) : (
                <>
                  <option value="">Select a branch</option>
                  {activeBranches.map((b) => (
                    <option key={b.branch_id} value={b.branch_id}>
                      {b.branch_name}
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.branchId && <p className="text-xs text-red-500 mt-1">{errors.branchId}</p>}
          </div>

          {/* Assigned Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Assigned Area / Station <span className="text-red-500">*</span>
            </label>
            <select
              className={`${inputBase} appearance-none bg-white cursor-pointer ${
                errors.assignedArea ? "border-red-400 ring-2 ring-red-100" : ""
              }`}
              value={form.assignedArea}
              onChange={(e) => update("assignedArea", e.target.value)}
            >
              <option value="">Select area</option>
              {ASSIGNED_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            {errors.assignedArea && (
              <p className="text-xs text-red-500 mt-1">{errors.assignedArea}</p>
            )}
          </div>

          {/* Connection Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Connection Type
            </label>
            <select
              className={`${inputBase} appearance-none bg-white cursor-pointer`}
              value={form.connectionType}
              onChange={(e) =>
                update("connectionType", e.target.value as PrinterFormData["connectionType"])
              }
            >
              {CONNECTION_TYPES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* IP + Port (when network) */}
          {form.connectionType === "network" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  IP Address
                </label>
                <input
                  type="text"
                  className={`${inputBase} ${errors.ipAddress ? "border-red-400" : ""}`}
                  placeholder="192.168.1.45"
                  value={form.ipAddress}
                  onChange={(e) => update("ipAddress", e.target.value)}
                />
                {errors.ipAddress && (
                  <p className="text-xs text-red-500 mt-1">{errors.ipAddress}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Port
                </label>
                <input
                  type="text"
                  className={inputBase}
                  placeholder="9100"
                  value={form.port}
                  onChange={(e) => update("port", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* USB Port (when usb) */}
          {form.connectionType === "usb" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                USB Port
              </label>
              <input
                type="text"
                className={inputBase}
                placeholder="e.g., /dev/usb/lp0"
                value={form.usbPort}
                onChange={(e) => update("usbPort", e.target.value)}
              />
            </div>
          )}

          {/* Paper Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Paper Size
            </label>
            <select
              className={`${inputBase} appearance-none bg-white cursor-pointer`}
              value={form.paperSize}
              onChange={(e) => update("paperSize", e.target.value)}
            >
              {PAPER_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <select
              className={`${inputBase} appearance-none bg-white cursor-pointer`}
              value={form.status}
              onChange={(e) =>
                update("status", e.target.value as PrinterFormData["status"])
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Auto Print Options */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700">Auto Print Options</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoPrintReceipts}
                onChange={(e) => update("autoPrintReceipts", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#ff5a1f] focus:ring-[#ff5a1f]"
              />
              <span className="text-sm text-gray-600">Auto print receipts</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoPrintKitchenTickets}
                onChange={(e) => update("autoPrintKitchenTickets", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#ff5a1f] focus:ring-[#ff5a1f]"
              />
              <span className="text-sm text-gray-600">Auto print kitchen tickets</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoPrintInvoices}
                onChange={(e) => update("autoPrintInvoices", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#ff5a1f] focus:ring-[#ff5a1f]"
              />
              <span className="text-sm text-gray-600">Auto print invoices</span>
            </label>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {isEditing ? "Save Changes" : "Add Printer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrinterModal;
