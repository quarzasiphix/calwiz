import { coerceProfile, exportProfile, importProfile, loadProfile, parseLegacyBirthdate, STORAGE_KEY } from "./storage";
import { defaultProfile } from "./schema";

beforeEach(() => localStorage.clear());

describe("profile storage", () => {
  it("parses the legacy DD/MM/YYYY format and rejects impossible dates", () => {
    expect(parseLegacyBirthdate("29/09/1999")).toBe("1999-09-29");
    expect(parseLegacyBirthdate("31/02/1990")).toBeNull();
    expect(parseLegacyBirthdate("1999-09-29")).toBeNull();
  });

  it("migrates the original app's keys once and removes them", () => {
    localStorage.setItem("calwiz_birthdate", "15/03/1990");
    localStorage.setItem("calwiz_life_path_number", "9");
    const p = loadProfile();
    expect(p.birth?.date).toBe("1990-03-15");
    expect(localStorage.getItem("calwiz_birthdate")).toBeNull();
    expect(localStorage.getItem("calwiz_life_path_number")).toBeNull();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).birth.date).toBe("1990-03-15");
  });

  it("salvages valid fields from a partly corrupt profile", () => {
    const p = coerceProfile({ zodiac: "sidereal", theme: "neon", birth: { date: "2023-02-30" } });
    expect(p.zodiac).toBe("sidereal");
    expect(p.theme).toBe("system");
    expect(p.birth).toBeUndefined();
  });

  it("survives garbage in storage", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadProfile().zodiac).toBe("tropical");
  });

  it("round-trips export and import, and rejects invalid imports", () => {
    const p = { ...defaultProfile(), birth: { date: "1990-03-15" as const, time: "08:30" } };
    expect(importProfile(exportProfile(p)).birth).toEqual(p.birth);
    expect(() => importProfile(JSON.stringify({ profile: { zodiac: "draconic" } }))).toThrow();
  });
});
