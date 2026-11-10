import { addDays, addMonths, civilOf, dayBounds, diffDays, isCivilDate, offsetMinutes, startOfWeek, weekday, zonedToInstant } from "../time/civil";

describe("civil dates", () => {
  it("validates real calendar dates only", () => {
    expect(isCivilDate("2024-02-29")).toBe(true);
    expect(isCivilDate("2023-02-29")).toBe(false);
    expect(isCivilDate("2026-13-01")).toBe(false);
    expect(isCivilDate("26-1-1")).toBe(false);
  });
  it("does calendar arithmetic without time zones", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2024-03-01", -1)).toBe("2024-02-29");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2026-01-15", -1)).toBe("2025-12-15");
    expect(addMonths("2026-01-15", -13)).toBe("2024-12-15");
    expect(diffDays("2026-01-01", "2026-12-31")).toBe(364);
    expect(weekday("2026-11-10")).toBe(2); // Tuesday
    expect(startOfWeek("2026-11-10", 1)).toBe("2026-11-09");
    expect(startOfWeek("2026-11-10", 0)).toBe("2026-11-08");
  });
});

describe("time zones", () => {
  it("converts ordinary wall times", () => {
    expect(zonedToInstant("2026-07-01", { hour: 12, minute: 0 }, "Europe/Warsaw").toISOString()).toBe("2026-07-01T10:00:00.000Z");
    expect(zonedToInstant("2026-01-15", { hour: 9, minute: 0 }, "America/New_York").toISOString()).toBe("2026-01-15T14:00:00.000Z");
    expect(zonedToInstant("2026-01-15", { hour: 9, minute: 0 }, "Asia/Kolkata").toISOString()).toBe("2026-01-15T03:30:00.000Z");
  });
  it("shifts non-existent spring-forward times forward", () => {
    // Warsaw jumps 02:00 → 03:00 on 2026-03-29; 02:30 reads as 03:30 CEST.
    expect(zonedToInstant("2026-03-29", { hour: 2, minute: 30 }, "Europe/Warsaw").toISOString()).toBe("2026-03-29T01:30:00.000Z");
  });
  it("picks the earlier instant in a fall-back overlap", () => {
    expect(zonedToInstant("2026-10-25", { hour: 2, minute: 30 }, "Europe/Warsaw").toISOString()).toBe("2026-10-25T00:30:00.000Z");
  });
  it("has 23- and 25-hour days around DST", () => {
    const spring = dayBounds("2026-03-29", "Europe/Warsaw");
    const fall = dayBounds("2026-10-25", "Europe/Warsaw");
    expect((spring.end.getTime() - spring.start.getTime()) / 3.6e6).toBe(23);
    expect((fall.end.getTime() - fall.start.getTime()) / 3.6e6).toBe(25);
  });
  it("reads civil dates and offsets", () => {
    const t = new Date("2026-11-10T23:30:00Z");
    expect(civilOf(t, "UTC")).toBe("2026-11-10");
    expect(civilOf(t, "Asia/Tokyo")).toBe("2026-11-11");
    expect(civilOf(t, "America/Los_Angeles")).toBe("2026-11-10");
    expect(offsetMinutes(t, "Asia/Kolkata")).toBe(330);
  });
});
