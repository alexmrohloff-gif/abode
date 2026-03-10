"use client";

import { useOptimistic, useState, useCallback, useEffect } from "react";
import { initiatePayment } from "../../actions/rentActions";

export type ShareStatus = "PAID" | "PENDING" | "FAILED";

type OptimisticStatus = ShareStatus | "PROCESSING";

export interface PaymentDashboardProps {
  /** Total rent due for the current period (e.g. 300000 = £3000) */
  totalRentCents: number;
  /** Rent collected so far for the current period (e.g. 250000 = £2500) */
  collectedRentCents: number;
  /** Logged-in user's share status */
  myShareStatus: ShareStatus;
  /** RentShare id for the current user's share (enables Pay Rent button when status is PENDING/FAILED) */
  rentShareId?: string;
  /** Whether the logged-in user has been flagged with low funds (show warning only for them) */
  isLowFunds?: boolean;
  /** Currency code for display (default GBP) */
  currency?: string;
  /** Called after a successful payment so the parent can refetch (e.g. update collected total) */
  onPaymentSuccess?: () => void;
}

function formatMoney(cents: number, currency: string = "GBP"): string {
  const symbol = currency === "GBP" ? "£" : currency;
  return `${symbol}${(cents / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
}

function statusLabel(status: OptimisticStatus): string {
  switch (status) {
    case "PAID":
      return "Paid";
    case "PENDING":
      return "Pending";
    case "FAILED":
      return "Action Required";
    case "PROCESSING":
      return "Processing...";
    default:
      return "Pending";
  }
}

function statusStyles(status: OptimisticStatus): string {
  switch (status) {
    case "PAID":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    case "PENDING":
      return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    case "FAILED":
      return "bg-red-500/20 text-red-400 border-red-500/40";
    case "PROCESSING":
      return "bg-slate-500/20 text-slate-400 border-slate-500/40";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/40";
  }
}

export function PaymentDashboard({
  totalRentCents,
  collectedRentCents,
  myShareStatus,
  rentShareId,
  isLowFunds = false,
  currency = "GBP",
  onPaymentSuccess
}: PaymentDashboardProps) {
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const [optimisticStatus, addOptimisticStatus] = useOptimistic<OptimisticStatus, OptimisticStatus>(
    myShareStatus,
    (_current, optimistic) => optimistic
  );

  const handlePayRent = useCallback(async () => {
    if (!rentShareId) return;
    addOptimisticStatus("PROCESSING");
    setToast(null);
    const result = await initiatePayment(rentShareId);
    if (result.error) {
      setToast({ message: result.error });
      return;
    }
    onPaymentSuccess?.();
  }, [rentShareId, addOptimisticStatus, onPaymentSuccess]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const canPayRent =
    rentShareId &&
    (myShareStatus === "PENDING" || myShareStatus === "FAILED") &&
    optimisticStatus !== "PROCESSING";

  const progressPercent =
    totalRentCents > 0 ? Math.min(100, (collectedRentCents / totalRentCents) * 100) : 0;

  return (
    <div className="relative flex flex-col gap-6 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <h2 className="text-lg font-semibold text-slate-100">Rent collection</h2>

      {/* Progress: total collected for current period */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Current period</span>
          <span className="font-medium text-slate-200">
            {formatMoney(collectedRentCents, currency)} / {formatMoney(totalRentCents, currency)}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={collectedRentCents}
            aria-valuemin={0}
            aria-valuemax={totalRentCents}
            aria-label="Rent collected this period"
          />
        </div>
      </div>

      {/* Logged-in user's share status (no balances) + Pay Rent */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-400">Your share:</span>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusStyles(optimisticStatus)}`}
        >
          {statusLabel(optimisticStatus)}
        </span>
        {canPayRent && (
          <button
            type="button"
            onClick={handlePayRent}
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-brand-dark disabled:opacity-50"
          >
            Pay rent
          </button>
        )}
        {optimisticStatus === "PROCESSING" && (
          <span className="text-xs text-slate-500">Sending payment…</span>
        )}
      </div>

      {/* Toast: error from server (e.g. Low Funds) — rollback is implicit when optimistic clears */}
      {toast && (
        <div
          className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
          role="alert"
          aria-live="assertive"
        >
          <span className="text-red-400" aria-hidden>
            ⚠
          </span>
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-auto rounded p-0.5 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Low funds warning: subtle, for this user only */}
      {isLowFunds && !toast && (
        <div
          className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200"
          role="status"
          aria-live="polite"
        >
          <span className="text-amber-400" aria-hidden>
            ⚠
          </span>
          <span>Low funds — top up to avoid missing your rent payment.</span>
        </div>
      )}
    </div>
  );
}
