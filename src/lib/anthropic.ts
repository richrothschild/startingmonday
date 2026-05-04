import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const MODELS = {
  sonnet: process.env.ANTHROPIC_CHAT_MODEL ?? 'claude-sonnet-4-6',
  haiku: process.env.ANTHROPIC_HAIKU_MODEL ?? 'claude-haiku-4-5-20251001',
} as const
