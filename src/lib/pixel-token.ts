import { createHmac } from 'crypto'

// Token is a base64url-encoded JSON payload. Can be signed (preferred) or unsigned (deprecated).
// Signed tokens use HMAC-SHA256 for integrity verification.
// Format: { uid: string (UUID), type: string, d: string (YYYY-MM-DD), s?: string (signature) }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PIXEL_TOKEN_SECRET = process.env.PIXEL_TOKEN_SECRET || ''

export type PixelTokenPayload = {
  uid: string
  type: string
  d: string
  signed?: boolean
}

/**
 * Generate an unsigned pixel token (deprecated - for backward compatibility only).
 * Use generatePixelTokenSigned() for new code.
 */
export function generatePixelToken(userId: string, emailType: string, sentDate: string): string {
  const payload = JSON.stringify({ uid: userId, type: emailType, d: sentDate })
  return Buffer.from(payload).toString('base64url')
}

/**
 * Generate a signed pixel token using HMAC-SHA256.
 * This is the preferred method as it prevents spoofing of analytics events.
 */
export function generatePixelTokenSigned(userId: string, emailType: string, sentDate: string): string {
  if (!PIXEL_TOKEN_SECRET) {
    // Fallback to unsigned if secret not configured (graceful degradation)
    console.warn('PIXEL_TOKEN_SECRET not configured; falling back to unsigned token')
    return generatePixelToken(userId, emailType, sentDate)
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
 * Parse an unsigned pixel token (deprecated).
 * Accepts any valid payload - no integrity check.
 */
export function parsePixelToken(token: string): PixelTokenPayload | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const obj = JSON.parse(decoded)
    if (typeof obj.uid !== 'string' || !UUID_RE.test(obj.uid)) return null
    if (typeof obj.type !== 'string') return null
    return { uid: obj.uid, type: obj.type, d: obj.d ?? '', signed: false }
  } catch {
    return null
  }
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

    return { uid: payload.uid, type: payload.type, d: payload.d, signed: true }
  } catch {
    return null
  }
}
