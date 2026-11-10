import { Link } from "react-router";
import { clsx } from "clsx";
import type { MoonState, PrincipalPhase } from "@/domain/astronomy/moon";
import { isMaster, type CoreNumber } from "@/domain/numerology/engine";
import type { SkyEvent } from "@/domain/sky/events";
import { civilOf } from "@/domain/time/civil";
import { MoonDisk } from "@/ui/MoonDisk";
import { describeEvent, formatDateTime, formatRelative, formatTime, TONE_CLASS } from "./format";

export function NumberMark({ value, size = "md", personal = false, className }: { value: CoreNumber; size?: "sm" | "md" | "lg" | "xl"; personal?: boolean; className?: string }) {
  const master = isMaster(value);
  const dims = { sm: "h-6 min-w-6 text-xs", md: "h-9 min-w-9 text-base", lg: "h-14 min-w-14 text-3xl", xl: "h-20 min-w-20 text-5xl" }[size];
  return (
    <span
      className={clsx(
        "num inline-flex items-center justify-center rounded-full font-display leading-none",
        dims,
        personal ? "text-gold" : "text-ink",
        master && "ring-1 ring-inset ring-gold/60",
        size !== "sm" && "border border-line/80",
        className,
      )}
      title={master ? `Master number ${value}` : undefined}
    >
      {value}
    </span>
  );
}

export function EventList({
  events,
  timeZone,
  now,
  showDate = true,
  linkDays = true,
  empty = "No notable events.",
}: {
  events: SkyEvent[];
  timeZone: string;
  now?: Date;
  showDate?: boolean;
  linkDays?: boolean;
  empty?: string;
}) {
  if (!events.length) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="divide-y divide-line/60">
      {events.map((e, i) => {
        const t = describeEvent(e);
        const day = civilOf(e.instant, timeZone);
        const body = (
          <>
            <span aria-hidden className={clsx("flex w-7 shrink-0 justify-center text-lg leading-none", TONE_CLASS[t.tone])}>
              {e.kind === "moonPhase" ? <PhaseIcon phase={e.phase} /> : t.glyph}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-ink">{t.title}</span>
              <span className="block truncate text-xs text-muted">{t.detail}</span>
            </span>
            <span className="num shrink-0 text-right text-xs text-muted">
              <span className="block text-ink/90">{showDate ? formatDateTime(e.instant, timeZone) : formatTime(e.instant, timeZone)}</span>
              {now && <span className="block">{formatRelative(e.instant, now)}</span>}
            </span>
          </>
        );
        return (
          <li key={`${e.kind}-${e.instant.getTime()}-${i}`}>
            {linkDays ? (
              <Link to={`/day/${day}`} className="-mx-2 flex min-h-[52px] items-center gap-3 rounded-xl px-2 py-2 hover:bg-raised/60">
                {body}
              </Link>
            ) : (
              <div className="flex min-h-[52px] items-center gap-3 py-2">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const PHASE_ORDER: PrincipalPhase[] = ["new", "firstQuarter", "full", "lastQuarter"];

/**
 * Lunation progress by elapsed time, with the actual (not evenly spaced)
 * instants of the principal phases marked.
 */
export function LunationBar({ moon }: { moon: MoonState }) {
  const start = moon.previousNew.getTime();
  const span = moon.nextNew.getTime() - start;
  // Quarter instants within this lunation: use the next occurrence, or step back one lunation if it lies beyond.
  const marks = PHASE_ORDER.slice(1).map((p) => {
    let t = moon.next[p].getTime();
    if (t > moon.nextNew.getTime()) t -= moon.lunationDays * 86_400_000;
    return { p, f: (t - start) / span, t };
  });
  const pct = moon.cycleFraction * 100;
  return (
    <div>
      <div
        className="relative h-1.5 rounded-full bg-line/70"
        role="progressbar"
        aria-label="Progress through the current lunation"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-valuetext={`${pct.toFixed(0)}% through the lunation, day ${moon.ageDays.toFixed(1)} of ${moon.lunationDays.toFixed(1)}`}
      >
        <div className="absolute inset-y-0 left-0 rounded-full bg-moon/70" style={{ width: `${pct}%` }} />
        {marks.map((m) => (
          <span key={m.p} className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-muted/70" style={{ left: `${m.f * 100}%` }} />
        ))}
        <span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg bg-moon" style={{ left: `${pct}%` }} />
      </div>
      <div className="relative mt-2 h-4 text-2xs text-faint">
        <span className="absolute left-0">New</span>
        {marks.map((m) => (
          <span key={m.p} className="absolute -translate-x-1/2" style={{ left: `${m.f * 100}%` }} aria-hidden>
            {m.p === "full" ? "○" : m.p === "firstQuarter" ? "◐" : "◑"}
          </span>
        ))}
        <span className="absolute right-0">New</span>
      </div>
    </div>
  );
}

const PHASE_ICON: Record<PrincipalPhase, [number, number]> = { new: [0, 270], firstQuarter: [0.5, 270], full: [1, 0], lastQuarter: [0.5, 90] };

/** Phase icon drawn with the real renderer, so "new" reads as dark and "full" as lit. */
export function PhaseIcon({ phase, size = 18 }: { phase: PrincipalPhase; size?: number }) {
  const [k, pa] = PHASE_ICON[phase];
  return <MoonDisk illumination={k} brightLimbAngle={pa} size={size} detail={false} />;
}
