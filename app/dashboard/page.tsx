import { auth } from "../../auth";

export default async function DashboardPage() {
  const session = await auth();
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-100">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-400">
        Protected. User ID: {session?.user?.id ?? "—"}
      </p>
    </div>
  );
}
