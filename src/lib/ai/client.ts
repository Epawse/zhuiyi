import OpenAI from 'openai'

const ollamaClient = new OpenAI({
  apiKey: process.env.OLLAMA_API_KEY || '',
  baseURL: process.env.OLLAMA_BASE_URL || 'https://ollama.com/v1',
})

export { ollamaClient }