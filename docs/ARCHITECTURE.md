# AgriSetu — Architecture & Interoperability

## 1. What this node does

AgriSetu is one *working node* of what can become a shared digital agriculture
network. It takes three kinds of input — location, crop, and season — combines
them with weather and soil data, and produces a **localized agro-advisory
record**. It also accepts a crop photo and produces a **disease diagnostic
record** using a vision-capable LLM.

Everything the app produces is emitted as a structured **Agro-Advisory Record**
(see `docs/agro-advisory-schema.json`). That one decision is the whole point of
the build: the schema, not the UI, is what makes cross-border cooperation
possible.

## 2. Component map

```
Farmer (mobile web)
   │
   ▼
Next.js app (this repo)              ┌─────────────────────────────┐
   ├─ Module A  /api/advisory        │ Static datasets (demo):      │
   │   location + crop + season  ──► │  districts.json (soil,       │
   │   └─ builds context             │   weather, NDVI)             │
   │   └─ Claude generates           │  crops.json, diseases.json   │
   │   └─ returns Agro-Advisory Rec  │                              │
   ├─ Module B  /api/diagnose        │ Anthropic Claude API         │
   │   photo + crop hint ──────────► │  (text + vision)             │
   │   └─ returns Diagnosis record   │                              │
   ├─ Module C  /soil-health         └─────────────────────────────┘
   │   NDVI-based health indicator (sample data; Sentinel Hub / GEE /
   │   Bhuvan integration is a drop-in later)
   └─ Module D  /schema
       presents the interoperable record format + this narrative
```

- **Frontend + backend in one Next.js app** — mobile-first, low-bandwidth;
  only text and one photo upload travel the wire.
- **LLM provider is swappable.** `lib/llm.ts` wraps Claude; the same interface
  could point at any BRICS-hosted model. Everything the model returns is
  validated into the shared schema.
- **Demo-safe fallbacks.** Without an API key, Module A falls back to a
  deterministic advisory built from the same datasets, so the demo never
  breaks and the data contract is identical.

## 3. The interoperability layer (Module D)

The **Agro-Advisory Record** schema standardizes:

| Section | What it carries | Why it matters cross-border |
|---|---|---|
| `location` | Country/state/district + lat/lng | Enables geo-join of advisories across nations |
| `context` | Crop, season, soil, weather | Comparable input conditions |
| `advisory` | Summary, irrigation, fertilizer, risks, regenerative tips | The knowledge itself, language-tagged |
| `provenance` | Model, generator, data sources | Trust — anyone can verify where an advisory came from |

### How this enables BRICS cooperation

1. **Shareable by design.** Any AgriN node (e.g., EMBRAPA in Brazil, ICAR in
   India) can emit records in this format. Consumers don't need to know who
   produced a record — they just read the schema.
2. **Comparable across borders.** Two advisories for "rice, kharif" from
   Ludhiana and from a Brazilian node can be compared field-by-field because
   the structure is identical. That enables cooperative model evaluation:
   *"which node's advisory improved outcomes in similar conditions?"*
3. **Trust via provenance.** `provenance` records the model and data sources,
   so partners can decide which node's advice to trust without a central
   authority.
4. **Versioning.** `schemaVersion` is semver. Major bumps are breaking (field
   removal), minor bumps are additive. A shared registry (even a simple
   JSON file in each repo) can publish "I speak version 1.x" so old nodes keep
   working while the network evolves.

### Future evolution (not in this build)

- A central schema registry + example records from multiple member nodes
- A reference API for querying records by location/crop (federation)
- Signature/hash of records for tamper-evident sharing
- Localized output fields per node's languages (structure is already ready)

## 4. Data sources

| Layer | Today (demo) | Tomorrow (drop-in) |
|---|---|---|
| Weather | Sample per-district dataset | OpenWeatherMap / IMD open data |
| Soil | Sample Soil Health Card-style fields | data.gov.in Soil Health Card datasets |
| Satellite | Static NDVI values | Sentinel Hub / Google Earth Engine / ISRO Bhuvan |
| Diagnosis | Claude vision | Fine-tuned on PlantVillage-class datasets + edge deployment |

## 5. Running locally

```bash
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm install
npm run dev                  # http://localhost:3000
```

`npm run build && npm start` for production. Deploy the whole app to Vercel —
no separate backend needed.
