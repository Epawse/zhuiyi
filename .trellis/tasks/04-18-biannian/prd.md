# 追忆 (Zhuīyì) — 让记忆浮现

## Goal

打造一款将用户照片转化为个性化叙事的AI产品。灵感来自普鲁斯特的《追忆似水年华》——当触碰记忆深处的某个瞬间时，被遗忘的场景、气味、面孔全部复苏。用户上传照片，AI提取时空信息并理解画面内容，生成多风格的追忆叙事。风格不限——用户可以选择古风编年、追忆似水年华、赛博朋克、日记体等任何风格，AI全程参与叙事生成和风格适配。

目标是参加抖音AI创变者计划（AI体验赛道），核心卖点是"刷到懂你的瞬间"——让普通人的记忆被AI唤醒。

## What I already know

* 项目名：**追忆 (Zhuīyì)**
* 灵感：普鲁斯特《追忆似水年华》——非自主记忆，触碰即复苏
* 赛事：抖音AI创变者计划 - 武汉大学线下校赛，10:10-17:00，约7小时
* 评委看重：想象力 + 可运行的完整Demo
* 最佳赛道：AI体验（"刷到懂你的瞬间"）
* 核心功能：照片上传 → EXIF/Vision提取时空信息 → 地图路线 → 时间线播放 → AI多风格叙事生成
* 风格系统：AI驱动的风格引擎，用户选择风格后叙事语感和视觉氛围都跟着变，风格不局限于预设
* AI模型：Gemini 3 Flash Preview（Ollama Cloud代理），备选qwen3-vl、qwen3.5、glm-5.1
* API通道：Ollama Cloud（OpenAI兼容格式），Google AI Studio直连在中国大陆不可用（已测试确认）
* API格式：OpenAI SDK (`openai`)，baseURL=`https://ollama.com/v1`，支持streaming
* 图片风格化（扩展）：暂无可用图片生成模型，hackathon阶段不做
* 地图：高德地图 JS API 2.0（用户有GIS背景）
* 技术栈方向：Next.js + 高德地图 + Ollama Cloud (OpenAI兼容) + exifr + Tailwind CSS + Framer Motion
* 部署：Vercel（一键部署，方便评委访问）
* Demo照片：temp-pictures/目录，5张HEIC格式

## Assumptions (temporary)

* 用户照片可能有GPS缺失（需vision补全）
* 中国地图必须用GCJ-02坐标系（高德/腾讯）
* hackathon阶段以Web优先，最终需跨平台（抖音小程序 + React Native）
* Gemini Pro API可以处理vision+text请求（照片+元数据+风格指令 → 叙事文本）
* hackathon阶段无需后端数据库，客户端存储即可

## Open Questions

1. ~~项目名定什么？~~ → 已决定：追忆
2. ~~视觉风格？~~ → 已决定：AI驱动风格系统，不限定
3. ~~风格系统实现深度？~~ → 已决定：3种预设 + 自由输入
4. ~~是否做可分享卡片？~~ → 已决定：做一个可截图的精美分享页

## Requirements (evolving)

### P0 - MVP（hackathon必做）

- [ ] 照片上传（支持多张，拖拽或选择，支持HEIC格式转换）
- [ ] 照片压缩（上传前压缩到合理大小，避免API超时）
- [ ] EXIF提取（GPS坐标 + 拍摄时间）
- [ ] GPS缺失时：Vision模型推断地点信息
- [ ] 时间缺失时：使用文件修改时间或视觉推断季节
- [ ] 地图展示：高德地图，照片缩略图标记在GPS坐标处
- [ ] 路线连接：按时间顺序连接照片点，形成路线
- [ ] 时间线播放：动画展示路线行进，照片逐一浮现
- [ ] **AI叙事生成**：每张/每组照片生成追忆描述
- [ ] **AI风格系统**：用户可选择叙事风格，AI据此生成不同语感的文字
  - 预设风格至少3种（如：古风编年、追忆似水年华、赛博朋克）
  - 用户可自由输入风格描述（如"像海子的诗"、"像村上春树的小说"）
- [ ] 风格主题系统：不同风格切换完整视觉主题（配色、字体、动画、地图样式）
- [ ] AI生成风格背景：用Google AI Studio Gemini图片生成能力为每种风格生成主题背景图（需代理）
- [ ] 篇章场景图：每篇章选取代表性照片(3-5张)+风减述 → gemini-3.1-flash-image-preview多参考图模式生成场景插画

### P1 - 增强体验（hackathon尽量做）

- [ ] 照片自动归类（按时间+地点+场景聚类为"篇章"）
- [ ] "篇章"结构：时间线自动分为若干篇章，每个篇章有标题
- [ ] **篇章场景图**：每篇章用照片+风减述生成1张AI场景插画（gemini-3.1-flash-image-preview，多参考图模式）
- [ ] 情感/氛围感知（从照片推断情绪，融入叙事）
- [ ] 分享页生成（可截图的精美页面，风格与叙事一致，适合发抖音）
- [ ] 更多预设风格（日记体、科幻体、武侠体、散文诗体...）

### P2 - 未来演进

- [ ] 抖音小程序版本
- [ ] 短视频自动生成（路线+旁白+配乐，风格匹配）
- [ ] React Native App版本
- [ ] 云端存储与多设备同步
- [ ] 社交功能：查看/点赞他人的追忆
- [ ] 风格社区：用户创建风格并分享
- [ ] 配乐系统：AI根据风格和画面选配音乐氛围

## Acceptance Criteria (evolving)

- [ ] 用户可上传5-20张照片并看到地图路线
- [ ] AI生成的叙事文本随风格变化，同一组照片在不同风格下输出截然不同
- [ ] 时间线可播放，照片浮现有动画
- [ ] GPS缺失照片有合理降级处理（不报错，用视觉推断）
- [ ] Demo可在评委浏览器中直接访问
- [ ] 整体视觉有"记忆浮现"的质感，非工具感
- [ ] 至少3种预设风格可切换

## Definition of Done

- [ ] 可运行Demo部署在Vercel
- [ ] 评委可扫码/点击链接体验
- [ ] 有准备好的demo照片数据（预置或自带）
- [ ] 路演表达准备就绪：能讲清"追忆"的故事

## Out of Scope (for hackathon)

- 视频自动生成
- 抖音小程序开发
- 用户账号系统
- 后端数据库/云存储
- 人物识别
- 社交/分享功能（除截图外）
- 配乐系统

## Technical Notes

### 已确认技术选型

| 层 | 技术 | 理由 |
|---|---|---|
| 前端框架 | Next.js 14 + React | SSR便于分享，开发快 |
| 样式 | Tailwind CSS | 快速迭代 |
| 地图 | Canvas自绘记忆星图 | 沉浸感优先，抽象星座连线替代真实底图（D14） |
| EXIF | exifr | 浏览器端，成熟稳定 |
| 动画 | Framer Motion | 时间线播放、照片浮现 |
| AI | Gemini 3 Flash Preview (Ollama Cloud) | 文本+Vision理解，OpenAI兼容格式，中国大陆可达 |
| AI图片生成 | ❌ 不可用 | Ollama Cloud无图片生成端点，Gemini仅返回工具调用JSON |
| AI图片生成 | ✅ Google AI Studio (需代理) | gemini-3.1-flash-image-preview，3种风格背景已验证通过 |
| 状态管理 | Zustand | 轻量，跨平台可复用 |
| 状态管理 | Zustand | 轻量，跨平台可复用 |
| 存储 | IndexedDB | 客户端，完整历史持久化（D17） |
| AI SDK | openai (npm) | OpenAI兼容格式，Ollama Cloud适配 |
| 图片转换 | heic2any | HEIC→JPEG，iOS照片兼容 |
| 部署 | Vercel | 一键部署 |

### 风格系统架构

```
用户选择风格 → 风格Prompt模板 → Ollama Cloud (OpenAI兼容格式)
                                          ↓
照片 + 时空信息 + 风格指令 → gemini-3-flash-preview 生成对应风格的叙事文本
                                          ↓
                               前端根据风格渲染
                               （字体、配色、动画微妙变化）
```

风格是AI能力的核心展现——不是UI皮肤切换，是AI对不同文学/叙事传统的理解和再创造。

### 风格视觉主题映射

| 风格 | 主色 | 字体 | 地图样式 | 动画 | AI背景风格 |
|------|------|------|---------|------|-----------|
| 古风编年 | 宣纸色#F5F0E8 + 墨色#2C2C2C + 朱红#C41A16 | 楷体/宋体 | 极简灰/水墨风 | 水墨晕染 | 水墨山水、宣纸纹理 |
| 追忆似水年华 | 暖棕#D4A574 + 米白#FAF8F5 + 深褐#5C3D2E | 衬线体 | 暖色调 | 淡入淡出 | 复古暖调、老照片质感 |
| 赛博朋克 | 黑#0A0A0A + 霓虹青#00FFD4 + 品红#FF0066 | 等宽/无衬线 | 暗色+发光 | 闪烁/扫描线 | 霓虹城市、数据流 |

自定义风格：用户输入描述 → Gemini同时生成叙事prompt + 建议配色方案(JSON) + 风格背景图 + 篇章场景图

### 篇章场景图架构 (SUPERSEDED → 统一封面图 D13)

```
所有照片分析结果汇总
  ↓
汇总 prompt: "A panoramic illustration capturing the journey through {locations} during {timeframe}, in {style} style"
  ↓
gemini-3.1-flash-image-preview → 1张统一封面图
古风：水墨长卷   追忆：印象主义暖调   赛博：霓虹城景
```

统一封面图是"记忆复苏"体验的关键——一张图覆盖整个旅程，而非碎片化的per-chapter场景。

### 风格示例

| 风格 | 同一张照片的输出 |
|------|----------------|
| 古风编年 | 甲辰仲春，岁在三月。余访江城，登临黄鹤古楼。适逢日薄西山…水面粼粼如散碎金 |
| 追忆似水年华 | 三月武汉的江风，总是裹挟着一种半干不湿的泥土与铁锈的气息…碎金般的阳光费力地穿透云层 |
| 赛博朋克 | TIMESTAMP: 2024.03 / LOC: WH-Sector. 云层缝隙裂开，240Hz夕阳强行切入…江面光栅过载 |
| 日记体 | 3月15日 晴 今天去了黄鹤楼，比想象中高。 |
| 海子体 | 春天，十个海子全部复活 / 你站在楼上 / 江水是永不停息的诗 |

### 关键技术风险

1. 高德地图API需要key，需提前申请
2. Gemini API并发限制，批量照片需队列处理
3. EXIF GPS可能被手机APP抹除（微信等），需vision补全
4. 中国地图坐标偏移（WGS-84→GCJ-02），高德自带转换
5. 风格prompt需要调教，保证输出质量稳定
6. ~~Ollama Cloud Pro的API endpoint和鉴权方式需确认~~ ✅ 已确认（OpenAI兼容格式，已测试通过）
7. 照片压缩：上传前压缩到合理大小避免API超时
9. gemini-3-flash-preview的reasoning字段会消耗token，需考虑是否显示/隐藏
10. HEIC格式照片需浏览器端转换（demo照片为HEIC格式）
11. Google AI Studio gemini-3.1-flash-image-preview 支持图片生成（需代理，已验证），REST API参考见brainstorm/gemini-image-api-reference.md
12. 风格背景图=AI实时生成（Google AI Studio，需代理）；若代理不可用降级为CSS主题+预制背景
13. gemini-3.1-flash-image-preview 还支持文+图→图（照片风格化），作为P1功能

### API 测试验证结论（2026-04-18）

| API通道 | 状态 | 用途 |
|--------|------|------|
| Ollama Cloud gemini-3-flash-preview | ✅ 完全可用 | 文本+Vision理解（主力），不支持图片生成 |
| Ollama Cloud qwen3-vl:235b-instruct | ✅ 可用 | Vision备选 |
| Ollama Cloud qwen3.5:397b | ✅ 可用 | 纯文本备选（无vision，thinking慢）|
| Ollama Cloud glm-5.1 | ✅ 可用 | 中文备选（无vision）|
| Google AI Studio直连 | ❌ 中国大陆不可用 | 降级备选（需VPN）|

**降级策略**：
```
实时调用Ollama Cloud gemini-3-flash-preview (默认)
  ↓ API超时(>15s)
重试1次
  ↓ 仍然失败
切换到Ollama Cloud qwen3-vl
  ↓ 仍然失败
本地预生成JSON（完全离线降级）
```

**图片生成策略**：
```
Google AI Studio gemini-3.1-flash-image-preview (需要代理)
  ↓ 代理不可用或API失败
降级为CSS主题+预制背景图
```

**场景图生成流程**：
```
Phase 1: 信息提取（逐张）
Phase 2: 叙事生成（批量streaming）
Phase 2.5: 篇章聚类 → 篇章场景图生成（每篇章1张，多参考图+风减述）
  ↓ 每张图15-40s，可并行或串行展示
古风：照片+水墨山水的prompt → 水墨长卷场景
追忆：照片+印象主义prompt → 暖调印象场景
赛博：照片+霓虹城市prompt → 霓虹数据流场景
```

**关键发现**：
- Streaming两种格式都可用，推荐OpenAI兼容格式 `/v1/chat/completions`
- Vision输出JSON格式稳定，可直接用于结构化数据
- 三种风格叙事质量均优秀，核心卖点已验证
- gemini响应约2-3s，qwen3.5约5-8s（含thinking）

### 赛道匹配分析

AI体验赛道完美契合：
- "创造新的信息流内容单元" → 追忆卡片就是新内容单元
- "让用户在刷的过程中遇到刚好懂你的瞬间" → 你被遗忘的记忆被AI唤醒
- 风格系统本身就是AI能力的深度展示——不只是生成文本，是理解并重塑叙事方式
- 核心情感：普鲁斯特式非自主记忆——触碰即复苏

## Decision (ADR-lite)

### D1: 项目名

**Context**: 需要一个能承载产品内核的名字
**Decision**: 追忆 (Zhuīyì)
**Consequences**: 直接呼应普鲁斯特《追忆似水年华》，产品叙事从"编年记录"升级为"记忆唤醒"

### D2: 视觉/叙事风格

**Context**: 需要确定产品的视觉和叙事风格方向
**Decision**: AI驱动的风格系统，不限定固定风格。用户选择风格后，叙事语感和视觉氛围都跟着变。风格不局限于预设——用户可自由输入风格描述。
**Consequences**: 风格系统成为AI能力的核心展现，是产品差异化的关键。hackathon阶段至少3种预设风格 + 自由输入。

### D3: hackathon风格系统深度

**Context**: 风格系统做到什么程度
**Decision**: 3种预设风格（古风编年/追忆似水年华/赛博朋克）+ 用户自由输入框
**Consequences**: 平衡展示效果和开发时间。3种预设让评委直观感受AI的风格能力，自由输入展示AI的泛化能力。

### D4: 分享功能

**Context**: 是否需要可分享内容
**Decision**: 做一个可截图的精美分享页，风格与叙事一致，适合发抖音
**Consequences**: 增加爆火潜力。预计额外1-2小时开发。

### D5: 地图提供商

**Context**: 中国地图需要GCJ-02坐标系，用户有GIS背景
**Decision**: 高德地图 JS API 2.0
**Consequences**: 原生GCJ-02，中国数据最准确，免费额度大，WebGL渲染性能好。自定义样式需通过高德平台配置。

### D6: AI模型与API通道

**Context**: 需要vision能力理解照片+文学风格文本生成。经API测试，Google AI Studio在中国大陆无法直连。
**Decision**: 使用Ollama Cloud代理的gemini-3-flash-preview（OpenAI兼容格式），备选qwen3-vl、qwen3.5、glm-5.1
**Consequences**: 
- API稳定可用，响应快（~2-3s），streaming支持好
- 三种风格叙事质量已验证优秀
- 必须使用`openai` SDK而非`@google/genai`
- Ollama Cloud API Key需环境变量管理
- Google AI Studio直连作为VPN环境下的备选，不作为主力

### D7: AI调用策略

**Context**: 多张照片需要AI处理，如何组织调用
**Decision**: 两阶段调用——阶段1逐张提取信息，阶段2批量生成叙事
**Consequences**: 分阶段方便重试（换风格只需重跑阶段2），streaming输出体验好。10张照片≈20次API调用，在限额内。

### D8: 用户流程

**Context**: 上传后如何展示结果
**Decision**: 逐步揭示式流程——上传→地图标记逐一亮起→选风格→叙事逐字浮现→分享
**Consequences**: 每一步都有明确的用户关注点，过程感=记忆浮现的体验感。

### D9: API通道选择

**Context**: 经测试Google AI Studio直连在中国大陆不可用（连接超时），Ollama Cloud完全可用
**Decision**: 使用Ollama Cloud作为唯一API通道，OpenAI兼容格式（`https://ollama.com/v1`）
**Consequences**: 
- 使用`openai` npm包，baselineURL指向Ollama Cloud
- 模型名：`gemini-3-flash-preview`（主力），`qwen3-vl:235b-instruct`（vision备选），`qwen3.5:397b`（纯文本备选）
- 图片生成模型：gemini-3.1-flash-image-preview（唯一）
- API Key从环境变量`OLLAMA_API_KEY`读取，Google AI Studio Key从`GOOGLE_AI_API_KEY`读取
- 降级链（文本）：gemini-3-flash → qwen3-vl → 本地预生成JSON
- 图片生成模型：gemini-3.1-flash-image-preview（唯一，不使用pro版本）

### D10: Demo照片格式

**Context**: 准备了5张HEIC格式照片用于demo演示
**Decision**: 使用temp-pictures目录中的5张HEIC照片作为demo数据，前端需支持HEIC→JPEG转换
**Consequences**: 需要在上传流程中加入HEIC格式转换（使用heic2any库），确保demo流程顺畅

### D11: 风格视觉方案

**Context**: 需要确定风格系统的视觉深度——仅CSS主题切换，还是包含AI生成的图片
**Decision**: CSS主题 + AI生成风格背景图 + AI生成篇章场景插画的完整视觉方案
**Consequences**: 
- CSS主题切换（配色/字体/动画/地图样式）仍然实现
- 风格背景图通过Google AI Studio gemini-3.1-flash-image-preview实时生成（需代理）
- 篇章场景图：每篇章选3-5张代表照片+风减述→多参考图模式生成场景插画（P0）
- 若代理不可用，降级为CSS主题+预制背景图

### D12: 篇章场景图 (SUPERSEDED by D13)

**Context**: 纯文字叙事的视觉冲击力有限，需要篇章级别的场景插画让"记忆复苏"体验完整
**Decision**: ~~每个篇章生成1张AI场景插画~~ → 改为统一封面图（见D13）
**Consequences**: 原方案每篇章1张场景图，但生成时间长（15-40s/张×N篇章），且缺乏整体叙事感

### D13: 统一封面图（替代per-chapter场景图）

**Context**: 每篇章独立生成场景图太慢（3章=45-120s），且每张只反映单篇章，缺乏整体叙事感。NotebookLM的模式更优——一张封面图覆盖整个故事。
**Decision**: 所有照片分析结果汇总 → 生成一张统一封面图（"记忆长卷"）
**Consequences**: 
- 仅1次API调用（~20s），体验连贯无断裂
- Prompt: `"A panoramic artistic illustration capturing the journey through {locations} during {timeframe}, in {style} style. Elements: {key_scenes_combined}"`
- 封面图作为ExperiencePage顶部hero，类似NotebookLM杂志封面
- 章节内不再生成场景图，改用照片网格+叙事文本
- 减少API调用次数，减少用户等待

### D14: 星座/记忆星图（替代高德底图）

**Context**: 原始高德底图（即使dark样式）仍是典型地图——线条、标注、路网——完全破坏"记忆浮现"的氛围。地图是"工具感"最强的UI元素。
**Decision**: 不使用高德底图，改用Canvas自绘"记忆星图"——每张照片=发光点（缩略图+脉冲光晕），按时间顺序用曲线连接，深色背景，标注地点名但无标准地图元素
**Consequences**: 
- 地图本身成为"记忆浮现"的视觉隐喻——像星座连线
- 不加载高德JS API，减小bundle size
- 保留GCJ-02坐标（如需），但视觉上完全抽象化
- `mapStyle` 字段不再需要（不再使用AMap样式）
- `@amap/amap-jsapi-loader` 依赖可移除

### D15: 沉浸式UI视觉重构

**Context**: 当前UI"功能正确但情感缺席"——白底居中文字、零Framer Motion使用、inline style全无设计系统、Geist Sans字体不适配文学产品。产品卖点是"触碰记忆深处的瞬间"但UI感觉像表单。
**Decision**: 采用 Liquid Glass + Storytelling-Driven 混合风格，全面重构UI
**Consequences**: 
- **首页**：深色hero背景 + 磨砂玻璃面板 + "记忆之门"隐喻
- **字体**：中文 Noto Serif SC + 英文 Cormorant Garamond（替代Geist Sans）
- **动画**：Framer Motion AnimatePresence页间过渡 + 叙事逐字浮现（typewriter效果）+ 照片光晕渐现
- **主题**：CSS变量驱动（`--color-primary`等），Tailwind theme扩展
- **面板**：磨砂玻璃效果（backdrop-blur）、阴影层次
- **风格切换**：全页氛围过渡（背景+字体+色调同步）
- **Processing**：仪式感动画替代网格spinner
- `theme.animation` 字段将被实际消费

### D16: 4K高清预制背景图

**Context**: 当前3张背景图质量/尺寸不统一，首页无背景，背景opacity仅0.15几乎不可见
**Decision**: 为首页+每种风格预生成3840×2160 4K背景图，提升背景可见度
**Consequences**: 
- 首页：深墨色+微光纹理hero背景
- 古风：宣纸纹理+水墨晕染（非具象山水）
- 追忆：暖调老照片/印象派光斑（非具象风景）
- 赛博：暗色+数据流+霓虹线条（非具象城市）
- 背景opacity提升到0.25-0.4，或用CSS gradient overlay融合
- 自定义风格：提供默认中性深色背景
- 用Gemini图片生成预生成，或外部工具生成后放入/public

### D17: Hash路由 + IndexedDB历史

**Context**: 无路由（纯state驱动），历史记录只存摘要（60字预览），点击历史卡片无反应，刷新丢失进度
**Decision**: URL hash路由 + IndexedDB持久化完整历史
**Consequences**: 
- Hash路由：`#landing`, `#processing`, `#experience`, `#share`（hackathon最小改动）
- IndexedDB存储完整chapter数据（叙事文本+风格+照片URLs），替代localStorage
- 历史卡片onClick → hash跳转+从IndexedDB恢复
- 刷新不丢失进度（从hash+IndexedDB恢复状态）