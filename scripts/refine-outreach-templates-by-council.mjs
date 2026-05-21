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

function quantifiedProofLineForFocus(focus) {
  const f = (focus || '').toUpperCase()
  if (f.includes('CFO') || f.includes('FINANCE')) return '3 outcomes: cleaner board framing, stronger change language, and faster first replies'
  if (f.includes('CTO') || f.includes('TECH')) return '3 outcomes: sharper architecture framing, clearer business value, and stronger stakeholder alignment'
  if (f.includes('COO') || f.includes('OPER')) return '3 outcomes: tighter execution story, better sequencing, and faster screening progression'
  if (f.includes('CISO') || f.includes('SECUR')) return '3 outcomes: clearer risk framing, better non-technical readability, and stronger trust signals'
  if (f.includes('CPO') || f.includes('PRODUCT')) return '3 outcomes: crisper product narrative, more strategic pull, and cleaner interview cadence'
  if (f.includes('CHRO') || f.includes('PEOPLE')) return '3 outcomes: better change narrative, stronger leadership signal, and cleaner decision-maker alignment'
  if (f.includes('CEO') || f.includes('BOARD')) return '3 outcomes: cleaner board-readiness, stronger strategic posture, and more credible executive momentum'
  if (f.includes('VP')) return '3 outcomes: clearer scope signal, stronger example quality, and faster next-step clarity'
  return '3 outcomes: cleaner positioning, stronger proof, and faster decision-making'
}

function microSpecificLine(company, focus, audience) {
  return `For ${focus} leaders at ${company}, the first 30 days usually need 3 things to line up: the target list, the prep brief, and the outreach cadence.`
}

function ctaVariants(audience) {
  return {
    sample: `If useful, I can send a one-page sample built around your ${audience} context.`,
    pilot: `If useful, I can walk you through a 20-minute pilot with 3 success criteria and you can decide quickly if it fits.`,
  }
}

function subjectVariants(roleBucket, company) {
  return {
    a: `Bad idea to send a 1-page ${roleBucket} transition conversation flow for ${company}?`,
    b: `3 reasons ${roleBucket} leaders at ${company} need a tighter transition conversation flow?`,
    c: `How ${roleBucket} leaders at ${company} can improve transition momentum in 30 days?`,
  }
}

function coachBody(row) {
  const first = firstName(row)
  const company = companyName(row)
  const focus = focusText(row.persona_focus || row.role_bucket || row.title)
  const proof = proofLineForFocus(focus)
  const quantified = quantifiedProofLineForFocus(focus)
  return [
    `Hi ${first},`,
    '',
    `I have been following your work at ${company}, and I thought this might be useful for the executives you support.`,
    '',
    'Starting Monday gives executive coaches a practical execution layer: target company intelligence, structured prep briefs, and outreach workflows that help senior candidates move with focus.',
    '',
    microSpecificLine(company, focus, 'coach'),
    '',
    `In the first 30 days, coaches usually see ${quantified}.`,
    '',
    `For ${focus} clients, the biggest win is ${proof}.`,
    '',
    ctaVariants('coach practice').pilot,
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
  const quantified = quantifiedProofLineForFocus(focus)
  const cta = ctaVariants('transition cohort')
  return [
    `Hi ${first},`,
    '',
    `I have been following your work at ${company}, and I thought this might be useful for your transition cohorts.`,
    '',
    'Starting Monday helps outplacement teams run a measurable operating cadence across company targeting, outreach quality, and prep readiness for senior candidates.',
    '',
    microSpecificLine(company, focus, 'outplacement'),
    '',
    `In the first 30 days, teams usually see ${quantified}.`,
    '',
    `For ${focusLabel}, the biggest win is ${proof}.`,
    '',
    cta.sample,
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
  const quantified = quantifiedProofLineForFocus(rb)
  const cta = ctaVariants(rb)
  return [
    'Hi {first_name},',
    '',
    `I have been following your work at {company_name}, and I thought this might be useful for ${rb} transitions.`,
    '',
    'Starting Monday gives senior leaders a practical execution system: target company intelligence, role-specific prep briefs, and outreach workflows that improve signal quality in first-touch conversations.',
    '',
    `For ${rb} leaders at {company_name}, the first 30 days usually need 3 things to line up: the target list, the prep brief, and the outreach cadence.`,
    '',
    `In the first 30 days, leaders usually see ${quantified}.`,
    '',
    `For ${rb} candidates, the biggest win is ${proof}.`,
    '',
    cta.sample,
    '',
    'Rich',
    'startingmonday.app',
  ].join('\n')
}

function executiveFollowupBody(roleBucket, step) {
  const focus = roleBucket || 'Executive'
  const proof = proofLineForFocus(focus)
  const quantified = quantifiedProofLineForFocus(focus)
  const cta = ctaVariants(focus)
  if (step === 'followup_1') {
    return [
      'Hi {first_name},',
      '',
      `I have been following your work at {company_name}, and I wanted to follow up on my earlier note about ${focus} transitions.`,
      '',
      `The part that usually matters most is getting 3 things aligned early: the narrative, the target list, and the first outreach sequence.`,
      '',
      `For ${focus} candidates, that is where ${proof} usually shows up.`,
      '',
      cta.sample,
      '',
      'Rich',
      'startingmonday.app',
    ].join('\n')
  }
  if (step === 'followup_2') {
    return [
      'Hi {first_name},',
      '',
      `I have been following your work at {company_name}, and I had one more thought on ${focus} transitions.`,
      '',
      `In most active searches, the 3 signal points that matter are the resume story, the prep brief, and the follow-through cadence.`,
      '',
      `For ${focus} leaders, that is where ${quantified} usually emerge.`,
      '',
      cta.pilot,
      '',
      'Rich',
      'startingmonday.app',
    ].join('\n')
  }
  return [
    'Hi {first_name},',
    '',
    `I have been following your work at {company_name}, and I am closing the loop on my note about ${focus} transitions.`,
    '',
    'If timing is not right, no problem. If it is, I can send one concise example showing how the workflow looks in practice.',
    '',
    `That example is usually the cleanest way to show the 3-part structure without overexplaining it.`,
    '',
    'Rich',
    'startingmonday.app',
  ].join('\n')
}

async function rewriteExecutiveBlocks(relPath) {
  const full = path.join(ROOT, relPath)
  const raw = await readFile(full, 'utf8')
  const { headers, rows } = parseCsv(raw)
  const enrichedHeaders = [
    ...headers,
    ...['subject_variant_a', 'subject_variant_b', 'subject_variant_c', 'cta_variant_a', 'cta_variant_b'].filter(h => !headers.includes(h)),
  ]
  let updated = 0
  for (const row of rows) {
    const rb = row.role_bucket || 'Executive'
    row.subject_line_1 = `Bad idea to send a 1-page executive transition conversation flow for ${rb} leaders?`
    row.subject_line_2 = `Bad idea to send a 1-page executive transition conversation flow for ${rb} leaders?`
    row.subject_variant_a = `Bad idea to send a 1-page ${rb} transition conversation flow for {company_name}?`
    row.subject_variant_b = `3 ways ${rb} leaders improve transition momentum in 30 days?`
    row.subject_variant_c = `How ${rb} leaders at {company_name} can tighten transition conversations?`
    row.cta_variant_a = ctaVariants(rb).sample
    row.cta_variant_b = ctaVariants(rb).pilot
    row.email_body_core = executiveBodyForRole(rb)
    row.cta_line = ctaVariants(rb).sample
    updated++
  }
  await writeFile(full, toCsv(enrichedHeaders, rows), 'utf8')

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

async function generateFollowupLadder(relPath) {
  const full = path.join(ROOT, relPath)
  const raw = await readFile(full, 'utf8')
  const { rows } = parseCsv(raw)
  const outputRows = []
  for (const row of rows) {
    const roleBucket = row.role_bucket || 'Executive'
    outputRows.push({
      role_bucket: roleBucket,
      step: 'followup_1',
      send_delay_days: '3',
      subject: `Bad idea to send a 1-page ${roleBucket} transition conversation flow for {company_name}?`,
      email_text: executiveFollowupBody(roleBucket, 'followup_1'),
      status: 'ready',
    })
    outputRows.push({
      role_bucket: roleBucket,
      step: 'followup_2',
      send_delay_days: '7',
      subject: `Bad idea to send a 1-page senior ${roleBucket} transition conversation flow for {company_name}?`,
      email_text: executiveFollowupBody(roleBucket, 'followup_2'),
      status: 'ready',
    })
    outputRows.push({
      role_bucket: roleBucket,
      step: 'followup_3',
      send_delay_days: '12',
      subject: `Bad idea to send a 1-page transition conversation flow for ${roleBucket} leaders at {company_name}?`,
      email_text: executiveFollowupBody(roleBucket, 'followup_3'),
      status: 'ready',
    })
  }
  const headers = ['role_bucket', 'step', 'send_delay_days', 'subject', 'email_text', 'status']
  const outPath = path.join(ROOT, 'docs', 'outreach', 'executive_role_followup_ladder.csv')
  await writeFile(outPath, toCsv(headers, outputRows), 'utf8')
  return { outFile: outPath, rows: outputRows.length }
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
  const ladder = await generateFollowupLadder(path.join('docs', 'outreach', 'role_bucket_email_body_blocks.csv'))
  results.executiveFollowupRows = ladder.rows
  results.executiveFollowupFile = ladder.outFile

  console.log('Council refinements complete:')
  console.log(`coaches_prospecting_100 updated rows: ${results.coaches100}`)
  console.log(`coaches_prospecting_curated_top25 updated rows: ${results.coaches25}`)
  console.log(`exec_coaches_full_batch_may2026 updated rows: ${results.execCoaches}`)
  console.log(`outplacement_firms_prospecting_100 updated rows: ${results.outplacement}`)
  console.log(`role_bucket_email_body_blocks updated rows: ${results.executiveBlocks}`)
  console.log(`executive send-ready templates: ${results.executiveSendReadyFile}`)
  console.log(`executive follow-up ladder rows: ${results.executiveFollowupRows}`)
  console.log(`executive follow-up ladder file: ${results.executiveFollowupFile}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
