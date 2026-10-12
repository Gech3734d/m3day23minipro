/**
 * Shared display formatters. Keep currency, absolute date/time, and relative time
 * consistent across order summaries, delivery tracking, and CSV exports.
 */
export function etb(value) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

export function when(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Addis_Ababa"
  }).format(date);
}

export function relative(value, now = Date.now()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "time unavailable";
  const seconds = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  const units = [
    ["year", 31536000], ["month", 2592000], ["week", 604800],
    ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1]
  ];
  const [unit, size] = units.find(([, size]) => abs >= size) || units[units.length - 1];
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.round(seconds / size), unit
  );
}