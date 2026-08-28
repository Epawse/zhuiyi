# Project: 追忆 (Zhuīyì)

## Quick Reference

- **Stack**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Zustand + Framer Motion
- **Package manager**: pnpm
- **Run**: `pnpm dev` (http://localhost:3000)
- **Build**: `pnpm build`

## Working Contract

- 本仓是业务实现、验证与发布事实的 owner；状态以当前代码、测试、Git、部署和运行时读回为准，不在仓外维护项目镜像。
- 首次写入前确认目标路径、`pwd`、Git root 和工作树状态，保留与本任务无关的用户改动。
- 短任务直接完成并验证；连续上下文由当前 harness 管理，不在仓内建立 queue、`WORK`/`TODO` 或 handoff tracker。
- 真正独立的交接只一次性传递 outcome、boundary、已有 evidence 与 acceptance/stop，不落盘为第二状态面。完成事实由 Git、测试、PR、部署或生产读回保存，不另建完成历史台账或会话包装层。

## API Routes

| Route | Method | Purpose | AI Service |
|-------|--------|---------|------------|
| `/api/analyze` | POST | Photo analysis (scene, location, mood) | Google AI OpenAI-compatible API; Ollama fallback |
| `/api/narrate` | POST (SSE) | Narrative generation (streaming) | Google AI OpenAI-compatible API; Ollama fallback |
| `/api/summary` | POST (SSE) | Journey summary generation | Google AI OpenAI-compatible API; Ollama fallback |
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
GOOGLE_AI_API_KEY=                # Primary AI key; required in production
OLLAMA_API_KEY=                   # Optional text/vision fallback
OLLAMA_BASE_URL=                  # Optional fallback base URL (default: https://ollama.com/v1)
NEXT_PUBLIC_SUPABASE_URL=         # Optional cloud auth/history sync
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Optional cloud auth/history sync
HTTPS_PROXY=                      # Optional local proxy for image generation
HTTP_PROXY=                       # Optional local proxy fallback
LOG_LEVEL=            # debug|info|warn|error (default: debug)
```

## Key Architecture Decisions

- **Google AI** (OpenAI-compatible) is primary for text+vision and Google AI Studio handles image generation; Ollama remains an optional fallback
- **Two-step AI flow**: analyze (structured JSON) → narrate (streaming text)
- **Three-step image flow**: style background → chapter scene images
- **HEIC conversion**: browser-side via heic2any before upload
- **Local-first persistence**: Zustand/localStorage works without cloud services; Supabase auth and history sync activate only when both public Supabase variables are configured
