import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()

function parseCsv(content) {
  if (!content.trim()) return { headers: [], rows: [] }
  const records = []
  let row = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    if (ch === '"') {
      if (inQuotes && content[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
      continue
    }
    if (ch === ',' && !inQuotes) { row.push(current); current = ''; continue }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && content[i + 1] === '\n') i++
      row.push(current); current = ''
      if (row.some(c => c.length > 0)) records.push(row)
      row = []
      continue
    }
    current += ch
  }
  if (current.length > 0 || row.length > 0) {
    row.push(current)
    if (row.some(c => c.length > 0)) records.push(row)
  }
  if (records.length === 0) return { headers: [], rows: [] }
  const [headers, ...lines] = records
  const rows = lines.map(cols => {
    const mapped = {}
    for (let i = 0; i < headers.length; i++) mapped[headers[i]] = cols[i] ?? ''
    return mapped
  })
  return { headers, rows }
}

function esc(val) {
  const s = String(val ?? '')
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCsv(headers, rows) {
  const lines = [headers.map(esc).join(',')]
  for (const row of rows) lines.push(headers.map(h => esc(row[h] ?? '')).join(','))
  return lines.join('\r\n') + '\r\n'
}

function firstName(row) {
  if (row.first_name) return row.first_name.trim()
  const full = (row.full_name || '').trim()
  return full ? full.split(/\s+/)[0] : 'there'
}

function companyName(row) {
  return (row.company || row['Company Name'] || 'your team').trim() || 'your team'
}

function focusText(raw) {
  const p = (raw || '').trim()
  if (!p) return 'senior transition'
  return p
}

function proofLineForFocus(focus) {
  const f = (focus || '').toUpperCase()
  if (f.includes('CFO') || f.includes('FINANCE')) return 'faster translation of finance credibility into board-readable transition narratives'
  if (f.includes('CTO') || f.includes('TECH')) return 'clearer architecture-to-business messaging before first stakeholder interviews'
  if (f.includes('COO') || f.includes('OPER')) return 'stronger execution-cadence proof in early outreach and screening calls'
  if (f.includes('CISO') || f.includes('SECUR')) return 'higher-confidence risk and resilience framing for non-technical decision-makers'
  if (f.includes('CPO') || f.includes('PRODUCT')) return 'sharper product-to-growth narrative consistency across outreach and interview prep'
  if (f.includes('CHRO') || f.includes('PEOPLE')) return 'more credible people-and-change leadership signaling in first-touch conversations'
  if (f.includes('CEO') || f.includes('BOARD')) return 'cleaner board-readiness signal and tighter strategic positioning in early conversations'
  if (f.includes('VP')) return 'clearer next-scope readiness proof supported by concrete execution examples'
  return 'cleaner role-specific positioning supported by measurable execution evidence'
}

function coachBody(row) {
  const first = firstName(row)
  const company = companyName(row)
  const focus = focusText(row.persona_focus || row.role_bucket || row.title)
  const proof = proofLineForFocus(focus)
  return [
    `Hi ${first},`,
    '',
    `I have been following your work at ${company}, and I thought this might be useful for the executives you support.`,
    '',
    'Starting Monday gives executive coaches a practical execution layer: target company intelligence, structured prep briefs, and outreach workflows that help senior candidates move with focus.',
    '',
    'In the first 30 days, coaches typically see stronger momentum signals: cleaner target lists, faster first-touch cycles, and better interview readiness before high-stakes conversations.',
    '',
    `For ${focus} clients, the biggest win is ${proof}.`,
    '',
    'If useful, I can walk you through it in 20 minutes and you can decide quickly if it fits your practice.',
    '',
    'Rich',
    'startingmonday.app',
  ].join('\n')
}

function outplacementBody(row) {
  const first = firstName(row)
  const company = companyName(row)
  const focus = focusText(row.persona_focus || row.role_bucket)
  const focusLabel = /programs?$/i.test(focus) ? focus : `${focus} programs`
  const proof = proofLineForFocus(focus)
  return [
    `Hi ${first},`,
    '',
    `I have been following your work at ${company}, and I thought this might be useful for your transition cohorts.`,
    '',
    'Starting Monday helps outplacement teams run a measurable operating cadence across company targeting, outreach quality, and prep readiness for senior candidates.',
    '',
    'In the first 30 days, teams typically see higher weekly engagement, faster time-to-qualified-conversation, and more consistent interview preparation across leadership cohorts.',
    '',
    `For ${focusLabel}, the biggest win is ${proof}.`,
    '',
    'If useful, I can share a 30-day pilot outline with concrete success metrics and you can decide quickly if it fits your program.',
    '',
    'Rich',
    'startingmonday.app',
  ].join('\n')
}

function subject(row) {
  return `Bad idea to send a 1-page executive transition conversation flow for ${companyName(row)}?`
}

async function updateCoachesFile(relPath) {
  const full = path.join(ROOT, relPath)
  const raw = await readFile(full, 'utf8')
  const { headers, rows } = parseCsv(raw)
  let updated = 0
  for (const row of rows) {
    const body = coachBody(row)
    if ('default_subject' in row) row.default_subject = subject(row)
    if ('email_subject' in row) row.email_subject = subject(row)
    if ('subject' in row) row.subject = subject(row)
    if ('default_body' in row) row.default_body = body
    if ('email_body' in row) row.email_body = body
    if ('email_text' in row) row.email_text = body
    if ('email_body_core' in row) row.email_body_core = body
    updated++
  }
  await writeFile(full, toCsv(headers, rows), 'utf8')
  return updated
}

async function updateOutplacementFile(relPath) {
  const full = path.join(ROOT, relPath)
  const raw = await readFile(full, 'utf8')
  const { headers, rows } = parseCsv(raw)
  let updated = 0
  for (const row of rows) {
    const rb = (row.role_bucket || '').toLowerCase()
    if (!rb.includes('outplacement') && !rb.includes('director') && !rb.includes('partner') && !rb.includes('practice')) {
      // The file is outplacement-focused; keep broad update anyway.
    }
    const body = outplacementBody(row)
    if ('default_subject' in row) row.default_subject = subject(row)
    if ('subject' in row) row.subject = subject(row)
    if ('default_body' in row) row.default_body = body
    if ('email_body_core' in row) row.email_body_core = body
    updated++
  }
  await writeFile(full, toCsv(headers, rows), 'utf8')
  return updated
}

function executiveBodyForRole(roleBucket) {
  const rb = roleBucket || 'Executive'
  const proof = proofLineForFocus(rb)
  return [
    'Hi {first_name},',
    '',
    `I have been following your work at {company_name}, and I thought this might be useful for ${rb} transitions.`,
    '',
    'Starting Monday gives senior leaders a practical execution system: target company intelligence, role-specific prep briefs, and outreach workflows that improve signal quality in first-touch conversations.',
    '',
    'In the first 30 days, leaders typically see stronger momentum: cleaner targeting, tighter narrative discipline, and faster progression to qualified conversations.',
    '',
    `For ${rb} candidates, the biggest win is ${proof}.`,
    '',
    'If useful, I can send a one-page version customized to your current transition context.',
    '',
    'Rich',
    'startingmonday.app',
  ].join('\n')
}

async function rewriteExecutiveBlocks(relPath) {
  const full = path.join(ROOT, relPath)
  const raw = await readFile(full, 'utf8')
  const { headers, rows } = parseCsv(raw)
  let updated = 0
  for (const row of rows) {
    const rb = row.role_bucket || 'Executive'
    row.subject_line_1 = `Bad idea to send a 1-page executive transition conversation flow for ${rb} leaders?`
    row.subject_line_2 = `Bad idea to send a 1-page executive transition conversation flow for ${rb} leaders?`
    row.email_body_core = executiveBodyForRole(rb)
    row.cta_line = 'If useful, I can send a one-page version customized to your current transition context.'
    updated++
  }
  await writeFile(full, toCsv(headers, rows), 'utf8')

  const outHeaders = ['role_bucket', 'default_subject', 'default_body', 'status']
  const outRows = rows.map(r => ({
    role_bucket: r.role_bucket,
    default_subject: `Bad idea to send a 1-page executive transition conversation flow for ${r.role_bucket} leaders?`,
    default_body: executiveBodyForRole(r.role_bucket),
    status: 'ready',
  }))
  const outPath = path.join(ROOT, 'docs', 'outreach', 'executive_role_send_ready_templates.csv')
  await writeFile(outPath, toCsv(outHeaders, outRows), 'utf8')
  return { updated, outFile: outPath }
}

async function main() {
  const results = {}
  results.coaches100 = await updateCoachesFile(path.join('docs', 'outreach', 'coaches_prospecting_100.csv'))
  results.coaches25 = await updateCoachesFile(path.join('docs', 'outreach', 'coaches_prospecting_curated_top25.csv'))
  results.execCoaches = await updateCoachesFile(path.join('docs', 'outreach', 'exec_coaches_full_batch_may2026.csv'))
  results.outplacement = await updateOutplacementFile(path.join('docs', 'outreach', 'outplacement_firms_prospecting_100.csv'))
  const exec = await rewriteExecutiveBlocks(path.join('docs', 'outreach', 'role_bucket_email_body_blocks.csv'))
  results.executiveBlocks = exec.updated
  results.executiveSendReadyFile = exec.outFile

  console.log('Council refinements complete:')
  console.log(`coaches_prospecting_100 updated rows: ${results.coaches100}`)
  console.log(`coaches_prospecting_curated_top25 updated rows: ${results.coaches25}`)
  console.log(`exec_coaches_full_batch_may2026 updated rows: ${results.execCoaches}`)
  console.log(`outplacement_firms_prospecting_100 updated rows: ${results.outplacement}`)
  console.log(`role_bucket_email_body_blocks updated rows: ${results.executiveBlocks}`)
  console.log(`executive send-ready templates: ${results.executiveSendReadyFile}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
