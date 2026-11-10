/** Different screens must never disagree about the same date. */
import { daySummary, dayDetail, eventsOnDay, type SkySettings } from "../sky/day";
import { addDays, dayBounds, type CivilDate } from "../time/civil";

const s: SkySettings = { timeZone: "Europe/Warsaw", zodiac: "tropical", location: null, birthDate: "1990-03-15" };

describe("day composition", () => {
  it("summary and detail agree on numbers and events", () => {
    for (const date of ["2024-01-25", "2026-03-29", "2026-11-10"] as CivilDate[]) {
      const sum = daySummary(date, s);
      const det = dayDetail(date, s, new Date("2000-01-01Z"));
      expect(det.numbers).toEqual(sum.numbers);
      expect(det.events).toEqual(sum.events);
      expect(det.phase).toBe(sum.phase);
    }
  });

  it("puts the exact full moon on the right local day across a zone boundary", () => {
    // Full moon 2024-01-25 17:54 UTC → 18:54 in Warsaw, but 26 Jan 04:54 in Sydney.
    expect(daySummary("2024-01-25", s).phaseEvent?.phase).toBe("full");
    const syd = { ...s, timeZone: "Australia/Sydney" };
    expect(daySummary("2024-01-25", syd).phaseEvent).toBeNull();
    expect(daySummary("2024-01-26", syd).phaseEvent?.phase).toBe("full");
  });

  it("assigns every event of a month to exactly one day", () => {
    let count = 0;
    for (let d: CivilDate = "2026-03-01"; d < "2026-04-01"; d = addDays(d, 1)) {
      const { start, end } = dayBounds(d, s.timeZone);
      for (const e of eventsOnDay(d, s)) {
        expect(e.instant >= start && e.instant < end).toBe(true);
        count++;
      }
    }
    expect(count).toBeGreaterThan(15); // ≥ 4 phases + ~13 Moon ingresses + others
  });

  it("uses 'now' for today and local noon otherwise", () => {
    const now = new Date("2026-11-10T16:02:30Z");
    expect(dayDetail("2026-11-10", s, now).isNow).toBe(true);
    expect(dayDetail("2026-11-10", s, now).instant.toISOString()).toBe("2026-11-10T16:02:00.000Z");
    expect(dayDetail("2026-11-11", s, now).instant.toISOString()).toBe("2026-11-11T11:00:00.000Z");
  });
});
