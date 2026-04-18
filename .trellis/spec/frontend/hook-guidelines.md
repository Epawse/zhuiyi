# Hook Guidelines

> How hooks are used in the Zhuīyì project.

---

## Overview

Custom hooks encapsulate stateful logic for photo processing, AI communication, map interaction, and playback control. All hooks follow the `use*` naming convention and are co-located in `src/hooks/`.

---

## Custom Hook Patterns

### Hook file template

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
// External imports
// Internal imports

interface UseFooResult {
  data: Foo | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFoo(input: FooInput): UseFooResult {
  const [data, setData] = useState<Foo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Side effects here
    return () => {
      // Cleanup
    };
  }, [/* deps */]);

  return { data, loading, error, refetch };
}
```

### Rules

1. **One hook per file** — named `use{Feature}.ts`
2. **Return object, not tuple** — `return { data, loading, error }`, not `return [data, loading]`
3. **Always include cleanup** — AMap instances, event listeners, intervals must be cleaned up
4. **No direct Zustand reads in hooks** — hooks can call Zustand actions but should not subscribe to Zustand state inside hooks (subscribe in components instead)

---

## Data Fetching

### Pattern: Gemini API via route handlers

No client-side API calls to Gemini. All AI calls go through Next.js route handlers (`/api/analyze`, `/api/narrate`) which proxy to Gemini.

```typescript
// ✅ Correct: Call your own API route
const response = await fetch('/api/analyze', {
  method: 'POST',
  body: JSON.stringify({ image: base64 }),
});

// ❌ Forbidden: Call Gemini directly from client
const response = await fetch('https://generativelanguage.googleapis.com/...');
```

**Why**: API keys stay server-side, CORS is not an issue, and we can add rate limiting/error handling centrally.

### SSE streaming for narratives

Narrative generation uses Server-Sent Events for character-by-character streaming:

```typescript
export function useNarrative() {
  const streamNarrative = useCallback(async (analyses, style) => {
    const res = await fetch('/api/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analyses, style }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // Parse SSE chunks and update store
    }
  }, []);

  return { streamNarrative };
}
```

---

## Hook Descriptions

| Hook | Purpose | Key Dependencies |
|------|---------|-----------------|
| `usePhotoUpload` | Handle file selection, EXIF extraction, compression | exifr, browser-image-compression |
| `usePhotoAnalysis` | Call Vision API per photo, track progress | fetch /api/analyze |
| `useNarrative` | Stream narrative text from Gemini | fetch /api/narrate (SSE) |
| `useMapRoute` | Manage AMap instance, markers, polylines | @amap/amap-jsapi-loader |
| `usePlayback` | Control timeline playback (play/pause/speed/seek) | None (pure state) |
| `useStyleTheme` | Read current style theme, provide CSS variables | Zustand store |

---

## Common Mistakes

1. **Don't call Gemini API from the browser** — always go through `/api/*` route handlers
2. **Don't forget to destroy AMap instances** — AMap Map objects leak memory if not `.destroy()`ed in cleanup
3. **Don't use `useEffect` without deps array** — every effect must have explicit deps or `[]`
4. **Don't store base64 image data in Zustand** — it causes massive re-renders. Store only metadata (thumbnails as URLs via `URL.createObjectURL`)