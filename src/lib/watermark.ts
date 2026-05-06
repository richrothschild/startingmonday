/**
 * Steganographic watermarking using zero-width Unicode characters.
 *
 * Encoding scheme:
 *   U+200C (ZWNJ): boundary marker, start and end
 *   U+200B (ZWS):  encodes bit 0
 *   U+200D (ZWJ):  encodes bit 1
 *
 * A UUID (128 bits) produces 130 invisible characters that survive
 * copy-paste in browsers, email clients, and most document editors.
 * The insertion position in multi-paragraph text is seeded from the
 * userId so it varies per user, not always at the start or end.
 */

const ZWNJ = '‌'
const ZWS  = '​'
const ZWJ  = '‍'

export function encodeUserId(userId: string): string {
  const hex = userId.replace(/-/g, '')
  if (hex.length !== 32) return ''
  let bits = ''
  for (const char of hex) {
    const nibble = parseInt(char, 16)
    for (let i = 3; i >= 0; i--) bits += ((nibble >> i) & 1) ? ZWJ : ZWS
  }
  return ZWNJ + bits + ZWNJ
}

export function decodeWatermark(text: string): string | null {
  const match = text.match(/‌([​‍]{128})‌/)
  if (!match) return null
  const bits = match[1]
  let hex = ''
  for (let i = 0; i < 128; i += 4) {
    let nibble = 0
    for (let j = 0; j < 4; j++) if (bits[i + j] === ZWJ) nibble |= (1 << (3 - j))
    hex += nibble.toString(16)
  }
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-')
}

export function watermarkText(text: string, userId: string): string {
  const mark = encodeUserId(userId)
  if (!mark) return text
  const paragraphs = text.split('\n\n')
  if (paragraphs.length <= 1) return text + mark
  const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const idx = 1 + (hash % Math.max(1, paragraphs.length - 1))
  paragraphs[idx] = (paragraphs[idx] ?? '') + mark
  return paragraphs.join('\n\n')
}

export function appendWatermarkToStream(
  stream: ReadableStream<Uint8Array>,
  userId: string,
): ReadableStream<Uint8Array> {
  const mark = encodeUserId(userId)
  if (!mark) return stream
  const encoder = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      const reader = stream.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          controller.enqueue(value)
        }
        controller.enqueue(encoder.encode(mark))
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })
}
