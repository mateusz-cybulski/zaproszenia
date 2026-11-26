import Link from "next/link";

import { cn } from "@/shared/lib/css";

import { INSTRUCTION_LANGUAGES } from "../config/languages";
import type { InstructionLanguage } from "../model/instruction-content";

type LanguageSwitchProps = { current: InstructionLanguage; label: string };

export function LanguageSwitch({ current, label }: LanguageSwitchProps) {
  return (
    <nav aria-label={label}>
      <ul className="flex rounded-lg border p-0.5 text-sm">
        {INSTRUCTION_LANGUAGES.map(({ language, name, href }) => (
          <li key={language}>
            <Link
              href={href}
              lang={language}
              hrefLang={language}
              aria-current={language === current ? "page" : undefined}
              className={cn(
                "block rounded-md px-3 py-1 text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                "aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground",
              )}
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
