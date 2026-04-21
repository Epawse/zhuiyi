export type StyleType = 'ancient' | 'proust' | 'cyber' | 'custom' | 'diary' | 'wuxia' | 'prose'

export interface StyleTheme {
  id: StyleType
  name: string
  label: string
  description: string
  isDark?: boolean
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textMuted: string
    accent: string
  }
  font: {
    heading: string
    body: string
  }
  animation: {
    type: 'ink' | 'fade' | 'glitch'
    duration: number
  }
  mapStyle: string
  backgroundImage: string
  scenePrompt: string
  narrativePrompt: string
}

export const STYLES: Record<StyleType, StyleTheme> = {
  ancient: {
    id: 'ancient',
    name: 'ancient',
    label: '古风编年',
    description: '以编年史笔法，将记忆写入卷轴',
    isDark: false,
    colors: {
      primary: '#C41A16',
      secondary: '#8B6914',
      background: '#F5F0E8',
      surface: '#EDE8D8',
      text: '#2C2C2C',
      textMuted: '#6B6B6B',
      accent: '#C41A16',
    },
    font: {
      heading: '"Noto Serif SC", "STSong", serif',
      body: '"Noto Serif SC", "STSong", serif',
    },
    animation: { type: 'ink', duration: 800 },
    mapStyle: 'amap://styles/whitesmoke',
    backgroundImage: '/bg-ancient.jpg',
    scenePrompt: 'Traditional Chinese ink wash painting style. Misty mountains, flowing water, rice paper texture. Create a cohesive artistic illustration that captures the mood and atmosphere.',
    narrativePrompt: `你是编年史官，以中国传统编年体书写此人的记忆旅程。

规则：
- 以干支纪年开头（如"甲辰年春"）
- 行文古雅凝练，善用四字短语
- 景物描写用古典意象（烟波、残阳、归鸿等）
- 情感克制而深沉，哀而不伤
- 末句以"……"收束，留有余味

照片信息：
{photoInfo}

请为这组照片撰写一段编年体叙事，200字以内。`,
  },
  proust: {
    id: 'proust',
    name: 'proust',
    label: '追忆似水年华',
    description: '以普鲁斯特笔触，触碰记忆深处的瞬间',
    isDark: false,
    colors: {
      primary: '#D4A574',
      secondary: '#8B6914',
      background: '#FAF8F5',
      surface: '#F0EBE3',
      text: '#5C3D2E',
      textMuted: '#8B7355',
      accent: '#D4A574',
    },
    font: {
      heading: '"Noto Serif SC", "Georgia", serif',
      body: '"Noto Serif SC", "Georgia", serif',
    },
    animation: { type: 'fade', duration: 1200 },
    mapStyle: 'amap://styles/light',
    backgroundImage: '/bg-proust.jpg',
    scenePrompt: 'Warm vintage impressionist style. Aged paper texture, soft sepia and brown tones, gentle light leaks and faded floral patterns. Create a cohesive artistic illustration that captures the mood and atmosphere.',
    narrativePrompt: `你是记忆的拾荒者，以普鲁斯特《追忆似水年华》的笔触书写。

规则：
- 从感官细节开始（气味、触感、光线）
- 长句蜿蜒，用逗号串联意象
- 时间是流动的，记忆是叠加的
- 情感温柔而执着，像在寻找某个失落的下午
- 末尾把现在与过去轻轻连结

照片信息：
{photoInfo}

请为这组照片撰写一段普鲁斯特式叙事，250字以内。`,
  },
  cyber: {
    id: 'cyber',
    name: 'cyber',
    label: '赛博朋克',
    description: '以数据流的方式，解构记忆的碎片',
    isDark: true,
    colors: {
      primary: '#00FFD4',
      secondary: '#FF0066',
      background: '#0A0A0A',
      surface: '#1A1A2E',
      text: '#E0E0E0',
      textMuted: '#888888',
      accent: '#00FFD4',
    },
    font: {
      heading: '"JetBrains Mono", "Fira Code", monospace',
      body: '"JetBrains Mono", "Fira Code", monospace',
    },
    animation: { type: 'glitch', duration: 400 },
    mapStyle: 'amap://styles/dark',
    backgroundImage: '/bg-cyber.jpg',
    scenePrompt: 'Dark cyberpunk cityscape style. Neon lights, data streams, holographic overlays. Dominant colors: black, neon cyan (#00FFD4), and hot pink (#FF0066). Digital glitch effects, scan lines. Create a cohesive artistic illustration that captures the mood and atmosphere.',
    narrativePrompt: `你是数据考古员，在2084年的废墟中解读这段旧记忆。

规则：
- 用时间戳、坐标、数据标记开头（如"2084.NE4 · LOC: WH-Sector"）
- 混合技术术语与诗意描写（"240Hz夕阳强行切入"）
- 句子碎片化，像损坏的数据流
- 情感被编码在数据的裂缝中
- 末尾给出一串"系统备注"，像是未来的注释

照片信息：
{photoInfo}

请为这组照片撰写一段赛博朋克风叙事，200字以内。`,
  },
  custom: {
    id: 'custom',
    name: 'custom',
    label: '自定义风格',
    description: '由AI为你创造独特的叙事风格',
    isDark: true,
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      background: '#0f0f1a',
      surface: '#1a1a2e',
      text: '#E0E0E0',
      textMuted: '#888888',
      accent: '#6366F1',
    },
    font: {
      heading: '"Noto Sans SC", sans-serif',
      body: '"Noto Sans SC", sans-serif',
    },
    animation: { type: 'fade', duration: 800 },
    mapStyle: '',
    backgroundImage: '/bg-custom.jpg',
    scenePrompt: 'Elegant cosmic abstract style. Deep indigo and violet gradients, subtle star-like points, aurora-like flowing light. Create a cohesive artistic illustration that captures the mood and atmosphere.',
    narrativePrompt: '',
  },
  diary: {
    id: 'diary',
    name: 'diary',
    label: '私密日记',
    description: '以私密日记的口吻，记录每一刻的真实温度',
    isDark: false,
    colors: {
      primary: '#B87333',
      secondary: '#8B6914',
      background: '#F5F0E8',
      surface: '#EDE8D8',
      text: '#3D2B1F',
      textMuted: '#6B5B4F',
      accent: '#B87333',
    },
    font: {
      heading: '"Noto Serif SC", "STSong", serif',
      body: '"Noto Serif SC", "STSong", serif',
    },
    animation: { type: 'fade', duration: 800 },
    mapStyle: 'amap://styles/light',
    backgroundImage: '/bg-proust.jpg',
    scenePrompt: 'Warm vintage journal style. Aged paper texture, handwritten ink traces, soft sepia and warm amber tones. Quiet afternoon light filtering through a window. Create a cohesive artistic illustration that captures the mood and atmosphere.',
    narrativePrompt: `你是一本私密日记的书写者，以第一人称记录这段记忆旅程。

规则：
- 以日期和天气开头（如"10月15日，晴"）
- 语气真诚、私密，像只给自己看的文字
- 记录细节：光线、气味、心情的微妙变化
- 偶尔出现自我对话和内心独白
- 结尾以一句轻声的总结收束

照片信息：
{photoInfo}

请为这组照片撰写一段日记体叙事，250字以内。`,
  },
  wuxia: {
    id: 'wuxia',
    name: 'wuxia',
    label: '江湖行记',
    description: '以武侠笔法，书写一段仗剑天涯的记忆',
    isDark: false,
    colors: {
      primary: '#8B0000',
      secondary: '#2F4F4F',
      background: '#F5F0E8',
      surface: '#EDE8D8',
      text: '#1C1C1C',
      textMuted: '#5C5C5C',
      accent: '#8B0000',
    },
    font: {
      heading: '"Noto Serif SC", "STSong", serif',
      body: '"Noto Serif SC", "STSong", serif',
    },
    animation: { type: 'ink', duration: 800 },
    mapStyle: 'amap://styles/whitesmoke',
    backgroundImage: '/bg-ancient.jpg',
    scenePrompt: 'Traditional Chinese ink wash painting with martial arts atmosphere. Misty mountains, bamboo groves, a solitary figure with a sword. Bold brush strokes, rice paper texture, red seal stamps. Create a cohesive artistic illustration that captures the mood and atmosphere.',
    narrativePrompt: `你是江湖说书人，以武侠小说的笔法书写这段旅程。

规则：
- 以地名+时辰开头（如"长安·寅时三刻"）
- 用武侠术语描述场景（"踏过青石""掠过山岚"）
- 动作描写利落，意境描写悠远
- 情感藏在对景物的描写中，不轻易直抒胸臆
- 结尾留一个悬念或余韵

照片信息：
{photoInfo}

请为这组照片撰写一段武侠风叙事，250字以内。`,
  },
  prose: {
    id: 'prose',
    name: 'prose',
    label: '散文诗',
    description: '以散文诗的笔触，将记忆写成流动的意象',
    isDark: true,
    colors: {
      primary: '#A78BFA',
      secondary: '#818CF8',
      background: '#0f0f1a',
      surface: '#1a1a2e',
      text: '#E0E0E0',
      textMuted: '#888888',
      accent: '#A78BFA',
    },
    font: {
      heading: '"Cormorant Garamond", "Noto Serif SC", serif',
      body: '"Noto Serif SC", Georgia, serif',
    },
    animation: { type: 'fade', duration: 1200 },
    mapStyle: 'amap://styles/dark',
    backgroundImage: '/bg-custom.jpg',
    scenePrompt: 'Dreamy nocturnal prose style. Deep indigo and violet gradients, moonlit clouds, drifting fog over a silent lake. Ethereal and contemplative atmosphere. Create a cohesive artistic illustration that captures the mood and atmosphere.',
    narrativePrompt: `你是一位散文诗作者，以意象叠加的方式书写这段记忆。

规则：
- 不追求情节，追求意象的流动和情绪的层次
- 大量使用比喻和通感（如"时间是蓝色的"）
- 句子可长可短，节奏像呼吸一样自然
- 段落之间留有空白，像诗的分行
- 结尾让意象自然消散，不强行总结

照片信息：
{photoInfo}

请为这组照片撰写一段散文诗叙事，250字以内。`,
  },
}