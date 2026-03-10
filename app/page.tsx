export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="max-w-xl space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Automated rent-splitting for modern flatshares.
        </h1>
        <p className="text-base text-slate-300">
          Abode connects to your bank via Open Banking, calculates fair rent shares
          for every flatmate, and automates collection so you never have to chase a
          transfer again.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-slate-950 shadow-sm hover:bg-brand-dark">
            Get early access
          </button>
          <button className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-900">
            Learn how splitting works
          </button>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-slate-100">Split</h2>
          <p className="mt-1 text-xs text-slate-400">
            Model your flatshare, leases, and individual shares with clean, auditable
            logic.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-slate-100">Connect</h2>
          <p className="mt-1 text-xs text-slate-400">
            Securely link accounts using Open Banking, with no card details stored.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-slate-100">Collect</h2>
          <p className="mt-1 text-xs text-slate-400">
            Automate monthly pulls so every tenant pays on time, every time.
          </p>
        </div>
      </section>
    </div>
  );
}

