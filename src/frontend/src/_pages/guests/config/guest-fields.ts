import { TextLimit } from "@/shared/config";
import type { FormFieldConfig } from "@/shared/ui/form-field";

import type { GuestField } from "../model/guest-form";

export const recipientFields: FormFieldConfig<GuestField>[] = [
  {
    name: "fullName",
    label: "Imię i nazwisko",
    maxLength: TextLimit.short,
    hint: "Puste, gdy zapraszasz całą instytucję (np. redakcję).",
  },
  { name: "position", label: "Stanowisko", maxLength: TextLimit.short },
  { name: "institution", label: "Instytucja", maxLength: TextLimit.short },
  {
    name: "salutation",
    label: "Zwrot grzecznościowy",
    maxLength: TextLimit.short,
    hint: "Np. „Szanowny Panie Dyrektorze”.",
  },
];
