# Optional AI interpretation

Calwiz works fully without AI. If `VITE_AI_WEBHOOK_URL` (https) is set at
build time, the Day and Today screens show an **Ask** button. Otherwise they
offer **Copy as prompt**, which puts the same verified context on the clipboard
for any assistant the user prefers.

## Request (POST, JSON)

```jsonc
{
  "version": 2,
  "question": "Explain today's Moon",
  "system": "You are the interpretation layer of Calwiz… (see SYSTEM_GUIDANCE)",
  "context": {
    "version": 2, "app": "calwiz", "date": "2026-11-10", "timeZone": "Europe/Warsaw",
    "instant": "2026-11-10T16:02:00.000Z",
    "conventions": { "zodiac": "tropical", "positions": "geocentric apparent…", "numerology": "Pythagorean…" },
    "moon": { "phase": "Waxing Crescent", "illuminationPercent": 2.1, "waxing": true, "ageDays": 1.4, "lunationProgressPercent": 4.8, "nextFullMoon": "…", "nextNewMoon": "…", "distanceKm": 401234 },
    "positions": [{ "body": "Sun", "placement": "18°16′ Scorpio", "longitude": 228.27, "retrograde": false }],
    "aspects": [{ "between": "Venus–Mars", "aspect": "Sextile", "orbDegrees": 0.2, "applying": false }],
    "events": [{ "title": "Moon enters Sagittarius", "at": "…" }],
    "numerology": { "universalDay": 4, "universalMonth": 3, "universalYear": 1, "personal": { "lifePath": 1, "personalYear": 1, "personalMonth": 3, "personalDay": 4 } },
    "dayRuler": "Mars"
  }
}
```

`numerology.personal` is included only when the user ticks the checkbox. Birth
date, time and place are never sent. Users can preview the exact payload.

## Response

Either `text/plain`, or JSON with a string `answer` (or `output` / `text`,
which n8n often uses). Empty or non-2xx responses are shown as errors. There is
no canned fallback.

## n8n sketch

Webhook (POST) → AI Agent / Chat Model node, with `{{$json.body.system}}` as the
system message and `{{$json.body.question}}` plus `{{JSON.stringify($json.body.context)}}`
as the user message → Respond to Webhook with `{ "answer": "{{$json.output}}" }`.
Add CORS headers for your Calwiz origin and rate limiting on the n8n side. The
webhook URL is public in the bundle, so keep API keys in n8n.
