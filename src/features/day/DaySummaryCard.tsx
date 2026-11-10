import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { PHASE_THEME } from "@/domain/astrology/meanings";
import { formatPlacement, SIGN_GLYPHS } from "@/domain/astrology/zodiac";
import { NUMBER_MEANING } from "@/domain/numerology/meanings";
import type { DaySummary } from "@/domain/sky/day";
import { EventList, NumberMark } from "@/features/shared/components";
import { formatCivil, formatPercent } from "@/features/shared/format";
import { MoonDisk } from "@/ui/MoonDisk";

/** Compact description of one day, used beside/below the calendar grid. */
export function DaySummaryCard({ day, timeZone, isToday }: { day: DaySummary; timeZone: string; isToday: boolean }) {
  const ud = day.numbers.universalDay.value;
  const pd = day.numbers.personal?.day.value;
  return (
    <article className="panel p-5" aria-labelledby={`sum-${day.date}`}>
      <p className="label">{isToday ? "Today" : formatCivil.weekdayShort(day.date)}</p>
      <h2 id={`sum-${day.date}`} className="mt-1 text-2xl">
        {formatCivil.dayMonth(day.date)}
      </h2>
      <div className="mt-4 flex items-center gap-4">
        <MoonDisk illumination={day.illumination} brightLimbAngle={day.brightLimbAngle} size={64} />
        <div>
          <p className="font-display text-lg">{day.phaseName}</p>
          <p className="num text-sm text-muted">
            {formatPercent(day.illumination)} lit at noon · {day.waxing ? "waxing" : "waning"}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">{PHASE_THEME[day.phase].short}.</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="label">Sun</dt>
          <dd className="num mt-0.5">
            {SIGN_GLYPHS[day.sun.sign]} {formatPlacement(day.sun)}
          </dd>
        </div>
        <div>
          <dt className="label">Moon</dt>
          <dd className="num mt-0.5">
            {SIGN_GLYPHS[day.moon.sign]} {formatPlacement(day.moon)}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center gap-3">
        <NumberMark value={ud} />
        <span className="text-sm text-muted">{NUMBER_MEANING[ud].title}</span>
        {pd && (
          <>
            <NumberMark value={pd} personal />
            <span className="text-sm text-muted">personal</span>
          </>
        )}
      </div>
      <div className="mt-4 border-t border-line/60 pt-2">
        <EventList events={day.events} timeZone={timeZone} showDate={false} linkDays={false} empty="No exact events this day." />
      </div>
      <Link to={`/day/${day.date}`} className="btn-outline mt-4 w-full">
        Open full day <ArrowRight size={16} aria-hidden />
      </Link>
    </article>
  );
}
