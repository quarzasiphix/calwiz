# Calwiz

A mobile-first, installable cosmic calendar. For any date it shows what is
happening in the sky (the Moon's real phase and illumination, planetary
positions, retrogrades, eclipses), the numbers of the day, and how they relate
to your own birth date. Astrology and numerology are presented as symbolic
traditions and always labelled apart from computed data.

- **Accurate:** astronomy from [astronomy-engine](https://github.com/cosinekitty/astronomy) (≈1′), tested against USNO and NASA reference values.
- **Private:** no account, no backend, no analytics. The profile stays in `localStorage`.
- **Offline:** a PWA with a precached shell. Every calculation runs on the device.

## Screens

| Route | Purpose |
|---|---|
| `/` | Today: the Moon now, Sun/Moon signs, retrogrades, numbers, reading, upcoming events |
| `/calendar/:yyyy-mm?d=` | Month grid or list with Moon, Numbers, Events and Personal layers |
| `/day/:yyyy-mm-dd` | Deep-linkable day: share, `.ics` export, optional AI |
| `/moon?d=` | Lunation explorer, milestones, rise/set, eclipses, calendar reminders |
| `/sky?d=` · `/sky/natal` | Zodiac wheel, positions, aspects, ingresses/stations · birth chart and transits |
| `/numbers?d=` | Universal and personal numbers with the working shown, nine-year cycle |
| `/me` · `/about` | Profile, location, conventions, theme, install, export/delete · methods and limits |

## Develop

```sh
npm install
npm run dev          # http://localhost:8080
npm run check        # typecheck + lint + unit tests + build
npm run test:e2e     # Playwright against the production build (mobile + desktop, offline)
npm run icons        # regenerate PWA icons from scripts/generate-icons.mjs
node scripts/screenshot.mjs http://localhost:8080/moon out.png 390 844 1 dark
```

Optional AI: copy `.env.example` to `.env.local` and set `VITE_AI_WEBHOOK_URL`. See `docs/AI.md`.

## Docs

- `AGENTS.md`: where everything lives, and the rules for changing it (start here, human or AI)
- `docs/ARCHITECTURE.md`: decisions and trade-offs
- `docs/CALCULATIONS.md`: every method, convention and precision limit
- `docs/AI.md`: the AI webhook contract
- `docs/AUDIT.md`: what was wrong with the previous version
