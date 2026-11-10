import { useRef, useState } from "react";
import { Check, Copy, Sparkles } from "lucide-react";
import type { DayDetail } from "@/domain/sky/day";
import type { CivilDate } from "@/domain/time/civil";
import type { Profile } from "@/features/profile/schema";
import { useOnline } from "@/features/shared/hooks";
import { Disclosure } from "@/ui/primitives";
import { aiConfigured, askAi, AiError } from "./client";
import { buildAiContext, promptFor } from "./context";

const PRESETS = ["Explain today's Moon", "What does this day's number mean?", "How were these values calculated?"];

/**
 * Optional AI interpretation. Core features never depend on it.
 * Generated text is always labelled; failures are shown as failures.
 */
export function AskPanel({ date, detail, profile }: { date: CivilDate; detail: DayDetail; profile: Profile }) {
  const [question, setQuestion] = useState("");
  const [includePersonal, setIncludePersonal] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const online = useOnline();
  const configured = aiConfigured();
  const hasPersonal = Boolean(detail.numbers.personal);

  const context = () => buildAiContext(date, detail, profile, includePersonal && hasPersonal);

  const send = async () => {
    abort.current?.abort();
    const ctl = new AbortController();
    abort.current = ctl;
    setBusy(true);
    setError(null);
    setAnswer(null);
    try {
      setAnswer(await askAi(context(), question.trim(), ctl.signal));
    } catch (e) {
      if (!ctl.signal.aborted) setError(e instanceof AiError ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(promptFor(context(), question.trim()));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't access the clipboard.");
    }
  };

  return (
    <div>
      <p className="text-sm text-muted">
        {configured
          ? "Ask a question about this day. The AI receives only the computed values shown in Calwiz — not your birth details."
          : "Copy this day's computed data as a ready-made prompt for any AI assistant you use. Nothing is sent from Calwiz."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p} type="button" className="chip" aria-pressed={question === p} onClick={() => setQuestion(p)}>
            {p}
          </button>
        ))}
      </div>
      <label className="sr-only" htmlFor={`q-${date}`}>
        Your question
      </label>
      <textarea
        id={`q-${date}`}
        rows={2}
        maxLength={500}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Or write your own question…"
        className="field mt-3 min-h-[72px] resize-y py-2"
      />
      {hasPersonal && (
        <label className="mt-2 flex min-h-[44px] items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={includePersonal} onChange={(e) => setIncludePersonal(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--gold))]" />
          Include my personal numbers (life path, personal year/month/day)
        </label>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {configured && (
          <button type="button" className="btn-solid" onClick={send} disabled={busy || !online}>
            <Sparkles size={16} aria-hidden /> {busy ? "Asking…" : online ? "Ask" : "Offline"}
          </button>
        )}
        <button type="button" className="btn-outline" onClick={copy}>
          {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />} {copied ? "Copied" : "Copy as prompt"}
        </button>
        {busy && (
          <button type="button" className="btn-ghost" onClick={() => abort.current?.abort()}>
            Cancel
          </button>
        )}
      </div>
      <div aria-live="polite">
        {error && (
          <p role="alert" className="mt-4 text-sm text-rose">
            {error}
          </p>
        )}
        {answer && (
          <div className="mt-4 rounded-2xl border border-rose/30 bg-surface p-4">
            <p className="label text-rose">AI-generated interpretation · may be inaccurate</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
          </div>
        )}
      </div>
      <Disclosure summary="Preview the data that would be shared" className="mt-2">
        <pre className="max-h-64 overflow-auto rounded-xl bg-bg/60 p-3 text-2xs text-muted">{JSON.stringify(context(), null, 2)}</pre>
      </Disclosure>
    </div>
  );
}
