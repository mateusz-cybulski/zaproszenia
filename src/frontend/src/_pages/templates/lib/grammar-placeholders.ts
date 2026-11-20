import {
  DECLINABLE_PLACEHOLDERS,
  type DeclinablePlaceholder,
  type Placeholder,
  usesPlaceholder,
} from "@/entities/template";

const DATE_PLACEHOLDER = "event_date";

type DeclinableUse = { name: DeclinablePlaceholder; label: string };

// The date format and the cases matter only for the placeholders the field uses.
export function grammarPlaceholders(content: string, placeholders: Placeholder[]) {
  const used = placeholders.filter((placeholder) => usesPlaceholder(content, placeholder));
  return {
    usesDate: used.some((placeholder) => placeholder.name === DATE_PLACEHOLDER),
    declinable: used.flatMap((placeholder): DeclinableUse[] => {
      const name = DECLINABLE_PLACEHOLDERS.find((declinable) => declinable === placeholder.name);
      return name ? [{ name, label: placeholder.label }] : [];
    }),
  };
}
