import { NextRequest } from 'next/server'
import { ollamaClient } from '@/lib/ai/client'
import { PhotoExif } from '@/types'
import { buildAnalyzePrompt } from '@/lib/ai/prompts'
import { log } from '@/lib/logger'

const TAG = 'analyze'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  try {
    const body = await request.json()
    const { image, exif } = body as { image: string; exif?: PhotoExif | null }

    if (!image) {
      log.warn(TAG, 'Missing image in request')
      return Response.json({ error: 'image is required' }, { status: 400 })
    }

    log.info(TAG, `Analyzing photo (exif: ${exif ? 'yes' : 'no'}, image length: ${image.length})`)

    const prompt = buildAnalyzePrompt(exif || null)

    const response = await ollamaClient.chat.completions.create({
      model: 'gemini-3-flash-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}` },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    let content = response.choices[0]?.message?.content || ''
    log.debug(TAG, `Raw model response (first 200 chars): ${content.slice(0, 200)}`)

    content = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
    const parsed = JSON.parse(content)

    const elapsed = Date.now() - startTime
    log.info(TAG, `Analysis complete in ${elapsed}ms`, {
      scene: parsed.scene,
      location: parsed.location_guess,
      confidence: parsed.confidence,
    })

    return Response.json(parsed)
  } catch (error) {
    const elapsed = Date.now() - startTime
    log.error(TAG, `Analysis failed after ${elapsed}ms`, error instanceof Error ? error.message : String(error))
    return Response.json(
      { error: 'Analysis failed', details: String(error) },
      { status: 500 }
    )
  }
}