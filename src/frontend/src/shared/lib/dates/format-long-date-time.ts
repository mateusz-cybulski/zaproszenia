const formats = new Map<string, Intl.DateTimeFormat>();

// In the given zone, not the browser's: an event happens at its own local time.
export function formatLongDateTime(isoDate: string, timeZone: string): string {
  let format = formats.get(timeZone);
  if (!format) {
    format = new Intl.DateTimeFormat("pl-PL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    });
    formats.set(timeZone, format);
  }
  return format.format(new Date(isoDate));
}
