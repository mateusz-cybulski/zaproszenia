import type { FontName } from "@/entities/template";

type FieldPreset = { label: string; content: string; font: FontName; fontSize: number };

// What "Add field" offers; the content uses placeholder names and is shown with their labels.
export const FIELD_PRESETS: readonly FieldPreset[] = [
  { label: "Zwrot grzecznościowy", content: "{salutation},", font: "serif-italic", fontSize: 13 },
  { label: "Adresat", content: "{recipient}", font: "serif-bold", fontSize: 14 },
  { label: "Blok adresowy (koperta)", content: "{recipient_block}", font: "sans", fontSize: 11 },
  { label: "Nazwa wydarzenia", content: "{event_name}", font: "serif-bold", fontSize: 18 },
  {
    label: "Data i godzina",
    content: "{event_weekday}, {event_date}\ngodz. {event_time}",
    font: "serif",
    fontSize: 12,
  },
  { label: "Miejsce", content: "{venue}\n{event_address}", font: "serif", fontSize: 11 },
  { label: "Treść zaproszenia", content: "{invitation_text}", font: "serif", fontSize: 12 },
  { label: "Własny tekst", content: "Tekst", font: "serif", fontSize: 12 },
];

export type { FieldPreset };

export const EDITOR_COPY = {
  addField: "Dodaj pole",
  fields: "Pola",
  noFields: "Na tej stronie nie ma pól.",
  pickField: "Kliknij ramkę na podglądzie albo wybierz pole z listy.",
  page: (index: number) => `Strona ${index + 1}`,
  pageSelect: "Strona szablonu",
  canvasHint:
    "Podgląd pokazuje przykładowego gościa. Ramki to przybliżony obszar pól: przeciągnij ramkę, by ją przesunąć, i złap uchwyt z prawej, by zmienić szerokość. Długi tekst łamie się w szerokości pola.",
  previewFailed: "Nie da się pokazać podglądu",
  readOnly: "Szablon systemowy jest tylko do odczytu",
  readOnlyDescription: "Skopiuj go, żeby zmienić układ pól.",
  fieldLabel: (content: string) => `Pole: ${content}`,
  resize: "Zmień szerokość pola",
} as const;
