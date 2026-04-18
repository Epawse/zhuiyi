import { PhotoAnalysis, PhotoExif } from '@/types'

export function buildAnalyzePrompt(exif: PhotoExif | null): string {
  const locationHint = exif?.latitude && exif?.longitude
    ? `GPS坐标: ${exif.latitude}, ${exif.longitude}`
    : 'GPS坐标: 缺失，请根据画面内容推断地点'

  const timeHint = exif?.datetime
    ? `拍摄时间: ${exif.datetime}`
    : '拍摄时间: 缺失，请根据画面内容推断时间'

  return `你是一个照片分析专家。请仔细分析这张照片，提取以下信息。

${locationHint}
${timeHint}

请以JSON格式返回，不要包含任何其他文字：
{
  "scene": "场景描述（如：城市街道/山间小路/室内客厅）",
  "location_guess": "推断的具体地点（如：武汉黄鹤楼附近/上海外滩/某个咖啡厅）",
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

  const prompt = customStylePrompt || stylePrompt
  return prompt.replace('{photoInfo}', photoInfo)
}

export function buildSceneImagePrompt(
  photoAnalyses: PhotoAnalysis[],
  stylePrompt: string
): string {
  const sceneDescription = photoAnalyses
    .map((a) => `${a.scene} at ${a.location_guess}, ${a.time_of_day}, ${a.season}`)
    .join('; ')

  return `${stylePrompt} Scene contains: ${sceneDescription}. Generate a cohesive artistic illustration that captures the mood and atmosphere of these moments.`
}

export function buildStyleBackgroundPrompt(stylePrompt: string): string {
  return stylePrompt
}