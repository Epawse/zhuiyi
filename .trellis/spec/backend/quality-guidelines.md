# Backend Quality Guidelines

> Code quality standards for the Zhuīyì backend.

---

## Overview

Minimal backend — 2 API route handlers + AI logic modules. Quality guidelines focus on API key security and graceful error handling.

---

## Forbidden Patterns

1. **No API keys in client code** — Gemini API key stays in `GEMINI_API_KEY` env var, accessed only in route handlers
2. **No database** — hackathon scope, state lives in client memory
3. **No authentication** — not in scope for hackathon
4. **No `any` types** — same as frontend rules
5. **No unvalidated request bodies** — always validate shape before processing

---

## Required Patterns

1. **Environment variables in `.env.local`** — `GEMINI_API_KEY`, `NEXT_PUBLIC_AMAP_KEY`
2. **`.env.example` in git** — template with placeholder values
3. **SSE streaming for narrative generation** — use `ReadableStream` with `TextEncoder`
4. **Retry logic for Gemini calls** — exponential backoff, max 1 retry
5. **Rate limit awareness** — if Gemini returns 429, return `retryable: true` to client

---

## Code Review Checklist

- [ ] No API keys in client code or git
- [ ] Request body validated before processing
- [ ] Error responses include `code` and `retryable` fields
- [ ] SSE streams properly terminated with `[DONE]`
- [ ] No `console.log` left in production