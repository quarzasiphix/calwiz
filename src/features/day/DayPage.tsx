import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { CalendarPlus, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { PHASE_NAMES } from "@/domain/astronomy/moon";
import { BODY_GLYPH, PHASE_THEME, SIGN_THEME } from "@/domain/astrology/meanings";
import { formatPlacement, SIGN_GLYPHS } from "@/domain/astrology/zodiac";
import { NUMBER_MEANING } from "@/domain/numerology/meanings";
import { dayDetail } from "@/domain/sky/day";
import { addDays, diffDays, isCivilDate, type CivilDate } from "@/domain/time/civil";

const relativeDays = (n: number) => new Intl.RelativeTimeFormat(navigator.language, { numeric: "auto" }).format(n, "day");
import { AskPanel } from "@/features/ai/AskPanel";
import { NumberWorking } from "@/features/numbers/NumberWorking";
import { useProfile } from "@/features/profile/ProfileProvider";
import { EventList, NumberMark } from "@/features/shared/components";
import { formatCivil, formatPercent, formatTime } from "@/features/shared/format";
import { useNow, useToday } from "@/features/shared/hooks";
import { dayIcs, downloadFile } from "@/features/share/ics";
import { shareDay } from "@/features/share/share";
import { useMoonOrientation } from "@/features/moon/orientation";
import { MoonDisk } from "@/ui/MoonDisk";
import { Disclosure, Page, Section, SourceTag, Stat } from "@/ui/primitives";

/** /day/:date — a deep-linkable, shareable description of one date. */
export default function DayPage() {
  const { date } = useParams();
  if (!date || !isCivilDate(date)) return <Navigate to="/calendar" replace />;
  return <Day date={date} />;
}

function Day({ date }: { date: CivilDate }) {
  const { profile, sky } = useProfile();
  const now = useNow();
  const today = useToday();
  const d = useMemo(() => dayDetail(date, sky, now), [date, sky, now]);
  const orientation = useMoonOrientation(d.instant);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const tz = sky.timeZone;
  const n = d.numbers;
  const isToday = date === today;

  return (
    <Page wide>
      <nav className="flex items-center justify-between" aria-label="Day navigation">
        <Link to={`/day/${addDays(date, -1)}`} className="btn-ghost -ml-3" aria-label="Previous day">
          <ChevronLeft size={18} aria-hidden /> {formatCivil.medium(addDays(date, -1))}
        </Link>
        <Link to={`/calendar/${date.slice(0, 7)}?d=${date}`} className="label hover:text-ink">
          {formatCivil.monthYear(date)}
        </Link>
        <Link to={`/day/${addDays(date, 1)}`} className="btn-ghost -mr-3" aria-label="Next day">
          {formatCivil.medium(addDays(date, 1))} <ChevronRight size={18} aria-hidden />
        </Link>
      </nav>

      <header className="mt-6 grid items-center gap-6 sm:grid-cols-[180px_1fr]">
        <MoonDisk
          illumination={d.illumination}
          brightLimbAngle={d.brightLimbAngle}
          parallacticAngle={orientation.parallactic}
          size={180}
          className="mx-auto"
          label={`${d.phaseName}, ${formatPercent(d.illumination)} illuminated`}
        />
        <div>
          <p className="label">{isToday ? "Today" : relativeDays(diffDays(today, date))}</p>
          <h1 className="mt-1 text-4xl">{formatCivil.long(date)}</h1>
          <p className="mt-2 text-muted">
            {d.phaseName} · {formatPercent(d.illumination)} lit {isToday ? `at ${formatTime(d.instant, tz)}` : "at local noon"} · {d.waxing ? "waxing" : "waning"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="btn-outline min-h-[40px]"
              onClick={async () => setShareMsg(await shareDay(date, d))}
            >
              <Share2 size={16} aria-hidden /> Share
            </button>
            <button className="btn-outline min-h-[40px]" onClick={() => downloadFile(`calwiz-${date}.ics`, dayIcs(date, d, tz), "text/calendar")}>
              <CalendarPlus size={16} aria-hidden /> Add events to calendar
            </button>
          </div>
          {shareMsg && (
            <p role="status" className="mt-2 text-xs text-muted">
              {shareMsg}
            </p>
          )}
        </div>
      </header>

      <div className="grid gap-x-12 lg:grid-cols-2">
        <Section title="The Moon" aside={<SourceTag kind="computed" />}>
          <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <Stat label="Illuminated" value={formatPercent(d.moonState.illumination, 1)} />
            <Stat label="Lunar age" value={`${d.moonState.ageDays.toFixed(1)} d`} />
            <Stat label="Cycle" value={formatPercent(d.moonState.cycleFraction)} hint="by elapsed time" />
            <Stat label="Moon sign" value={`${SIGN_GLYPHS[d.moon.sign]} ${d.moon.sign}`} hint={formatPlacement(d.moon)} />
            {d.moonTimes && <Stat label="Moonrise" value={d.moonTimes.rise ? formatTime(d.moonTimes.rise, tz) : "—"} />}
            {d.moonTimes && <Stat label="Moonset" value={d.moonTimes.set ? formatTime(d.moonTimes.set, tz) : "—"} />}
          </dl>
          {!d.moonTimes && (
            <p className="mt-4 text-sm text-muted">
              <Link to="/me#location" className="link">
                Set a location
              </Link>{" "}
              for moonrise, moonset and sunrise times.
            </p>
          )}
          <p className="mt-4 text-xs text-faint">
            <Link to={`/moon?d=${date}`} className="link">
              Explore this lunation →
            </Link>
          </p>
        </Section>

        <Section title="Events this day" aside={<span className="text-faint">times in {tz}</span>}>
          <EventList events={d.events} timeZone={tz} showDate={false} linkDays={false} empty="No exact events on this date." />
          {d.sunTimes && (
            <p className="num mt-3 text-sm text-muted">
              Sunrise {d.sunTimes.rise ? formatTime(d.sunTimes.rise, tz) : "—"} · Sunset {d.sunTimes.set ? formatTime(d.sunTimes.set, tz) : "—"}
            </p>
          )}
        </Section>
      </div>

      <div className="grid gap-x-12 lg:grid-cols-2">
        <Section title="Numbers" aside={<SourceTag kind="computed" />}>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <NumberMark value={n.universalDay.value} size="lg" />
              <div>
                <p className="label">Universal day</p>
                <p className="font-display">{NUMBER_MEANING[n.universalDay.value].title}</p>
              </div>
            </div>
            {n.personal && (
              <div className="flex items-center gap-3">
                <NumberMark value={n.personal.day.value} size="lg" personal />
                <div>
                  <p className="label">Personal day</p>
                  <p className="font-display">{NUMBER_MEANING[n.personal.day.value].title}</p>
                </div>
              </div>
            )}
          </div>
          <p className="mt-3 text-sm text-muted">{NUMBER_MEANING[(n.personal?.day ?? n.universalDay).value].day}</p>
          <Disclosure summary="Show the working" className="mt-2 border-t border-line/60">
            <NumberWorking result={n.universalDay} />
            {n.personal && <NumberWorking result={n.personal.day} className="mt-4" />}
          </Disclosure>
        </Section>

        <Section title="Planets" aside={<Link to={`/sky?d=${date}`} className="link">Sky explorer</Link>}>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {d.positions.map((p) => (
              <li key={p.body} className="flex items-center gap-2">
                <span aria-hidden className="w-5 text-center text-moon">
                  {BODY_GLYPH[p.body]}
                </span>
                <span className="w-16 text-muted">{p.body}</span>
                <span className="num">
                  {SIGN_GLYPHS[p.placement.sign]} {Math.floor(p.placement.degree)}°
                </span>
                {p.retrograde && (
                  <span className="text-2xs text-sky" title="Retrograde">
                    ℞
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <div className="grid gap-x-12 lg:grid-cols-2">
        <Section title="Reading" aside={<SourceTag kind="tradition" />}>
          <p className="font-display text-lg">{PHASE_THEME[d.phase].short}.</p>
          <p className="mt-2 text-sm text-muted">{PHASE_THEME[d.phase].long}</p>
          <p className="mt-2 text-sm text-muted">
            Sun in {d.sun.sign} ({SIGN_THEME[d.sun.sign].keywords}); Moon in {d.moon.sign} ({SIGN_THEME[d.moon.sign].keywords}). Traditional day ruler:{" "}
            {d.dayRuler}.
          </p>
        </Section>
        <Section title={`Ask about ${isToday ? "today" : "this day"}`} aside={<SourceTag kind="generated" />}>
          <AskPanel date={date} detail={d} profile={profile} />
        </Section>
      </div>
      <p className="mt-10 text-2xs text-faint">{PHASE_NAMES[d.moonState.phase] !== d.phaseName && "The day's phase name reflects the exact phase occurring during this date; continuous values are sampled at the time shown."}</p>
    </Page>
  );
}
