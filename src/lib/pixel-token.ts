// Token is a base64url-encoded JSON payload. No secret signing needed -
// this is purely for attribution, not authentication.
// Format: { uid: string, type: string, d: string (YYYY-MM-DD) }

export type PixelTokenPayload = {
  uid: string
  type: string
  d: string
}

export function generatePixelToken(userId: string, emailType: string, sentDate: string): string {
  const payload = JSON.stringify({ uid: userId, type: emailType, d: sentDate })
  return Buffer.from(payload).toString('base64url')
}

export function parsePixelToken(token: string): PixelTokenPayload | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const obj = JSON.parse(decoded)
    if (typeof obj.uid !== 'string' || typeof obj.type !== 'string') return null
    return { uid: obj.uid, type: obj.type, d: obj.d ?? '' }
  } catch {
    return null
  }
}
