/**
 * Reference values: US Naval Observatory phase tables and NASA/GSFC eclipse
 * predictions (Espenak). Tolerances are far tighter than anything displayed.
 */
import { Body, HorizonFromVector, MakeTime, Observer, RotateVector, Rotation_ECT_EQD, Rotation_EQD_HOR, VectorFromSphere, Spherical } from "astronomy-engine";
import { bodyPosition, longitudeOf } from "../astronomy/bodies";
import { moonState, phaseEventsBetween, previousNewMoon, phaseKeyFromElongation } from "../astronomy/moon";
import { boundaryCrossingsBetween, eclipsesBetween, lunarApsidesBetween, seasonsBetween, stationsBetween } from "../astronomy/search";
import { ayanamsa, placement, zodiacLongitude } from "../astrology/zodiac";
import { chartAngles, houseCusps, houseOf, natalChart } from "../astrology/natal";
import { findAspects } from "../astrology/aspects";

const minutesBetween = (a: Date, iso: string) => Math.abs(a.getTime() - new Date(iso).getTime()) / 60_000;

describe("lunar phases (USNO)", () => {
  it("finds January 2024 quarters within 2 minutes", () => {
    const ev = phaseEventsBetween(new Date("2024-01-01T00:00Z"), new Date("2024-02-01T00:00Z"));
    expect(ev.map((e) => e.phase)).toEqual(["lastQuarter", "new", "firstQuarter", "full"]);
    expect(minutesBetween(ev[0]!.instant, "2024-01-04T03:30Z")).toBeLessThan(2);
    expect(minutesBetween(ev[1]!.instant, "2024-01-11T11:57Z")).toBeLessThan(2);
    expect(minutesBetween(ev[2]!.instant, "2024-01-18T03:53Z")).toBeLessThan(2);
    expect(minutesBetween(ev[3]!.instant, "2024-01-25T17:54Z")).toBeLessThan(2);
  });

  it("distinguishes illumination from cycle progress", () => {
    const atFirstQuarter = moonState(new Date("2024-01-18T03:53Z"));
    expect(atFirstQuarter.illumination).toBeGreaterThan(0.48);
    expect(atFirstQuarter.illumination).toBeLessThan(0.52);
    expect(atFirstQuarter.phase).toBe("firstQuarter");
    expect(atFirstQuarter.waxing).toBe(true);
    // Elapsed time 6.66 d of a 29.6 d lunation — not 0.25.
    expect(atFirstQuarter.cycleFraction).toBeGreaterThan(0.2);
    expect(atFirstQuarter.cycleFraction).toBeLessThan(0.24);

    const full = moonState(new Date("2024-04-24T01:00Z"));
    expect(full.illumination).toBeGreaterThan(0.995);
    expect(full.phase).toBe("full");
    expect(full.waxing).toBe(false); // elongation just past 180°
  });

  it("computes lunar age from the previous new moon", () => {
    const s = moonState(new Date("2024-01-21T11:57Z"));
    expect(s.ageDays).toBeCloseTo(10, 1);
    expect(minutesBetween(s.previousNew, "2024-01-11T11:57Z")).toBeLessThan(2);
    expect(minutesBetween(s.next.full, "2024-01-25T17:54Z")).toBeLessThan(2);
    expect(minutesBetween(previousNewMoon(new Date("2024-01-11T12:30Z")), "2024-01-11T11:57Z")).toBeLessThan(2);
  });

  it("names phases from elongation", () => {
    expect(phaseKeyFromElongation(1)).toBe("new");
    expect(phaseKeyFromElongation(45)).toBe("waxingCrescent");
    expect(phaseKeyFromElongation(135)).toBe("waxingGibbous");
    expect(phaseKeyFromElongation(225)).toBe("waningGibbous");
    expect(phaseKeyFromElongation(300)).toBe("waningCrescent");
    expect(phaseKeyFromElongation(359)).toBe("new");
  });

  it("puts the Moon at a plausible distance", () => {
    const s = moonState(new Date("2024-01-01T00:00Z"));
    expect(s.distanceKm).toBeGreaterThan(356_000);
    expect(s.distanceKm).toBeLessThan(407_000);
    expect(s.diameterDeg).toBeGreaterThan(0.48);
    expect(s.diameterDeg).toBeLessThan(0.57);
  });

  it("orients the bright limb towards the Sun (waxing: west, ~270°)", () => {
    const s = moonState(new Date("2024-01-18T03:53Z"));
    expect(s.brightLimbAngle).toBeGreaterThan(220);
    expect(s.brightLimbAngle).toBeLessThan(320);
  });
});

describe("eclipses, seasons, apsides (NASA/USNO)", () => {
  it("finds the 2024-04-08 total solar and 2025-03-14 total lunar eclipses", () => {
    const solar = eclipsesBetween(new Date("2024-04-01Z"), new Date("2024-04-15Z"));
    expect(solar).toHaveLength(1);
    expect(solar[0]!.body).toBe("Sun");
    expect(solar[0]!.kind).toBe("total");
    expect(minutesBetween(solar[0]!.instant, "2024-04-08T18:17Z")).toBeLessThan(3);

    const lunar = eclipsesBetween(new Date("2025-03-01Z"), new Date("2025-03-31Z"));
    expect(lunar.map((e) => `${e.body}:${e.kind}`)).toEqual(["Moon:total", "Sun:partial"]);
    expect(minutesBetween(lunar[0]!.instant, "2025-03-14T06:59Z")).toBeLessThan(3);
  });

  it("finds equinoxes and solstices", () => {
    const s = seasonsBetween(new Date("2024-01-01Z"), new Date("2025-01-01Z"));
    expect(s.map((x) => x.kind)).toEqual(["marchEquinox", "juneSolstice", "septemberEquinox", "decemberSolstice"]);
    expect(minutesBetween(s[0]!.instant, "2024-03-20T03:06Z")).toBeLessThan(3);
    expect(minutesBetween(s[3]!.instant, "2024-12-21T09:20Z")).toBeLessThan(3);
  });

  it("alternates perigee and apogee", () => {
    const a = lunarApsidesBetween(new Date("2024-01-01Z"), new Date("2024-03-01Z"));
    expect(a.length).toBeGreaterThanOrEqual(4);
    for (const x of a) {
      if (x.kind === "perigee") expect(x.distanceKm).toBeLessThan(372_000);
      else expect(x.distanceKm).toBeGreaterThan(400_000);
    }
  });
});

describe("planets", () => {
  it("finds the April 2024 Mercury retrograde stations", () => {
    const st = stationsBetween("Mercury", new Date("2024-03-15Z"), new Date("2024-05-15Z"));
    expect(st.map((s) => s.turnsTo)).toEqual(["retrograde", "direct"]);
    expect(minutesBetween(st[0]!.instant, "2024-04-01T22:14Z")).toBeLessThan(60);
    expect(minutesBetween(st[1]!.instant, "2024-04-25T12:54Z")).toBeLessThan(60);
    expect(bodyPosition("Mercury", new Date("2024-04-10Z")).retrograde).toBe(true);
    expect(bodyPosition("Mercury", new Date("2024-05-10Z")).retrograde).toBe(false);
    // Sun and Moon never retrograde.
    expect(bodyPosition("Sun", new Date("2024-04-10Z")).retrograde).toBe(false);
  });

  it("finds sign ingresses (Jupiter → Gemini 2024-05-25 23:15 UTC)", () => {
    const c = boundaryCrossingsBetween("Jupiter", new Date("2024-05-01Z"), new Date("2024-06-30Z"));
    expect(c).toHaveLength(1);
    expect(placement(c[0]!.segment * 30).sign).toBe("Gemini");
    expect(minutesBetween(c[0]!.instant, "2024-05-25T23:15Z")).toBeLessThan(30);
  });

  it("puts the Sun at 0° Aries at the March equinox", () => {
    const lon = longitudeOf("Sun", new Date("2024-03-20T03:06Z"));
    expect(Math.min(lon, 360 - lon)).toBeLessThan(0.01);
  });

  it("finds ~13 Moon ingresses a month", () => {
    const c = boundaryCrossingsBetween("Moon", new Date("2024-01-01Z"), new Date("2024-02-01Z"));
    expect(c.length).toBeGreaterThanOrEqual(13);
    expect(c.length).toBeLessThanOrEqual(15);
  });
});

describe("zodiac and charts", () => {
  it("computes a Chitrapaksha ayanamsa near the published Lahiri value", () => {
    expect(ayanamsa(new Date("2000-01-01T12:00Z"))).toBeCloseTo(23.85, 1);
    const a2026 = ayanamsa(new Date("2026-01-01Z"));
    expect(a2026).toBeGreaterThan(24.15);
    expect(a2026).toBeLessThan(24.3);
    expect(zodiacLongitude(10, "sidereal", new Date("2026-01-01Z"))).toBeCloseTo(360 + 10 - a2026, 6);
  });

  it("places the Ascendant on the eastern horizon", () => {
    const cases = [
      { t: "1990-03-15T08:30Z", lat: 52.23, lon: 21.01 },
      { t: "2001-07-04T22:10Z", lat: 40.71, lon: -74.01 },
      { t: "1975-12-01T03:00Z", lat: -33.87, lon: 151.21 },
      { t: "2020-06-21T12:00Z", lat: 0, lon: 0 },
    ];
    for (const c of cases) {
      const when = new Date(c.t);
      const { ascendant, midheaven } = chartAngles(when, c.lat, c.lon);
      const time = MakeTime(when);
      const obs = new Observer(c.lat, c.lon, 0);
      const toHor = (lon: number) => {
        const ect = VectorFromSphere(new Spherical(0, lon, 1), time);
        const eqd = RotateVector(Rotation_ECT_EQD(time), ect);
        return HorizonFromVector(RotateVector(Rotation_EQD_HOR(time, obs), eqd), "");
      };
      const asc = toHor(ascendant);
      expect(Math.abs(asc.lat)).toBeLessThan(0.01); // altitude 0
      expect(asc.lon).toBeGreaterThan(0); // azimuth east (0..180)
      expect(asc.lon).toBeLessThan(180);
      const mc = toHor(midheaven);
      expect(mc.lat).toBeGreaterThan(Math.abs(asc.lat)); // MC is above the horizon at these latitudes
    }
  });

  it("assigns houses", () => {
    expect(houseCusps(95, "wholeSign")[0]).toBe(90);
    expect(houseCusps(95, "equal")[1]).toBe(125);
    expect(houseOf(91, houseCusps(95, "wholeSign"))).toBe(1);
    expect(houseOf(89, houseCusps(95, "wholeSign"))).toBe(12);
    expect(houseOf(94, houseCusps(95, "equal"))).toBe(12);
  });

  it("only builds houses with a location, and flags uncertain signs without a time", () => {
    const noTime = natalChart({
      instant: new Date("2024-01-11T12:00Z"),
      zodiac: "tropical",
      houseSystem: "wholeSign",
      dayBounds: { start: new Date("2024-01-11T00:00Z"), end: new Date("2024-01-12T00:00Z") },
    });
    expect(noTime.angles).toBeNull();
    expect(noTime.points.every((p) => p.house === null)).toBe(true);
    expect(Array.isArray(noTime.uncertainSigns)).toBe(true);

    const full = natalChart({ instant: new Date("1990-03-15T08:30Z"), zodiac: "tropical", houseSystem: "equal", location: { latitude: 52.23, longitude: 21.01 } });
    expect(full.angles).not.toBeNull();
    expect(full.points.every((p) => p.house! >= 1 && p.house! <= 12)).toBe(true);
  });

  it("detects aspects with orbs", () => {
    const a = findAspects([
      { body: "Sun", longitude: 10, speed: 1 },
      { body: "Mars", longitude: 132, speed: 0.5 },
      { body: "Venus", longitude: 193, speed: 1.2 },
    ]);
    const sunMars = a.find((x) => x.a === "Sun" && x.b === "Mars")!;
    expect(sunMars.kind).toBe("trine");
    expect(sunMars.orb).toBeCloseTo(2);
    expect(sunMars.applying).toBe(true); // separation 122° shrinking towards 120°
    expect(a.find((x) => x.a === "Sun" && x.b === "Venus")?.kind).toBe("opposition");
  });

  it("uses the Body enum consistently", () => {
    expect(Body.Moon).toBe("Moon");
  });
});
