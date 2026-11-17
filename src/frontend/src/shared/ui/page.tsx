import type { ReactNode } from "react";

export function Page({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      {title && <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>}
      {children}
    </div>
  );
}
