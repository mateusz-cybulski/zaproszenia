import { CalendarDays, FileText, type LucideIcon, Settings, Users } from "lucide-react";

import { routes } from "@/shared/routes";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const navItems: NavItem[] = [
  { href: routes.events(), label: "Wydarzenia", icon: CalendarDays },
  { href: routes.guests(), label: "Goście", icon: Users },
  { href: routes.templates(), label: "Szablony", icon: FileText },
  { href: routes.settings(), label: "Ustawienia", icon: Settings },
];
