import { NextRequest } from 'next/server'
import { ollamaClient } from '@/lib/ai/client'
import { STYLES } from '@/types/style'
import { log } from '@/lib/logger'

const TAG = 'summary'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  try {
    const body = await request.json()
    const { chapterNarratives, style } = body as {
      chapterNarratives: { title: string; text: string }[]
      style: string
    }

    if (!chapterNarratives || chapterNarratives.length === 0) {
      return Response.json({ error: 'chapterNarratives are required' }, { status: 400 })
    }

    const styleTheme = STYLES[style as keyof typeof STYLES]
    const styleLabel = styleTheme?.label || '追忆'
    const narrativeStyle = styleTheme?.narrativePrompt || ''

    const chaptersInfo = chapterNarratives
      .map((c, i) => `第${i + 1}章「${c.title}」：${c.text}`)
      .join('\n\n')

    const summaryPrompt = `你是一位记忆叙事大师。用户刚刚完成了一段旅程，各章节的叙事如下：

${chaptersInfo}

请为整段旅程撰写一段总结性游记，要求：
- 风格延续"${styleLabel}"的叙事风格
- 100-150字
- 概括整个旅程的情感主线和核心体验
- 开头用一句话总领全文
- 结尾呼应开头，形成闭环
- 不要列出具体的章节标题，而是自然流畅地叙述

请直接输出游记内容，不要包含任何前缀或标号。`

    log.info(TAG, `Starting summary generation (style: ${style}, chapters: ${chapterNarratives.length})`)

    const stream = await ollamaClient.chat.completions.create({
      model: 'gemini-3-flash-preview',
      messages: [{ role: 'user', content: summaryPrompt }],
      stream: true,
      temperature: 0.7,
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
          log.info(TAG, `Summary complete in ${Date.now() - startTime}ms (${charCount} chars)`)
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
    log.error(TAG, `Summary failed after ${elapsed}ms`, error instanceof Error ? error.message : String(error))
    return Response.json(
      { error: 'Summary generation failed', details: String(error) },
      { status: 500 }
    )
  }
}