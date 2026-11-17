import { countries } from "@/shared/config";

import type { GuestField } from "../model/guest-form";

export type FieldConfig = {
  name: GuestField;
  label: string;
  hint?: string;
} & ({ maxLength: number } | { options: readonly { value: string; label: string }[] });

export const recipientFields: FieldConfig[] = [
  {
    name: "fullName",
    label: "Imię i nazwisko",
    maxLength: 300,
    hint: "Puste, gdy zapraszasz całą instytucję (np. redakcję).",
  },
  { name: "position", label: "Stanowisko", maxLength: 300 },
  { name: "institution", label: "Instytucja", maxLength: 300 },
  {
    name: "salutation",
    label: "Zwrot grzecznościowy",
    maxLength: 300,
    hint: "Np. „Szanowny Panie Dyrektorze”.",
  },
];

export const addressFields: FieldConfig[] = [
  { name: "street", label: "Ulica i numer", maxLength: 300 },
  { name: "postalCode", label: "Kod pocztowy", maxLength: 20 },
  { name: "city", label: "Miejscowość", maxLength: 200 },
  {
    name: "country",
    label: "Kraj",
    options: countries.map((country) => ({ value: country.code, label: country.name })),
  },
];
