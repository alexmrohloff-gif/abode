import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Abode – Automated Rent Splitting",
  description:
    "Abode is a property tech platform that automates rent-splitting and collection for flatmates using Open Banking."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
          <header className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-sm font-semibold text-brand-dark">
                A
              </div>
              <span className="text-lg font-semibold tracking-tight">abode</span>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Rent, split. Sorted.
            </span>
          </header>
          <main className="flex-1 py-10">{children}</main>
          <footer className="mt-8 border-t border-slate-900 pt-4 text-xs text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} Abode. Built for modern flatshares.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
