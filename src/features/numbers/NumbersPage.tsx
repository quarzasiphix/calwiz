import { useMemo } from "react";
import { Link } from "react-router";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dayNumbers, personalYear, reduce, type CoreNumber, type NumberResult } from "@/domain/numerology/engine";
import { NUMBER_MEANING } from "@/domain/numerology/meanings";
import { addDays, addMonths, daysInMonth, parseCivil, startOfMonth } from "@/domain/time/civil";
import { useProfile } from "@/features/profile/ProfileProvider";
import { NumberMark } from "@/features/shared/components";
import { formatCivil } from "@/features/shared/format";
import { useDateParam } from "@/features/shared/hooks";
import { EmptyState } from "@/ui/States";
import { Disclosure, Page, Section, SourceTag } from "@/ui/primitives";
import { NumberWorking } from "./NumberWorking";

export default function NumbersPage() {
  const { sky } = useProfile();
  const [date, setDate, isToday] = useDateParam();
  const birth = sky.birthDate;
  const n = useMemo(() => dayNumbers(date, birth), [date, birth]);
  const { year, month } = parseCivil(date);

  const monthDays = useMemo(() => {
    const first = startOfMonth(date);
    return Array.from({ length: daysInMonth(year, month) }, (_, i) => dayNumbers(addDays(first, i), birth));
  }, [date, year, month, birth]);

  return (
    <Page wide>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Numerology · Pythagorean</p>
          <h1 className="mt-1 text-3xl sm:text-4xl">{formatCivil.long(date)}</h1>
        </div>
        <div className="flex items-center gap-1">
          <button className="icon-btn" aria-label="Previous day" onClick={() => setDate(addDays(date, -1))}>
            <ChevronLeft size={20} />
          </button>
          <input type="date" aria-label="Date" className="field min-h-[40px] w-auto rounded-full py-1 text-sm" value={date} onChange={(e) => setDate(e.target.value as typeof date)} />
          <button className="icon-btn" aria-label="Next day" onClick={() => setDate(addDays(date, 1))}>
            <ChevronRight size={20} />
          </button>
          {!isToday && (
            <button className="btn-outline min-h-[40px]" onClick={() => setDate(null)}>
              Today
            </button>
          )}
        </div>
      </header>

      <div className="grid gap-x-12 lg:grid-cols-2">
        <Section title="Universal" aside={<SourceTag kind="computed" />}>
          <p className="mb-4 text-sm text-muted">The same for everyone — derived from the date alone.</p>
          <NumberRow label="Day" result={n.universalDay} />
          <NumberRow label="Month" result={n.universalMonth} kind="month" />
          <NumberRow label="Year" result={n.universalYear} kind="year" />
        </Section>

        <Section title="Personal" aside={<SourceTag kind="computed" />}>
          {n.personal ? (
            <>
              <p className="mb-4 text-sm text-muted">From your birth date and this date. Personal years begin on 1 January.</p>
              <NumberRow label="Life Path" result={n.personal.lifePath} personal kind="lifePath" />
              <NumberRow label="Personal year" result={n.personal.year} personal kind="year" />
              <NumberRow label="Personal month" result={n.personal.month} personal kind="month" />
              <NumberRow label="Personal day" result={n.personal.day} personal />
            </>
          ) : (
            <EmptyState title="Personal numbers need your birth date" action={<Link to="/me#birth" className="btn-solid">Add birth date</Link>}>
              Life Path and your personal year, month and day are calculated on this device and never uploaded.
            </EmptyState>
          )}
        </Section>
      </div>

      {birth && <NineYearCycle birth={birth} year={year} />}

      <Section
        title={`Day numbers in ${formatCivil.month(date)}`}
        aside={
          <span className="flex gap-1">
            <button className="icon-btn h-9 w-9" aria-label="Previous month" onClick={() => setDate(addMonths(date, -1))}>
              <ChevronLeft size={16} />
            </button>
            <button className="icon-btn h-9 w-9" aria-label="Next month" onClick={() => setDate(addMonths(date, 1))}>
              <ChevronRight size={16} />
            </button>
          </span>
        }
      >
        <ol className="grid grid-cols-7 gap-1 sm:grid-cols-[repeat(16,minmax(0,1fr))]">
          {monthDays.map((d) => {
            const day = parseCivil(d.date).day;
            return (
              <li key={d.date}>
                <button
                  onClick={() => setDate(d.date)}
                  aria-current={d.date === date ? "date" : undefined}
                  aria-label={`${formatCivil.medium(d.date)}: universal ${d.universalDay.value}${d.personal ? `, personal ${d.personal.day.value}` : ""}`}
                  className={clsx("flex w-full flex-col items-center rounded-xl py-2", d.date === date ? "bg-raised ring-1 ring-ink/50" : "hover:bg-raised/60")}
                >
                  <span className="num text-2xs text-faint">{day}</span>
                  <span className="num font-display text-lg leading-tight">{d.universalDay.value}</span>
                  {d.personal && <span className="num text-xs text-gold">{d.personal.day.value}</span>}
                </button>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-2xs text-faint">Large: universal day{birth ? " · gold: your personal day" : ""}. Master numbers (11, 22, 33) are kept unreduced.</p>
      </Section>

      <Section title="How Calwiz calculates">
        <div className="max-w-2xl space-y-3 text-sm text-muted">
          <p>
            Calwiz uses one engine everywhere: the Pythagorean method in which the month, day and year are each reduced first — by summing digits until a
            single digit remains, stopping at the master numbers 11, 22 and 33 — and then added and reduced again.
          </p>
          <p>
            Example: 29 September 1999 → month 9, day 29 → 11, year 1999 → 28 → 10 → 1; 9 + 11 + 1 = 21 → <strong className="text-ink">3</strong>. Summing all
            digits at once (2+9+0+9+1+9+9+9 = 48 → 12 → 3) agrees here but can hide master numbers on other dates, which is why the convention matters.
          </p>
          <p>Interpretations come from numerological tradition and are symbolic, not predictive.</p>
        </div>
      </Section>
    </Page>
  );
}

function NumberRow({ label, result, personal = false, kind = "day" }: { label: string; result: NumberResult; personal?: boolean; kind?: "day" | "month" | "year" | "lifePath" }) {
  const meaning = NUMBER_MEANING[result.value];
  return (
    <div className="border-b border-line/60 py-3">
      <div className="flex items-center gap-4">
        <NumberMark value={result.value} size="md" personal={personal} />
        <div className="min-w-0 flex-1">
          <p className="label">{label}</p>
          <p className="font-display">{meaning.title}</p>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">{kind === "lifePath" ? meaning.lifePath : kind === "year" ? meaning.year : kind === "month" ? `A month with the tone of ${meaning.keywords.replace(/ · /g, ", ")}.` : meaning.day}</p>
      <Disclosure summary="Working">
        <NumberWorking result={result} />
      </Disclosure>
    </div>
  );
}

/** Personal years 1–9 as a cycle, marking where this year falls. */
function NineYearCycle({ birth, year }: { birth: `${number}-${string}-${string}`; year: number }) {
  const years = Array.from({ length: 9 }, (_, i) => year - 4 + i).map((y) => ({ y, v: personalYear(birth, y).value }));
  const base = (v: CoreNumber) => reduce(v, false).value;
  const current = years[4]!;
  return (
    <Section title="Your nine-year cycle" aside={<SourceTag kind="computed" />}>
      <ol className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
        {years.map(({ y, v }) => (
          <li key={y} className="min-w-[72px] flex-1">
            <div className={clsx("rounded-xl border px-2 py-3 text-center", y === year ? "border-gold/70 bg-gold/10" : "border-line/60")}>
              <p className="num text-2xs text-faint">{y}</p>
              <p className={clsx("num font-display text-2xl", y === year && "text-gold")}>{v}</p>
              <p className="truncate text-2xs text-muted">{NUMBER_MEANING[v].title.replace("The ", "")}</p>
            </div>
            <div className="mt-1 h-1 rounded-full bg-line/60">
              <div className="h-1 rounded-full bg-gold/60" style={{ width: `${(base(v) / 9) * 100}%` }} />
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-sm text-muted">
        {current.y} is personal year {current.v}: {NUMBER_MEANING[current.v].year}
      </p>
    </Section>
  );
}

