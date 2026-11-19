// The same bounds as the API's TemplateField.
export const FIELD_LIMITS = {
  contentLength: 2000,
  fontSize: { min: 4, max: 96, step: 0.5 },
  lineHeight: { min: 0.8, max: 3, step: 0.1 },
  positionStep: 0.5,
} as const;
