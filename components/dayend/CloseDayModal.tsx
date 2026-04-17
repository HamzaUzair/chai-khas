"use client";

import React, { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface CloseDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  closing: boolean;
  branchName: string;
  businessDate: string;
  netRevenue: number;
}

const CloseDayModal: React.FC<CloseDayModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  closing,
  branchName,
  businessDate,
  netRevenue,
}) => {
  const [note, setNote] = useState("");
  useEffect(() => {
    if (isOpen) setNote("");
  }, [isOpen]);
  if (!isOpen) return null;

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-PK", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closing ? undefined : onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Close Day</h2>
          </div>
          <button
            onClick={onClose}
            disabled={closing}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to close the day for{" "}
            <span className="font-semibold text-gray-800">{branchName}</span>?
          </p>
          <p className="text-sm text-gray-600">
            Business Date: <span className="font-medium">{formatDate(businessDate)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Net Revenue:{" "}
            <span className="font-bold text-[#ff5a1f]">
              PKR {netRevenue.toLocaleString("en-PK")}
            </span>
          </p>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Closing note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={closing}
              rows={2}
              placeholder="E.g. cash short by PKR 200, drawer handover done."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all resize-none disabled:opacity-50"
            />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <p className="text-sm text-amber-800">
              Once the day is closed, a day-end record is saved for this branch/date and cannot
              be re-closed.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={closing}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note)}
            disabled={closing}
            className="px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer disabled:opacity-60"
          >
            {closing ? "Closing…" : "Close Day"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloseDayModal;
