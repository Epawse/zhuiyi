import { PhotoAnalysis, PhotoExif } from '@/types'

export function buildAnalyzePrompt(exif: PhotoExif | null): string {
  const hasGps = exif?.latitude && exif?.longitude
  const locationHint = hasGps
    ? `GPS坐标: ${exif.latitude}, ${exif.longitude}
重要：GPS坐标已提供，请基于坐标确认具体地点名称（城市+地标），不要忽略GPS信息。`
    : `GPS坐标: 缺失。请仔细观察画面中的地标建筑、自然景观、文字标识、文化元素等，尽可能推断具体地点（城市+地标名称）。如果无法确定，给出最可能的地点并标注"推断"。严禁返回"未知地点"，必须给出你的最佳推断。`

  const timeHint = exif?.datetime
    ? `拍摄时间: ${exif.datetime}
重要：拍摄时间已提供，请基于此时间确认季节和时段，不要忽略时间信息。`
    : '拍摄时间: 缺失，请根据画面内容推断时间'

  return `你是一个照片分析专家。请仔细分析这张照片，提取以下信息。

${locationHint}
${timeHint}

请以JSON格式返回，不要包含任何其他文字：
{
  "scene": "场景描述（如：城市街道/山间小路/室内客厅）",
  "location_guess": "基于GPS坐标或画面推断的具体地点（如：西安大雁塔附近/上海外滩）",
  "mood": ["情绪1", "情绪2"],
  "season": "spring/summer/autumn/winter",
  "time_of_day": "dawn/morning/afternoon/dusk/night",
  "activity": "正在进行的活动",
  "key_objects": ["画面中识别到的关键物体1", "物体2"],
  "notable_detail": "一个值得记住的细节",
  "confidence": "high/medium/low"
}`
}

export function buildNarratePrompt(
  analyses: PhotoAnalysis[],
  stylePrompt: string,
  customStylePrompt?: string
): string {
  const photoInfo = analyses
    .map((a, i) => `照片${i + 1}: ${a.scene}，${a.location_guess}，${a.activity}，${a.notable_detail}`)
    .join('\n')

  if (customStylePrompt) {
    return `你是一位风格独特的叙事者。请按照以下风格描述来书写这段记忆旅程。

风格要求：${customStylePrompt}

规则：
- 严格遵循上述风格描述的语气、用词和行文方式
- 从照片信息中提取关键细节融入叙事
- 控制在200字以内

照片信息：
${photoInfo}

请为这组照片撰写一段叙事。`
  }

  return stylePrompt.replace('{photoInfo}', photoInfo)
}