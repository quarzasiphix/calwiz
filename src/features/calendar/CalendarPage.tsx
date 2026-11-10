import { useEffect, useMemo, useRef, type KeyboardEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { clsx } from "clsx";
import { daySummary, type DaySummary } from "@/domain/sky/day";
import { eventWeight } from "@/domain/sky/events";
import { addDays, addMonths, isCivilDate, parseCivil, startOfMonth, startOfWeek, type CivilDate } from "@/domain/time/civil";
import { useProfile } from "@/features/profile/ProfileProvider";
import type { Layers } from "@/features/profile/schema";
import { DaySummaryCard } from "@/features/day/DaySummaryCard";
import { describeEvent, formatCivil, formatPercent, TONE_CLASS } from "@/features/shared/format";
import { useToday } from "@/features/shared/hooks";
import { NumberMark } from "@/features/shared/components";
import { MoonDisk } from "@/ui/MoonDisk";
import { Page, Segmented } from "@/ui/primitives";

const MONTH_RE = /^(\d{4})-(\d{2})$/;

/** /calendar/:month(YYYY-MM)?d=YYYY-MM-DD&view=list */
export default function CalendarPage() {
  const { month: monthParam } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const today = useToday();
  const { profile, update, sky } = useProfile();
  const layers = profile.layers;

  const monthStart: CivilDate = useMemo(() => {
    const m = monthParam && MONTH_RE.exec(monthParam);
    if (m && isCivilDate(`${m[1]}-${m[2]}-01`)) return `${m[1]}-${m[2]}-01` as CivilDate;
    return startOfMonth(today);
  }, [monthParam, today]);

  const selRaw = params.get("d");
  const selected: CivilDate =
    selRaw && isCivilDate(selRaw) && selRaw.startsWith(monthStart.slice(0, 7)) ? selRaw : today.startsWith(monthStart.slice(0, 7)) ? today : monthStart;
  const view = params.get("view") === "list" ? "list" : "grid";

  const go = (date: CivilDate, opts: { focus?: boolean } = {}) => {
    const month = date.slice(0, 7);
    const q = new URLSearchParams(params);
    q.set("d", date);
    navigate({ pathname: `/calendar/${month}`, search: q.toString() }, { replace: month === monthStart.slice(0, 7) });
    if (opts.focus) pendingFocus.current = date;
  };
  const setView = (v: "grid" | "list") => {
    const q = new URLSearchParams(params);
    if (v === "list") q.set("view", "list");
    else q.delete("view");
    setParams(q, { replace: true });
  };

  const gridStart = startOfWeek(monthStart, profile.weekStartsOn);
  const nextMonth = addMonths(monthStart, 1);
  const cells = useMemo(() => {
    const out: CivilDate[] = [];
    for (let d = gridStart; out.length < 42; d = addDays(d, 1)) out.push(d);
    // Drop a trailing week that lies entirely in the next month.
    return out[35]! >= nextMonth ? out.slice(0, 35) : out;
  }, [gridStart, nextMonth]);

  const summaries = useMemo(() => new Map(cells.map((d) => [d, daySummary(d, sky)])), [cells, sky]);
  const selectedSummary = summaries.get(selected) ?? daySummary(selected, sky);

  // Roving focus for keyboard navigation.
  const pendingFocus = useRef<CivilDate | null>(null);
  useEffect(() => {
    const d = pendingFocus.current;
    if (!d) return;
    pendingFocus.current = null;
    document.querySelector<HTMLButtonElement>(`[data-date="${d}"]`)?.focus();
  });

  const onKey = (e: KeyboardEvent) => {
    const delta: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    let next: CivilDate | null = null;
    if (e.key in delta) next = addDays(selected, delta[e.key]!);
    else if (e.key === "PageUp") next = addMonths(selected, e.shiftKey ? -12 : -1);
    else if (e.key === "PageDown") next = addMonths(selected, e.shiftKey ? 12 : 1);
    else if (e.key === "Home") next = startOfWeek(selected, profile.weekStartsOn);
    else if (e.key === "End") next = addDays(startOfWeek(selected, profile.weekStartsOn), 6);
    if (next) {
      e.preventDefault();
      go(next, { focus: true });
    }
  };

  const weekdayLabels = cells.slice(0, 7);
  const toggle = (k: keyof Layers) => update((p) => ({ layers: { ...p.layers, [k]: !p.layers[k] } }));
  const hasBirth = Boolean(sky.birthDate);

  return (
    <Page wide>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button className="icon-btn" aria-label="Previous month" onClick={() => go(addMonths(selected, -1))}>
            <ChevronLeft size={20} />
          </button>
          <h1 className="min-w-[9.5rem] text-center text-2xl sm:text-3xl" aria-live="polite">
            {formatCivil.monthYear(monthStart)}
          </h1>
          <button className="icon-btn" aria-label="Next month" onClick={() => go(addMonths(selected, 1))}>
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selected !== today && (
            <button className="btn-outline min-h-[40px]" onClick={() => go(today)}>
              Today
            </button>
          )}
          <label className="sr-only" htmlFor="jump">
            Jump to date
          </label>
          <input
            id="jump"
            type="date"
            className="field min-h-[40px] w-auto rounded-full py-1 text-sm"
            value={selected}
            onChange={(e) => isCivilDate(e.target.value) && go(e.target.value)}
          />
          <Segmented
            label="Calendar view"
            size="sm"
            value={view}
            onChange={setView}
            options={[
              { value: "grid", label: <LayoutGrid size={14} aria-label="Month grid" /> },
              { value: "list", label: <List size={14} aria-label="List" /> },
            ]}
          />
        </div>
      </header>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Information layers">
        {(
          [
            ["moon", "Moon"],
            ["numbers", "Numbers"],
            ["events", "Events"],
            ...(hasBirth ? ([["personal", "Personal"]] as const) : []),
          ] as const
        ).map(([k, label]) => (
          <button key={k} className="chip" aria-pressed={layers[k]} onClick={() => toggle(k)}>
            {label}
          </button>
        ))}
        {!hasBirth && (
          <Link to="/me" className="chip border-dashed">
            + Personal numbers
          </Link>
        )}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {view === "grid" ? (
          <div role="grid" aria-label={formatCivil.monthYear(monthStart)} onKeyDown={onKey}>
            <div role="row" className="grid grid-cols-7 pb-2">
              {weekdayLabels.map((d) => (
                <div key={d} role="columnheader" className="label text-center">
                  <span aria-hidden className="sm:hidden">
                    {formatCivil.weekdayNarrow(d)}
                  </span>
                  <span className="hidden sm:inline">{formatCivil.weekdayShort(d)}</span>
                </div>
              ))}
            </div>
            {Array.from({ length: cells.length / 7 }, (_, w) => (
              <div role="row" key={w} className="grid grid-cols-7 gap-1 sm:gap-1.5 [&+&]:mt-1 sm:[&+&]:mt-1.5">
                {cells.slice(w * 7, w * 7 + 7).map((d) => (
                  <DayCell
                    key={d}
                    s={summaries.get(d)!}
                    layers={layers}
                    hasBirth={hasBirth}
                    inMonth={d >= monthStart && d < nextMonth}
                    isToday={d === today}
                    isSelected={d === selected}
                    onSelect={() => go(d)}
                  />
                ))}
              </div>
            ))}
            <p className="mt-3 hidden text-2xs text-faint sm:block">Arrow keys move by day/week · Page Up/Down by month (Shift: year) · Moon shown at local noon</p>
          </div>
        ) : (
          <MonthList monthStart={monthStart} nextMonth={nextMonth} summaries={summaries} layers={layers} hasBirth={hasBirth} today={today} selected={selected} />
        )}

        <aside aria-label="Selected day" className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <DaySummaryCard day={selectedSummary} timeZone={sky.timeZone} isToday={selected === today} />
        </aside>
      </div>
    </Page>
  );
}

function topEvent(s: DaySummary) {
  return [...s.events].filter((e) => !(e.kind === "ingress" && e.body === "Moon") && e.kind !== "moonPhase").sort((a, b) => eventWeight(b) - eventWeight(a))[0];
}

function cellLabel(s: DaySummary, isToday: boolean): string {
  const parts = [formatCivil.long(s.date)];
  if (isToday) parts.push("today");
  parts.push(`${s.phaseName}, ${formatPercent(s.illumination)} lit`);
  parts.push(`universal day ${s.numbers.universalDay.value}`);
  if (s.numbers.personal) parts.push(`personal day ${s.numbers.personal.day.value}`);
  const ev = s.events.filter((e) => !(e.kind === "ingress" && e.body === "Moon") && e.kind !== "moonPhase");
  if (ev.length) parts.push(ev.map((e) => describeEvent(e).title).join(", "));
  return parts.join(". ");
}

function DayCell({
  s,
  layers,
  hasBirth,
  inMonth,
  isToday,
  isSelected,
  onSelect,
}: {
  s: DaySummary;
  layers: Layers;
  hasBirth: boolean;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const ev = layers.events ? topEvent(s) : undefined;
  const evText = ev && describeEvent(ev);
  const personal = layers.personal && hasBirth ? s.numbers.personal?.day.value : undefined;
  const { day } = parseCivil(s.date);
  return (
    <div role="gridcell" aria-selected={isSelected} className="min-w-0">
      <button
        type="button"
        data-date={s.date}
        tabIndex={isSelected ? 0 : -1}
        onClick={onSelect}
        aria-label={cellLabel(s, isToday)}
        aria-current={isToday ? "date" : undefined}
        className={clsx(
          "relative flex aspect-[4/5] w-full flex-col items-center rounded-xl border px-0.5 pb-1 pt-1.5 text-center transition-colors sm:aspect-square sm:items-stretch sm:px-2 sm:pt-2 sm:text-left",
          isSelected ? "border-ink/70 bg-raised" : "border-transparent hover:bg-raised/60 sm:border-line/40 sm:bg-surface/40",
          !inMonth && "opacity-35",
        )}
      >
        <span className="flex w-full items-center justify-center gap-1 sm:justify-between">
          <span
            className={clsx(
              "num inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs sm:text-sm",
              isToday ? "bg-gold font-semibold text-bg" : "text-ink",
            )}
          >
            {day}
          </span>
          {layers.numbers && (
            <span className="hidden gap-1 sm:flex" aria-hidden>
              <NumberMark value={s.numbers.universalDay.value} size="sm" />
              {personal && <NumberMark value={personal} size="sm" personal />}
            </span>
          )}
        </span>

        <span className="mt-auto flex w-full flex-col items-center gap-0.5 sm:flex-row sm:items-end sm:justify-between">
          {layers.moon && (
            <span className="relative" aria-hidden>
              <MoonDisk illumination={s.illumination} brightLimbAngle={s.brightLimbAngle} size={22} detail={false} className="sm:h-8 sm:w-8 xl:h-9 xl:w-9" />
              {s.phaseEvent && <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-gold" />}
            </span>
          )}
          <span className="flex items-center gap-1 sm:hidden" aria-hidden>
            {layers.numbers && <span className="num text-2xs text-muted">{s.numbers.universalDay.value}</span>}
            {personal && <span className="num text-2xs text-gold">{personal}</span>}
          </span>
          {evText && (
            <span aria-hidden className={clsx("hidden max-w-full truncate text-2xs sm:block", TONE_CLASS[evText.tone])} title={evText.title}>
              {evText.glyph} <span className="hidden xl:inline">{evText.title}</span>
            </span>
          )}
          {evText && <span aria-hidden className={clsx("absolute right-1 top-1 h-1 w-1 rounded-full bg-current sm:hidden", TONE_CLASS[evText.tone])} />}
        </span>
      </button>
    </div>
  );
}

function MonthList({
  monthStart,
  nextMonth,
  summaries,
  layers,
  hasBirth,
  today,
  selected,
}: {
  monthStart: CivilDate;
  nextMonth: CivilDate;
  summaries: Map<CivilDate, DaySummary>;
  layers: Layers;
  hasBirth: boolean;
  today: CivilDate;
  selected: CivilDate;
}) {
  const days = [...summaries.values()].filter((s) => s.date >= monthStart && s.date < nextMonth);
  return (
    <ol className="divide-y divide-line/60" aria-label={`Days of ${formatCivil.monthYear(monthStart)}`}>
      {days.map((s) => {
        const events = layers.events ? s.events.filter((e) => !(e.kind === "ingress" && e.body === "Moon")) : [];
        return (
          <li key={s.date} id={`d-${s.date}`}>
            <Link
              to={`/day/${s.date}`}
              aria-current={s.date === today ? "date" : undefined}
              className={clsx("flex min-h-[64px] items-center gap-3 rounded-xl px-2 py-2 hover:bg-raised/60", s.date === selected && "bg-raised/60")}
            >
              <span className="w-12 shrink-0 text-center">
                <span className="label block">{formatCivil.weekdayShort(s.date)}</span>
                <span className={clsx("num font-display text-xl", s.date === today && "text-gold")}>{parseCivil(s.date).day}</span>
              </span>
              {layers.moon && <MoonDisk illumination={s.illumination} brightLimbAngle={s.brightLimbAngle} size={32} detail={false} />}
              <span className="min-w-0 flex-1">
                {layers.moon && (
                  <span className="num block text-sm">
                    {s.phaseName} <span className="text-muted">· {formatPercent(s.illumination)}</span>
                  </span>
                )}
                {events.length > 0 && (
                  <span className="block truncate text-xs text-muted">{events.map((e) => describeEvent(e).title).join(" · ")}</span>
                )}
              </span>
              {layers.numbers && <NumberMark value={s.numbers.universalDay.value} size="sm" />}
              {layers.personal && hasBirth && s.numbers.personal && <NumberMark value={s.numbers.personal.day.value} size="sm" personal />}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
