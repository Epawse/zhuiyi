# Error Handling

> Error types and handling strategies for the Zhuīyì backend.

---

## Overview

The hackathon project has 2 API routes. Error handling focuses on graceful degradation — the app should always show something useful, never a blank screen or unhelpful error.

---

## Error Response Format

All API errors return JSON:

```typescript
interface ApiError {
  error: string;           // Human-readable message
  code: string;            // Machine-readable code
  retryable: boolean;      // Whether client should retry
}
```

### Error codes

| Code | Meaning | Retryable | Client Action |
|------|---------|-----------|---------------|
| `ANALYSIS_FAILED` | Gemini Vision call failed | Yes | Retry once, then use fallback |
| `NARRATIVE_FAILED` | Gemini text generation failed | Yes | Retry once, then use cached |
| `IMAGE_TOO_LARGE` | Image exceeds size limit | No | Compress and retry |
| `RATE_LIMITED` | Gemini API rate limit hit | Yes | Wait and retry |
| `INVALID_REQUEST` | Bad request body | No | Fix request |

---

## Error Handling Strategy

### API Route Handlers

```typescript
// route.ts pattern
export async function POST(req: Request) {
  try {
    // Validate input
    const body = await req.json();
    if (!isValidInput(body)) {
      return Response.json({ error: 'Invalid request', code: 'INVALID_REQUEST', retryable: false }, { status: 400 });
    }

    // Call Gemini
    const result = await callGemini(body);
    return Response.json(result);

  } catch (error) {
    if (error instanceof GeminiApiError) {
      if (error.isRetryable) {
        return Response.json({ error: 'AI service temporarily unavailable', code: 'ANALYSIS_FAILED', retryable: true }, { status: 503 });
      }
    }
    return Response.json({ error: 'Internal server error', code: 'INTERNAL', retryable: false }, { status: 500 });
  }
}
```

### Client-Side Error Boundaries

Each major component section has an ErrorBoundary:

```tsx
<MapErrorBoundary fallback={<TimelineMode />}>
  <MapView />
</MapErrorBoundary>

<AIErrorBoundary fallback={<CachedNarrative />}>
  <NarrativeOverlay />
</AIErrorBoundary>
```

### Graceful Degradation Chain

```
Live Gemini API
  ↓ fails
Retried Gemini API (1x, 2s backoff)
  ↓ fails
Pre-generated JSON narratives (3 styles)
  ↓ fails
Hardcoded fallback narrative templates
```

---

## Common Mistakes

1. **Don't expose API keys in error messages** — log internally, return generic message to client
2. **Don't crash the entire app for one photo's analysis failure** — skip failed photos, continue with successful ones
3. **Don't forget to handle SSE stream termination** — if `/api/narrate` stream drops, the client must handle partial text