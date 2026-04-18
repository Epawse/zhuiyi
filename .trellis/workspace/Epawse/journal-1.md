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
- [x] Map not integrated yet (AMap) → D14: 改为Canvas自绘记忆星图
- [x] Streaming narrative not displayed incrementally → D15: typewriter逐字浮现
- [ ] No demo mode / fallback for offline
- [ ] Share page could be richer
- [ ] Custom style not implemented

---

## Session 2: 2026-04-18 Immersive UI Overhaul Planning

### User-Identified Issues (5 items)
1. 美术资产未整理 → D16: 4K高清预制背景图
2. 历史记录不稳健，无路由 → D17: Hash路由 + IndexedDB历史
3. Per-chapter场景图太慢 → D13: 统一封面图（NotebookLM式）
4. 高德底图破坏沉浸感 → D14: 星座/记忆星图（Canvas自绘）
5. 整体沉浸感不足 → D15: Liquid Glass + Storytelling-Driven UI重构

### Design System Generated (UI/UX Pro Max)
- Pattern: Immersive/Interactive Experience
- Style: Liquid Glass (morphing, translucent, fluid effects)
- Typography: Noto Serif SC (中文) + Cormorant Garamond (英文标题)
- Effects: backdrop-blur glass panels, typewriter narrative reveal, Framer Motion page transitions

### New ADR Decisions Added
- D13: Unified cover image (replaces per-chapter scene images)
- D14: Constellation/memory map (replaces AMap tiles)
- D15: Immersive UI visual overhaul (Liquid Glass + Storytelling-Driven)
- D16: 4K pre-baked backgrounds
- D17: Hash routing + IndexedDB history

### Implementation Priority
1. P0: LandingPage重设计 + Framer Motion页间过渡 + 叙事逐字浮现
2. P0: 统一封面图替代per-chapter场景图
3. P1: 4K背景资产 + 提升背景opacity
4. P1: 星座图替代高德地图
5. P2: Hash路由 + IndexedDB历史

### Implementation Completed

1. **Immersive UI Overhaul** (Task #1)
   - LandingPage: dark gradient hero (#0a0a0f→#1a1a2e), warm gold radial glow, SVG noise grain, Cormorant Garamond title, glass-morphism upload area, Framer Motion stagger entrance
   - UploadArea: glass card redesign (bg-white/3 backdrop-blur), SVG camera icon, upload SVG icon on button, dark theme text
   - ProcessingPage: dark theme, gold progress bar, stagger photo grid, green glow on completion
   - ExperiencePage: background opacity 0.25 (was 0.15), glass placeholder, photo glow shadows, typewriter narrative reveal, cover image hero
   - SharePage: dark glass card, chapter dividers, accent button glow
   - Page transitions: AnimatePresence in root page.tsx, fade+slide variants
   - Layout: Google Fonts (Cormorant Garamond, Noto Serif SC, JetBrains Mono) via next/font
   - globals.css: CSS variables, glass utilities, noise-overlay, typewriter-cursor, reduced-motion

2. **Unified Cover Image** (Task #2)
   - Removed per-chapter scene images (PhotoChapter.sceneImage, generatingScene removed)
   - Store-level coverImage + generatingCover
   - ExperiencePage: one API call after ALL narratives ready, panoramic prompt combining all locations/scenes
   - Cover displayed as full-width hero with AnimatePresence fade-in

3. **Constellation Memory Map** (Task #5)
   - New MemoryMap.tsx: Canvas-rendered dot-and-line map
   - GPS-normalized points or fallback arc layout
   - Quadratic curve connections with glow
   - Hover: enlarged dot + label + photo thumbnail
   - Style-aware: cyber=cyan glow, ancient=warm accent, proust=soft gold
   - No AMap dependency needed

4. **Hash Routing + History** (Task #3)
   - Hash routing: #landing, #processing, #experience, #share
   - Browser back/forward works via hashchange listener
   - HistoryEntry now stores coverImage + full narratives
   - HistoryCard onClick restores style + cover + chapters, navigates to #experience
   - SharePage saves narratives to history