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
- [ ] 风格适配视觉：不同风格至少影响字体、配色、动画过渡的细微差别

### P1 - 增强体验（hackathon尽量做）

- [ ] 照片自动归类（按时间+地点+场景聚类为"篇章"）
- [ ] "篇章"结构：时间线自动分为若干篇章，每个篇章有标题
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
| 地图 | 高德地图 JS API 2.0 | 中国GCJ-02坐标，免费额度 |
| EXIF | exifr | 浏览器端，成熟稳定 |
| 动画 | Framer Motion | 时间线播放、照片浮现 |
| AI | Gemini 3 Flash Preview (Ollama Cloud) | 图片理解+文本生成+风格适配，OpenAI兼容格式，中国大陆可达 |
| 状态管理 | Zustand | 轻量，跨平台可复用 |
| 存储 | IndexedDB | 客户端，hackathon足够 |
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
8. Ollama Cloud API Key需保存在环境变量，不能提交到Git
9. gemini-3-flash-preview的reasoning字段会消耗token，需考虑是否显示/隐藏
10. HEIC格式照片需浏览器端转换（demo照片为HEIC格式）

### API 测试验证结论（2026-04-18）

| API通道 | 状态 | 用途 |
|--------|------|------|
| Ollama Cloud gemini-3-flash-preview | ✅ 完全可用 | Vision+叙事（主力）|
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
- API Key从环境变量`OLLAMA_API_KEY`读取
- 降级链：gemini-3-flash → qwen3-vl → 本地预生成JSON

### D10: Demo照片格式

**Context**: 准备了5张HEIC格式照片用于demo演示
**Decision**: 使用temp-pictures目录中的5张HEIC照片作为demo数据，前端需支持HEIC→JPEG转换
**Consequences**: 需要在上传流程中加入HEIC格式转换（使用heic2any库），确保demo流程顺畅