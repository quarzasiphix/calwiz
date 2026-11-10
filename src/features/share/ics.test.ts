import { eventsIcs } from "./ics";

describe("iCalendar export", () => {
  it("produces RFC 5545 events with escaped text, CRLF and optional alarms", () => {
    const ics = eventsIcs([{ kind: "moonPhase", instant: new Date("2024-01-25T17:54:00Z"), phase: "full" }], { alarmMinutes: 60, name: "Test; a, b" });
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("DTSTART:20240125T175400Z");
    expect(ics).toContain("SUMMARY:Full Moon");
    expect(ics).toContain("X-WR-CALNAME:Test\\; a\\, b");
    expect(ics).toContain("TRIGGER:-PT60M");
    expect(ics.split("\r\n").every((l) => l.length <= 75)).toBe(true);
  });
});
