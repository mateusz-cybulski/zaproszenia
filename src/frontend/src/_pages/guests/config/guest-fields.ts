import type { FormFieldConfig } from "@/shared/ui/form-field";

import type { GuestField } from "../model/guest-form";

export const recipientFields: FormFieldConfig<GuestField>[] = [
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
