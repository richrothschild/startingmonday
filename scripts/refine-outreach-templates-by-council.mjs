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
  if (f.includes('CFO') || f.includes('FINANCE')) return 'a board-ready finance narrative that compresses the first conversation into one clean point of view'
  if (f.includes('CTO') || f.includes('TECH')) return 'an architecture-to-business story that makes the technical scope obvious to non-technical decision-makers'
  if (f.includes('COO') || f.includes('OPER')) return 'an execution story that shows operating leverage instead of just describing responsibility'
  if (f.includes('CISO') || f.includes('SECUR')) return 'a risk narrative that translates security depth into trust, resilience, and business continuity'
  if (f.includes('CPO') || f.includes('PRODUCT')) return 'a product-to-growth narrative that shows customer impact and operating judgment together'
  if (f.includes('CHRO') || f.includes('PEOPLE')) return 'a change-leadership story that makes culture, talent, and operating cadence easy to trust'
  if (f.includes('CEO') || f.includes('BOARD')) return 'a board-readiness narrative that makes scope, governance, and strategic fit easy to see'
  if (f.includes('VP')) return 'a next-scope narrative that shows readiness for the bigger mandate without overexplaining the path'
  return 'a role-specific narrative that makes the next conversation easier to schedule and easier to trust'
}

function stakesLineForFocus(focus, company) {
  const f = (focus || '').toUpperCase()
  if (f.includes('CFO') || f.includes('FINANCE')) return `For ${focus} leaders at ${company}, the real risk is sounding competent but not board-ready when the first serious conversation starts.`
  if (f.includes('CTO') || f.includes('TECH')) return `For ${focus} leaders at ${company}, the real risk is being seen as technically strong but too abstract for a CEO, board, or investor audience.`
  if (f.includes('COO') || f.includes('OPER')) return `For ${focus} leaders at ${company}, the real risk is being known for execution without proving the scale and sequencing that the next role requires.`
  if (f.includes('CISO') || f.includes('SECUR')) return `For ${focus} leaders at ${company}, the real risk is having the right expertise but losing the room before the business impact lands.`
  if (f.includes('CPO') || f.includes('PRODUCT')) return `For ${focus} leaders at ${company}, the real risk is sounding product-savvy without tying that work to growth, customer insight, and operating discipline.`
  if (f.includes('CHRO') || f.includes('PEOPLE')) return `For ${focus} leaders at ${company}, the real risk is describing culture work in a way that feels soft instead of decisive.`
  if (f.includes('CEO') || f.includes('BOARD')) return `For ${focus} leaders at ${company}, the real risk is under-selling governance, scale, and decision quality in the first conversation.`
  if (f.includes('VP')) return `For ${focus} leaders at ${company}, the real risk is sounding ready for more scope without proving what changes at the higher level.`
  return `For ${focus} leaders at ${company}, the real risk is sounding credible in theory but not specific enough to move the conversation forward.`
}

function ctaVariants(audience) {
  return {
    sample: `If useful, I can send a one-page sample built around your ${audience} context.`,
    pilot: `If useful, I can share the 30-day benchmark sheet and walk you through a 20-minute pilot with 3 success criteria.`,
  }
}

function benchmarkAssetForFocus(focus) {
  const f = (focus || '').toUpperCase()
  if (f.includes('CFO') || f.includes('FINANCE')) return 'the CFO board-readiness scorecard'
  if (f.includes('CTO') || f.includes('TECH')) return 'the CTO architecture-to-business benchmark'
  if (f.includes('COO') || f.includes('OPER')) return 'the COO sequencing and operating cadence benchmark'
  if (f.includes('CISO') || f.includes('SECUR')) return 'the CISO risk narrative benchmark'
  if (f.includes('CPO') || f.includes('PRODUCT')) return 'the product leadership narrative benchmark'
  if (f.includes('CHRO') || f.includes('PEOPLE')) return 'the leadership-change benchmark'
  if (f.includes('CEO') || f.includes('BOARD')) return 'the board-readiness benchmark'
  if (f.includes('VP')) return 'the next-scope readiness benchmark'
  return 'the role-specific benchmark sheet'
}

function breakupHookForFocus(focus) {
  const f = (focus || '').toUpperCase()
  if (f.includes('CFO') || f.includes('FINANCE')) return 'how finance credibility becomes board-ready in the first conversation'
  if (f.includes('CTO') || f.includes('TECH')) return 'how technical depth becomes a business-facing narrative'
  if (f.includes('COO') || f.includes('OPER')) return 'how operating scale becomes a cleaner story of sequencing and leverage'
  if (f.includes('CISO') || f.includes('SECUR')) return 'how security depth becomes risk language a business leader can use'
  if (f.includes('CPO') || f.includes('PRODUCT')) return 'how product judgment becomes a growth story that does not sound fluffy'
  if (f.includes('CHRO') || f.includes('PEOPLE')) return 'how culture and change work become specific enough to move the process'
  if (f.includes('CEO') || f.includes('BOARD')) return 'how scope and governance become a board-ready opening narrative'
  if (f.includes('VP')) return 'how next-scope readiness becomes something concrete instead of aspirational'
  return 'how role depth becomes a clearer first conversation'
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
    stakesLineForFocus(focus, company),
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
    stakesLineForFocus(focus, company),
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
  const stakes = stakesLineForFocus(rb, '{company_name}')
  const cta = ctaVariants(rb)
  return [
    'Hi {first_name},',
    '',
    `I have been following your work at {company_name}, and I thought this might be useful for ${rb} transitions.`,
    '',
    'Starting Monday gives senior leaders a practical execution system: target company intelligence, role-specific prep briefs, and outreach workflows that improve signal quality in first-touch conversations.',
    '',
    stakes,
    '',
    `The clearest proof point for ${rb} leaders is ${proof}.`,
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
  const stakes = stakesLineForFocus(focus, '{company_name}')
  const cta = ctaVariants(focus)
  const benchmarkAsset = benchmarkAssetForFocus(focus)
  if (step === 'followup_1') {
    return [
      'Hi {first_name},',
      '',
      `I have been following your work at {company_name}, and I wanted to follow up on my earlier note about ${focus} transitions.`,
      '',
      stakes,
      '',
      `For ${focus} candidates, that is where ${proof} usually shows up in the first serious conversation.`,
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
      `I can also send ${benchmarkAsset} so you can see how the first week, first pitch, and first follow-up should look for this role.`,
      '',
      `For ${focus} leaders, that is where ${proof} becomes visible in a way that is hard to fake and easy to evaluate.`,
      '',
      `If useful, I can share ${benchmarkAsset} and walk you through a 20-minute pilot with 3 success criteria.`,
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
    `If timing is not right, no problem. If it is, I can send one concise example plus ${benchmarkAsset} so you can judge it quickly.`,
    '',
    `That is usually the cleanest way to show ${breakupHookForFocus(focus)} without overexplaining it.`,
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
