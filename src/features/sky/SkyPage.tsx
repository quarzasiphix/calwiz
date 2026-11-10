import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ASPECT_GLYPH, ASPECT_LABEL, aspectsFromPositions } from "@/domain/astrology/aspects";
import { BODY_GLYPH, BODY_THEME, RETROGRADE_NOTE, SIGN_THEME } from "@/domain/astrology/meanings";
import { formatPlacement, placement, SIGN_GLYPHS, zodiacLongitude } from "@/domain/astrology/zodiac";
import { allPositions } from "@/domain/astronomy/bodies";
import { skyEventsBetween } from "@/domain/sky/events";
import { addDays, dayBounds, todayIn, zonedParts } from "@/domain/time/civil";
import { useProfile } from "@/features/profile/ProfileProvider";
import { EventList } from "@/features/shared/components";
import { formatCivil, formatDateTime } from "@/features/shared/format";
import { useDateParam, useNow } from "@/features/shared/hooks";
import { Disclosure, Page, Section, SourceTag } from "@/ui/primitives";
import { ZodiacWheel } from "@/ui/ZodiacWheel";
import { SkyTabs } from "./SkyTabs";

export default function SkyPage() {
  const { sky } = useProfile();
  const now = useNow();
  const [date, setDate, isToday] = useDateParam();
  const tz = sky.timeZone;
  const bounds = dayBounds(date, tz);
  const nowMinutes = isToday ? (() => { const p = zonedParts(now, tz); return p.hour * 60 + p.minute; })() : 720;
  const [minutes, setMinutes] = useState<number | null>(null);
  const minuteOfDay = minutes ?? nowMinutes;
  const instant = useMemo(() => new Date(bounds.start.getTime() + minuteOfDay * 60_000), [bounds.start, minuteOfDay]);

  const positions = useMemo(
    () =>
      allPositions(instant).map((p) => {
        const zl = zodiacLongitude(p.longitude, sky.zodiac, instant);
        return { ...p, zl, placement: placement(zl) };
      }),
    [instant, sky.zodiac],
  );
  const aspects = useMemo(() => aspectsFromPositions(positions.map((p) => ({ ...p, longitude: p.zl })), sky.orbs), [positions, sky.orbs]);
  const ahead = useMemo(
    () =>
      skyEventsBetween(dayBounds(date, tz).start, dayBounds(addDays(date, 60), tz).end, { zodiac: sky.zodiac, moonIngresses: true }).filter(
        (e) => e.kind === "ingress" ? e.body !== "Moon" : e.kind === "station" || e.kind === "season",
      ),
    [date, tz, sky.zodiac],
  );

  const hh = String(Math.floor(minuteOfDay / 60)).padStart(2, "0");
  const mm = String(minuteOfDay % 60).padStart(2, "0");

  return (
    <Page wide>
      <SkyTabs />
      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Planetary positions · {sky.zodiac === "tropical" ? "tropical" : "sidereal"} zodiac</p>
          <h1 className="mt-1 text-3xl sm:text-4xl">{formatCivil.long(date)}</h1>
        </div>
        <div className="flex items-center gap-1">
          <button className="icon-btn" aria-label="Previous day" onClick={() => setDate(addDays(date, -1))}>
            <ChevronLeft size={20} />
          </button>
          <input type="date" aria-label="Date" className="field min-h-[40px] w-auto rounded-full py-1 text-sm" value={date} onChange={(e) => setDate(e.target.value as typeof date)} />
          <input
            type="time"
            aria-label="Time"
            className="field min-h-[40px] w-auto rounded-full py-1 text-sm"
            value={`${hh}:${mm}`}
            onChange={(e) => {
              const [h, m] = e.target.value.split(":").map(Number);
              if (Number.isFinite(h) && Number.isFinite(m)) setMinutes(h! * 60 + m!);
            }}
          />
          <button className="icon-btn" aria-label="Next day" onClick={() => setDate(addDays(date, 1))}>
            <ChevronRight size={20} />
          </button>
          {(!isToday || minutes !== null) && (
            <button className="btn-outline min-h-[40px]" onClick={() => { setMinutes(null); setDate(todayIn(tz)); }}>
              Now
            </button>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,460px)_1fr]">
        <div>
          <ZodiacWheel
            points={positions.map((p) => ({ body: p.body, longitude: p.zl, retrograde: p.retrograde }))}
            aspects={aspects}
            size={460}
            className="mx-auto h-auto w-full max-w-[460px]"
            label={`Zodiac wheel for ${formatDateTime(instant, tz)}: ${positions.map((p) => `${p.body} ${formatPlacement(p.placement)}`).join(", ")}`}
          />
          <label htmlFor="sky-time" className="sr-only">
            Time of day
          </label>
          <input id="sky-time" type="range" min={0} max={1439} step={5} value={minuteOfDay} onChange={(e) => setMinutes(Number(e.target.value))} className="mt-4 w-full accent-[rgb(var(--moon))]" />
          <p className="num text-center text-xs text-muted">
            {formatDateTime(instant, tz)} · drag to watch the Moon move ~0.5° an hour
          </p>
        </div>

        <div className="min-w-0">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl">Positions</h2>
            <SourceTag kind="computed" />
          </div>
          <table className="mt-3 w-full text-sm">
            <caption className="sr-only">Geocentric apparent positions</caption>
            <thead>
              <tr className="label text-left">
                <th scope="col" className="pb-2 font-medium">Body</th>
                <th scope="col" className="pb-2 font-medium">Placement</th>
                <th scope="col" className="pb-2 text-right font-medium">Motion /day</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {positions.map((p) => (
                <tr key={p.body}>
                  <th scope="row" className="py-2 text-left font-normal">
                    <span aria-hidden className="mr-2 inline-block w-5 text-center text-moon">{BODY_GLYPH[p.body]}</span>
                    {p.body}
                  </th>
                  <td className="num py-2">
                    <span aria-hidden className="mr-1 text-muted">{SIGN_GLYPHS[p.placement.sign]}</span>
                    {formatPlacement(p.placement)}
                  </td>
                  <td className={`num py-2 text-right ${p.retrograde ? "text-sky" : "text-muted"}`}>
                    {p.speed >= 0 ? "+" : "−"}
                    {Math.abs(p.speed).toFixed(p.body === "Moon" ? 1 : 3)}°{p.retrograde && " ℞"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Disclosure summary="What do these values mean?" className="mt-2 border-t border-line/60">
            <p className="text-sm text-muted">
              Geocentric apparent ecliptic longitude (light-time and aberration corrected) on the true ecliptic of date, from astronomy-engine (≈1′
              accuracy). ℞ marks retrograde — negative apparent motion in longitude. {RETROGRADE_NOTE}
            </p>
          </Disclosure>

          <Section title="Aspects" aside={<Link to="/me#astrology" className="link">Orbs</Link>} className="mt-8">
            {aspects.length ? (
              <ul className="grid gap-x-6 sm:grid-cols-2">
                {aspects.map((a) => (
                  <li key={`${a.a}-${a.b}`} className="flex min-h-[40px] items-center gap-2 border-b border-line/50 text-sm">
                    <span aria-hidden className="w-12 text-moon">
                      {BODY_GLYPH[a.a]} {ASPECT_GLYPH[a.kind]} {BODY_GLYPH[a.b]}
                    </span>
                    <span className="flex-1">
                      {a.a} {ASPECT_LABEL[a.kind].toLowerCase()} {a.b}
                    </span>
                    <span className="num text-xs text-muted">
                      {a.orb.toFixed(1)}° {a.applying === null ? "" : a.applying ? "applying" : "separating"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No major aspects within the configured orbs.</p>
            )}
          </Section>
        </div>
      </div>

      <div className="grid gap-x-12 lg:grid-cols-2">
        <Section title="Next 60 days" aside="ingresses, stations, seasons">
          <EventList events={ahead.slice(0, 12)} timeZone={tz} now={isToday ? now : undefined} />
        </Section>
        <Section title="Symbolism" aside={<SourceTag kind="tradition" />}>
          <ul className="space-y-3 text-sm">
            {positions.slice(0, 7).map((p) => (
              <li key={p.body}>
                <span className="text-ink">
                  {p.body} in {p.placement.sign}
                </span>
                <span className="text-muted"> — {BODY_THEME[p.body]}, expressed through {SIGN_THEME[p.placement.sign].keywords.replace(/ · /g, ", ")}.</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </Page>
  );
}
