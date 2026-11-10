import { clsx } from "clsx";
import type { NumberResult } from "@/domain/numerology/engine";

/** Shows each reduction step of a numerology result. */
export function NumberWorking({ result, className }: { result: NumberResult; className?: string }) {
  const final = result.steps[result.steps.length - 1];
  return (
    <div className={clsx("text-sm", className)}>
      <p className="text-muted">
        <span className="text-ink">{final?.label}</span> = {result.formula}
      </p>
      <ol className="num mt-2 space-y-1 font-mono text-xs text-muted">
        {result.steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="w-32 shrink-0 text-faint">{s.label}</span>
            <span className={i === result.steps.length - 1 ? "text-ink" : undefined}>{s.working}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
