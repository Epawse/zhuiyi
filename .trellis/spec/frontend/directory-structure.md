# Directory Structure

> How frontend code is organized in the Zhuīyì project.

---

## Overview

The project follows a **feature-based directory structure** within Next.js App Router conventions. The app is a single-page application with state-driven views (LANDING, PROCESSING, EXPERIENCE, SHARE).

---

## Directory Layout

```
zhuiyi/
├── public/
│   └── demo/                       # Demo data (pre-loaded photos + narratives)
│       ├── photos/                  # 8-10 demo photos with GPS
│       └── narratives/              # Pre-generated narrative JSONs (3 styles)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout (fonts, globals)
│   │   ├── page.tsx                 # Main page (single-page app entry)
│   │   ├── globals.css              # Tailwind directives + custom styles
│   │   └── api/
│   │       ├── analyze/route.ts     # POST: Gemini Vision analysis proxy
│   │       └── narrate/route.ts     # POST: Gemini narrative generation proxy (SSE)
│   │
│   ├── components/
│   │   ├── landing/                 # LANDING state components
│   │   │   ├── LandingPage.tsx
│   │   │   └── UploadArea.tsx
│   │   ├── processing/              # PROCESSING state components
│   │   │   ├── ProcessingPage.tsx
│   │   │   └── PhotoGrid.tsx
│   │   ├── experience/              # EXPERIENCE state components (core)
│   │   │   ├── ExperiencePage.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── NarrativeOverlay.tsx
│   │   │   ├── StyleSelector.tsx
│   │   │   ├── PlaybackControls.tsx
│   │   │   └── MemoryFragments.tsx
│   │   ├── share/                   # SHARE state components
│   │   │   ├── SharePage.tsx
│   │   │   └── ShareActions.tsx
│   │   └── common/                  # Shared components
│   │       ├── StyleProvider.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── usePhotoUpload.ts
│   │   ├── usePhotoAnalysis.ts
│   │   ├── useNarrative.ts
│   │   ├── useMapRoute.ts
│   │   ├── usePlayback.ts
│   │   └── useStyleTheme.ts
│   │
│   ├── lib/                          # Pure logic (no React)
│   │   ├── ai/
│   │   │   ├── client.ts
│   │   │   ├── prompts.ts
│   │   │   ├── analyze.ts
│   │   │   ├── narrate.ts
│   │   │   └── cache.ts
│   │   ├── map/
│   │   │   ├── amap.ts
│   │   │   ├── markers.ts
│   │   │   ├── route.ts
│   │   │   └── style.ts
│   │   ├── photo/
│   │   │   ├── exif.ts
│   │   │   ├── compress.ts
│   │   │   ├── heic.ts
│   │   │   └── cluster.ts
│   │   ├── style/
│   │   │   ├── themes.ts
│   │   │   └── custom.ts
│   │   └── demo/
│   │       ├── photos.ts
│   │       └── narratives.ts
│   │
│   ├── store/
│   │   └── useAppStore.ts            # Zustand global state
│   │
│   └── types/
│       ├── photo.ts
│       ├── narrative.ts
│       ├── style.ts
│       └── map.ts
│
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── .env.local                        # GEMINI_API_KEY, NEXT_PUBLIC_AMAP_KEY
└── .env.example                      # Template for env vars
```

---

## Module Organization

### New feature checklist

1. Determine which app state the feature belongs to (LANDING, PROCESSING, EXPERIENCE, SHARE)
2. Create component(s) in `components/<state>/`
3. If the feature needs custom hook, add to `hooks/`
4. If the feature has pure logic, add to `lib/`
5. If the feature needs shared state, add to Zustand store
6. If the feature needs API communication, add route handler in `app/api/`

### Rule: One component per file

Each file exports one primary component. Helper sub-components go in the same file only if they're small and never reused.

### Rule: Co-locate related code

Keep components, hooks, and types close together:
- `components/experience/MapView.tsx` — the map view
- `lib/map/amap.ts` — AMap initialization (used by MapView)
- `types/map.ts` — map-related types

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `MapView.tsx`, `NarrativeOverlay.tsx` |
| Hooks | camelCase with `use` prefix | `usePhotoAnalysis.ts` |
| Lib modules | camelCase | `analyze.ts`, `prompts.ts` |
| Types | PascalCase | `PhotoAnalysis`, `NarrativeEntry` |
| Store | camelCase with `use` prefix | `useAppStore.ts` |
| CSS classes | Tailwind utility classes | No custom CSS classes |
| Env vars | `NEXT_PUBLIC_` prefix for client | `NEXT_PUBLIC_AMAP_KEY` |
| API routes | kebab-case | `/api/analyze`, `/api/narrate` |
| Demo data | kebab-case | `ancient.json`, `proust.json`, `cyber.json` |