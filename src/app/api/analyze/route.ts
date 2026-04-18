import { NextRequest } from 'next/server'
import { ollamaClient } from '@/lib/ai/client'
import { PhotoExif } from '@/types'
import { buildAnalyzePrompt } from '@/lib/ai/prompts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, exif } = body as { image: string; exif?: PhotoExif | null }

    if (!image) {
      return Response.json({ error: 'image is required' }, { status: 400 })
    }

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

    const content = response.choices[0]?.message?.content || ''
    const parsed = JSON.parse(content)

    return Response.json(parsed)
  } catch (error) {
    console.error('Analyze error:', error)
    return Response.json(
      { error: 'Analysis failed', details: String(error) },
      { status: 500 }
    )
  }
}