/**
 * Script to generate 4K pre-baked background images using Google AI Studio.
 * Run: npx tsx scripts/generate-backgrounds.ts
 *
 * Requires GOOGLE_AI_API_KEY and HTTPS_PROXY in .env.local
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { loadEnv } from './load-env'

const OUTPUT_DIR = join(process.cwd(), 'public')

const BACKGROUNDS = [
  {
    name: 'bg-landing.jpg',
    prompt: `Create a dark, atmospheric abstract background image (3840x2160 resolution). Deep dark gradient from #0a0a0f to #1a1a2e. In the center, a very subtle warm golden radial glow (like a fading memory, colors #D4A574 and #8B6914 at 10% opacity). The overall feel should be cinematic, like looking into the depths of memory. Very subtle film grain texture. No text, no people, no objects — pure abstract atmosphere. The image should work as a background for a literary/narrative app called "追忆" (Remembrance).`,
  },
  {
    name: 'bg-ancient.jpg',
    prompt: `Create a 3840x2160 abstract background in traditional Chinese ink wash (水墨) style. Rice paper (宣纸) texture as the base — warm cream color #F5F0E8. Subtle ink wash gradients with very light gray and warm tones. Faint mountain silhouettes at the horizon, almost invisible. Delicate ink splash accents in vermillion #C41A16 (朱红) — just tiny spots, like seal stamps. No text, no people, no buildings. The feeling should be like opening an ancient scroll — quiet, dignified, with depth. Very low contrast, atmospheric, painterly.`,
  },
  {
    name: 'bg-proust.jpg',
    prompt: `Create a 3840x2160 abstract background in warm vintage impressionist style. Aged paper texture base — warm off-white #FAF8F5. Soft sepia and golden brown (#D4A574) light leaks and bokeh spots scattered gently across the frame. Faded floral patterns barely visible, like pressed flowers in an old book. Gentle warm light gradients, like afternoon sunlight through lace curtains. No text, no people, no objects — pure atmospheric warmth. The feeling should be like opening a beloved old book — nostalgic, tender, luminous.`,
  },
  {
    name: 'bg-cyber.jpg',
    prompt: `Create a 3840x2160 abstract background in dark cyberpunk style. Pure black #0A0A0A base. Subtle vertical data stream lines in very low opacity neon cyan #00FFD4. A few horizontal glitch lines in hot pink #FF0066 at 5% opacity. Faint grid pattern like a digital horizon. Very subtle scan lines across the image. The overall feel should be like looking at a holographic display in a dark room — minimal, digital, mysterious. No text, no people, no cityscapes — pure abstract digital atmosphere.`,
  },
  {
    name: 'bg-custom.jpg',
    prompt: `Create a 3840x2160 abstract background that is elegant and neutral — suitable for any custom narrative style. Deep indigo-to-dark gradient (#1a1a2e to #0f0f1a). Subtle constellation-like scattered dots in soft white (3% opacity). A gentle aurora-like flowing gradient in indigo #6366F1 and violet #8B5CF6 at very low opacity (8%). The feel should be cosmic yet grounded — like a night sky that could become anything. No text, no objects. Clean, modern, versatile.`,
  },
]

async function generateImage(prompt: string, maxRetries = 5): Promise<{ mimeType: string; data: string } | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    console.error('GOOGLE_AI_API_KEY not found in environment')
    return null
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
      imageConfig: {
        aspectRatio: '16:9',
        imageSize: '1K',
      },
    },
  }

  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY

  const fetchOptions: Record<string, unknown> = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    timeout: 120000,
  }

  // Use proxy if available
  if (proxyUrl) {
    console.log(`  Using proxy: ${proxyUrl}`)
    try {
      const { ProxyAgent } = await import('undici')
      fetchOptions.dispatcher = new ProxyAgent(proxyUrl as string)
    } catch {
      console.warn('  undici not available, trying without proxy')
    }
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`  Calling Google AI Studio API (attempt ${attempt}/${maxRetries})...`)

    try {
      const response = await fetch(url, fetchOptions as RequestInit)

      if (response.status === 503) {
        const waitSec = 15 * attempt
        console.log(`  ⏳ 503 — model overloaded, waiting ${waitSec}s before retry...`)
        await new Promise((r) => setTimeout(r, waitSec * 1000))
        continue
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`  API error (${response.status}): ${errorText.slice(0, 300)}`)
        return null
      }

      const data = await response.json() as Record<string, unknown>
      const candidates = data?.candidates as Array<Record<string, unknown>> | undefined
      const parts = candidates?.[0]?.content?.parts as Array<Record<string, unknown>> | undefined

      if (!parts) {
        console.error('  No parts in response')
        return null
      }

      for (const part of parts) {
        const inlineData = part.inlineData as { mimeType: string; data: string } | undefined
        if (inlineData) {
          return { mimeType: inlineData.mimeType, data: inlineData.data }
        }
      }

      console.error('  No image data in response')
      return null
    } catch (err) {
      console.error(`  Network error (attempt ${attempt}):`, err instanceof Error ? err.message : String(err))
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 10000))
      }
    }
  }

  console.error(`  ❌ All ${maxRetries} attempts failed`)
  return null
}

function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, 'base64')
}

async function main() {
  // Load .env.local
  loadEnv()

  if (!process.env.GOOGLE_AI_API_KEY) {
    console.error('Error: GOOGLE_AI_API_KEY not found. Set it in .env.local')
    process.exit(1)
  }

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  console.log(`\n🎨 Generating ${BACKGROUNDS.length} background images...\n`)

  for (const bg of BACKGROUNDS) {
    const outputPath = join(OUTPUT_DIR, bg.name)
    console.log(`\n📝 ${bg.name}`)
    console.log(`  Prompt: ${bg.prompt.slice(0, 80)}...`)

    const result = await generateImage(bg.prompt)

    if (!result) {
      console.error(`  ❌ Failed to generate ${bg.name}`)
      continue
    }

    const buffer = base64ToBuffer(result.data)
    writeFileSync(outputPath, buffer)
    const sizeKB = Math.round(buffer.length / 1024)
    console.log(`  ✅ Saved ${bg.name} (${sizeKB} KB, ${result.mimeType})`)
  }

  console.log('\n✨ Done! Background images saved to /public/')
}

main().catch(console.error)