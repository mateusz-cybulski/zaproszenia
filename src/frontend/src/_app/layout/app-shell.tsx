import Link from "next/link";
import type { ReactNode } from "react";

import { requireViewer } from "@/entities/viewer/index.server";
import { routes } from "@/shared/routes";
import { ThemeSwitcher } from "@/shared/ui/theme-switcher";

import { LogoutButton } from "./logout-button";
import { SidebarNav } from "./sidebar-nav";

export async function AppShell({ children }: { children: ReactNode }) {
  // Runs only on a full page load: Next.js keeps the layout on link navigation, so every
  // page checks the session itself too (an API call, or requireViewer()).
  const viewer = await requireViewer();

  return (
    <div className="grid min-h-dvh grid-cols-[auto_minmax(0,1fr)]">
      <aside className="sticky top-0 flex h-dvh w-sidebar flex-col gap-4 border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
        <Link href={routes.guests()} className="px-3 text-lg font-semibold tracking-tight">
          Zaproszenia
        </Link>
        <SidebarNav />
        <div className="mt-auto grid gap-3 border-t border-sidebar-border px-3 pt-4">
          {viewer.email && (
            <p className="truncate text-sm text-muted-foreground" title={viewer.email}>
              {viewer.email}
            </p>
          )}
          <ThemeSwitcher />
          <LogoutButton />
        </div>
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
