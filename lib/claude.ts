import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

export async function callHaiku(system: string, user: string, maxTokens = 2048): Promise<string> {
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  })
  const block = msg.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
  return block.text
}

export type VisionImage = {
  data: string // base64, no data: prefix
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
}

export async function callHaikuVision(
  system: string,
  user: string,
  image: VisionImage,
  maxTokens = 2048,
): Promise<string> {
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    system,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: image.mediaType, data: image.data },
          },
          { type: 'text', text: user },
        ],
      },
    ],
  })
  const block = msg.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
  return block.text
}
