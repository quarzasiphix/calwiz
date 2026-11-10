import { useMemo, useState } from "react";
import { Link } from "react-router";
import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { moonState, parallacticAngle, phaseEventsBetween, PHASE_NAMES } from "@/domain/astronomy/moon";
import { eclipsesBetween, lunarApsidesBetween } from "@/domain/astronomy/search";
import { PHASE_THEME, SIGN_THEME } from "@/domain/astrology/meanings";
import { formatPlacement, placement, SIGN_GLYPHS, zodiacLongitude } from "@/domain/astrology/zodiac";
import { longitudeOf } from "@/domain/astronomy/bodies";
import { dayDetail } from "@/domain/sky/day";
import type { SkyEvent } from "@/domain/sky/events";
import { addDays } from "@/domain/time/civil";
import { useProfile } from "@/features/profile/ProfileProvider";
import { eventsIcs, downloadFile } from "@/features/share/ics";
import { EventList, LunationBar } from "@/features/shared/components";
import { formatCivil, formatDateTime, formatDuration, formatKm, formatPercent, formatTime } from "@/features/shared/format";
import { useDateParam, useNow } from "@/features/shared/hooks";
import { MoonDisk } from "@/ui/MoonDisk";
import { Page, Section, Segmented, SourceTag, Stat } from "@/ui/primitives";
import { memo } from "@/domain/cache";

const DAY = 86_400_000;

export default function MoonPage() {
  const { sky, profile } = useProfile();
  const now = useNow();
  const [date, setDate, isToday] = useDateParam();
  const base = useMemo(() => dayDetail(date, sky, now), [date, sky, now]);
  const lunation = base.moonState;
  const tz = sky.timeZone;

  // Scrubber: hours offset from the base instant, bounded to this lunation.
  const [offsetH, setOffsetH] = useState(0);
  const [view, setView] = useState<"north" | "sky">(profile.location ? "sky" : "north");
  const minH = Math.ceil((lunation.previousNew.getTime() - base.instant.getTime()) / 3.6e6);
  const maxH = Math.floor((lunation.nextNew.getTime() - base.instant.getTime()) / 3.6e6);
  const instant = new Date(base.instant.getTime() + offsetH * 3.6e6);
  const m = useMemo(() => (offsetH === 0 ? lunation : moonState(instant)), [offsetH, lunation, instant.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps
  const loc = profile.location;
  const pa = view === "sky" && loc ? parallacticAngle(instant, loc.latitude, loc.longitude) : 0;
  const moonSign = placement(zodiacLongitude(longitudeOf("Moon", instant), sky.zodiac, instant));

  const upcoming = useMemo(() => {
    return memo("moonUpcoming", `${date}|${tz}`, () => {
      const from = base.instant;
      const phases: SkyEvent[] = phaseEventsBetween(from, new Date(from.getTime() + 60 * DAY)).map((e) => ({ kind: "moonPhase", instant: e.instant, phase: e.phase }));
      const eclipses: SkyEvent[] = eclipsesBetween(from, new Date(from.getTime() + 366 * DAY)).map((e) => ({ kind: "eclipse", instant: e.instant, body: e.body, eclipse: e.kind }));
      const apsides: SkyEvent[] = lunarApsidesBetween(from, new Date(from.getTime() + 30 * DAY)).map((e) => ({ kind: "apsis", instant: e.instant, apsis: e.kind, distanceKm: e.distanceKm }));
      return { phases: phases.slice(0, 8), eclipses, apsides };
    });
  }, [date, tz, base.instant]);

  const exportYear = (alarm: boolean) => {
    const from = new Date();
    const to = new Date(from.getTime() + 365 * DAY);
    const events: SkyEvent[] = [
      ...phaseEventsBetween(from, to)
        .filter((e) => e.phase === "full" || e.phase === "new")
        .map((e) => ({ kind: "moonPhase" as const, instant: e.instant, phase: e.phase })),
      ...eclipsesBetween(from, to).map((e) => ({ kind: "eclipse" as const, instant: e.instant, body: e.body, eclipse: e.kind })),
    ].sort((a, b) => a.instant.getTime() - b.instant.getTime());
    downloadFile("calwiz-moon-12-months.ics", eventsIcs(events, { name: "Calwiz · Moon", alarmMinutes: alarm ? 60 : undefined }), "text/calendar");
  };

  const scrubLabel = offsetH === 0 ? (isToday ? "Now" : "Noon") : formatDateTime(instant, tz);

  return (
    <Page wide>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label">{isToday ? "Tonight's Moon" : "The Moon on"}</p>
          <h1 className="mt-1 text-3xl sm:text-4xl">{isToday ? formatCivil.long(date) : formatCivil.long(date)}</h1>
        </div>
        <div className="flex items-center gap-1">
          <button className="icon-btn" aria-label="Previous day" onClick={() => { setOffsetH(0); setDate(addDays(date, -1)); }}>
            <ChevronLeft size={20} />
          </button>
          <input
            type="date"
            aria-label="Choose a date"
            className="field min-h-[40px] w-auto rounded-full py-1 text-sm"
            value={date}
            onChange={(e) => { setOffsetH(0); setDate(e.target.value as typeof date); }}
          />
          <button className="icon-btn" aria-label="Next day" onClick={() => { setOffsetH(0); setDate(addDays(date, 1)); }}>
            <ChevronRight size={20} />
          </button>
          {!isToday && (
            <button className="btn-outline min-h-[40px]" onClick={() => { setOffsetH(0); setDate(null); }}>
              Today
            </button>
          )}
        </div>
      </header>

      <section className="mt-8 grid items-center gap-10 md:grid-cols-[minmax(0,380px)_1fr]" aria-label="Moon visualisation">
        <div>
          <MoonDisk
            illumination={m.illumination}
            brightLimbAngle={m.brightLimbAngle}
            parallacticAngle={pa}
            size={380}
            className="mx-auto h-auto w-[min(80vw,380px)]"
            label={`${PHASE_NAMES[m.phase]}, ${formatPercent(m.illumination, 1)} illuminated`}
          />
          <div className="mt-4 flex justify-center">
            <Segmented
              size="sm"
              label="Disk orientation"
              value={view}
              onChange={setView}
              options={[
                { value: "north", label: "North up" },
                { value: "sky", label: loc ? `From ${loc.name.split(",")[0]}` : "As seen locally" },
              ]}
            />
          </div>
          {view === "sky" && !loc && (
            <p className="mt-2 text-center text-xs text-muted">
              <Link to="/me#location" className="link">Set a location</Link> to orient the disk to your horizon.
            </p>
          )}
          <p className="mt-3 text-center text-2xs text-faint">Lit shape and tilt computed; surface markings are illustrative.</p>
        </div>

        <div className="min-w-0">
          <h2 className="text-4xl">{PHASE_NAMES[m.phase]}</h2>
          <p className="mt-1 text-muted">{PHASE_THEME[m.phase].short}</p>
          <dl className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
            <Stat label="Illuminated" value={formatPercent(m.illumination, 1)} hint="of the visible disk" />
            <Stat label="Cycle" value={formatPercent(m.cycleFraction, 1)} hint="of the lunation elapsed" />
            <Stat label="Age" value={`${m.ageDays.toFixed(2)} d`} hint={`of ${m.lunationDays.toFixed(2)} d`} />
            <Stat label="Elongation" value={`${m.elongation.toFixed(1)}°`} hint={m.waxing ? "waxing · east of the Sun" : "waning · west of the Sun"} />
            <Stat label="Distance" value={formatKm(m.distanceKm)} hint="centre to centre" />
            <Stat label="Apparent size" value={`${(m.diameterDeg * 60).toFixed(1)}′`} hint="angular diameter" />
          </dl>

          <div className="mt-8">
            <div className="flex items-baseline justify-between">
              <label htmlFor="scrub" className="label">
                Explore this lunation
              </label>
              <span className="num text-xs text-muted">
                {scrubLabel}
                {offsetH !== 0 && (
                  <button className="link ml-2" onClick={() => setOffsetH(0)}>
                    reset
                  </button>
                )}
              </span>
            </div>
            <input
              id="scrub"
              type="range"
              min={minH}
              max={maxH}
              step={1}
              value={offsetH}
              onChange={(e) => setOffsetH(Number(e.target.value))}
              className="mt-3 w-full accent-[rgb(var(--moon))]"
              aria-valuetext={`${formatDateTime(instant, tz)}, ${formatPercent(m.illumination)} illuminated`}
            />
            <div className="mt-3">
              <LunationBar moon={m} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-x-12 lg:grid-cols-2">
        <Section title="Phase milestones" aside={<SourceTag kind="computed" />}>
          <EventList events={upcoming.phases} timeZone={tz} now={isToday ? now : undefined} />
          <p className="mt-3 text-sm text-muted">
            Next full moon in {formatDuration(lunation.next.full.getTime() - base.instant.getTime())}, next new moon in{" "}
            {formatDuration(lunation.next.new.getTime() - base.instant.getTime())}.
          </p>
        </Section>

        <Section title={loc ? `Rise & set · ${loc.name.split(",")[0]}` : "Rise & set"}>
          {base.moonTimes && base.sunTimes ? (
            <dl className="grid grid-cols-2 gap-5">
              <Stat label="Moonrise" value={base.moonTimes.rise ? formatTime(base.moonTimes.rise, tz) : "None"} hint={base.moonTimes.rise ? undefined : "No rise this date"} />
              <Stat label="Moonset" value={base.moonTimes.set ? formatTime(base.moonTimes.set, tz) : "None"} hint={base.moonTimes.set ? undefined : "No set this date"} />
              <Stat label="Sunrise" value={base.sunTimes.rise ? formatTime(base.sunTimes.rise, tz) : "—"} />
              <Stat label="Sunset" value={base.sunTimes.set ? formatTime(base.sunTimes.set, tz) : "—"} />
            </dl>
          ) : (
            <p className="text-sm text-muted">
              Rise and set times depend on where you are.{" "}
              <Link to="/me#location" className="link">
                Add a location
              </Link>{" "}
              — it stays on this device.
            </p>
          )}
          <p className="mt-3 text-2xs text-faint">Upper limb on the horizon, standard refraction, sea level. Times in {tz}.</p>
        </Section>
      </div>

      <div className="grid gap-x-12 lg:grid-cols-2">
        <Section title="Eclipses in the next year">
          <EventList events={upcoming.eclipses} timeZone={tz} empty="No eclipses in the next 12 months." />
          <p className="mt-2 text-2xs text-faint">Times are of greatest eclipse. Solar eclipses are only visible along part of Earth.</p>
        </Section>
        <Section title="Distance">
          <EventList events={upcoming.apsides} timeZone={tz} />
        </Section>
      </div>

      <div className="grid gap-x-12 lg:grid-cols-2">
        <Section title="Moon sign" aside={<SourceTag kind="tradition" />}>
          <p className="font-display text-2xl">
            {SIGN_GLYPHS[moonSign.sign]} {formatPlacement(moonSign)}
          </p>
          <p className="mt-2 text-sm text-muted">{SIGN_THEME[moonSign.sign].summary}</p>
          <p className="mt-2 text-2xs text-faint">
            Astrological placement ({sky.zodiac} zodiac) — a symbolic convention, separate from the astronomical phase above.
          </p>
        </Section>
        <Section title="Reminders">
          <p className="text-sm text-muted">
            Add the next 12 months of full moons, new moons and eclipses to your calendar app. Your calendar delivers the reminders reliably, even when
            Calwiz is closed.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-outline" onClick={() => exportYear(true)}>
              <CalendarPlus size={16} aria-hidden /> With 1-hour alerts
            </button>
            <button className="btn-ghost" onClick={() => exportYear(false)}>
              Without alerts
            </button>
          </div>
        </Section>
      </div>

      <Section title="Illumination isn't cycle progress">
        <p className="max-w-2xl text-sm text-muted">
          <strong className="text-ink">Illuminated fraction</strong> is how much of the disk is sunlit as seen from Earth — 50% at each quarter.{" "}
          <strong className="text-ink">Cycle progress</strong> is how much of the current lunation (new moon to new moon) has elapsed. They differ because
          illumination follows the cosine of the Sun–Moon angle, and because the Moon's orbital speed varies: this lunation lasts{" "}
          {lunation.lunationDays.toFixed(2)} days, not the 29.53-day average. {isToday ? "Right now" : "At noon on this date"} the Moon is{" "}
          {formatPercent(lunation.illumination)} lit but {formatPercent(lunation.cycleFraction)} through the cycle.
        </p>
      </Section>
    </Page>
  );
}
