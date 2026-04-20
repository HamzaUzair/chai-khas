"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, X } from "lucide-react";
import type { Order } from "@/types/order";
import { apiFetch } from "@/lib/auth-client";

interface CashierPaymentModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onPaid: (updatedOrder: Order) => void;
}

const METHODS = ["Cash", "Card", "Online"] as const;
const DISCOUNT_TYPES = ["Fixed Amount", "Percentage"] as const;
const SERVICE_CHARGE_PERCENT = 5;
const DEFAULT_GST_PERCENT = 3;

const CashierPaymentModal: React.FC<CashierPaymentModalProps> = ({
  isOpen,
  order,
  onClose,
  onPaid,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<(typeof METHODS)[number]>("Cash");
  const [discountType, setDiscountType] =
    useState<(typeof DISCOUNT_TYPES)[number]>("Fixed Amount");
  const [discountValue, setDiscountValue] = useState<string>("");
  const [discountReason, setDiscountReason] = useState<string>("");
  const [gstPercent, setGstPercent] = useState<string>(String(DEFAULT_GST_PERCENT));
  const [receivedAmount, setReceivedAmount] = useState<string>("");
  const [receivedEdited, setReceivedEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!order) return;
    setPaymentMethod("Cash");
    setDiscountType("Fixed Amount");
    setDiscountValue("");
    setDiscountReason("");
    setGstPercent(String(order.gstPercent ?? DEFAULT_GST_PERCENT));
    setReceivedAmount("");
    setReceivedEdited(false);
    setError("");
  }, [order]);

  const subtotal =
    order?.items.reduce((sum, item) => sum + item.price * item.qty, 0) ?? 0;
  const discountRaw = Number(discountValue || "0");
  const normalizedDiscountValue =
    Number.isFinite(discountRaw) && discountRaw > 0 ? discountRaw : 0;
  const discountAmount =
    normalizedDiscountValue <= 0
      ? 0
      : discountType === "Percentage"
      ? (subtotal * normalizedDiscountValue) / 100
      : normalizedDiscountValue;
  const safeDiscountAmount = Math.min(discountAmount, subtotal);
  const taxableSubtotal = Math.max(0, subtotal - safeDiscountAmount);
  const serviceChargeAmount = (taxableSubtotal * SERVICE_CHARGE_PERCENT) / 100;
  const parsedGstPercent = Number(gstPercent || "0");
  const normalizedGstPercent = Number.isFinite(parsedGstPercent)
    ? Math.max(0, parsedGstPercent)
    : 0;
  const gstAmount = ((taxableSubtotal + serviceChargeAmount) * normalizedGstPercent) / 100;
  const finalTotal = Math.max(0, taxableSubtotal + serviceChargeAmount + gstAmount);
  const discountDisplayLabel =
    normalizedDiscountValue <= 0
      ? "0"
      : discountType === "Percentage"
      ? `${normalizedDiscountValue}%`
      : `PKR ${normalizedDiscountValue.toLocaleString()}`;
  const effectiveReceived = receivedEdited
    ? receivedAmount
    : finalTotal > 0
    ? String(Math.round(finalTotal * 100) / 100)
    : "";
  const receivedNumeric = Number(effectiveReceived || "0");
  const changeAmount =
    paymentMethod === "Cash" && Number.isFinite(receivedNumeric)
      ? Math.max(0, receivedNumeric - finalTotal)
      : 0;

  if (!isOpen || !order) return null;

  const handleMarkPaid = async () => {
    if (!order) return;
    setError("");
    if (normalizedDiscountValue > 0) {
      if (discountType === "Percentage" && normalizedDiscountValue > 100) {
        setError("Percentage discount cannot exceed 100.");
        return;
      }
      if (safeDiscountAmount > subtotal) {
        setError("Discount cannot exceed subtotal.");
        return;
      }
      if (!discountReason.trim()) {
        setError("Discount reason is required when discount is applied.");
        return;
      }
    }
    if (!Number.isFinite(parsedGstPercent) || parsedGstPercent < 0) {
      setError("GST must be a valid non-negative number.");
      return;
    }
    if (parsedGstPercent > 100) {
      setError("GST percentage cannot exceed 100.");
      return;
    }
    if (paymentMethod === "Cash") {
      const received = Number(effectiveReceived || "0");
      if (!Number.isFinite(received) || received < finalTotal) {
        setError("Received amount must be at least final payable total.");
        return;
      }
    }
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Paid",
          paymentMethod,
          discountType,
          discountValue: normalizedDiscountValue,
          discountReason: discountReason.trim(),
          gstPercent: normalizedGstPercent,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || "Failed to mark order as paid");
      }
      onPaid({
        ...order,
        status: "Paid",
        paymentMode: paymentMethod,
        discount: safeDiscountAmount,
        discountType: normalizedDiscountValue > 0 ? discountType : null,
        discountValue: normalizedDiscountValue,
        discountReason: normalizedDiscountValue > 0 ? discountReason.trim() : null,
        subtotal,
        serviceChargePercent: SERVICE_CHARGE_PERCENT,
        serviceCharge: serviceChargeAmount,
        gstPercent: normalizedGstPercent,
        gstAmount,
        total: finalTotal,
        paid: true,
        // The backend generates the real, DB-stored Bill ID on the
        // Served → Paid transition and returns it in the PATCH
        // response. We thread it through so the receipt modal that
        // opens right after payment shows the same value that will be
        // persisted and retrievable later from Sales List.
        billNo: typeof payload?.billNo === "string" ? payload.billNo : null,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark as paid");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-[#ff5a1f]" />
            <h2 className="text-lg font-bold text-gray-800">Cashier Payment</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">Order</p>
            <p className="text-lg font-bold text-gray-800">{order.orderNo}</p>
            <p className="text-xs text-gray-500 mt-1">
              {order.branchName} | {order.type}
              {order.table ? ` | Table ${order.table}` : ""}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-700">
              Bill Summary
            </div>
            <div className="p-4 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="text-gray-700">
                    {item.name}
                    {item.variationName ? ` (${item.variationName})` : ""} x{item.qty}
                  </div>
                  <div className="font-medium text-gray-800">
                    PKR {(item.price * item.qty).toLocaleString()}
                  </div>
                </div>
              ))}
              <div className="border-t border-dashed border-gray-200 pt-3 mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-700">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-[#ff5a1f]">
                    PKR {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4 space-y-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Discount Type
            </label>
            <select
              value={discountType}
              onChange={(e) =>
                setDiscountType(e.target.value as (typeof DISCOUNT_TYPES)[number])
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
            >
              {DISCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Discount Value
            </label>
            <input
              type="number"
              min={0}
              max={discountType === "Percentage" ? 100 : undefined}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "Percentage" ? "e.g. 10" : "e.g. 100"}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
            />
            {normalizedDiscountValue > 0 && (
              <>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Discount Reason
                </label>
                <textarea
                  rows={2}
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="Required reason for this discount"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                />
              </>
            )}
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-700">PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Discount</span>
                <span className="text-red-600">
                  {discountDisplayLabel}
                  {normalizedDiscountValue > 0
                    ? ` (- PKR ${safeDiscountAmount.toLocaleString()})`
                    : ""}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">
                  Service Charges ({SERVICE_CHARGE_PERCENT}%)
                </span>
                <span className="text-gray-700">
                  +PKR {serviceChargeAmount.toLocaleString()}
                </span>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  GST (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={gstPercent}
                  onChange={(e) => setGstPercent(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">GST Amount</span>
                  <span className="text-gray-700">+PKR {gstAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="pt-1 border-t border-dashed border-gray-200 flex items-center justify-between">
                <span className="font-semibold text-gray-700">Final Total</span>
                <span className="font-bold text-[#ff5a1f]">PKR {finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4 space-y-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as (typeof METHODS)[number])}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {paymentMethod === "Cash" && (
              <>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Cash Received
                </label>
                <input
                  type="number"
                  min={0}
                  value={effectiveReceived}
                  onChange={(e) => {
                    setReceivedEdited(true);
                    setReceivedAmount(e.target.value);
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                />
                <p className="text-xs text-gray-500">
                  Change: <span className="font-semibold">PKR {changeAmount.toLocaleString()}</span>
                </p>
              </>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleMarkPaid}
            disabled={submitting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] disabled:opacity-60"
          >
            {submitting ? "Processing..." : "Mark as Paid"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashierPaymentModal;
