# Code Reuse Thinking Guide

> **Purpose**: Stop and think before creating new code - does it already exist?

---

## The Problem

**Duplicated code is the #1 source of inconsistency bugs.**

In our hackathon project, the most likely duplication areas are:
- Photo processing logic (EXIF, compression, coordinate conversion)
- Style theme values (colors, fonts, animations repeated across components)
- Narrative generation prompts (similar structure across 3+ styles)
- Map interaction patterns (same marker creation code in multiple places)

---

## Before Writing New Code

### Step 1: Search First

```bash
# Search for similar function names
grep -r "functionName" src/

# Search for similar patterns
grep -r "primaryColor\|theme\|style" src/

# Check if a utility exists
ls src/lib/
```

### Step 2: Check These Locations

| What you need | Where to look first |
|---------------|-------------------|
| Photo utilities | `src/lib/photo/` (exif.ts, compress.ts, cluster.ts) |
| AI logic | `src/lib/ai/` (prompts.ts, analyze.ts, narrate.ts) |
| Map utilities | `src/lib/map/` (amap.ts, markers.ts, route.ts) |
| Style config | `src/lib/style/themes.ts` (all 3 preset themes) |
| Types | `src/types/` (photo.ts, narrative.ts, style.ts, map.ts) |
| State | `src/store/useAppStore.ts` |

---

## Project-Specific Reuse Patterns

### Style Themes

**All theme values live in `src/lib/style/themes.ts`** as a single source of truth.

```typescript
// ✅ Good: Import from themes
import { STYLE_PRESETS } from '@/lib/style/themes';
const { primaryColor } = STYLE_PRESETS[style];

// ❌ Bad: Hardcoding colors in components
<div className="text-[#C41A16]">...</div>
```

### Coordinate Conversion

**GPS to GCJ-02 conversion happens in ONE place**:

```typescript
// ✅ Good: Use the conversion function
import { wgs84ToGcj02 } from '@/lib/photo/exif';

// ❌ Bad: Doing coordinate math inline
const adjustedLat = lat + 0.0065; // WRONG - varies by location
```

### Prompt Templates

**All AI prompts live in `src/lib/ai/prompts.ts`**:

```typescript
// ✅ Good: Import and use
import { ANCIENT_STYLE_PROMPT, PROUST_STYLE_PROMPT } from '@/lib/ai/prompts';

// ❌ Bad: Inline prompt strings
const prompt = "你是一位太史公..."; // No! Use the template
```

### Error Boundaries

**Each boundary type has ONE reusable component**:

```typescript
// ✅ Good: Use the shared ErrorBoundary
import { MapErrorBoundary, AIErrorBoundary } from '@/components/common/ErrorBoundary';

// ❌ Bad: Creating new error boundary per component
class MyMapErrorBoundary extends React.Component { ... }
```

---

## When to Abstract

**Abstract when**:
- Same code appears 2+ times (2 is enough in a hackathon)
- Logic is complex (coordinate conversion, prompt templates)
- Multiple components need the same data (theme config)

**Don't abstract when**:
- Only used once
- Trivial one-liner (`className="text-white"`)
- Abstraction would be more complex than duplication

---

## Checklist Before Commit

- [ ] Searched for existing similar code
- [ ] No copy-pasted logic that should be shared
- [ ] Theme colors come from `themes.ts`, not hardcoded
- [ ] Coordinate conversion uses `wgs84ToGcj02()`
- [ ] AI prompts come from `prompts.ts`
- [ ] Error boundaries are shared components