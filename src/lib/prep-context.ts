import { DOC_CHARS } from '@/lib/ai-limits'

export type Signal = {
  signal_type: string
  signal_summary: string
  outreach_angle?: string | null
  signal_date: string
}
export type ScanRow = {
  scanned_at: string
  ai_score?: number | null
  ai_summary?: string | null
  raw_hits?: unknown
}
export type ContactRow = {
  name: string
  title?: string | null
  firm?: string | null
  channel?: string | null
  notes?: string | null
}
export type DocRow = { label: string; content: string }

export const DOC_LABEL_NAMES: Record<string, string> = {
  job_description: 'Job Description',
  news:            'News & Press',
  annual_report:   'Annual Report',
  org_notes:       'Org Notes',
  other:           'Other',
}

export function buildScanSection(scanResults: ScanRow[] | null): string {
  if (!scanResults?.[0]) return 'No career page scans on file.'
  const scan = scanResults[0]
  const matches = ((scan.raw_hits ?? []) as { title: string; score: number; is_match: boolean; summary: string }[])
    .filter(h => h.is_match)
  const date = new Date(scan.scanned_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })
  return matches.length > 0
    ? `Career page scanned ${date}:\n` + matches.map(h => `- ${h.title} (fit score: ${h.score}): ${h.summary}`).join('\n')
    : `Career page scanned ${date}, no matching roles detected.`
}

export function buildSignalSection(signals: Signal[] | null): string | null {
  if (!(signals ?? []).length) return null
  return (signals ?? []).map(s => {
    const date = new Date(s.signal_date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    return `- [${s.signal_type.toUpperCase()}] ${date}: ${s.signal_summary}${s.outreach_angle ? `\n  Angle: ${s.outreach_angle}` : ''}`
  }).join('\n')
}

export function buildContactSection(contacts: ContactRow[] | null): string {
  if (!(contacts ?? []).length) return 'No contacts on file.'
  return (contacts ?? []).map(c => {
    const parts = [c.title, c.firm].filter(Boolean).join(' at ')
    return `- ${c.name}${parts ? `, ${parts}` : ''}${c.channel ? ` (via ${c.channel})` : ''}${c.notes ? `: ${c.notes}` : ''}`
  }).join('\n')
}

export function buildDocSection(documents: DocRow[] | null): string | null {
  if (!(documents ?? []).length) return null
  return (documents ?? []).map(d => {
    const labelName = DOC_LABEL_NAMES[d.label] ?? d.label
    const content = d.content.length > DOC_CHARS ? d.content.slice(0, DOC_CHARS) + '\n[truncated]' : d.content
    return `[${labelName}]\n${content}`
  }).join('\n\n')
}
