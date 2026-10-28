const TZ = "Asia/Makassar";

export function dayMonth(iso: string) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("id-ID", { day: "2-digit", timeZone: TZ }).format(d);
  const month = new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: TZ })
    .format(d).replace(".", "").toUpperCase();
  return { day, month };
}

export function timeOf(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ,
  }).format(new Date(iso)).replace(":", ".");
}

export const CATEGORY_LABEL: Record<string, string> = {
  academic: "AKADEMIK", organization: "ORGANISASI", event: "ACARA", other: "LAINNYA",
};