import Link from "next/link";

export default function HomePage() {
  return (
    <div className="grid gap-6 md:grid-cols-[3fr,2fr]">
      <section className="card p-6 md:p-8">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span className="pill">Unified rental journey</span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
          Make a house your{" "}
          <span className="bg-gradient-to-br from-emerald-300 via-teal-300 to-sky-300 bg-clip-text text-transparent">
            home
          </span>
          .
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-300 md:text-base">
          abode brings search, onboarding, contracts, payments, escrow, and chat into a single calm interface
          for tenants, landlords, and agencies.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/auth/signup" className="btn-primary">
            Get started
          </Link>
          <Link href="/auth/login" className="text-sm text-emerald-300">
            I already have an account
          </Link>
        </div>

        <div className="mt-8 grid gap-4 text-sm text-slate-200 md:grid-cols-3">
          <div>
            <p className="badge-neutral mb-1 inline-block">Tenants</p>
            <p>Guided onboarding, shared rent splits, and one place to track payments.</p>
          </div>
          <div>
            <p className="badge-neutral mb-1 inline-block">Landlords</p>
            <p>Simplified screening, contracts, and payouts with clear visibility across tenancies.</p>
          </div>
          <div>
            <p className="badge-neutral mb-1 inline-block">Agencies</p>
            <p>Operational tooling that keeps tenants informed and reduces back-and-forth.</p>
          </div>
        </div>
      </section>

      <section className="card flex flex-col justify-between p-5 md:p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Live tenancy snapshot</p>
          <h2 className="mt-2 text-lg font-medium text-slate-50">Grove Street, Apartment 4B</h2>
          <p className="mt-1 text-xs text-slate-400">Shared tenancy · 4 occupants</p>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2">
              <div>
                <p className="text-slate-200">Next rent cycle</p>
                <p className="text-slate-400">1 Apr · Total £2,400</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-300">You pay £600</p>
                <p className="text-slate-400">25% of rent</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2">
              <p className="text-slate-300">Rent split</p>
              <div className="mt-2 grid grid-cols-4 gap-2 text-[11px]">
                <div className="rounded-md bg-emerald-500/15 p-2 text-emerald-200">
                  You
                  <br />
                  25%
                </div>
                <div className="rounded-md bg-sky-500/10 p-2 text-sky-200">Sam · 25%</div>
                <div className="rounded-md bg-violet-500/10 p-2 text-violet-200">Amir · 25%</div>
                <div className="rounded-md bg-rose-500/10 p-2 text-rose-200">Leah · 25%</div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2">
              <p className="text-slate-300">Today&apos;s focus</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-400">
                <li>Finish onboarding checklist</li>
                <li>Review tenancy agreement</li>
                <li>Confirm deposit payment method</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400">
          <span>End-to-end visibility · Human-centred flows</span>
          <span>abode · 2026</span>
        </div>
      </section>
    </div>
  );
}

