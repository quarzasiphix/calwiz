import { useMemo } from "react";
import { Link } from "react-router";
import { crossAspects, findAspects, ASPECT_GLYPH, ASPECT_LABEL } from "@/domain/astrology/aspects";
import { BODY_GLYPH, BODY_THEME, SIGN_THEME } from "@/domain/astrology/meanings";
import { HOUSE_SYSTEM_LABEL, natalChart } from "@/domain/astrology/natal";
import { formatPlacement, placement, SIGN_GLYPHS, zodiacLongitude } from "@/domain/astrology/zodiac";
import { allPositions } from "@/domain/astronomy/bodies";
import { dayBounds, dayReferenceInstant, zonedToInstant } from "@/domain/time/civil";
import { useProfile } from "@/features/profile/ProfileProvider";
import { formatCivil, formatDateTime, formatZoneName } from "@/features/shared/format";
import { useNow } from "@/features/shared/hooks";
import { EmptyState } from "@/ui/States";
import { Page, Section, SourceTag } from "@/ui/primitives";
import { ZodiacWheel } from "@/ui/ZodiacWheel";
import { SkyTabs } from "./SkyTabs";

/**
 * Birth chart. Houses and the Ascendant are only shown when birth time AND
 * place are saved — never computed from a guessed time.
 */
export default function NatalPage() {
  const { profile, sky } = useProfile();
  const now = useNow();
  const birth = profile.birth;

  const chart = useMemo(() => {
    if (!birth) return null;
    const tz = birth.place?.timeZone ?? profile.timeZone;
    const exact = Boolean(birth.time && birth.place);
    const instant = birth.time
      ? zonedToInstant(birth.date, { hour: Number(birth.time.slice(0, 2)), minute: Number(birth.time.slice(3, 5)) }, tz)
      : dayReferenceInstant(birth.date, tz);
    return {
      tz,
      exact,
      chart: natalChart({
        instant,
        zodiac: profile.zodiac,
        houseSystem: profile.houseSystem,
        location: exact ? { latitude: birth.place!.latitude, longitude: birth.place!.longitude } : undefined,
        dayBounds: birth.time ? undefined : dayBounds(birth.date, tz),
      }),
    };
  }, [birth, profile.timeZone, profile.zodiac, profile.houseSystem]);

  const transits = useMemo(() => {
    if (!chart) return [];
    const minute = new Date(Math.floor(now.getTime() / 3_600_000) * 3_600_000);
    const tp = allPositions(minute)
      .filter((p) => p.body !== "Moon")
      .map((p) => ({ body: p.body, longitude: zodiacLongitude(p.longitude, sky.zodiac, minute), speed: p.speed }));
    const np = chart.chart.points.map((p) => ({ body: p.body, longitude: p.zodiacLongitude }));
    const tight = { conjunction: 2, opposition: 2, square: 2, trine: 2, sextile: 1.5 };
    return crossAspects(tp, np, tight).slice(0, 10);
  }, [chart, now, sky.zodiac]);

  if (!birth || !chart) {
    return (
      <Page wide>
        <SkyTabs />
        <div className="mt-10">
          <EmptyState title="Add your birth date to see your chart" action={<Link to="/me" className="btn-solid">Add birth details</Link>}>
            A birth date gives planet signs. Adding the birth time and place unlocks the Ascendant, Midheaven and houses. Everything stays on this device.
          </EmptyState>
        </div>
      </Page>
    );
  }

  const c = chart.chart;
  const natalAspects = findAspects(c.points.map((p) => ({ body: p.body, longitude: p.zodiacLongitude, speed: p.speed })), sky.orbs);
  const sun = c.points[0]!;
  const moon = c.points[1]!;
  const asc = c.angles ? placement(c.angles.ascendant) : null;

  return (
    <Page wide>
      <SkyTabs />
      <header className="mt-6">
        <p className="label">
          Birth chart · {profile.zodiac} · {chart.exact ? `${HOUSE_SYSTEM_LABEL[profile.houseSystem]} houses` : "no houses"}
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl">{formatCivil.long(birth.date)}</h1>
        <p className="mt-1 text-sm text-muted">
          {birth.time ? `${formatDateTime(c.instant, chart.tz)} ${formatZoneName(c.instant, chart.tz)}` : "Birth time unknown — positions shown for local noon"}
          {birth.place ? ` · ${birth.place.name}` : ""}
        </p>
      </header>

      {!chart.exact && (
        <div className="mt-6 rounded-2xl border border-gold/40 bg-gold/5 p-4 text-sm">
          <p>
            {!birth.time && "Without a birth time, the Ascendant and houses can't be calculated, and fast planets may be uncertain."}
            {birth.time && !birth.place && "Add a birthplace to calculate the Ascendant, Midheaven and houses."}{" "}
            <Link to="/me#birth" className="link">
              Add details
            </Link>
          </p>
          {c.uncertainSigns.length > 0 && (
            <p className="mt-2 text-muted">
              Changes sign during your birth day: <strong className="text-ink">{c.uncertainSigns.join(", ")}</strong>. The sign shown is the noon value.
            </p>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,460px)_1fr]">
        <ZodiacWheel
          points={c.points.map((p) => ({ body: p.body, longitude: p.zodiacLongitude, retrograde: p.retrograde }))}
          aspects={natalAspects}
          left={c.angles?.ascendant ?? 0}
          cusps={c.cusps}
          angles={c.angles}
          size={460}
          className="mx-auto h-auto w-full max-w-[460px]"
          label={`Birth chart: ${c.points.map((p) => `${p.body} ${formatPlacement(placement(p.zodiacLongitude))}`).join(", ")}`}
        />
        <div className="min-w-0">
          <div className="grid grid-cols-3 gap-4">
            <Big label="Sun" sign={placement(sun.zodiacLongitude)} />
            <Big label="Moon" sign={placement(moon.zodiacLongitude)} uncertain={c.uncertainSigns.includes("Moon")} />
            {asc ? <Big label="Rising" sign={asc} /> : <div><p className="label">Rising</p><p className="mt-1 text-sm text-muted">Needs time & place</p></div>}
          </div>
          <table className="mt-6 w-full text-sm">
            <caption className="sr-only">Natal positions</caption>
            <thead>
              <tr className="label text-left">
                <th scope="col" className="pb-2 font-medium">Body</th>
                <th scope="col" className="pb-2 font-medium">Placement</th>
                <th scope="col" className="pb-2 text-right font-medium">House</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {c.points.map((p) => (
                <tr key={p.body}>
                  <th scope="row" className="py-2 text-left font-normal">
                    <span aria-hidden className="mr-2 inline-block w-5 text-center text-moon">{BODY_GLYPH[p.body]}</span>
                    {p.body}
                    {p.retrograde && <span className="ml-1 text-2xs text-sky">℞</span>}
                  </th>
                  <td className="num py-2">
                    {formatPlacement(placement(p.zodiacLongitude))}
                    {c.uncertainSigns.includes(p.body) && <span className="ml-1 text-gold" title="Sign uncertain without birth time">?</span>}
                  </td>
                  <td className="num py-2 text-right text-muted">{p.house ?? "—"}</td>
                </tr>
              ))}
              {c.angles && (
                <tr>
                  <th scope="row" className="py-2 text-left font-normal text-gold">Midheaven</th>
                  <td className="num py-2">{formatPlacement(placement(c.angles.midheaven))}</td>
                  <td className="py-2 text-right text-muted">10th axis</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-x-12 lg:grid-cols-2">
        <Section title="Transits to your chart now" aside={<SourceTag kind="computed" />}>
          {transits.length ? (
            <ul>
              {transits.map((a, i) => (
                <li key={i} className="flex min-h-[40px] items-center gap-2 border-b border-line/50 text-sm">
                  <span aria-hidden className="w-14 text-moon">
                    {BODY_GLYPH[a.a]} {ASPECT_GLYPH[a.kind]} <span className="text-gold">{BODY_GLYPH[a.b]}</span>
                  </span>
                  <span className="flex-1">
                    {a.a} {ASPECT_LABEL[a.kind].toLowerCase()} natal {a.b}
                  </span>
                  <span className="num text-xs text-muted">{a.orb.toFixed(1)}°</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No exact transits (within 2°) from the planets right now.</p>
          )}
          <p className="mt-2 text-2xs text-faint">Sun–Pluto in today's sky against your natal points; the fast Moon is omitted.</p>
        </Section>
        <Section title="Core placements" aside={<SourceTag kind="tradition" />}>
          <p className="text-sm text-muted">
            <span className="text-ink">Sun in {placement(sun.zodiacLongitude).sign}</span> — {SIGN_THEME[placement(sun.zodiacLongitude).sign].summary}
          </p>
          <p className="mt-2 text-sm text-muted">
            <span className="text-ink">Moon in {placement(moon.zodiacLongitude).sign}</span> — {BODY_THEME.Moon}, coloured by {SIGN_THEME[placement(moon.zodiacLongitude).sign].keywords.replace(/ · /g, ", ")}.
          </p>
          {asc && (
            <p className="mt-2 text-sm text-muted">
              <span className="text-ink">{asc.sign} rising</span> — the sign on the eastern horizon at birth, read as one's outward style: {SIGN_THEME[asc.sign].keywords.replace(/ · /g, ", ")}.
            </p>
          )}
        </Section>
      </div>
    </Page>
  );
}

function Big({ label, sign, uncertain }: { label: string; sign: ReturnType<typeof placement>; uncertain?: boolean }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="mt-1 font-display text-2xl">
        <span aria-hidden className="mr-1 text-muted">{SIGN_GLYPHS[sign.sign]}</span>
        {sign.sign}
        {uncertain && <span className="text-gold">?</span>}
      </p>
      <p className="num text-xs text-muted">{formatPlacement(sign)}</p>
    </div>
  );
}
