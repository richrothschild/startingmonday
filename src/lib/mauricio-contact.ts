const MAURICIO_EMAIL = 'mo@obmsalesconsulting.com'

export function buildMauricioMailto(subject: string, body?: string) {
  const url = new URL(`mailto:${MAURICIO_EMAIL}`)

  if (subject) {
    url.searchParams.set('subject', subject)
  }

  if (body) {
    url.searchParams.set('body', body)
  }

  return url.toString()
}
