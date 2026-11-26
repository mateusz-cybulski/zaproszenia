import type { Metadata } from "next";

import { POLISH_CONTENT } from "../config/content-polish";
import { InstructionPage } from "./instruction-page";

export const polishInstructionMetadata: Metadata = {
  title: "Instrukcja obsługi · Zaproszenia",
  description: "Jak prowadzić listę gości, układać szablony i drukować zaproszenia i koperty.",
};

export function PolishInstructionPage() {
  return <InstructionPage content={POLISH_CONTENT} />;
}
