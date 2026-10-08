import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <section className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold">Notebook</h1>
        {children}
      </section>
    </main>
  );
}
