import { NextRequest } from 'next/server'
import { ollamaClient } from '@/lib/ai/client'
import { PhotoAnalysis, StyleType } from '@/types'
import { buildNarratePrompt } from '@/lib/ai/prompts'
import { STYLES } from '@/types/style'
import { log } from '@/lib/logger'

const TAG = 'narrate'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  try {
    const body = await request.json()
    const { analyses, style, customStylePrompt } = body as {
      analyses: PhotoAnalysis[]
      style: StyleType
      customStylePrompt?: string
    }

    if (!analyses || !style) {
      log.warn(TAG, 'Missing analyses or style in request')
      return Response.json({ error: 'analyses and style are required' }, { status: 400 })
    }

    log.info(TAG, `Starting narration (style: ${style}, photos: ${analyses.length})`)

    const styleTheme = STYLES[style]
    const prompt = buildNarratePrompt(analyses, styleTheme.narrativePrompt, customStylePrompt)

    const stream = await ollamaClient.chat.completions.create({
      model: 'gemini-3-flash-preview',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      temperature: 0.8,
    })

    let charCount = 0
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || ''
            if (text) {
              charCount += text.length
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          log.info(TAG, `Narration complete in ${Date.now() - startTime}ms (${charCount} chars)`)
        } catch (err) {
          log.error(TAG, `Stream error after ${Date.now() - startTime}ms`, err instanceof Error ? err.message : String(err))
          controller.error(err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    const elapsed = Date.now() - startTime
    log.error(TAG, `Narration failed after ${elapsed}ms`, error instanceof Error ? error.message : String(error))
    return Response.json(
      { error: 'Narrative generation failed', details: String(error) },
      { status: 500 }
    )
  }
}