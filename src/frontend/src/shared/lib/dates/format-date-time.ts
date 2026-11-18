// A fixed time zone, so the server render and the browser hydrate to the same text.
const dateTimeFormat = new Intl.DateTimeFormat("pl-PL", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Warsaw",
});

export function formatDateTime(isoDate: string): string {
  return dateTimeFormat.format(new Date(isoDate));
}
