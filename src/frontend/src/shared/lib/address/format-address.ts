import { countryName } from "@/shared/config";

import type { Address } from "./address";

export function formatAddress(address: Address): string {
  const place = [address.postalCode, address.city].filter(Boolean).join(" ");
  const country = address.country === "PL" ? null : countryName(address.country);
  return [address.street, place, country].filter(Boolean).join(", ");
}
