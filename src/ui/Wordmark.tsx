/** Calwiz wordmark: a crescent beside a serif name. Pure paths (no masks) so duplicate instances are safe. */
export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-ink">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <path d="M16 3a13 13 0 1 0 12.6 16.2A11 11 0 0 1 12.8 3.4 13 13 0 0 0 16 3Z" fill="rgb(var(--mark))" />
        <circle cx="25" cy="7" r="1.8" fill="rgb(var(--gold))" />
      </svg>
      <span className="font-display text-xl tracking-tight" style={{ fontVariationSettings: '"SOFT" 100, "opsz" 72' }}>
        Calwiz
      </span>
    </span>
  );
}
