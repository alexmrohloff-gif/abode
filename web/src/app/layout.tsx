import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "abode",
  description: "Make a house your home, with abode."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-gradient-to-br from-emerald-400 to-teal-500" />
                <span className="text-lg font-semibold tracking-tight">abode</span>
              </div>
              <nav className="flex gap-4 text-sm text-slate-300">
                <span>Tenant</span>
                <span>Landlord</span>
                <span>Agency</span>
              </nav>
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

