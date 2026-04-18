import { NextRequest } from 'next/server'
import { log } from '@/lib/logger'

const TAG = 'generate-image'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  try {
    const body = await request.json()
    const { prompt, mode } = body as { prompt: string; mode?: 'background' | 'scene' }

    if (!prompt) {
      log.warn(TAG, 'Missing prompt in request')
      return Response.json({ error: 'prompt is required' }, { status: 400 })
    }

    log.info(TAG, `Generating image (mode: ${mode || 'scene'}, prompt: ${prompt.slice(0, 80)}...)`)

    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      log.error(TAG, 'GOOGLE_AI_API_KEY not configured')
      return Response.json({ error: 'GOOGLE_AI_API_KEY not configured' }, { status: 500 })
    }

    const imageUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
        imageConfig: {
          aspectRatio: mode === 'background' ? '16:9' : '3:2',
          imageSize: '1K',
        },
      },
    }

    log.debug(TAG, `Request body size: ${JSON.stringify(requestBody).length} bytes`)

    const response = await fetchWithProxy(imageUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      log.error(TAG, `Google AI Studio error (${response.status}): ${errorText.slice(0, 500)}`)
      return Response.json({ error: 'Image generation failed' }, { status: response.status })
    }

    const data = await response.json()
    const parts = data?.candidates?.[0]?.content?.parts || []

    for (const part of parts) {
      if (part.inlineData) {
        const elapsed = Date.now() - startTime
        const imgSize = part.inlineData.data.length
        log.info(TAG, `Image generated in ${elapsed}ms (${imgSize} chars base64, ${part.inlineData.mimeType})`)
        return Response.json({
          image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          mimeType: part.inlineData.mimeType,
        })
      }
    }

    log.warn(TAG, 'No image in response', { partsCount: parts.length, parts: parts.map((p: Record<string, unknown>) => Object.keys(p)) })
    return Response.json({ error: 'No image generated' }, { status: 500 })
  } catch (error) {
    const elapsed = Date.now() - startTime
    log.error(TAG, `Image generation failed after ${elapsed}ms`, error instanceof Error ? error.message : String(error))
    return Response.json(
      { error: 'Image generation failed', details: String(error) },
      { status: 500 }
    )
  }
}

async function fetchWithProxy(url: string, options: RequestInit): Promise<Response> {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY

  if (!proxyUrl) {
    log.warn(TAG, 'No proxy configured, connecting directly to Google AI Studio')
    return fetch(url, options)
  }

  log.debug(TAG, `Using proxy: ${proxyUrl}`)
  const { ProxyAgent } = await import('undici')
  const dispatcher = new ProxyAgent(proxyUrl)

  return fetch(url, { ...options, dispatcher } as RequestInit)
}