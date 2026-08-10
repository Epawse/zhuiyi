import OpenAI from 'openai'

const googleApiKey = process.env.GOOGLE_AI_API_KEY

const aiClient = new OpenAI({
  apiKey: googleApiKey || process.env.OLLAMA_API_KEY || '',
  baseURL: googleApiKey
    ? 'https://generativelanguage.googleapis.com/v1beta/openai/'
    : process.env.OLLAMA_BASE_URL || 'https://ollama.com/v1',
})

export { aiClient }
