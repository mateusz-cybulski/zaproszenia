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
    <div className="md:grid md:min-h-dvh md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-4 border-b border-sidebar-border bg-sidebar p-3 text-sidebar-foreground md:sticky md:top-0 md:h-dvh md:border-r md:border-b-0 md:p-4">
        <Link href={routes.guests()} className="px-3 text-lg font-semibold tracking-tight">
          Zaproszenia
        </Link>
        <SidebarNav />
        <div className="flex flex-wrap items-center gap-3 px-3 md:mt-auto md:flex-col md:items-stretch md:border-t md:border-sidebar-border md:pt-4">
          {viewer.email && (
            <p
              className="min-w-0 flex-1 truncate text-sm text-muted-foreground"
              title={viewer.email}
            >
              {viewer.email}
            </p>
          )}
          <ThemeSwitcher className="w-28 md:w-full" />
          <LogoutButton />
        </div>
      </aside>
      <main className="min-w-0 p-4 sm:p-8">{children}</main>
    </div>
  );
}
