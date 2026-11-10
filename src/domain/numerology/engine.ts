/**
 * Canonical numerology engine — every screen uses this module.
 *
 * System: Pythagorean date numerology, "reduce components first" method
 * (as popularised by Hans Decoz):
 *
 *   1. Reduce the month, the day and the year separately, by repeated digit
 *      summing, to 1–9 — or stop at a master number (11, 22, 33).
 *   2. Add the reduced components.
 *   3. Reduce the sum the same way.
 *
 *   Life Path       = reduce(month) + reduce(day) + reduce(birth year)
 *   Universal Year  = reduce(year)
 *   Universal Month = reduce(month) + Universal Year
 *   Universal Day   = reduce(month) + reduce(day) + Universal Year
 *   Personal Year   = reduce(birth month) + reduce(birth day) + Universal Year
 *   Personal Month  = Personal Year + reduce(month)
 *   Personal Day    = Personal Month + reduce(day)
 *
 * When a master number feeds a further sum it is added at its full value
 * (11, not 2). Personal years run on the calendar year (from 1 January).
 *
 * Every result carries a `steps` breakdown so the UI can show its working.
 */
import { parseCivil, type CivilDate } from "../time/civil";

export const MASTER_NUMBERS = [11, 22, 33] as const;
export type MasterNumber = (typeof MASTER_NUMBERS)[number];
export type CoreNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | MasterNumber;

export function isMaster(n: number): n is MasterNumber {
  return (MASTER_NUMBERS as readonly number[]).includes(n);
}

export function digitSum(n: number): number {
  let s = 0;
  for (const ch of String(Math.abs(Math.trunc(n)))) s += Number(ch);
  return s;
}

export interface Reduction {
  value: CoreNumber;
  /** Intermediate values, starting with the input: [1999, 28, 10, 1]. */
  chain: number[];
}

/** Repeated digit sum to 1–9, stopping at 11/22/33 unless `keepMasters` is false. */
export function reduce(n: number, keepMasters = true): Reduction {
  if (!Number.isFinite(n) || n < 0) throw new RangeError(`Cannot reduce ${n}`);
  const chain = [n];
  let v = n;
  while (v > 9 && !(keepMasters && isMaster(v))) {
    v = digitSum(v);
    chain.push(v);
  }
  if (v === 0) throw new RangeError("Numerology values start at 1");
  return { value: v as CoreNumber, chain };
}

export interface Step {
  label: string;
  /** e.g. "1999 → 28 → 10 → 1" */
  working: string;
  value: number;
}

export interface NumberResult {
  value: CoreNumber;
  steps: Step[];
  /** Plain-language formula, e.g. "month + day + year". */
  formula: string;
}

function chainText(r: Reduction): string {
  return r.chain.join(" → ");
}

function component(label: string, n: number): { r: Reduction; step: Step } {
  const r = reduce(n);
  return { r, step: { label, working: chainText(r), value: r.value } };
}

function sumStep(label: string, parts: number[]): { r: Reduction; step: Step } {
  const total = parts.reduce((a, b) => a + b, 0);
  const r = reduce(total);
  const working = r.chain.length > 1 ? `${parts.join(" + ")} = ${chainText(r)}` : `${parts.join(" + ")} = ${total}`;
  return { r, step: { label, working, value: r.value } };
}

export function lifePath(birth: CivilDate): NumberResult {
  const { year, month, day } = parseCivil(birth);
  const m = component("Birth month", month);
  const d = component("Birth day", day);
  const y = component("Birth year", year);
  const total = sumStep("Life Path", [m.r.value, d.r.value, y.r.value]);
  return { value: total.r.value, steps: [m.step, d.step, y.step, total.step], formula: "month + day + year, each reduced first" };
}

export function universalYear(year: number): NumberResult {
  const y = component("Year", year);
  return { value: y.r.value, steps: [{ ...y.step, label: "Universal Year" }], formula: "digits of the year" };
}

export function universalMonth(year: number, month: number): NumberResult {
  const uy = universalYear(year);
  const m = component("Month", month);
  const total = sumStep("Universal Month", [m.r.value, uy.value]);
  return { value: total.r.value, steps: [...uy.steps, m.step, total.step], formula: "month + universal year" };
}

export function universalDay(date: CivilDate): NumberResult {
  const { year, month, day } = parseCivil(date);
  const uy = universalYear(year);
  const m = component("Month", month);
  const d = component("Day", day);
  const total = sumStep("Universal Day", [m.r.value, d.r.value, uy.value]);
  return { value: total.r.value, steps: [...uy.steps, m.step, d.step, total.step], formula: "month + day + universal year" };
}

export function personalYear(birth: CivilDate, year: number): NumberResult {
  const b = parseCivil(birth);
  const bm = component("Birth month", b.month);
  const bd = component("Birth day", b.day);
  const uy = universalYear(year);
  const total = sumStep("Personal Year", [bm.r.value, bd.r.value, uy.value]);
  return { value: total.r.value, steps: [bm.step, bd.step, ...uy.steps, total.step], formula: "birth month + birth day + universal year" };
}

export function personalMonth(birth: CivilDate, year: number, month: number): NumberResult {
  const py = personalYear(birth, year);
  const m = component("Month", month);
  const total = sumStep("Personal Month", [py.value, m.r.value]);
  return { value: total.r.value, steps: [...py.steps, m.step, total.step], formula: "personal year + month" };
}

export function personalDay(birth: CivilDate, date: CivilDate): NumberResult {
  const { year, month, day } = parseCivil(date);
  const pm = personalMonth(birth, year, month);
  const d = component("Day", day);
  const total = sumStep("Personal Day", [pm.value, d.r.value]);
  return { value: total.r.value, steps: [...pm.steps, d.step, total.step], formula: "personal month + day" };
}

export interface DayNumbers {
  date: CivilDate;
  universalDay: NumberResult;
  universalMonth: NumberResult;
  universalYear: NumberResult;
  personal: null | {
    lifePath: NumberResult;
    day: NumberResult;
    month: NumberResult;
    year: NumberResult;
  };
}

export function dayNumbers(date: CivilDate, birth: CivilDate | null): DayNumbers {
  const { year, month } = parseCivil(date);
  return {
    date,
    universalDay: universalDay(date),
    universalMonth: universalMonth(year, month),
    universalYear: universalYear(year),
    personal: birth
      ? {
          lifePath: lifePath(birth),
          day: personalDay(birth, date),
          month: personalMonth(birth, year, month),
          year: personalYear(birth, year),
        }
      : null,
  };
}
