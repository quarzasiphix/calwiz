/**
 * iCalendar export. Reminders via the user's own calendar app are the only
 * reliable way to get scheduled alerts on every platform: web push needs a
 * server, and the Notification Triggers API never shipped.
 */
import type { DayDetail } from "@/domain/sky/day";
import type { SkyEvent } from "@/domain/sky/events";
import type { CivilDate } from "@/domain/time/civil";
import { describeEvent } from "@/features/shared/format";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** Fold lines at 75 octets (RFC 5545 §3.1). */
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
}

export function eventsIcs(events: SkyEvent[], opts: { alarmMinutes?: number; name?: string } = {}): string {
  const now = stamp(new Date());
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Calwiz//Cosmic Calendar//EN", "CALSCALE:GREGORIAN", `X-WR-CALNAME:${escape(opts.name ?? "Calwiz")}`];
  for (const e of events) {
    const t = describeEvent(e);
    const start = stamp(e.instant);
    const end = stamp(new Date(e.instant.getTime() + 15 * 60_000));
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.kind}-${e.instant.getTime()}@calwiz`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escape(t.title)}`,
      `DESCRIPTION:${escape(`${t.detail}. Computed by Calwiz.`)}`,
      "TRANSP:TRANSPARENT",
    );
    if (opts.alarmMinutes !== undefined) {
      lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escape(t.title)}`, `TRIGGER:-PT${opts.alarmMinutes}M`, "END:VALARM");
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function dayIcs(date: CivilDate, d: DayDetail, _tz: string): string {
  const events = d.events.filter((e) => !(e.kind === "ingress" && e.body === "Moon"));
  return eventsIcs(events, { name: `Calwiz ${date}` });
}

export function downloadFile(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
