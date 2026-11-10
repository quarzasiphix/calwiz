import { useMemo } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { PHASE_NAMES } from "@/domain/astronomy/moon";
import { BODY_GLYPH, PHASE_THEME, SIGN_THEME } from "@/domain/astrology/meanings";
import { formatPlacement, SIGN_GLYPHS } from "@/domain/astrology/zodiac";
import { NUMBER_MEANING } from "@/domain/numerology/meanings";
import { dayDetail } from "@/domain/sky/day";
import { eventWeight, skyEventsBetween } from "@/domain/sky/events";
import { addDays, dayBounds } from "@/domain/time/civil";
import { useProfile } from "@/features/profile/ProfileProvider";
import { EventList, LunationBar, NumberMark } from "@/features/shared/components";
import { formatCivil, formatDuration, formatPercent, formatTime, formatZoneName } from "@/features/shared/format";
import { useNow, useToday } from "@/features/shared/hooks";
import { AskPanel } from "@/features/ai/AskPanel";
import { MoonDisk } from "@/ui/MoonDisk";
import { Disclosure, Page, Section, SourceTag } from "@/ui/primitives";
import { NumberWorking } from "@/features/numbers/NumberWorking";
import { useMoonOrientation } from "@/features/moon/orientation";

export default function TodayPage() {
  const { profile, sky, update } = useProfile();
  const now = useNow();
  const today = useToday();
  const d = useMemo(() => dayDetail(today, sky, now), [today, sky, now]);
  const m = d.moonState;
  const orientation = useMoonOrientation(d.instant);

  const upcoming = useMemo(() => {
    const start = dayBounds(today, sky.timeZone).start;
    const end = dayBounds(addDays(today, 45), sky.timeZone).end;
    return skyEventsBetween(start, end, { zodiac: sky.zodiac, moonIngresses: true })
      .filter((e) => e.instant > now && eventWeight(e) >= 40)
      .slice(0, 6);
    // `now` only filters; the expensive search is memoised per day.
  }, [today, sky.timeZone, sky.zodiac, now]);

  const retro = d.positions.filter((p) => p.retrograde);
  const ud = d.numbers.universalDay;
  const pd = d.numbers.personal?.day;
  const untilFull = m.next.full.getTime() - now.getTime();
  const untilNew = m.next.new.getTime() - now.getTime();
  const moonSign = d.moon.sign;

  return (
    <Page wide>
      {!profile.onboarded && <Welcome onDismiss={() => update({ onboarded: true })} />}
      <p className="label">
        {formatCivil.long(today)} · {formatTime(now, sky.timeZone)} {formatZoneName(now, sky.timeZone)}
      </p>

      {/* Hero: the Moon right now */}
      <section aria-labelledby="hero-title" className="mt-6 grid items-center gap-8 md:grid-cols-[minmax(0,300px)_1fr] md:gap-12">
        <Link to="/moon" className="mx-auto block w-[min(68vw,300px)] animate-rise md:w-full" aria-label="Open the Moon page">
          <MoonDisk
            illumination={m.illumination}
            brightLimbAngle={m.brightLimbAngle}
            parallacticAngle={orientation.parallactic}
            size={300}
            className="h-auto w-full drop-shadow-[0_0_60px_rgb(var(--moon)/0.08)]"
            label={`${PHASE_NAMES[m.phase]}, ${formatPercent(m.illumination)} illuminated`}
          />
        </Link>
        <div className="min-w-0">
          <h1 id="hero-title" className="text-4xl sm:text-5xl">
            {PHASE_NAMES[m.phase]}
          </h1>
          <p className="mt-2 text-muted">
            <span className="num font-display text-3xl text-ink">{formatPercent(m.illumination)}</span>
            <span className="ml-2">of the disk lit · {m.waxing ? "waxing" : "waning"}</span>
          </p>
          <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="label">Lunar age</dt>
              <dd className="num mt-1 text-ink">{m.ageDays.toFixed(1)} d</dd>
            </div>
            <div>
              <dt className="label">Full moon</dt>
              <dd className="num mt-1 text-ink">in {formatDuration(untilFull)}</dd>
            </div>
            <div>
              <dt className="label">New moon</dt>
              <dd className="num mt-1 text-ink">in {formatDuration(untilNew)}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <LunationBar moon={m} />
            <p className="mt-1 text-xs text-faint">
              {formatPercent(m.cycleFraction)} through this {m.lunationDays.toFixed(2)}-day lunation
              {orientation.label && <> · disk shown {orientation.label}</>}
            </p>
          </div>
        </div>
      </section>

      {/* Sky now */}
      <section aria-label="Sun and Moon positions" className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line/70 bg-line/60 sm:grid-cols-3">
        <SkyCell glyph={BODY_GLYPH.Sun} label="Sun" value={formatPlacement(d.sun)} sign={d.sun.sign} />
        <SkyCell glyph={BODY_GLYPH.Moon} label="Moon" value={formatPlacement(d.moon)} sign={d.moon.sign} />
        <div className="bg-surface px-4 py-4">
          <p className="label">Retrograde now</p>
          <p className="mt-1 text-sm">
            {retro.length ? retro.map((p) => `${BODY_GLYPH[p.body]} ${p.body}`).join(" · ") : <span className="text-muted">No planets retrograde</span>}
          </p>
        </div>
      </section>
      <p className="mt-2 text-2xs text-faint">
        {sky.zodiac === "tropical" ? "Tropical" : "Sidereal (Chitrapaksha)"} zodiac · geocentric apparent positions ·{" "}
        <Link to="/me#astrology" className="link">
          change
        </Link>
      </p>

      <div className="grid gap-x-12 lg:grid-cols-2">
        {/* Numbers */}
        <Section title="Numbers of the day" aside={<SourceTag kind="computed" />}>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <NumberMark value={ud.value} size="lg" />
              <div>
                <p className="label">Universal day</p>
                <p className="font-display text-lg">{NUMBER_MEANING[ud.value].title}</p>
              </div>
            </div>
            {pd ? (
              <div className="flex items-center gap-3">
                <NumberMark value={pd.value} size="lg" personal />
                <div>
                  <p className="label">Your personal day</p>
                  <p className="font-display text-lg">{NUMBER_MEANING[pd.value].title}</p>
                </div>
              </div>
            ) : (
              <Link to="/me" className="chip">
                Add your birth date for personal numbers <ArrowRight size={12} aria-hidden />
              </Link>
            )}
          </div>
          <p className="mt-4 text-sm text-muted">{NUMBER_MEANING[(pd ?? ud).value].day}</p>
          <Disclosure summary="How these were calculated" className="mt-2 border-t border-line/60">
            <NumberWorking result={ud} />
            {pd && <NumberWorking result={pd} className="mt-4" />}
          </Disclosure>
        </Section>

        {/* Reading */}
        <Section title="Today's reading" aside={<SourceTag kind="tradition" />}>
          <p className="font-display text-lg leading-snug">
            {PHASE_THEME[m.phase].short}, with the Moon in {moonSign} {SIGN_GLYPHS[moonSign]}.
          </p>
          <p className="mt-2 text-sm text-muted">
            {PHASE_THEME[m.phase].long} The Moon in {moonSign} is traditionally linked with {SIGN_THEME[moonSign].keywords.replace(/ · /g, ", ")}.
          </p>
          <Disclosure summary="More about today's symbolism" className="mt-2 border-t border-line/60">
            <p className="text-sm text-muted">
              Sun in {d.sun.sign}: {SIGN_THEME[d.sun.sign].summary} The day is ruled by {d.dayRuler} in the traditional weekday scheme.
            </p>
            <p className="mt-2 text-2xs text-faint">
              Interpretations reflect astrological and numerological tradition. They are symbolic, not scientific predictions.
            </p>
          </Disclosure>
        </Section>
      </div>

      <div className="grid gap-x-12 lg:grid-cols-2">
        <Section title="Coming up" aside={<Link to="/calendar" className="link">Calendar</Link>}>
          <EventList events={upcoming} timeZone={sky.timeZone} now={now} empty="No major events in the next 45 days." />
        </Section>
        <Section title="Ask about today" aside={<SourceTag kind="generated" />}>
          <AskPanel date={today} detail={d} profile={profile} />
        </Section>
      </div>
    </Page>
  );
}

function SkyCell({ glyph, label, value, sign }: { glyph: string; label: string; value: string; sign: keyof typeof SIGN_THEME }) {
  return (
    <div className="flex items-center gap-3 bg-surface px-4 py-4">
      <span aria-hidden className="w-6 text-center text-2xl text-moon">
        {glyph}
      </span>
      <div className="min-w-0">
        <p className="label">{label}</p>
        <p className="num mt-0.5 text-sm">
          {value} <span aria-hidden className="text-muted">{SIGN_GLYPHS[sign]}</span>
        </p>
      </div>
    </div>
  );
}

function Welcome({ onDismiss }: { onDismiss: () => void }) {
  return (
    <aside aria-label="Welcome" className="mb-8 rounded-2xl border border-line/70 bg-surface/70 p-5 animate-rise">
      <p className="font-display text-xl">Welcome to Calwiz</p>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        This is the real sky, calculated on your device: the Moon's exact phase and light, where the planets are, and the numbers of each day. Astrology
        and numerology are shown as the symbolic traditions they are, always labelled.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/me" className="btn-solid" onClick={onDismiss}>
          Personalise (optional)
        </Link>
        <button className="btn-ghost" onClick={onDismiss}>
          Just explore
        </button>
      </div>
      <p className="mt-3 text-2xs text-faint">No account. Nothing you enter leaves this device.</p>
    </aside>
  );
}
