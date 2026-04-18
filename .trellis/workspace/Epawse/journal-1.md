# Journal - Epawse (Part 1)

> AI development session journal
> Started: 2026-04-18

---

## Session 1: 2026-04-18 MVP Implementation

### Summary
- Completed full MVP: photo upload → AI analysis → narrative generation → style themes → scene images → share → history
- API routes tested and verified with real HEIC photos (scene-1, Xi'an)
- All 3 AI services working: Ollama Cloud (analyze/narrate) + Google AI Studio (generate-image)

### Test Results (scene-1, 5 HEIC photos from Xi'an)

| Photo | Location | Time |
|-------|----------|------|
| IMG_0065 | 西安城墙护城河（永宁门附近） | summer/afternoon |
| IMG_0170 | 西安博物院 | summer/night |
| IMG_0322 | 西安美术馆（大唐不夜城） | summer/dusk |
| IMG_0434 | 西安陕西历史博物馆 | summer/afternoon |
| IMG_0515 | 西安秦始皇兵马俑博物馆 | summer/afternoon |

| API | Status | Avg Time |
|-----|--------|----------|
| /api/analyze | ✅ 5/5 | 12s |
| /api/narrate (ancient) | ✅ | 9.5s |
| /api/narrate (proust) | ✅ | 8s |
| /api/narrate (cyber) | ✅ | 8.6s |
| /api/generate-image | ✅ | 19s |

### Key Bugs Fixed
1. EXIF extracted before HEIC conversion (GPS was lost)
2. JSON parse: strip `\`\`\`json` wrappers from model output
3. ProcessingPage closure bug: use getState() instead of stale photos
4. Analyze prompt: GPS/time prioritized over vision guessing
5. History button always visible, hydrate on mount + requestAnimationFrame
6. Store reset function was missing

### Architecture Decisions
- D6/D9: Ollama Cloud for text+vision, Google AI Studio for image gen (needs proxy)
- D11: CSS themes + pre-baked background images (not AI-generated per request)
- D12: Chapter scene images via gemini-3.1-flash-image-preview (multi-ref mode)
- D10: HEIC→JPEG via heic2any, EXIF from original file

### Commits
- `8f22782` feat: implement core MVP
- `6d8679d` fix: ProcessingPage analysis results
- `996184c` feat: structured logging + AGENTS.md
- `e2325d2` refactor: pre-baked style backgrounds
- `4546695` feat: history records with localStorage
- `1d3ac94` fix: history entry to top-right corner
- `ddb1067` fix: analyze API failure handling
- `4014714` fix: EXIF before HEIC, GPS priority, history hydrate
- `7503d15` fix: history button always visible

### Remaining Issues
- [ ] Map not integrated yet (AMap)
- [ ] Streaming narrative not displayed incrementally (shows all at once)
- [ ] No demo mode / fallback for offline
- [ ] Share page could be richer
- [ ] Custom style not implemented