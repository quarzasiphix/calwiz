import type { DayDetail } from "@/domain/sky/day";
import type { CivilDate } from "@/domain/time/civil";
import { formatCivil, formatPercent } from "@/features/shared/format";

/** Plain-text day summary. Contains no personal data. */
export function dayShareText(date: CivilDate, d: DayDetail): string {
  return [
    `${formatCivil.long(date)}`,
    `${d.phaseName}, ${formatPercent(d.illumination)} lit · Moon in ${d.moon.sign} · Sun in ${d.sun.sign}`,
    `Universal day number ${d.numbers.universalDay.value}`,
  ].join("\n");
}

/** Web Share where available, clipboard otherwise. Returns a status message. */
export async function shareDay(date: CivilDate, d: DayDetail): Promise<string> {
  const url = `${location.origin}/day/${date}`;
  const text = dayShareText(date, d);
  try {
    if (navigator.share) {
      await navigator.share({ title: `Calwiz · ${formatCivil.medium(date)}`, text, url });
      return "Shared.";
    }
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return "Summary and link copied.";
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return "";
    return "Sharing isn't available here.";
  }
}
