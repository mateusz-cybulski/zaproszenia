import type { Metadata } from "next";

import { ENGLISH_CONTENT } from "../config/content-english";
import { InstructionPage } from "./instruction-page";

export const englishInstructionMetadata: Metadata = {
  title: "User guide · Zaproszenia",
  description: "How to keep a guest list, design templates and print invitations and envelopes.",
};

export function EnglishInstructionPage() {
  return <InstructionPage content={ENGLISH_CONTENT} />;
}
