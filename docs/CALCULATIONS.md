# Calculation methods

All computed values come from `src/domain`. Tests in `src/domain/__tests__`
compare them with independently published references.

## Time

- Calendar days are `CivilDate` in the user's chosen IANA zone (default: the
  device zone, which follows travel unless the user pins one).
- Wall-time → instant uses Intl offsets. In a spring-forward gap the time is
  shifted forward. In a fall-back overlap the earlier instant is used.
- A day's continuous values are sampled at local noon, or at "now" for today.

## Astronomy (astronomy-engine 2.x)

| Quantity | Definition | Tested against |
|---|---|---|
| Ecliptic longitude | Geocentric, apparent (light-time + aberration), true ecliptic and equinox of date | Sun at 0° at the 2024 March equinox |
| Speed / retrograde | Central difference of longitude (±12 h; Moon ±1 h); retrograde if < 0 | Mercury stations 2024-04-01 22:14 / 04-25 12:54 UTC (±60 min) |
| Illuminated fraction | `Illumination(Moon).phase_fraction` | ≈0.5 at First Quarter 2024-01-18, > 0.995 at Full 2024-04-23 |
| Elongation | Moon − Sun ecliptic longitude (`MoonPhase`) | Phase naming |
| Principal phases | `SearchMoonQuarter` | USNO Jan 2024 quarters (±2 min) |
| Lunar age / cycle progress | Elapsed time since the previous new moon / length of *this* lunation | |
| Bright limb angle | Meeus, *Astronomical Algorithms*, eq. 48.5 | Waxing limb faces west |
| Parallactic angle | Standard formula from local sidereal time | |
| Distance / diameter | Geocentric distance; 2·asin(1737.4 km / d) | Range checks |
| Eclipses | `SearchLunarEclipse`, `SearchGlobalSolarEclipse` (peak) | 2024-04-08 total solar, 2025-03-14 total lunar (±3 min) |
| Seasons | `Seasons(year)` | 2024 equinox and solstice (±3 min) |
| Rise/set | `SearchRiseSet`, upper limb, standard refraction, sea level | |
| Ingresses | 30° boundary crossings, sampled (6 h Moon, 1 d others), bisected to 30 s | Jupiter → Gemini 2024-05-25 23:15 UTC (±30 min) |

Phase names: a principal name is used within ±6° elongation of exact (≈ ±12 h).
Otherwise crescent/gibbous. In calendar cells, the principal name appears on the
local date of the exact event.

**Moon rendering:** the lit region is the bright-limb semicircle plus a
terminator half-ellipse with semi-axis r·|1 − 2k|. It is rotated by the
bright-limb angle (north up) or by bright-limb minus parallactic angle (zenith
up, when a location is set). The surface texture is illustrative.

## Astrology

- Tropical by default. Sidereal = tropical − ayanamsa, where the ayanamsa is
  Spica's (J2000 Hipparcos RA/Dec) longitude of date minus 180° (true
  Chitrapaksha). Tested: 23.85° ± 0.05 at J2000.
- Signs: 30° segments. Placements are shown truncated to arcminutes.
- Aspects: conjunction, sextile, square, trine, opposition. Default orbs are
  8/5/7/7/8°, user-adjustable. Applying = separation from exact shrinks over the next hour.
- Ascendant: λ = atan2(cos RAMC, −(sin RAMC cos ε + tan φ sin ε)). MC:
  λ = atan2(sin RAMC, cos RAMC cos ε). ε = true obliquity, taken from the
  engine's ECT→EQD rotation. Tested by converting the result back to horizon
  coordinates: altitude 0°, azimuth east.
- Houses: Whole Sign or Equal. Both require birth time and place.
- Without a birth time: positions at local noon. Bodies whose sign changes during
  the birth day are flagged.
- Traditional weekday rulers: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn (Sunday → Saturday).

## Numerology

See the header of `src/domain/numerology/engine.ts`. In short: Pythagorean,
components reduced first, masters 11/22/33 kept, master values carried at
full value into further sums, personal years from 1 January.

## Precision limits

- Displayed precision (0.1°, 1 min) is coarser than the engine's error.
- Valid roughly 1700–2200. Historical time-zone data before ~1970 depends on the browser's tzdb.
- Positions are geocentric. The Moon's topocentric position differs by up to ~1°.
