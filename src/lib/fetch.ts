const rateLimitMap = new Map<string, number>()

export function checkRateLimit(url: string, cooldownMs = 10000): string | null {
  const now = Date.now()
  const last = rateLimitMap.get(url)
  if (last && now - last < cooldownMs) {
    const wait = Math.ceil((cooldownMs - (now - last)) / 1000)
    return `请求太频繁，请 ${wait} 秒后再试`
  }
  rateLimitMap.set(url, now)
  return null
}

export function clearRateLimit(url: string) {
  rateLimitMap.delete(url)
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 30000
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(id)
  }
}