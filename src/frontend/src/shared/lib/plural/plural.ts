const RULES = new Intl.PluralRules("pl-PL");

export type PluralForms = { one: string; few: string; many: string };

// Polish needs three forms: 1 gość, 2–4 goście, 5–21 gości (and 22–24 goście again).
export function plural(count: number, forms: PluralForms): string {
  const rule = RULES.select(count);
  const form = rule === "one" ? forms.one : rule === "few" ? forms.few : forms.many;
  return `${count} ${form}`;
}
