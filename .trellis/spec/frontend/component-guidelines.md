# Component Guidelines

> How components are built in the Zhuīyì project.

---

## Overview

The app has exactly 4 page states, each rendered by a top-level component. All state transitions are managed by Zustand. Components are functional React components with TypeScript.

---

## Component Structure

### File template

```tsx
'use client'; // Required for components using hooks/browser APIs

import { useState } from 'react';
import { motion } from 'framer-motion';
// External imports first
// Internal imports second (components, hooks, lib, types)

// Types
interface ComponentNameProps {
  // Props here
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // Hooks at the top
  const style = useStyleTheme();
  const [localState, setLocalState] = useState<string>('');

  // Event handlers
  const handleClick = () => { ... };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Rules

1. **Always `'use client'`** — this is a client-heavy SPA, almost all components need it
2. **One component per file** — unless a sub-component is <20 lines and never reused
3. **Named exports** — no default exports. `export function Foo()`, not `export default Foo`
4. **Props interface above component** — not in a separate types file for component-local types

---

## Props Conventions

### Prop drilling limit

- **Max 2 levels** of prop drilling. If a prop is passed through 3+ components, promote to Zustand store.
- **Destructure props** in the function signature, not inside the body.

```tsx
// Good
export function NarrativeOverlay({ style, narrative, onPhotoClick }: NarrativeOverlayProps) {

// Bad  
export function NarrativeOverlay(props: NarrativeOverlayProps) {
  const style = props.style;
```

### Callback naming

| Type | Convention | Example |
|------|-----------|---------|
| Click handler | `on` + Verb | `onPhotoClick`, `onStyleChange` |
| Data callback | `on` + Noun + Verb | `onNarrativeGenerated` |
| Boolean toggle | `on` + Adjective + Noun | `onPlayingToggle` |

---

## Styling Patterns

### Tailwind CSS only

No CSS modules, no styled-components, no custom CSS classes (except in `globals.css` for fonts and animations).

### Style theming

Three preset styles (ancient, proust, cyber) + custom. Theme is provided via `StyleProvider` which sets CSS custom properties:

```tsx
// StyleProvider sets CSS variables based on current style
<div style={{
  '--color-primary': theme.primary,
  '--color-bg': theme.background,
  '--font-body': theme.fontBody,
}}>
  {children}
</div>
```

Components reference theme via Tailwind's arbitrary values or CSS variables:

```html
<h1 className="text-[var(--color-primary)] font-[var(--font-title)]">
```

### Animation

Use Framer Motion for all animations. Key patterns:

- Page transitions: `AnimatePresence` + `motion.div` with `initial`, `animate`, `exit`
- Text reveal: Manual interval-based character reveal (not Framer Motion)
- Map markers: `motion.div` with `whileHover`, `whileTap`
- State transitions: `layoutId` for shared element animations where appropriate
- **Respect `prefers-reduced-motion`**: Always check and disable animations for users who prefer reduced motion

---

## Accessibility

### Minimum requirements for hackathon

1. All interactive elements have `aria-label` or visible text
2. Map controls have `aria-label`
3. Color contrast meets WCAG AA (especially the 3 style themes — verify contrast ratios)
4. Playback controls are keyboard accessible (Space to play/pause, Arrow keys to navigate)
5. `prefers-reduced-motion` media query disables heavy animations

### Icon library

Use **Lucide React** (`lucide-react`) for icons. Consistent, tree-shakeable, good React support.

---

## Common Mistakes

1. **Don't use AMap methods outside `useEffect`** — AMap is imperative, always initialize in `useEffect` with cleanup
2. **Don't forget `key` prop** when rendering photo lists with `.map()`
3. **Don't put heavy computation in render** — EXIF extraction and image compression go in Web Workers or `useMemo`
4. **Don't use `index` as key** for photo lists — use photo `id` for stable keys across re-renders