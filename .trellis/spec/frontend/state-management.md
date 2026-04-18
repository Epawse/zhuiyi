# State Management

> How state is managed in the Zhuīyì project.

---

## Overview

The app uses **Zustand** as the single global state store. No React Context, no Redux, no server state library. The state machine has 4 phases and all data flows through Zustand.

---

## State Categories

### Global state (Zustand)

All app state lives in a single Zustand store (`useAppStore`). This includes:

- Current phase (`landing | processing | experience | share`)
- Photo data and analysis results
- Narrative text and streaming state
- Style/theme selection
- Map view state
- Playback state
- Error states
- Demo mode flag

### Local state (React useState)

Only use `useState` for:
- UI-only state (hover, focus, open/close toggles)
- Transient animation state
- Form inputs before submission

**Rule**: If state needs to survive component unmount, or is read by 2+ components, it goes in Zustand.

### Server state

No server state library (no React Query). Server state is fetched via route handlers and stored in Zustand:

- Photo analysis results → stored in `analyses` array
- Narrative text → stored in `narratives` array
- Streaming state → tracked with `isStreaming` flag

### URL state

No URL state. The app is a single page with no routing.

---

## Zustand Store Design

```typescript
// store/useAppStore.ts
import { create } from 'zustand';

interface AppState {
  // Phase machine
  phase: 'landing' | 'processing' | 'experience' | 'share';
  setPhase: (phase: AppState['phase']) => void;

  // Photos
  photos: PhotoMeta[];
  addPhotos: (photos: PhotoMeta[]) => void;

  // Analysis
  analyses: PhotoAnalysis[];
  setAnalysis: (index: number, analysis: PhotoAnalysis) => void;
  processingProgress: { current: number; total: number };

  // Narratives
  narratives: NarrativeEntry[];
  currentNarrativeIndex: number;
  isStreaming: boolean;
  appendStreamText: (text: string) => void;
  setNarratives: (narratives: NarrativeEntry[]) => void;

  // Style
  style: StyleType; // 'ancient' | 'proust' | 'cyber' | string
  customStylePrompt: string;
  setStyle: (style: StyleType) => void;
  setCustomStylePrompt: (prompt: string) => void;

  // Playback
  isPlaying: boolean;
  playbackSpeed: number;
  togglePlayback: () => void;
  setCurrentIndex: (index: number) => void;

  // Map
  mapCenter: [number, number];
  mapZoom: number;
  setMapView: (center: [number, number], zoom: number) => void;

  // Errors
  errors: { map: boolean; ai: boolean; upload: boolean };
  setError: (key: keyof AppState['errors'], value: boolean) => void;

  // Demo
  isDemoMode: boolean;
  startDemo: () => void;
}
```

---

## When to Use Global State

Promote to global state when:

1. **Read by 2+ components** at different hierarchy levels
2. **Needs to survive component unmount** (e.g., analysis results after navigating away from processing page)
3. **Is part of the core data flow** (photos → analysis → narratives)

Keep as local state when:

1. **Only used by one component** (e.g., a dropdown open/close state)
2. **Is UI-only** (e.g., hover state)
3. **Is destroyed when component unmounts** (e.g., a temporary form input)

---

## Server State

### No caching layer needed for hackathon

- Photo analyses are one-shot: generate once, store in Zustand
- Narratives can be regenerated (style switch): new request, replace in Zustand
- No background refresh, no polling, no optimistic updates

### Error handling in store

```typescript
errors: { map: boolean; ai: boolean; upload: boolean };
```

Each component reads its relevant error flag and renders an ErrorBoundary with an appropriate fallback.

---

## Common Mistakes

1. **Don't store base64 image data in Zustand** — causes massive re-renders. Store `PhotoMeta` with URLs from `URL.createObjectURL()`, clean up with `URL.revokeObjectURL()` in component cleanup
2. **Don't create new Zustand stores** — one store for the entire app
3. **Don't use `useEffect` to sync Zustand state to local state** — read Zustand directly where needed
4. **Don't forget to clean up `URL.createObjectURL`** — memory leak if not revoked