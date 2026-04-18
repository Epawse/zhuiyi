import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, mode } = body as { prompt: string; mode?: 'background' | 'scene' }

    if (!prompt) {
      return Response.json({ error: 'prompt is required' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
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

    const response = await fetchWithProxy(imageUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google AI Studio error:', errorText)
      return Response.json({ error: 'Image generation failed' }, { status: response.status })
    }

    const data = await response.json()
    const parts = data?.candidates?.[0]?.content?.parts || []

    for (const part of parts) {
      if (part.inlineData) {
        return Response.json({
          image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          mimeType: part.inlineData.mimeType,
        })
      }
    }

    return Response.json({ error: 'No image generated' }, { status: 500 })
  } catch (error) {
    console.error('Image generation error:', error)
    return Response.json(
      { error: 'Image generation failed', details: String(error) },
      { status: 500 }
    )
  }
}

async function fetchWithProxy(url: string, options: RequestInit): Promise<Response> {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY

  if (!proxyUrl) {
    return fetch(url, options)
  }

  const { ProxyAgent } = await import('undici')
  const dispatcher = new ProxyAgent(proxyUrl)

  return fetch(url, { ...options, dispatcher } as RequestInit)
}