# The Avenue Residence Portal — Project Summary

> A lobby TV dashboard for "The Avenue" residential building in Balaclava, Melbourne, showing live weather, next city-bound trains from Balaclava Station, and building news/announcements. Production-ready and running 24/7 on Fire TV + Philips commercial display.

---

## 🎯 Project Goal

Build a free, unattended lobby TV dashboard that:
- Shows current weather + 3-day forecast for Melbourne
- Shows the next 3 city-bound trains from Balaclava Station (live + scheduled)
- Shows building news/announcements (Lift status, hard rubbish collection, strata contact)
- Runs 24/7 on a Philips signage TV without intervention
- Auto-updates data without manual refresh
- Costs $0/month to host

---

## ✅ Current State: Production

**Live URL:** https://theavenue-sigma.vercel.app
**GitHub:** https://github.com/crisleiva-dev/theavenue (public, main branch auto-deploys)
**Figma reference:** https://www.figma.com/design/L9YUZBctrIzuemaGhsjqY7/The-Avenue-Residence-Portal (TV-1 frame, node 1:3)

---

## 🛠️ Tech Stack

| Layer | Choice |
|------|--------|
| Framework | **Next.js 16** (App Router) — *NOTE: per `AGENTS.md`, this is breaking-change Next, NOT what training data knows; read `node_modules/next/dist/docs/` before assuming APIs* |
| UI | **React 19** + **Tailwind CSS v4** (CSS-first `@theme` tokens in `globals.css`) |
| Language | **TypeScript** |
| Timezone | **Luxon** with explicit `Australia/Melbourne` zone (critical — Vercel runs UTC) |
| Train data | Transport Victoria GTFS Realtime via `gtfs-realtime-bindings` npm package |
| Weather data | Open-Meteo (client-side, no API key) |
| Cache builder | `scripts/build-gtfs-cache.ts` (Node port of original Python script) |
| Hosting | **Vercel** Hobby tier (free), auto-deploys on `git push main` |
| Source control | GitHub via `gh` CLI (sideloaded into `~/.local`) |

---

## 📁 Project Structure

```
the-avenue-dashboard/
├── app/
│   ├── layout.tsx                # Root layout (with Tailwind)
│   ├── page.tsx                  # Modern dashboard (production /)
│   ├── globals.css               # Tailwind v4 @theme tokens
│   ├── api/trains/route.ts       # GTFS-Realtime server proxy
│   └── (tv)/                     # Route group with minimal layout
│       ├── layout.tsx            # No Tailwind, no fonts (for basic WebViews)
│       └── tv/
│           ├── page.tsx          # Iframe shell (kept as fallback for old browsers)
│           └── content/page.tsx  # Lite dashboard (HTML tables, inline styles)
├── components/
│   ├── Dashboard.tsx             # Client orchestrator, polls + layout grid
│   ├── Header.tsx                # Brand + clock
│   ├── WeatherCard.tsx           # Hero, stats, forecast
│   ├── TrainsCard.tsx            # Next Trains + Balaclava
│   └── NewsCard.tsx              # 3-tile news feed
├── lib/
│   ├── trains.ts                 # GTFS-RT proxy logic (with 30s TTL cache)
│   ├── weather.ts                # WMO codes, helpers
│   ├── gtfsCache.ts              # Static schedule loader
│   └── types.ts                  # Train, WeatherVM interfaces
├── data/
│   └── gtfs_cache.json           # Static train schedule (14-day lookahead)
├── public/
│   ├── avatar.jpg                # Building avatar
│   └── tram.svg                  # (Currently unused — emoji removed)
└── scripts/
    └── build-gtfs-cache.ts       # Regenerates gtfs_cache.json from Transport Victoria
```

---

## 🚀 What's Been Built (Chronological Highlights)

### Phase 1 — Port from vanilla to Next.js
- Original: HTML/CSS/JS + Python proxy on local Mac, API key hardcoded in `server.py`
- Ported to Next.js 16 with TypeScript and Tailwind v4
- Trains proxy moved to a Route Handler (`app/api/trains/route.ts`)
- API key moved to `process.env.GTFS_API_KEY` (never in code)
- Old vanilla files deleted

### Phase 2 — Deploy to production
- Flattened project (was in `web/` subfolder) to repo root
- Pushed to GitHub public repo
- Connected GitHub → Vercel
- Added `GTFS_API_KEY` to Vercel environment variables
- Auto-deploys on `git push main`

### Phase 3 — TV browser saga
The Philips 32BDL4050D's built-in WebView is too old to run modern React/CSS. Tried (and failed) many approaches:
- Server-side data fetch with timeouts → went white
- Client-side `setInterval` polling → got stuck after 20 min
- Meta-refresh every 60s → went white after a few cycles
- Iframe shell + content split → still went white in 3 minutes

**The actual fix:** Nested `<html><body>` bug — Next.js root layout was wrapping pages that already had `<html><body>`, creating invalid HTML. The Philips WebView accumulated parse errors and crashed. Fixed by using a route group `(tv)` with its own minimal root layout.

But ultimately, the Philips browser was abandoned — see Phase 4.

### Phase 4 — Switch to Fire TV Stick
- Bought Amazon Fire TV Stick HD (2024)
- Installed **Downloader** app
- Sideloaded a browser via Downloader (TV Bro from APKMirror)
- Modern dashboard renders perfectly
- Tried **Fully Kiosk Browser** — abandoned, bundled WebView still has layout issues
- Settled on **TV Bro** as the production browser

### Phase 5 — Kiosk automation
- Installed **AutoStart - No Root** (sideloaded via Downloader from APKMirror)
- Configured to launch TV Bro at boot with 20s delay
- "Goto Homescreen after autostart" → OFF
- Disabled Fire TV screensaver (Settings → Display & Sounds → Screensaver → Never)
- Disabled HDMI CEC

### Phase 6 — ADB + sleep prevention
- Downloaded Android Platform Tools (free, Google-signed, no Gatekeeper issues)
- Enabled ADB Debugging on Fire Stick
- Connected from Mac via Wi-Fi (`adb connect 192.168.0.237:5555`)
- Applied three keep-awake settings:
  ```bash
  ./adb shell settings put global stay_on_while_plugged_in 7
  ./adb shell settings put secure sleep_timeout 0
  ./adb shell settings put system screen_off_timeout 2147460000
  ```
- Fire Stick now never sleeps

### Phase 7 — Philips TV config (overnight black screen fix)
TV was switching to "Custom Source" overnight, losing the Fire Stick signal. Confirmed via PDF manual:
- **Configuration1 → Boot on source → HDMI 1** ✅
- **Configuration1 → Switch on state → Forced on** ✅
- **Advanced option → Auto signal detection → Failover, HDMI 1 (×10)** ✅
- **Advanced option → Power Save → Mode 4** (shows "no signal" instead of shutting down) ✅
- **Advanced option → Schedule → Clear all** ← *had something programmed, likely the root cause* ✅
- **Advanced option → Off Timer → 0** ✅

### Phase 8 — Layout polish to match Figma
After production was live, iterated on visual design from Figma reference:
- Header subtitle: "Melbourne, Victoria" → "Balaclava, Melbourne, Victoria"
- Weather hero reorganized to horizontal row: `[temp] [icon] [desc] [MAX] [MIN]`
- Big temperature shrunk from `clamp(10rem, 22vw, 28rem)` to `clamp(6rem, 10vw, 12rem)`
- Removed "Updated XX:XX pm" timestamp (footer "Last refresh" is sufficient)
- "Sandringham | Towards city" → teal color (was muted)
- Removed tram emoji icon from Trains card
- All three section labels ("CURRENTLY", "NEXT TRAINS", "NEWS FEED") unified to same size/weight/color
- Train list cards: text reduced (1.6rem → 1.15rem), tighter padding
- Forecast tiles: rain % always shown (was hidden if `<= 10%`)
- **News Feed section added** (3 tiles: Lift Repair Works, Next Hard Rubbish Collection Day, Horizon Contact)
- Dashboard grid: `[auto / 1.8fr / 1fr / auto]` (header / main / news / footer)

---

## 🏗️ Final Hardware/Software Setup

```
Lobby TV setup:
┌────────────────────────────────────────────────┐
│ Philips 32BDL4050D (commercial signage)         │
│  ├ HDMI 1 (active) ←── Fire TV Stick HD (2024)  │
│  │                       └ TV Bro browser       │
│  │                          └ loads             │
│  │                            theavenue-        │
│  │                            sigma.vercel.app  │
│  ├ Boot on source: HDMI 1                       │
│  ├ Switch on state: Forced on                   │
│  ├ Auto signal detection: Failover HDMI 1       │
│  ├ Power Save: Mode 4                           │
│  ├ Schedule: Cleared                            │
│  └ HDMI CEC: Off                                │
└────────────────────────────────────────────────┘
                       ▲
                       │ HDMI
                       │
Fire Stick HD config:
  ADB enabled
  Developer Mode enabled
  stay_on_while_plugged_in = 7
  sleep_timeout = 0
  screen_off_timeout = 2147460000
  AutoStart - No Root → TV Bro at 20s after boot
  Screensaver disabled
  Apps from Unknown Sources: ON
```

---

## ✏️ News Content (Hardcoded in `components/NewsCard.tsx`)

Currently 3 static tiles, edited directly in code:
1. **Lift Repair Works** — Kone (Fuji) report awaited, use stairwell
2. **Next Hard Rubbish Collection Day** — "TBC"
3. **Horizon Contact** — Phone + email for strata management

To update: edit the `NEWS_ITEMS` array → `git push` → Vercel auto-deploys.

---

## 🐛 Active Bugs / Known Issues

| Issue | Status | Workaround |
|------|--------|------------|
| Fully Kiosk Browser layout breaks | Abandoned | Use TV Bro instead |
| Philips built-in WebView crashes | Abandoned | Use Fire TV Stick instead |
| "Remote not detected" on cold boot | Cosmetic | Self-clears in 30-60s, no intervention needed |
| Fire TV monthly system update reboot | Inherent | AutoStart relaunches TV Bro, ~5-10min gap |
| News content is hardcoded | By design | Edit code + push to update (acceptable for low-change content) |

**No blocking bugs.** System is stable in production.

---

## 🔄 Operational Notes

- **Updating content:** Edit relevant file → `git push` → Vercel auto-deploys in ~60s → TV picks up on next page revalidation
- **API key safe:** Lives only in `web/.env.local` on dev Mac (gitignored) and Vercel's encrypted env var store
- **Data refresh cadence:**
  - Clock: every 1s (client-side)
  - Trains: every 30s (proxy → GTFS Realtime)
  - Weather: every 5min (client → Open-Meteo)
- **Cache:**
  - Trains: 30s in-memory TTL in `lib/trains.ts`
  - Page (modern `/`): not ISR cached
  - Page (lite `/tv/content`): ISR `revalidate = 60`

---

## 🎨 Design Tokens (`app/globals.css`)

```css
--color-bg: #0c111d        /* page background */
--color-surface: #141927   /* card background */
--color-tile: rgba(255,255,255,0.05)  /* stat/news tiles */
--color-line: rgba(255,255,255,0.08)  /* borders */
--color-blue: #5b9cf6      /* train NOW badge */
--color-teal: #22d3ee      /* highlights, news titles, station route */
--color-ink: #eef2ff       /* main text */
--color-ice: #ecfeff       /* secondary text */
--color-muted: #64748b     /* labels, footnotes */
--color-amber: #fbbf24     /* "soon" train badge */
--color-accent: #06b6d4    /* train card left bar */
--radius-card: 20px        /* card corners */
```

---

## 🌱 Suggested Next Steps

### Easy / Quick Wins
- **Custom domain** — point e.g. `dashboard.theavenue.com.au` at Vercel (free, ~5 min)
- **README.md** at repo root explaining the project (helps future-you)
- **Update Hard Rubbish Collection Day** when council date is confirmed (replace "TBC" with actual date)
- **Rotate the GTFS API key** (used in dev/screenshots; get a fresh one from Transport Victoria portal, update in Vercel env vars)

### Medium effort
- **Dynamic news content** — instead of hardcoded `NEWS_ITEMS`, pull from:
  - A Google Sheet (use Google Sheets API)
  - A Notion database (use Notion API)
  - A simple admin page on the same Vercel app
- **Building announcements feature** — separate from news, time-bound (e.g., "Pool closed Sat 14 June")
- **Photo carousel** — building images, events, community photos rotate on screen-saver-like rotation
- **Weather alerts** — pull severe weather warnings from BOM (Bureau of Meteorology)
- **Mobile-friendly view** at a different route (e.g., `/m`) for residents on their phones

### Larger features
- **Multi-building support** — if there are sister buildings, parameterize the station/location
- **Community calendar** — events, BBQs, OC meetings
- **Maintenance dashboard** — book lift/parking spot
- **Message board** — admin posts visible to residents
- **Resident-facing companion app** (PWA) with the same data

### Operational hardening
- **Uptime monitoring** — UptimeRobot (free) pings the dashboard every 5min, alerts on downtime
- **Vercel analytics** — turn on Vercel's free analytics to see if the dashboard is being viewed
- **Error tracking** — Sentry free tier catches client/server errors
- **Schedule a weekly TV reboot** via a smart plug (~$15) — fully preventive

---

## 🔑 Critical Files for Future Context

If starting a new chat to work on this project, point the assistant at:
- `app/page.tsx` + `components/Dashboard.tsx` → main entry
- `components/WeatherCard.tsx`, `TrainsCard.tsx`, `NewsCard.tsx` → individual cards
- `app/globals.css` → design tokens
- `lib/trains.ts` → GTFS-RT logic (where timezone correctness lives)
- `AGENTS.md` → reminder that Next.js 16 has breaking changes from training data
- This summary file → full context

---

## 📞 Contacts / Resources

- **Vercel project:** Linked to GitHub `crisleiva-dev/theavenue`, auto-deploys main
- **Transport Victoria GTFS Realtime API:** https://opendata.transport.vic.gov.au/
- **Open-Meteo (weather):** https://open-meteo.com/ (no key needed)
- **Figma file:** https://www.figma.com/design/L9YUZBctrIzuemaGhsjqY7/The-Avenue-Residence-Portal
- **TV manual (Philips 32BDL4050D):** [PDF on Mac]
- **Lobby URL:** https://theavenue-sigma.vercel.app
- **Fire Stick IP (local network):** 192.168.0.237 (DHCP may change)

---

*Summary generated 2026-06-10. Project is in stable production. All major architectural decisions documented above.*
