"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "./nav-items";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Menu główne">
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-sidebar-accent-foreground"
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
