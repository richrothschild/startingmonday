import { createHmac } from 'crypto'

// Token is a base64url-encoded JSON payload signed with HMAC-SHA256.
// Format: { uid: string (UUID), type: string, d: string (YYYY-MM-DD), s: string (signature) }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PIXEL_TOKEN_SECRET = process.env.PIXEL_TOKEN_SECRET || ''

export type PixelTokenPayload = {
  uid: string
  type: string
  d: string
}

/**
 * Generate a signed pixel token using HMAC-SHA256.
 * Signed tokens are required and prevent spoofing of analytics events.
 */
export function generatePixelTokenSigned(userId: string, emailType: string, sentDate: string): string {
  if (!PIXEL_TOKEN_SECRET) {
    throw new Error('PIXEL_TOKEN_SECRET is required for tracking token signing')
  }

  const payload = { uid: userId, type: emailType, d: sentDate }
  const message = JSON.stringify(payload)
  const signature = createHmac('sha256', PIXEL_TOKEN_SECRET)
    .update(message)
    .digest('base64url')

  const tokenPayload = { ...payload, s: signature }
  return Buffer.from(JSON.stringify(tokenPayload)).toString('base64url')
}

/**
 * Parse a signed pixel token with HMAC-SHA256 verification.
 * Returns null if the signature is invalid or token is malformed.
 */
export function parsePixelTokenSigned(token: string): PixelTokenPayload | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const obj = JSON.parse(decoded)

    if (typeof obj.uid !== 'string' || !UUID_RE.test(obj.uid)) return null
    if (typeof obj.type !== 'string') return null
    if (typeof obj.s !== 'string') return null // signature must be present

    if (!PIXEL_TOKEN_SECRET) {
      console.warn('PIXEL_TOKEN_SECRET not configured; cannot verify signed token')
      return null
    }

    // Verify signature
    const payload = { uid: obj.uid, type: obj.type, d: obj.d ?? '' }
    const message = JSON.stringify(payload)
    const expectedSignature = createHmac('sha256', PIXEL_TOKEN_SECRET)
      .update(message)
      .digest('base64url')

    if (obj.s !== expectedSignature) {
      return null // signature mismatch
    }

    return { uid: payload.uid, type: payload.type, d: payload.d }
  } catch {
    return null
  }
}

// Legacy parser used only for rejection telemetry, not for accepted tracking events.
export function parsePixelTokenLegacyForTelemetry(token: string): PixelTokenPayload | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const obj = JSON.parse(decoded)
    if (typeof obj.uid !== 'string' || !UUID_RE.test(obj.uid)) return null
    if (typeof obj.type !== 'string') return null
    if (typeof obj.s === 'string') return null
    return { uid: obj.uid, type: obj.type, d: obj.d ?? '' }
  } catch {
    return null
  }
}
