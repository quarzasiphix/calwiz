import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";

export function Page({ children, className, wide = false }: { children: ReactNode; className?: string; wide?: boolean }) {
  return <div className={clsx("mx-auto w-full px-4 pt-5 sm:px-6 lg:px-10 lg:pt-10", wide ? "max-w-6xl" : "max-w-3xl", className)}>{children}</div>;
}

export function PageHeader({ eyebrow, title, children, actions }: { eyebrow?: ReactNode; title: ReactNode; children?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="label mb-2">{eyebrow}</p>}
        <h1 className="text-3xl leading-tight sm:text-4xl">{title}</h1>
        {children && <div className="mt-2 text-sm text-muted">{children}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Section({ title, aside, children, className, id }: { title?: ReactNode; aside?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  const hid = useId();
  return (
    <section aria-labelledby={title ? hid : undefined} className={clsx("mt-10 min-w-0", className)} id={id}>
      {(title || aside) && (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          {title && (
            <h2 id={hid} className="text-xl">
              {title}
            </h2>
          )}
          {aside && <div className="text-xs text-muted">{aside}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, className }: { label: ReactNode; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <div className={clsx("min-w-0", className)}>
      <dt className="label">{label}</dt>
      <dd className="num mt-1 font-display text-2xl leading-tight">{value}</dd>
      {hint && <dd className="mt-0.5 text-xs text-muted">{hint}</dd>}
    </div>
  );
}

/** Accessible disclosure for "show the working" / long interpretations. */
export function Disclosure({ summary, children, defaultOpen = false, className }: { summary: ReactNode; children: ReactNode; defaultOpen?: boolean; className?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[44px] w-full items-center justify-between gap-3 text-left text-sm text-muted hover:text-ink"
      >
        <span>{summary}</span>
        <ChevronDown size={16} className={clsx("shrink-0 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      <div id={id} hidden={!open} className="pb-2">
        {children}
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  label: string;
  size?: "sm" | "md";
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-line p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            "rounded-full px-3 font-medium transition-colors",
            size === "sm" ? "min-h-[32px] text-xs" : "min-h-[40px] text-sm",
            value === o.value ? "bg-ink text-bg" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** A small marker that distinguishes computed data from symbolic interpretation. */
export function SourceTag({ kind }: { kind: "computed" | "tradition" | "generated" }) {
  const map = {
    computed: { text: "Computed", cls: "text-sky border-sky/40" },
    tradition: { text: "Tradition", cls: "text-gold border-gold/40" },
    generated: { text: "AI-generated", cls: "text-rose border-rose/40" },
  } as const;
  const m = map[kind];
  return <span className={clsx("inline-flex items-center rounded-full border px-2 py-0.5 text-2xs font-medium uppercase tracking-wider", m.cls)}>{m.text}</span>;
}
