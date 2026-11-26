import type { ScreenshotName } from "../config/screenshots";

export type InstructionLanguage = "en" | "pl";

// Text may mark the app's own labels with **…**; they are shown in bold.
export type InstructionBlock =
  | { type: "text"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "list"; items: string[] }
  | { type: "terms"; items: { term: string; description: string }[] }
  | { type: "tip"; text: string }
  | { type: "figure"; screenshot: ScreenshotName; alt: string; caption: string };

export type InstructionSection = {
  id: string;
  title: string;
  blocks: InstructionBlock[];
};

export type InstructionContent = {
  language: InstructionLanguage;
  title: string;
  intro: string;
  contentsLabel: string;
  backToApp: string;
  languageLabel: string;
  sections: InstructionSection[];
};
