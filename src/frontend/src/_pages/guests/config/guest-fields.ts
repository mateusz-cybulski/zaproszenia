import { TEXT_LIMIT } from "@/shared/config";
import type { FormFieldConfig } from "@/shared/ui/form-field";

import type { GuestField } from "../model/guest-form";

export const RECIPIENT_FIELDS: FormFieldConfig<GuestField>[] = [
  {
    name: "fullName",
    label: "Imię i nazwisko",
    maxLength: TEXT_LIMIT.short,
    hint: "Puste, gdy zapraszasz całą instytucję (np. redakcję).",
  },
  { name: "position", label: "Stanowisko", maxLength: TEXT_LIMIT.short },
  { name: "institution", label: "Instytucja", maxLength: TEXT_LIMIT.short },
  {
    name: "salutation",
    label: "Zwrot grzecznościowy",
    maxLength: TEXT_LIMIT.short,
    hint: "Np. „Szanowny Panie Dyrektorze”.",
  },
];
