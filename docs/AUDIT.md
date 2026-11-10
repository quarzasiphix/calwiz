# Calwiz — Audit of the pre-redesign codebase

Audit date: 2026-11-10. Baseline commit: `5f3c6b7 fixed index`.

The original app was a Lovable-generated Vite/React/shadcn project: one route (`/`),
a month grid that toggled between a "Numerology" and an "Astrology" mode, a Today
card, a day-detail dialog with an "Ask AI" button, and a birthdate form.

## Verdict

The UI shell was salvageable as a toolchain (Vite + React + Tailwind + TypeScript),
but **nearly every astronomical or astrological value shown was fabricated**, the
numerology engine was duplicated in three places with real reduction bugs, and the
AI feature returned canned text while labelling it "AI Insights". The domain layer
was rewritten from scratch; the UI was redesigned.

## 1. Calculation bugs and fabricated data

| # | Where (old) | Problem | Severity |
|---|---|---|---|
| A1 | `AstrologyTimeline.tsx` `calculatePlanetaryPositions` | Planet longitude = `dayOfYear * (index+1) * 0.986 + minute*0.25`. Pure invention: Mercury moves 2× the Sun, Saturn 7×, every planet moves 0.25°/min (≈ the Moon's rate × 30). | Critical |
| A2 | same | Retrograde = `dayOfYear % (60 + i*20) < 20`. Unrelated to apparent motion. | Critical |
| A3 | same | "House" derived from longitude + 180°, no time/location. Houses require birth time + place. | Critical |
| A4 | same, `calculateAlignment` | 0–100 "alignment score" with Excellent/Challenging labels, charted every 15 min. No tradition defines this; it was a decorative chart over fabricated data. | Critical |
| A5 | `PlanetaryAlignment.tsx` | Separate, *different* fake ephemeris (Moon `13.176°/day` from 1 Jan, Mercury `4.092°/day` = its heliocentric rate shown as geocentric). Aspects computed from these. Spinning animation every 50 ms. | Critical |
| A6 | `TodayHighlight.tsx`, `AstrologyTimeline.tsx` | Moon phase = `(unixDays % 29.53)/29.53`. The Unix epoch is not a new moon (new moon was 1970-01-07 20:35 UTC), so the phase was ~6.8 days wrong, and the mean synodic month ignores the ±14 h true-phase variation. The value was then shown as "Moon Phase %" — conflating cycle fraction with illumination. | Critical |
| A7 | `Calendar.tsx` | Sun sign = `floor((dayOfYear-80)/30)`. Ignores leap years and real ingress times; wrong near every cusp (e.g. 20 Apr, 21 Jun, 22 Dec land in the wrong sign some years). `CalendarHeader` labelled "Season" as `zodiacSigns[month % 12]` → November showed "Capricorn Season". | High |
| A8 | `Calendar.tsx` | Chinese sign from Gregorian year, ignoring Lunar New Year (Jan–Feb dates wrong). | Medium |
| A9 | `Calendar.tsx` | "Planetary influence" = `planets[(dayOfYear + date) % 10]`. Arbitrary. (Traditional day rulers exist — Sunday/Sun … Saturday/Saturn — but this wasn't that.) | High |
| A10 | `AstrologyTimeline.tsx` | "Planetary hour" = `planets[hour % 7]`. Real planetary hours divide daylight/night into 12 unequal parts from sunrise in Chaldean order. | Medium |
| N1 | `Calendar.tsx`, `TodayHighlight.tsx` | Universal day reduced by **one** pass of `sumDigits`. 1999-09-29 → 11+9+28 = 48 → **12** shown as the day number. | High |
| N2 | same | `secondaryNumber` is the *unreduced* total but the UI labelled it "Reduced". | Medium |
| N3 | same | Personal day = universal day + life path. The common (Pythagorean/Decoz) convention is personal year (birth month + birth day + current year) → personal month → personal day. Different, unstated algorithm. | High |
| N4 | `Calendar.tsx` | "Month" number ignores the year; personal month = month + life path. | Medium |
| N5 | `NumerologyCalculator.tsx` | Life-path parser accepted 31/02/1990; master-number check only after the component sum. Three separate implementations of digit reduction. | Medium |

## 2. Functional bugs

- **Wrong date in day detail.** `DayDetail` built the date from `new Date()`'s month and
  year, so after navigating to another month every opened day showed (and computed for)
  the *current* month.
- Three `NumerologyCalculator` instances (mobile sheet, mobile body, desktop body)
  with independent state. Desktop and mobile copies were both mounted at once.
- Dialog "Close" buttons clicked `document.querySelector('[data-radix-collection-item]')`
  — a random element, not the close button.
- Day cells were `div`s triggering dialogs: no keyboard focus, no accessible name.
- `PlanetaryAlignment` re-rendered 20×/s forever while mounted (`setInterval(…, 50)`).
- No URL state: dates and views could not be linked, bookmarked or restored.

## 3. AI integration

- `demoMode: true` hard-coded. Responses were template strings, rendered under the
  heading "AI Insights". On webhook failure the UI also fell back to the template.
  **Users were shown canned text as AI output.**
- The payload sent placeholders (`moonPhase: 0`, `planetaryPositions: []`,
  `lifePathNumber: null`) — the model would have been asked to interpret nothing.
- The webhook URL is a `VITE_` variable, i.e. public in the bundle. Not a secret leak
  per se, but anyone can call it; no rate limiting is possible client-side.

## 4. Architecture / DX / AX

- No domain layer; calculations lived inside components and were copy-pasted.
- `tsconfig` had `strict: false`, `noImplicitAny: false`; `any` state in Today card.
- 49 shadcn `ui/*` files, ~30 Radix packages, recharts, embla, cmdk, react-hook-form,
  react-query installed; only a handful used.
- No tests, no test runner.
- Lovable scaffolding: `lovable-tagger`, `cdn.gpteng.co` script in `index.html`,
  README pointing to Lovable, title `daily-number-insights-calendar`.
- Google Fonts loaded from CDN → no offline typography.
- Previous docs (`IMPROVEMENTS.md`, `LATEST_UPDATES.md`) described fabricated features
  as working ("Known issues: none").

## 5. UX / visual

- Two equal-weight "calendars" instead of one coherent product.
- Light lavender theme with rainbow badges per number and per sign; gradient bars.
- Desktop grid squeezed onto mobile; mobile cells show one badge with no context.
- Data cards of identical priority; no hierarchy; emoji moons.
- No PWA, no manifest, no icons, no offline support, no safe-area handling.

## 6. What was kept

- Toolchain: Vite, React 18, TypeScript, Tailwind, react-router.
- localStorage keys `calwiz_birthdate` (DD/MM/YYYY) / `calwiz_life_path_number` are
  read once and migrated into the new profile (`src/features/profile/migrate.ts`).
- The webhook concept (an n8n endpoint the owner controls), now opt-in and honest.
- Numerology interpretation themes (1–9, 11, 22, 33), rewritten more concisely.

See `ARCHITECTURE.md` for the decisions taken and `CALCULATIONS.md` for methods.
