# Architecture decisions

## Product shape

The original app had two equal "calendars" (Numerology, Astrology). Calwiz is now
organised around one question: *what is happening in the sky on this date, what
does the date represent, and how does it relate to me?* It has five destinations:

- **Today**: a composed daily dashboard with the Moon as its hero.
- **Calendar**: exploring dates with information layers.
- **Moon**: the lunation explorer.
- **Sky**: positions, aspects and the birth chart.
- **Numbers**: numerology with the working shown.

Mobile uses a bottom tab bar. Desktop uses a left rail. Profile/settings sit in
the header or the rail footer. Every view state that matters is in the URL
(`/calendar/2026-11?d=2026-11-14&view=list`, `/day/2026-11-14`, `/moon?d=…`).

## Layers

```
src/domain/     pure TS: time, astronomy, astrology, numerology, sky (composition)
src/features/   React screens + feature logic (profile, ai, share, pwa, …)
src/ui/         presentational components (MoonDisk, ZodiacWheel, primitives)
src/app/        routing, shell, error boundary
```

`domain` → no React (lint-enforced). `features` → may use `domain` and `ui`.
`ui` → no feature state.

## Key decisions

| Decision | Why |
|---|---|
| **astronomy-engine** for all ephemeris work | MIT, pure JS, offline, ≈1′ accuracy, ~27 kB gz in our tree-shaken build. Includes phases, eclipses, apsides, rise/set, precession–nutation. Alternatives (Swiss Ephemeris WASM) are larger and AGPL. |
| Keep Vite + React 18 + Tailwind; drop shadcn/Radix | The toolchain worked. 49 unused UI files and ~35 dependencies were removed. |
| No state library | One context (`ProfileProvider`) plus URL state covers the needs. Domain results are memoised in `domain/cache.ts`. |
| zod-validated, versioned profile in localStorage | Privacy by default. Field-level salvage keeps partially corrupt data. Legacy keys are migrated. |
| `CivilDate` string type + Intl-based zone conversion | DST-correct without a timezone library. Uses the browser's IANA database, including historical rules for birth times. |
| Day composition (`sky/day.ts`) | Guarantees the calendar, Today, Day and Moon screens agree. A test asserts it. |
| Calendar cells sample at local noon; Today uses "now" | Documented convention. Principal-phase names in cells come from the exact event falling on that local day. |
| Self-hosted variable fonts (Fraunces, Inter) | Offline typography. Only Latin subsets are precached. |
| `vite-plugin-pwa`, `generateSW`, `registerType: "prompt"` | Versioned precache. A new build never takes over a running tab silently, so chunks can't mix. Hourly and on-focus update checks. |
| Lazy routes, eager Today | Fast first paint for the morning-open use case. |
| Reminders via `.ics`, not Web Push | Push needs a server, and the Notification Triggers API never shipped. Calendar apps deliver alerts reliably everywhere. |
| AI = optional webhook, no demo mode | Core features never depend on it. Without a webhook, "Copy as prompt" gives users verified context for any assistant. |

## Not done (deliberately)

- Placidus/Koch houses: they need a careful implementation and high-latitude handling. Only Whole Sign and Equal are offered.
- Chinese zodiac: removed. The old one ignored Lunar New Year, and it is outside the product's core.
- Planetary hours, lunar nodes, asteroids: good candidates for the future. Each needs reference tests first.
- Localisation: all strings are in components. Formatting is already `Intl`-based and locale-aware. Extracting strings is the next step.
- A backend, auth or a database: no product requirement for them.

## Performance

A month view computes ~42 day summaries plus the month's event searches (stations,
ingresses, eclipses), roughly 50–150 ms on a mid-range phone, then memoised. Calendar
Moon icons skip surface detail. Nothing animates continuously.
