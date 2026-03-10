"use client";

import { useState, useCallback, useId } from "react";
import { splitConfigSchema, createLease } from "../../actions/rentActions";

export interface HouseholdMember {
  id: string;
  name: string;
}

export interface LeaseDetails {
  propertyLabel: string;
  dueDayOfMonth: number;
  landlordName: string;
  startDate: Date;
}

export interface SplitConfigurationProps {
  householdId: string;
  householdMembers: HouseholdMember[];
  leaseDetails: LeaseDetails;
  onSuccess?: (leaseId: string) => void;
  onError?: (message: string) => void;
}

interface TenantRow {
  id: string;
  userId: string;
  name: string;
  percentage: number;
}

function getRemainingPercentage(tenants: TenantRow[]): number {
  const sum = tenants.reduce((s, t) => s + t.percentage, 0);
  return Math.round((100 - sum) * 100) / 100;
}

export function SplitConfiguration({
  householdId,
  householdMembers,
  leaseDetails,
  onSuccess,
  onError
}: SplitConfigurationProps) {
  const [totalRentPounds, setTotalRentPounds] = useState<string>("");
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const idPrefix = useId();

  const remaining = getRemainingPercentage(tenants);
  const totalIs100 = tenants.length > 0 && Math.abs(remaining) < 0.01;

  const addTenant = useCallback(() => {
    const assigned = new Set(tenants.map((t) => t.userId));
    const next = householdMembers.find((m) => !assigned.has(m.id));
    if (!next) return;
    setTenants((prev) => [
      ...prev,
      { id: `${idPrefix}-${next.id}`, userId: next.id, name: next.name, percentage: 0 }
    ]);
  }, [householdMembers, tenants, idPrefix]);

  const removeTenant = useCallback((rowId: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== rowId));
  }, []);

  const setTenantPercentage = useCallback((rowId: string, value: number) => {
    const n = Math.max(0, Math.min(100, value));
    setTenants((prev) => prev.map((t) => (t.id === rowId ? { ...t, percentage: n } : t)));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      const total = parseFloat(totalRentPounds);
      if (Number.isNaN(total) || total <= 0) {
        setSubmitError("Enter a valid total rent.");
        return;
      }
      const payload = {
        totalRentPounds: total,
        tenants: tenants.map((t) => ({ userId: t.userId, percentage: t.percentage }))
      };
      const parsed = splitConfigSchema.safeParse(payload);
      if (!parsed.success) {
        const msg = parsed.error.flatten().message;
        const err =
          typeof msg === "string" ? msg : (msg.tenants as string[] | undefined)?.join(", ") ?? "Validation failed";
        setSubmitError(err);
        onError?.(err);
        return;
      }
      setIsSubmitting(true);
      const result = await createLease(householdId, {
        propertyLabel: leaseDetails.propertyLabel,
        totalRentPounds: parsed.data.totalRentPounds,
        dueDayOfMonth: leaseDetails.dueDayOfMonth,
        landlordName: leaseDetails.landlordName,
        startDate: leaseDetails.startDate
      }, parsed.data.tenants);
      setIsSubmitting(false);
      if (result.error) {
        setSubmitError(result.error);
        onError?.(result.error);
        return;
      }
      if (result.data?.leaseId) {
        onSuccess?.(result.data.leaseId);
      }
    },
    [
      totalRentPounds,
      tenants,
      householdId,
      leaseDetails,
      onSuccess,
      onError
    ]
  );

  const availableToAdd = householdMembers.filter((m) => !tenants.some((t) => t.userId === m.id));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <h2 className="text-lg font-semibold text-slate-100">Split configuration</h2>

      {/* Total rent */}
      <div className="space-y-1">
        <label htmlFor={`${idPrefix}-total`} className="block text-sm font-medium text-slate-300">
          Total rent (£)
        </label>
        <input
          id={`${idPrefix}-total`}
          type="number"
          min="0"
          step="0.01"
          value={totalRentPounds}
          onChange={(e) => setTotalRentPounds(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          placeholder="0.00"
        />
      </div>

      {/* Tenants */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Tenants</span>
          <span className="text-sm text-slate-400">
            Remaining: <strong className={remaining < 0 ? "text-red-400" : "text-slate-200"}>{remaining}%</strong>
          </span>
        </div>
        <ul className="space-y-2">
          {tenants.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-800/60 px-3 py-2"
            >
              <span className="min-w-[100px] text-sm text-slate-200">{row.name}</span>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={row.percentage === 0 ? "" : row.percentage}
                onChange={(e) => setTenantPercentage(row.id, e.target.value === "" ? 0 : parseFloat(e.target.value))}
                className="w-20 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-right text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                placeholder="0"
                aria-label={`Percentage for ${row.name}`}
              />
              <span className="text-sm text-slate-500">%</span>
              <button
                type="button"
                onClick={() => removeTenant(row.id)}
                className="ml-auto rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-red-400"
                aria-label={`Remove ${row.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        {availableToAdd.length > 0 && (
          <button
            type="button"
            onClick={addTenant}
            className="rounded-lg border border-dashed border-slate-600 px-3 py-2 text-sm text-slate-400 hover:border-brand hover:text-brand"
          >
            + Add tenant
          </button>
        )}
      </div>

      {/* Warning when total !== 100% */}
      {tenants.length > 0 && !totalIs100 && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          Please ensure all rent is accounted for.
        </p>
      )}

      {submitError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !totalIs100 || tenants.length === 0}
        className="w-fit rounded-lg bg-brand px-4 py-2 text-sm font-medium text-slate-950 hover:bg-brand-dark disabled:opacity-50 disabled:pointer-events-none"
      >
        {isSubmitting ? "Creating…" : "Create lease"}
      </button>
    </form>
  );
}
