# Type Safety

> Type safety patterns in the Zhuīyì project.

---

## Overview

This project uses **TypeScript strict mode**. All code is typed. The type system is the documentation.

---

## Type Organization

### Where types live

| Type category | Location | Examples |
|--------------|----------|----------|
| Photo-related | `src/types/photo.ts` | `PhotoMeta`, `EXIFData`, `PhotoAnalysis` |
| Narrative-related | `src/types/narrative.ts` | `NarrativeEntry`, `NarrativeChapter` |
| Style-related | `src/types/style.ts` | `StyleType`, `ThemeConfig` |
| Map-related | `src/types/map.ts` | `GeoPoint`, `MapMarkerData` |
| Zustand store | `src/store/useAppStore.ts` | `AppState` (inline in store definition) |
| API request/response | In route handlers | `AnalyzeRequest`, `AnalyzeResponse`, `NarrateRequest` |

### Rule: Types close to where they're used

- If a type is used by 2+ files → put in `src/types/`
- If a type is used by 1 file only → define at the top of that file
- Component prop types → define above the component in the same file

---

## Core Type Definitions

```typescript
// types/photo.ts
export interface PhotoMeta {
  id: string;
  file: File;
  thumbnailUrl: string;       // from URL.createObjectURL
  exif: EXIFData | null;
  analysis: PhotoAnalysis | null;
  narrative: string | null;
}

export interface EXIFData {
  latitude: number | null;     // WGS-84
  longitude: number | null;
  datetime: Date | null;
  make?: string;
  model?: string;
}

export interface PhotoAnalysis {
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

// types/narrative.ts
export interface NarrativeChapter {
  id: string;
  title: string;               // AI-generated chapter title
  photos: PhotoMeta[];
  text: string;                // AI-generated narrative text
  afterword: string;            // AI-generated afterword
}

export interface NarrativeEntry {
  photoId: string;
  text: string;
  afterword?: string;
}

// types/style.ts
export type StyleType = 'ancient' | 'proust' | 'cyber' | string;

export interface ThemeConfig {
  name: string;
  primaryColor: string;        // hex
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  animationSpeed: 'slow' | 'medium' | 'fast';
  routeColor: string;
  mapStyle: string;             // AMap style ID
}

// types/map.ts
export interface GeoPoint {
  lat: number;                  // GCJ-02
  lng: number;
}
```

---

## Validation

### API response validation

Use runtime type guards for Gemini API responses:

```typescript
function isPhotoAnalysis(obj: unknown): obj is PhotoAnalysis {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as PhotoAnalysis).scene === 'string' &&
    Array.isArray((obj as PhotoAnalysis).mood)
  );
}
```

No Zod or Yup — too heavy for a hackathon. Use manual type guards for critical external data.

### Form validation

No form library needed. The only "form" is the photo upload area, which validates:

```typescript
const PHOTO_CONSTRAINTS = {
  maxFiles: 30,
  minFiles: 1,
  maxFileSize: 20 * 1024 * 1024,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/heic', 'image/heif'],
} as const;
```

---

## Common Patterns

### Discriminated unions for phase

```typescript
// The phase determines which components render
type AppPhase = 'landing' | 'processing' | 'experience' | 'share';
```

### No `any` — use `unknown` with narrowing

```typescript
// Bad
function handleGeminiResponse(data: any) { ... }

// Good
function handleGeminiResponse(data: unknown) {
  if (isPhotoAnalysis(data)) {
    // data is now typed as PhotoAnalysis
  }
}
```

### Const assertions for style presets

```typescript
export const STYLE_PRESETS = {
  ancient: { ... },
  proust: { ... },
  cyber: { ... },
} as const satisfies Record<string, ThemeConfig>;
```

---

## Forbidden Patterns

1. **No `any`** — use `unknown` then narrow
2. **No type assertions (`as`)** unless absolutely necessary and documented why
3. **No `@ts-ignore`** — if you need to ignore, use `@ts-expect-error` with a comment explaining why
4. **No non-null assertions (`!`)** — handle null/undefined explicitly with optional chaining and defaults
5. **No implicit `any`** — `tsconfig.json` has `strict: true`