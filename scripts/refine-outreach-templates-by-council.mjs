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

function normalizeKey(k) {
  return String(k || '').replace(/^\uFEFF/, '').trim().toLowerCase()
}

function rowGet(row, keys) {
  const wanted = keys.map(k => normalizeKey(k))
  for (const [k, v] of Object.entries(row)) {
    if (wanted.includes(normalizeKey(k))) return v
  }
  return ''
}

function firstName(row) {
  const first = String(rowGet(row, ['first_name'])).trim()
  if (first) return first
  const full = String(rowGet(row, ['full_name'])).trim()
  return full ? full.split(/\s+/)[0] : 'there'
}

function companyName(row) {
  return (String(rowGet(row, ['company', 'Company Name'])) || 'your team').trim() || 'your team'
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

function microProofLine(channel, focus) {
  const f = (focus || '').toUpperCase()
  if (channel === 'coach') {
    if (f.includes('CEO') || f.includes('BOARD')) return 'In recent board-track coaching engagements, the strongest lift came when governance fit was stated explicitly in the opening two conversations.'
    if (f.includes('CFO') || f.includes('FINANCE')) return 'In recent finance-track transitions, response quality improved when candidates led with strategic capital judgment before technical detail.'
    if (f.includes('CTO') || f.includes('TECH')) return 'In recent technology-track transitions, interview progression improved when architecture work was translated into business risk and growth impact.'
    if (f.includes('COO') || f.includes('OPER')) return 'In recent operations-track transitions, progression improved when sequencing decisions were made explicit instead of implied.'
    return 'In recent executive coaching engagements, progression improved when first-touch messaging was rewritten for role-specific decision criteria.'
  }
  if (channel === 'outplacement') {
    if (f.includes('EXECUTIVE')) return 'In recent executive cohorts, qualified-conversation rate improved after first-touch narrative standards were normalized across coaches.'
    if (f.includes('CAREER') || f.includes('MOBILITY')) return 'In recent mobility programs, quality variance dropped when every participant used the same role-specific opening narrative framework.'
    if (f.includes('LEADERSHIP') || f.includes('TRANSITION')) return 'In recent transition programs, readiness improved when interview preparation and outreach language were measured against one shared benchmark.'
    return 'In recent outplacement cohorts, progression improved when candidate narratives were reviewed against a single measurable quality standard.'
  }
  if (f.includes('CFO') || f.includes('FINANCE')) return 'In recent CFO-track transitions, first conversations improved when board language and capital allocation logic were explicit from minute one.'
  if (f.includes('CTO') || f.includes('TECH')) return 'In recent CTO-track transitions, response quality improved when technical depth was translated into operating outcomes and decision impact.'
  if (f.includes('COO') || f.includes('OPER')) return 'In recent COO-track transitions, conversion improved when execution stories included sequencing decisions and operating leverage proof.'
  if (f.includes('CISO') || f.includes('SECUR')) return 'In recent CISO-track transitions, momentum improved when risk language was framed in business continuity and trust terms.'
  return 'In recent executive transitions, progression improved when role-specific narratives were tested and revised before high-stakes conversations.'
}

function costOfInactionLine(channel, focus) {
  if (channel === 'coach') {
    return `If this is ignored, the cost is usually another cycle of well-qualified clients getting filtered out because their first narrative is not decision-grade.`
  }
  if (channel === 'outplacement') {
    return `If this is ignored, the cost is usually program activity without qualified progression, which lowers confidence in cohort outcomes.`
  }
  return `If this is ignored, the cost is usually losing qualified opportunities before the role-fit conversation ever gets a fair read.`
}

function binaryCtaLine(asset, audience) {
  return `If useful, reply "send it" and I will send ${asset} for your ${audience}. If not relevant, reply "pass" and I will close this out.`
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

function coachStakesLineForFocus(focus, company) {
  const f = (focus || '').toUpperCase()
  if (f.includes('CEO') || f.includes('BOARD')) return `For ${focus} clients at ${company}, the failure mode is simple: they look accomplished, then lose momentum because governance and board-fit are not explicit in the first two conversations.`
  if (f.includes('CFO') || f.includes('FINANCE')) return `For ${focus} clients at ${company}, the failure mode is sounding financially credible but not investment-grade for board and CEO audiences.`
  if (f.includes('CTO') || f.includes('TECH')) return `For ${focus} clients at ${company}, the failure mode is deep technical credibility paired with weak business translation in first-touch conversations.`
  if (f.includes('COO') || f.includes('OPER')) return `For ${focus} clients at ${company}, the failure mode is being known as reliable operators without proving scale leverage for the next mandate.`
  return `For ${focus} clients at ${company}, the failure mode is looking qualified on paper but losing signal quality in live conversations.`
}

function coachProofPointForFocus(focus) {
  const f = (focus || '').toUpperCase()
  if (f.includes('CEO') || f.includes('BOARD')) return 'a board narrative that can be explained in one minute without hand-waving'
  if (f.includes('CFO') || f.includes('FINANCE')) return 'a finance-first narrative that reads as strategic judgment, not just stewardship'
  if (f.includes('CTO') || f.includes('TECH')) return 'a technical narrative that maps directly to revenue, risk, and execution outcomes'
  if (f.includes('COO') || f.includes('OPER')) return 'an operating narrative that proves sequencing, scale, and decision velocity'
  return 'a role narrative that survives hard follow-up questions without drifting into generic language'
}

function coachAssetForFocus(focus) {
  const f = (focus || '').toUpperCase()
  if (f.includes('CEO') || f.includes('BOARD')) return 'the board-readiness interview map'
  if (f.includes('CFO') || f.includes('FINANCE')) return 'the CFO investment-grade narrative sheet'
  if (f.includes('CTO') || f.includes('TECH')) return 'the CTO business-translation interview map'
  if (f.includes('COO') || f.includes('OPER')) return 'the COO sequencing and scale interview map'
  return 'the executive signal-quality interview map'
}

function outplacementStakesLine(focus, company) {
  const f = (focus || '').toUpperCase()
  const label = /programs?$/i.test(focus) ? focus : `${focus} programs`
  if (f.includes('EXECUTIVE')) return `For ${label} at ${company}, the failure mode is high candidate activity but low qualified progression because first-touch narratives are inconsistent.`
  if (f.includes('CAREER') || f.includes('MOBILITY')) return `For ${label} at ${company}, the failure mode is strong coaching effort with uneven narrative quality across cohorts.`
  if (f.includes('LEADERSHIP') || f.includes('TRANSITION')) return `For ${label} at ${company}, the failure mode is candidates moving fast but entering senior conversations underprepared.`
  return `For ${label} at ${company}, the failure mode is operational activity that does not convert into consistent executive-level conversation quality.`
}

function outplacementProofPoint(focus) {
  const f = (focus || '').toUpperCase()
  if (f.includes('EXECUTIVE')) return 'a consistent first-conversation standard across high-variance senior cohorts'
  if (f.includes('CAREER') || f.includes('MOBILITY')) return 'a cleaner narrative baseline that reduces coach-to-coach quality variance'
  if (f.includes('LEADERSHIP') || f.includes('TRANSITION')) return 'faster readiness for high-stakes conversations without adding coordinator overhead'
  return 'a measurable progression standard from targeting to first qualified conversation'
}

function outplacementAssetForFocus(focus) {
  const f = (focus || '').toUpperCase()
  if (f.includes('EXECUTIVE')) return 'the executive cohort progression benchmark'
  if (f.includes('CAREER') || f.includes('MOBILITY')) return 'the mobility cohort narrative benchmark'
  if (f.includes('LEADERSHIP') || f.includes('TRANSITION')) return 'the transition-readiness benchmark'
  return 'the program-level progression benchmark'
}

function coachBody(row) {
  const first = firstName(row)
  const company = companyName(row)
  const focus = focusText(row.persona_focus || row.role_bucket || row.title)
  const proof = coachProofPointForFocus(focus)
  const asset = coachAssetForFocus(focus)
  return [
    `Hi ${first},`,
    '',
    `I have been following your work at ${company}, and I thought this might be useful for the executives you support.`,
    '',
    'Starting Monday gives executive coaches a hard-edged execution layer: company targeting, interview narrative discipline, and outreach workflows that hold up under pressure.',
    '',
    coachStakesLineForFocus(focus, company),
    '',
    microProofLine('coach', focus),
    '',
    `The concrete proof point is ${proof}.`,
    '',
    costOfInactionLine('coach', focus),
    '',
    `If useful, I can send ${asset} so you can see exactly how it changes first-touch conversation quality.`,
    '',
    binaryCtaLine(asset, 'coach practice'),
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
  const proof = outplacementProofPoint(focus)
  const asset = outplacementAssetForFocus(focus)
  return [
    `Hi ${first},`,
    '',
    `I have been following your work at ${company}, and I thought this might be useful for your transition cohorts.`,
    '',
    'Starting Monday helps outplacement teams enforce one measurable execution standard across targeting, narrative quality, and first-conversation readiness.',
    '',
    outplacementStakesLine(focus, company),
    '',
    microProofLine('outplacement', focus),
    '',
    `The concrete proof point is ${proof}.`,
    '',
    costOfInactionLine('outplacement', focus),
    '',
    `For ${focusLabel}, the operating asset is ${asset}.`,
    '',
    binaryCtaLine(asset, 'transition cohort'),
    '',
    'Rich',
    'startingmonday.app',
  ].join('\n')
}

function subject(row) {
  return `Bad idea to send a 1-page executive transition conversation flow for ${companyName(row)}?`
}

function fillExecutivePlaceholders(template, row) {
  return template
    .replaceAll('{first_name}', firstName(row))
    .replaceAll('{company_name}', companyName(row))
}

function executiveSubjectForStep(roleBucket, company, step) {
  const rb = roleBucket || 'Executive'
  if (step === 'followup_2') return `Bad idea to send a 1-page senior ${rb} transition conversation flow for ${company}?`
  if (step === 'followup_3') return `Bad idea to send a 1-page transition conversation flow for ${rb} leaders at ${company}?`
  return `Bad idea to send a 1-page ${rb} transition conversation flow for ${company}?`
}

function isPersonRow(row) {
  const full = String(rowGet(row, ['full_name'])).trim()
  const first = String(rowGet(row, ['first_name'])).trim()
  const last = String(rowGet(row, ['last_name'])).trim()
  return Boolean(full || first || last)
}

function inferChannel(row, relPath) {
  const hint = `${rowGet(row, ['role_bucket']) || ''} ${rowGet(row, ['channel']) || ''} ${rowGet(row, ['persona_focus']) || ''} ${rowGet(row, ['title']) || ''} ${relPath}`.toUpperCase()
  if (hint.includes('COACH')) return 'coach'
  if (hint.includes('OUTPLACEMENT')) return 'outplacement'
  return 'executive'
}

function buildBodyAndSubject(row, relPath) {
  const channel = inferChannel(row, relPath)
  const rb = focusText(String(rowGet(row, ['role_bucket', 'persona_focus', 'title']) || 'Executive'))
  const company = companyName(row)
  const step = String(rowGet(row, ['step'])).trim().toLowerCase()

  if (channel === 'coach') {
    return { body: coachBody(row), subject: subject(row) }
  }

  if (channel === 'outplacement') {
    return { body: outplacementBody(row), subject: subject(row) }
  }

  if (step.startsWith('followup_')) {
    const body = fillExecutivePlaceholders(executiveFollowupBody(rb, step), row)
    return {
      body,
      subject: executiveSubjectForStep(rb, company, step),
    }
  }

  const body = fillExecutivePlaceholders(executiveBodyForRole(rb), row)
  return { body, subject: subject(row) }
}

async function updateGenericPersonFile(relPath) {
  const full = path.join(ROOT, relPath)
  const raw = await readFile(full, 'utf8')
  const { headers, rows } = parseCsv(raw)
  if (headers.length === 0 || rows.length === 0) return 0

  const hasAnySubjectCol = headers.some(h => normalizeKey(h).includes('subject'))
  const outHeaders = hasAnySubjectCol ? headers : [...headers, 'subject']

  let updated = 0
  for (const row of rows) {
    if (!isPersonRow(row)) continue
    const { body, subject: subj } = buildBodyAndSubject(row, relPath)

    if ('default_subject' in row) row.default_subject = subj
    if ('email_subject' in row) row.email_subject = subj
    if ('subject' in row) row.subject = subj
    if (!hasAnySubjectCol) row.subject = subj

    if ('default_body' in row) row.default_body = body
    if ('email_body' in row) row.email_body = body
    if ('email_text' in row) row.email_text = body
    if ('email_body_core' in row) row.email_body_core = body

    updated++
  }

  await writeFile(full, toCsv(outHeaders, rows), 'utf8')
  return updated
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
  const asset = benchmarkAssetForFocus(rb)
  return [
    'Hi {first_name},',
    '',
    `I have been following your work at {company_name}, and I thought this might be useful for ${rb} transitions.`,
    '',
    'Starting Monday gives senior leaders a practical execution system: target company intelligence, role-specific prep briefs, and outreach workflows that improve signal quality in first-touch conversations.',
    '',
    stakes,
    '',
    microProofLine('executive', rb),
    '',
    `The clearest proof point for ${rb} leaders is ${proof}.`,
    '',
    costOfInactionLine('executive', rb),
    '',
    `For ${rb} candidates, the biggest win is ${proof}.`,
    '',
    cta.sample,
    '',
    binaryCtaLine(asset, `${rb} transition context`),
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
      microProofLine('executive', focus),
      '',
      `For ${focus} candidates, that is where ${proof} usually shows up in the first serious conversation.`,
      '',
      costOfInactionLine('executive', focus),
      '',
      cta.sample,
      '',
      binaryCtaLine(benchmarkAsset, `${focus} transition context`),
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
      costOfInactionLine('executive', focus),
      '',
      binaryCtaLine(benchmarkAsset, `${focus} transition context`),
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
    costOfInactionLine('executive', focus),
    '',
    `That is usually the cleanest way to show ${breakupHookForFocus(focus)} without overexplaining it.`,
    '',
    binaryCtaLine(benchmarkAsset, `${focus} transition context`),
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

  // Normalize all remaining person-level files so every channel is on the latest format.
  const extraPersonFiles = [
    path.join('docs', 'outreach', 'search_firms_prospecting_100.csv'),
    path.join('docs', 'outreach', 'search_firms_prospecting_curated_top25.csv'),
    path.join('docs', 'outreach', 'apollo_priority_send_ready.csv'),
    path.join('docs', 'outreach', 'apollo_priority_followups.csv'),
    path.join('docs', 'outreach', 'send_ready_emails_first_10.csv'),
    path.join('docs', 'outreach', 'send_ready_followups_first_10.csv'),
    path.join('docs', 'outreach', 'prospecting_personalized_sample_10.csv'),
    path.join('docs', 'outreach', 'prospecting_batch_003_personalized_real_10.csv'),
    path.join('docs', 'outreach', 'prospecting_batch_004_personalized_real_19.csv'),
    path.join('docs', 'outreach', 'prospecting_combined_strict_21_personalized.csv'),
    path.join('docs', 'outreach', 'prospecting_combined_strict_31_personalized.csv'),
    path.join('docs', 'outreach', 'prospecting_combined_strict_50_personalized.csv'),
    path.join('docs', 'outreach', 'exec_coaches_batch_may2026_personalized.csv'),
  ]

  for (const file of extraPersonFiles) {
    try {
      const updated = await updateGenericPersonFile(file)
      results[file] = updated
    } catch (err) {
      // Keep generation resilient if an optional file is missing.
    }
  }

  console.log('Council refinements complete:')
  console.log(`coaches_prospecting_100 updated rows: ${results.coaches100}`)
  console.log(`coaches_prospecting_curated_top25 updated rows: ${results.coaches25}`)
  console.log(`exec_coaches_full_batch_may2026 updated rows: ${results.execCoaches}`)
  console.log(`outplacement_firms_prospecting_100 updated rows: ${results.outplacement}`)
  console.log(`role_bucket_email_body_blocks updated rows: ${results.executiveBlocks}`)
  console.log(`executive send-ready templates: ${results.executiveSendReadyFile}`)
  console.log(`executive follow-up ladder rows: ${results.executiveFollowupRows}`)
  console.log(`executive follow-up ladder file: ${results.executiveFollowupFile}`)
  for (const [k, v] of Object.entries(results)) {
    if (k.startsWith(path.join('docs', 'outreach'))) {
      console.log(`${k} updated rows: ${v}`)
    }
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
