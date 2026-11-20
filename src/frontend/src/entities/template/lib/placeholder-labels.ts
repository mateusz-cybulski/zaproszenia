import type { Placeholder } from "../model/placeholder";

const ANY_TOKEN = /\{([^{}\n]*)\}/g;

// As the API compares names: case, spacing and Polish letters do not matter.
function normalizeName(name: string): string {
  return name
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

// "{salutation}" is shown as "{Zwrot grzecznościowy}"; the API stores the name again on save.
export function toDisplay(content: string, placeholders: Placeholder[]): string {
  const labels = new Map(placeholders.map((placeholder) => [placeholder.name, placeholder.label]));
  return content.replace(/\{([a-z_]+)\}/g, (token, name: string) => {
    const label = labels.get(name);
    return label ? `{${label}}` : token;
  });
}

// Whether the content uses a placeholder, written by its name or by its label.
export function usesPlaceholder(content: string, placeholder: Placeholder): boolean {
  const wanted = new Set([normalizeName(placeholder.name), normalizeName(placeholder.label)]);
  return [...content.matchAll(ANY_TOKEN)].some((match) =>
    wanted.has(normalizeName(match[1] ?? "")),
  );
}

// The content with every placeholder replaced by its example, e.g. to estimate a field's height.
export function withExamples(content: string, placeholders: Placeholder[]): string {
  const examples = new Map<string, string>();
  for (const placeholder of placeholders) {
    examples.set(normalizeName(placeholder.name), placeholder.example);
    examples.set(normalizeName(placeholder.label), placeholder.example);
  }
  return content.replace(
    ANY_TOKEN,
    (_token, name: string) => examples.get(normalizeName(name)) ?? "",
  );
}
