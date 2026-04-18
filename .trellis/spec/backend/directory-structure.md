# Backend Directory Structure

> API route organization for the Zhuīyì project.

---

## Overview

The backend consists of exactly 2 Next.js API route handlers. No separate backend server, no database, no ORM.

---

## Directory Layout

```
src/app/api/
├── analyze/
│   └── route.ts          # POST: Gemini Vision analysis proxy
└── narrate/
    └── route.ts          # POST: Gemini narrative generation proxy (SSE)

src/lib/ai/
├── client.ts             # Gemini API client initialization
├── prompts.ts            # All prompt templates (organized by style)
├── analyze.ts             # Photo analysis logic
├── narrate.ts              # Narrative generation logic
└── cache.ts               # Narrative style caching
```

---

## API Route Design

### POST /api/analyze

Receives a photo (base64) + optional EXIF data, returns structured analysis.

```typescript
// Request
interface AnalyzeRequest {
  image: string;           // base64 encoded photo
  exif?: {
    latitude?: number;
    longitude?: number;
    datetime?: string;
  };
}

// Response
interface AnalyzeResponse {
  scene: string;
  location_guess: string;
  mood: string[];
  season: string;
  time_of_day: string;
  activity: string;
  key_objects: string[];
  notable_detail: string;
  confidence: 'high' | 'medium' | 'low';
}
```

### POST /api/narrate

Receives all photo analyses + style, returns narrative text as SSE stream.

```typescript
// Request
interface NarrateRequest {
  analyses: AnalyzeResponse[];
  style: StyleType;
  customStylePrompt?: string;
}

// Response: Server-Sent Events
// data: {"text": "甲辰年春"}
// data: {"text": "，客居武汉"}
// ...
// data: [DONE]
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| API routes | kebab-case | `/api/analyze`, `/api/narrate` |
| Lib modules | camelCase | `client.ts`, `prompts.ts` |
| Prompt templates | UPPER_SNAKE_CASE | `ANCIENT_STYLE_PROMPT`, `PROUST_STYLE_PROMPT` |
| Environment variables | UPPER_SNAKE_CASE | `GEMINI_API_KEY` |