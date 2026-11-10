import { dayNumbers, lifePath, personalDay, personalMonth, personalYear, reduce, universalDay, universalMonth, universalYear } from "../numerology/engine";

describe("reduce", () => {
  it("reduces to a single digit and stops at master numbers", () => {
    expect(reduce(1999).chain).toEqual([1999, 28, 10, 1]);
    expect(reduce(29).value).toBe(11);
    expect(reduce(29, false).value).toBe(2);
    expect(reduce(22).value).toBe(22);
    expect(reduce(33).value).toBe(33);
    expect(reduce(44).value).toBe(8);
    expect(() => reduce(0)).toThrow();
  });
});

describe("life path", () => {
  it("reduces components first and keeps master numbers", () => {
    // 9 + 29→11 + 1999→1 = 21 → 3
    expect(lifePath("1999-09-29").value).toBe(3);
    // 11 + 11 + 1987→25→7 = 29 → 11
    expect(lifePath("1987-11-11").value).toBe(11);
    // 12→3 + 25→7 + 1984→22 = 32 → 5
    expect(lifePath("1984-12-25").value).toBe(5);
  });
  it("shows its working", () => {
    const r = lifePath("1999-09-29");
    expect(r.steps.map((s) => s.working)).toEqual(["9", "29 → 11", "1999 → 28 → 10 → 1", "9 + 11 + 1 = 21 → 3"]);
  });
});

describe("universal numbers", () => {
  it("fully reduces day numbers (old app showed 12 for 1999-09-29)", () => {
    expect(universalDay("1999-09-29").value).toBe(3);
    expect(universalDay("2026-11-10").value).toBe(4); // 11 + 1 + 1 = 13 → 4
    expect(universalYear(2026).value).toBe(1);
    expect(universalMonth(2026, 11).value).toBe(3); // 11 + 1 = 12 → 3
    expect(universalYear(2029).value).toBe(4); // 13 → 4
    expect(universalYear(2009).value).toBe(11);
  });
  it("produces values in the allowed set for 20 years of dates", () => {
    const allowed = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]);
    for (let t = Date.UTC(2010, 0, 1); t < Date.UTC(2030, 0, 1); t += 86_400_000) {
      const d = new Date(t).toISOString().slice(0, 10) as `${number}-${string}-${string}`;
      expect(allowed.has(universalDay(d).value)).toBe(true);
    }
  });
});

describe("personal cycle", () => {
  it("chains year → month → day", () => {
    // birth 15 March: 3 + 15→6 + 2026→1 = 10 → 1
    expect(personalYear("1990-03-15", 2026).value).toBe(1);
    expect(personalMonth("1990-03-15", 2026, 11).value).toBe(3); // 1 + 11 = 12 → 3
    expect(personalDay("1990-03-15", "2026-11-10").value).toBe(4); // 3 + 1 = 4
  });
  it("is null without a birth date", () => {
    expect(dayNumbers("2026-11-10", null).personal).toBeNull();
    expect(dayNumbers("2026-11-10", "1990-03-15").personal?.day.value).toBe(4);
  });
});
