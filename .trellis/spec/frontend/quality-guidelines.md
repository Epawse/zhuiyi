# Quality Guidelines

> Code quality standards for frontend development in the Zhuīyì project.

---

## Overview

This is a 7-hour hackathon project. Quality guidelines are pragmatic — emphasize working code over perfect code, but maintain enough structure that the codebase doesn't collapse.

---

## Forbidden Patterns

### Never do this

1. **No `any` type** — use `unknown` if you truly don't know the type, then narrow with type guards
2. **No direct Gemini API calls from client** — always go through `/api/*` route handlers
3. **No `useEffect` without dependency array** — always specify deps or use `[]`
4. **No `localStorage` for photo data** — photos can be 100MB+, use IndexedDB if needed
5. **No `console.log` in production** — use a debug flag or remove before demo
6. **No default exports** — use named exports only
7. **No inline styles for theme values** — use CSS variables from StyleProvider
8. **No AMap DOM manipulation outside `useEffect`** — AMap is imperative, always init in `useEffect` with cleanup

---

## Required Patterns

### Always do this

1. **`'use client'` at top** — almost all components need it (hooks, browser APIs)
2. **Error boundaries** — wrap MapView, AI generation, and UploadArea in ErrorBoundary with fallbacks
3. **Responsive design** — test at 375px (mobile), 768px (tablet), 1024px+ (desktop)
4. **Loading states** — every async operation must show a loading indicator
5. **Graceful degradation** — if Gemini API fails, show pre-generated narratives. If AMap fails, show timeline-only mode.
6. **Zustand for shared state** — no prop drilling beyond 2 levels

---

## Testing Requirements

### Hackathon minimum

- **Manual test checklist** (see `brainstorm/implementation-supplement.md`)
- No automated tests required for hackathon
- Verify: upload, processing, experience, share, style switch, error states

### Post-hackathon

- Vitest for unit tests (hooks, lib functions)
- React Testing Library for component tests
- Playwright for E2E flow tests

---

## Code Review Checklist

Before committing:

- [ ] No `any` types
- [ ] No `console.log` left in code
- [ ] Error boundaries wrapping risky components
- [ ] Loading states for all async operations
- [ ] Cleanup in `useEffect` returns (AMap destroy, event listeners, intervals)
- [ ] `URL.createObjectURL` cleaned up in component unmount
- [ ] Tailwind classes used (no custom CSS classes except in globals.css)
- [ ] Named exports only (no default exports)
- [ ] Responsive: tested at 375px and 1024px
- [ ] `prefers-reduced-motion` respected