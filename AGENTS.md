# Calwiz: agent & contributor guide

Read this before changing code. It tells you where the authoritative
implementation of every feature lives.

## Golden rules

1. **One source of truth per quantity.** Screens never compute astronomy or
   numerology themselves. They call `src/domain/sky/day.ts` (`daySummary`,
   `dayDetail`, `monthEvents`) or the specific domain module. If two screens
   could disagree, the code is wrong.
2. **Never fabricate data.** Don't add placeholder positions, "alignment
   scores", demo AI answers or decorative charts of made-up values. If
   something can't be computed, show that it's unavailable.
3. **Label provenance.** Use `<SourceTag kind="computed" | "tradition" | "generated">`.
   Interpretations come from `domain/*/meanings.ts` and stay framed as tradition.
4. **Civil dates and instants differ.** `CivilDate` ("YYYY-MM-DD") is a calendar
   day in a zone. `Date` is an instant. Convert only with `src/domain/time/civil.ts`.
   Never use `new Date("YYYY-MM-DD")` or local-time `Date` getters for logic.
5. **Domain code is pure TypeScript.** ESLint forbids React/UI imports in `src/domain/**`.
6. **No guessed birth data.** Houses/Ascendant require birth time *and* place.

## Map

| Concern | File |
|---|---|
| Time zones, DST, civil-date arithmetic | `src/domain/time/civil.ts` |
| Planet/Sun/Moon positions, speed, retrograde | `src/domain/astronomy/bodies.ts` |
| Moon illumination, phase, age, lunation, limb angle, rise/set | `src/domain/astronomy/moon.ts` |
| Seasons, eclipses, apsides, stations, sign crossings | `src/domain/astronomy/search.ts` |
| Zodiac (tropical/sidereal ayanamsa), sign placement | `src/domain/astrology/zodiac.ts` |
| Aspects and orbs | `src/domain/astrology/aspects.ts` |
| Ascendant, MC, houses, natal chart | `src/domain/astrology/natal.ts` |
| Astrological meanings (symbolic text) | `src/domain/astrology/meanings.ts` |
| Numerology engine (the only one) | `src/domain/numerology/engine.ts` |
| Numerology meanings | `src/domain/numerology/meanings.ts` |
| Unified event timeline | `src/domain/sky/events.ts` |
| **Day composition used by all screens** | `src/domain/sky/day.ts` |
| Memo cache | `src/domain/cache.ts` |
| Profile schema / storage / migration / export | `src/features/profile/{schema,storage}.ts` |
| Profile React context (`useProfile`) | `src/features/profile/ProfileProvider.tsx` |
| Text formatting of dates, events, units | `src/features/shared/format.ts` |
| Routes | `src/app/App.tsx` |
| Shell, navigation, safe areas | `src/app/Layout.tsx` |
| Moon renderer | `src/ui/MoonDisk.tsx` |
| Zodiac wheel | `src/ui/ZodiacWheel.tsx` |
| Design tokens (light/dark) | `src/styles/tokens.css`, `tailwind.config.ts` |
| PWA manifest + service worker | `vite.config.ts`, `src/features/pwa/*` |
| AI context, client, panel | `src/features/ai/*` |
| `.ics` export, share | `src/features/share/*` |

## Adding things

- **A new computed quantity:** add a pure function in `src/domain/...`. Add a test with an
  independently published reference value in `src/domain/__tests__/`. If it is
  per-day, expose it through `dayDetail`.
- **A new event type:** extend `SkyEvent` in `events.ts`, `describeEvent` in
  `format.ts` and `eventWeight`. TypeScript's exhaustive switch will guide you.
- **A new screen:** create `src/features/<name>/<Name>Page.tsx` (default export) and
  register it in `App.tsx`. Add it to `e2e/app.spec.ts` "no horizontal overflow".
- **Profile fields:** extend `profileSchema`. `coerceProfile` keeps old data valid.
  For a breaking change, bump `PROFILE_VERSION` and migrate in `storage.ts`.

## Verify

`npm run check` and `npm run test:e2e` must pass. Tests pin `TZ=UTC` and the
`en-GB` locale. Use `node scripts/screenshot.mjs` to look at a page.
