export function firstNameFromRecipient(name: string | null | undefined): string {
  const cleaned = (name ?? '').toString().trim()
  if (!cleaned) return 'there'
  return cleaned.split(/\s+/)[0]
}

export function depitchSubject(subject: string | null | undefined, firstName: string): string {
  const raw = (subject ?? '').toString().trim()
  if (!raw) return `${firstName}, quick question`

  let next = raw
    .replace(/^Bad idea to send\s*/i, 'Quick question on ')
    .replace(/\?\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  if (/^Quick question on\s*$/i.test(next)) {
    next = `${firstName}, quick question`
  }

  return next
}

export function depitchBody(body: string | null | undefined, firstName: string): string {
  const raw = (body ?? '').toString()
  if (!raw.trim()) {
    return `Hi ${firstName},\n\nQuick question for you.\n\nRich\nstartingmonday.app`
  }

  let next = raw
    .replace(/\r\n/g, '\n')
    .replace(/\u2014/g, '-')
    .replace(/If this is ignored[^\n]*/gi, 'If this is not relevant right now, no worries.')
    .replace(/reply\s+["']send it["'][^\n]*reply\s+["']pass["'][^\n]*/gi, 'If helpful, I can send a one-page example. If not useful right now, no worries.')
    .replace(/Starting Monday gives/gi, 'I built Starting Monday as')
    .replace(/hard-edged/gi, 'practical')

  next = next.replace(/reply\s+["']send it["'][^\n]*/gi, 'If helpful, I can send a one-page example.')
  next = next.replace(/reply\s+["']pass["'][^\n]*/gi, 'If not useful right now, no worries.')

  if (!/^\s*Hi\s+/i.test(next)) {
    next = `Hi ${firstName},\n\n${next.trim()}`
  }

  return next
}
