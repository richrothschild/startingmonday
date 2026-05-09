const ZWNJ = '‌'
const ZWS  = '​'
const ZWJ  = '‍'

export function encodeUserId(userId) {
  const hex = userId.replace(/-/g, '')
  if (hex.length !== 32) return ''
  let bits = ''
  for (const char of hex) {
    const nibble = parseInt(char, 16)
    for (let i = 3; i >= 0; i--) bits += ((nibble >> i) & 1) ? ZWJ : ZWS
  }
  return ZWNJ + bits + ZWNJ
}

export function decodeWatermark(text) {
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

export function watermarkText(text, userId) {
  const mark = encodeUserId(userId)
  if (!mark) return text
  const paragraphs = text.split('\n\n')
  if (paragraphs.length <= 1) return text + mark
  const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const idx = 1 + (hash % Math.max(1, paragraphs.length - 1))
  paragraphs[idx] = (paragraphs[idx] ?? '') + mark
  return paragraphs.join('\n\n')
}

// Injects watermark into email HTML just before </body>.
// Uses a zero-height hidden span so it is invisible but survives copy-paste.
export function watermarkEmailHtml(html, userId) {
  const mark = encodeUserId(userId)
  if (!mark) return html
  const span = `<span style="font-size:0;line-height:0;display:block;height:0;overflow:hidden;" aria-hidden="true">${mark}</span>`
  return html.includes('</body>') ? html.replace('</body>', `${span}</body>`) : html + span
}

// Generates a base64url token encoding userId, emailType, and sentDate.
// Matches the parsePixelToken() decoder in src/lib/pixel-token.ts.
export function generatePixelToken(userId, emailType, sentDate) {
  const payload = JSON.stringify({ uid: userId, type: emailType, d: sentDate })
  return Buffer.from(payload).toString('base64url')
}

// Appends a 1x1 tracking pixel to email HTML.
// Fires when the recipient's email client loads images, logging IP and user agent.
export function injectTrackingPixel(html, userId, emailType, sentDate) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'
  const token = generatePixelToken(userId, emailType, sentDate)
  const img = `<img src="${appUrl}/api/track/open?t=${token}" width="1" height="1" style="display:block;border:0;" alt="" />`
  return html.includes('</body>') ? html.replace('</body>', `${img}</body>`) : html + img
}
