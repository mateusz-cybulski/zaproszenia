"use client";

import { cn } from "@/shared/lib/css";
import { setThemePreference, THEME_OPTIONS, useThemePreference } from "@/shared/lib/theme";

export function ThemeSwitcher({ className }: { className?: string }) {
  const preference = useThemePreference();

  return (
    <fieldset className={cn("flex gap-0.5 rounded-lg border border-border p-0.5", className)}>
      <legend className="sr-only">Motyw</legend>
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <label
          key={value}
          title={label}
          className="flex flex-1 cursor-pointer items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground has-checked:bg-accent has-checked:text-accent-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring"
        >
          <input
            type="radio"
            name="theme"
            value={value}
            checked={preference === value}
            onChange={() => setThemePreference(value)}
            className="sr-only"
          />
          <Icon className="size-4" aria-hidden />
          <span className="sr-only">{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
