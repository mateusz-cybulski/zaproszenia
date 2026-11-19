// Mirrors TextLimit in the API, which still validates: these give immediate feedback only.
export const TextLimit = {
  short: 300,
  long: 5000,
  city: 200,
  postalCode: 20,
} as const;
