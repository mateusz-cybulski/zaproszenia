import { type LucideIcon, Monitor, Moon, Sun } from "lucide-react";

import type { ThemePreference } from "./theme-preference";

export const themeOptions: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Jasny", icon: Sun },
  { value: "dark", label: "Ciemny", icon: Moon },
  { value: "system", label: "Systemowy", icon: Monitor },
];
