export type StyleType = 'ancient' | 'proust' | 'cyber' | 'custom'

export interface StyleTheme {
  id: StyleType
  name: string
  label: string
  description: string
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
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#1A1A1A',
      textMuted: '#666666',
      accent: '#6366F1',
    },
    font: {
      heading: '"Noto Sans SC", sans-serif',
      body: '"Noto Sans SC", sans-serif',
    },
    animation: { type: 'fade', duration: 800 },
    mapStyle: 'amap://styles/normal',
    backgroundImage: '',
    scenePrompt: '',
    narrativePrompt: '',
  },
}