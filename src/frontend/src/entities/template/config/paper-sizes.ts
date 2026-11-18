export const paperSizes = [
  { name: "A4", widthMm: 210, heightMm: 297 },
  { name: "A5", widthMm: 148, heightMm: 210 },
  { name: "A6", widthMm: 105, heightMm: 148 },
  { name: "DL", widthMm: 110, heightMm: 220 },
  { name: "C5", widthMm: 162, heightMm: 229 },
  { name: "C6", widthMm: 114, heightMm: 162 },
] as const;

export const PAPER_SIZE_TOLERANCE_MM = 1;
