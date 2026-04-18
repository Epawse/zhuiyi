# Cross-Layer Thinking Guide

> **Purpose**: Think through data flow across layers before implementing.

---

## The Problem

**Most bugs happen at layer boundaries**, not within layers.

In our project, the key boundaries are:
- **Client ↔ API Route** (browser ↔ Next.js server)
- **API Route ↔ Gemini API** (our server ↔ Google's server)
- **EXIF Extraction ↔ Vision Analysis** (local ↔ remote)
- **Photo Data ↔ Map Display** (data ↔ visual)

---

## Data Flow Map

### Primary Flow: Upload to Share

```
Browser
  │
  ├── exifr (EXIF extraction) ──→ PhotoMeta with GPS/time
  │                                    │
  ├── POST /api/analyze ──────────────┤
  │   (base64 image + EXIF)            │
  │                                    ▼
  │                              Gemini Vision API
  │                                    │
  │                                    ▼
  │                           PhotoAnalysis (JSON)
  │                                    │
  ├── Zustand Store ◄─────────────────┘
  │     │
  │     ├── clusterPhotos() ──→ NarrativeChapter[]
  │     │
  │     ├── POST /api/narrate (SSE stream)
  │     │     analyses[] + style ──→ Gemini Text API
  │     │                              │
  │     │                              ▼
  │     │                     Narrative text (streamed)
  │     │
  │     ├── AMap rendering
  │     │     GeoPoint[] + analysis ──→ MapView
  │     │
  │     └── html-to-image ──→ Share image
  │
  └── No persistence (refresh = data loss, acceptable for hackathon)
```

---

## Key Boundary Contracts

### Browser → /api/analyze

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| image | string (base64) | Yes | Compressed to <1MB |
| exif.latitude | number | No | WGS-84, null if missing |
| exif.longitude | number | No | WGS-84, null if missing |
| exif.datetime | string | No | ISO 8601, null if missing |

### /api/analyze → Browser

| Field | Type | Notes |
|-------|------|-------|
| scene | string | Short description |
| location_guess | string | Landmark name or "未知" |
| mood | string[] | 1-2 mood tags |
| confidence | "high"/"medium"/"low" | Certainty level |

### Browser → /api/narrate (SSE)

Request body:

| Field | Type | Notes |
|-------|------|-------|
| analyses | AnalyzeResponse[] | All photo analyses |
| style | string | "ancient" / "proust" / "cyber" or custom |
| customStylePrompt | string | Only when style is custom |

Response: SSE stream of `data: {"text": "..."}\n\n`, ending with `data: [DONE]\n\n`

---

## Coordinate System Boundary

**Critical**: EXIF stores WGS-84, AMap uses GCJ-02.

```
EXIF (WGS-84) → AMap.convertFrom(lnglat, 'gps', callback) → GCJ-02
```

This conversion MUST happen before passing coordinates to AMap. If skipped, markers will be offset by ~500m in China.

---

## Checklist for Cross-Layer Features

Before implementation:
- [ ] Mapped the complete data flow
- [ ] Identified coordinate system boundaries (WGS-84 → GCJ-02)
- [ ] Defined format at each API boundary
- [ ] Decided where validation happens (client-side for UX, server-side for security)

After implementation:
- [ ] Tested with null/missing EXIF data
- [ ] Tested with Gemini API failure
- [ ] Tested SSE stream interruption
- [ ] Verified coordinates display correctly on AMap