import { routes } from "@/shared/routes";

import type { InstructionLanguage } from "../model/instruction-content";

// Each name is written in its own language, as a language switch shows it.
export const INSTRUCTION_LANGUAGES: readonly {
  language: InstructionLanguage;
  name: string;
  href: string;
}[] = [
  { language: "en", name: "English", href: routes.instruction() },
  { language: "pl", name: "Polski", href: routes.instructionPolish() },
];
