# 🌾 AgriSetu — AI-Powered Agro-Advisory Platform

An interoperable AI advisory layer for small and marginal farmers: localized
agro-advisories, AI crop disease diagnosis from a photo, and a soil/vegetation
health indicator — built as a scalable digital public good aligned with the
**BRICS AgriN** initiative.

> 🚀 **Live demo:** [agrisetu-lyart.vercel.app](https://agrisetu-lyart.vercel.app/)

*Built for: Build with AI — Code for Communities, 2nd Edition · Track 4 (AgriN & Regenerative Agricultural Intelligence)*

---

## Modules

| Module | Page | What it does |
|---|---|---|
| **A. Localized Agro-Advisory** | `/advisory` | Location + crop + season → plain-language advisory (irrigation, fertilizer, sowing/harvest windows, risks, regenerative tips) via Claude |
| **B. Crop Disease Diagnostic** | `/diagnose` | Upload a crop photo → Claude vision identifies the disease with confidence, treatment and prevention |
| **C. Soil/Vegetation Health** | `/soil-health` | Color-coded NDVI-based health indicator per region (demo layer) |
| **D. Interoperable Data Schema** | `/schema` | The standardized Agro-Advisory Record format + cross-border cooperation narrative |

## Tech Stack

- **Next.js 16 (App Router, TypeScript, Tailwind v4)** — mobile-first, single deploy
- **Anthropic Claude API** — advisory generation (`claudeText`) and photo diagnosis (`claudeVision`)
- **Static demo datasets** — `data/districts.json` (soil, weather, NDVI), `data/crops.json`, `data/diseases.json`
- **No API key?** The app falls back to deterministic demo data so the flow still demos end-to-end

## Getting Started

```bash
cp .env.example .env.local     # add your ANTHROPIC_API_KEY
npm install
npm run dev                    # http://localhost:3000
```

Production: `npm run build && npm start`, or deploy straight to Vercel (no separate backend).

## Deployment

The app is deployed to Vercel — no separate backend required.

- **Live URL:** <https://agrisetu-lyart.vercel.app/>
- Vercel auto-deploys on every push to `main` (if connected via the Vercel dashboard).
- Set `ANTHROPIC_API_KEY` as an environment variable in the Vercel project settings.

## Project Structure

```
app/
  page.tsx                 # Landing
  advisory/page.tsx        # Module A
  diagnose/page.tsx        # Module B
  soil-health/page.tsx     # Module C
  schema/page.tsx          # Module D
  api/advisory/route.ts    # POST → Agro-Advisory Record
  api/diagnose/route.ts    # POST photo → Diagnosis record
components/                # Header, Footer, AdvisoryForm, DiagnoseForm, SoilHealthView
lib/
  llm.ts                   # Claude text/vision/JSON wrapper (swappable provider)
  advisory.ts              # Module A logic + demo fallback
  diagnose.ts              # Module B logic + validation
  data.ts                  # Dataset loaders + season-aware context builder
  types.ts                 # Shared types
  i18n.ts                  # Centralized UI strings (localization-ready)
data/                      # districts.json, crops.json, diseases.json
docs/
  agro-advisory-schema.json  # Interoperable record schema (Module D)
  ARCHITECTURE.md            # Architecture + BRICS cooperation narrative
```

## Interoperability (Module D)

Every advisory the app produces maps to the **Agro-Advisory Record** schema in
`docs/agro-advisory-schema.json`. It standardizes `location`, `context` (crop,
season, soil, weather), `advisory`, and `provenance` — so any BRICS AgriN node
can emit and consume the same structure, compare advisories across borders, and
trust records via provenance. See `docs/ARCHITECTURE.md` for the full story.

## Limitations (documented for the submission)

- Weather, soil and satellite (NDVI) layers use **curated sample data** — live
  OpenWeatherMap / IMD / Sentinel Hub / Bhuvan integration is a drop-in later.
- Disease diagnosis covers whatever the LLM can identify from a photo; it is a
  first check, not a replacement for an extension officer.
- English-only UI, with strings centralized in `lib/i18n.ts` for easy localization.

## License

MIT
