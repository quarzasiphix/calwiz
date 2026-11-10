/**
 * Optional AI webhook client.
 *
 * Configure with VITE_AI_WEBHOOK_URL (e.g. an n8n workflow you control). The
 * URL is public in the built bundle — put API keys on the server side of the
 * webhook, never in this app. There is no demo mode: if the webhook is not
 * configured the UI offers "copy as prompt" instead.
 */
import type { AiContext } from "./context";
import { SYSTEM_GUIDANCE } from "./context";

export const AI_WEBHOOK_URL: string | undefined = (import.meta.env.VITE_AI_WEBHOOK_URL as string | undefined)?.trim() || undefined;
export const AI_TIMEOUT_MS = 30_000;

export function aiConfigured(): boolean {
  return Boolean(AI_WEBHOOK_URL && /^https:\/\//.test(AI_WEBHOOK_URL));
}

export interface AiRequest {
  version: 2;
  question: string;
  system: string;
  context: AiContext;
}

export class AiError extends Error {}

export async function askAi(context: AiContext, question: string, signal?: AbortSignal): Promise<string> {
  if (!aiConfigured()) throw new AiError("No AI service is configured for this installation.");
  const body: AiRequest = { version: 2, question, system: SYSTEM_GUIDANCE, context };
  const timeout = AbortSignal.timeout(AI_TIMEOUT_MS);
  const res = await fetch(AI_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  }).catch((e: unknown) => {
    throw new AiError(e instanceof DOMException && e.name === "TimeoutError" ? "The AI service took too long to answer." : "Couldn't reach the AI service.");
  });
  if (!res.ok) throw new AiError(`The AI service returned an error (${res.status}).`);
  const type = res.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const data = (await res.json()) as unknown;
    const answer = typeof data === "string" ? data : (data as { answer?: unknown; output?: unknown; text?: unknown })?.answer ?? (data as { output?: unknown }).output ?? (data as { text?: unknown }).text;
    if (typeof answer !== "string" || !answer.trim()) throw new AiError("The AI service returned an empty answer.");
    return answer.trim();
  }
  const text = (await res.text()).trim();
  if (!text) throw new AiError("The AI service returned an empty answer.");
  return text;
}
