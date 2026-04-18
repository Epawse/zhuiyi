<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

Use the `/trellis:start` command when starting a new session to:
- Initialize your developer identity
- Understand current project context
- Read relevant guidelines

Use `@/.trellis/` to learn:
- Development workflow (`workflow.md`)
- Project structure guidelines (`spec/`)
- Developer workspace (`workspace/`)

If you're using Codex, project-scoped helpers may also live in:
- `.agents/skills/` for reusable Trellis skills
- `.codex/agents/` for optional custom subagents

Keep this managed block so 'trellis update' can refresh the instructions.

<!-- TRELLIS:END -->

# Project: 追忆 (Zhuīyì)

## Quick Reference

- **Stack**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Zustand + Framer Motion
- **Package manager**: pnpm
- **Run**: `pnpm dev` (http://localhost:3000)
- **Build**: `pnpm build`

## API Routes

| Route | Method | Purpose | AI Service |
|-------|--------|---------|------------|
| `/api/analyze` | POST | Photo analysis (scene, location, mood) | Ollama Cloud gemini-3-flash-preview |
| `/api/narrate` | POST (SSE) | Narrative generation (streaming) | Ollama Cloud gemini-3-flash-preview |
| `/api/generate-image` | POST | Image generation (background/scene) | Google AI Studio gemini-3.1-flash-image-preview |

## Logging

All API routes use a structured logger (`src/lib/logger.ts`):

```
[12:34:56.789] [INFO] [analyze] Analysis complete in 6500ms {"scene":"城市街道","location":"武汉","confidence":"high"}
[12:34:56.789] [ERROR] [generate-image] Image generation failed after 18000ms No proxy configured
```

- **Tag format**: `[timestamp] [LEVEL] [route-tag] message {optional-data}`
- **Tags**: `analyze`, `narrate`, `generate-image`
- **Log levels**: debug, info, warn, error (controlled by `LOG_LEVEL` env var, default: debug)
- **Every request logs**: start, duration, key results (scene/location for analyze, char count for narrate, image size for generate-image)
- **Errors log**: error message + duration
- **When debugging**: check terminal output for `[analyze]`, `[narrate]`, `[generate-image]` tags

## Environment Variables

```
OLLAMA_API_KEY=       # Ollama Cloud API key (required)
OLLAMA_BASE_URL=      # Ollama Cloud base URL (default: https://ollama.com/v1)
GOOGLE_AI_API_KEY=    # Google AI Studio API key (required for image gen)
HTTPS_PROXY=          # Proxy for Google AI Studio (default: http://127.0.0.1:7897)
HTTP_PROXY=           # Fallback proxy
AMAP_WEB_KEY=         # 高德地图 Web端 key (client-side)
AMAP_SERVICE_KEY=     # 高德地图 Web服务 key
LOG_LEVEL=            # debug|info|warn|error (default: debug)
```

## Key Architecture Decisions

- **Ollama Cloud** (OpenAI-compatible) for text+vision, **Google AI Studio** for image generation (needs proxy)
- **Two-step AI flow**: analyze (structured JSON) → narrate (streaming text)
- **Three-step image flow**: style background → chapter scene images
- **HEIC conversion**: browser-side via heic2any before upload
- **No database**: all state client-side (Zustand)