import { readFileSync, writeFileSync } from 'fs'

// ── CSV parser (no external deps) ─────────────────────────────────────────
function parseCsv(text) {
  const rows = []
  let col = '', fields = [], inQuote = false
  const flush = () => { fields.push(col); col = '' }
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1]
    if (inQuote) {
      if (ch === '"' && next === '"') { col += '"'; i++ }
      else if (ch === '"') inQuote = false
      else col += ch
    } else {
      if (ch === '"') { inQuote = true }
      else if (ch === ',') flush()
      else if (ch === '\r' && next === '\n') { flush(); rows.push(fields); fields = []; i++ }
      else if (ch === '\n') { flush(); rows.push(fields); fields = [] }
      else col += ch
    }
  }
  flush(); if (fields.some(f => f)) rows.push(fields)
  const headers = rows[0]
  return rows.slice(1).map(r => Object.fromEntries(headers.map((h, i) => [h.trim(), (r[i] || '').trim()])))
}

function csvEscape(s) {
  const str = String(s || '').replace(/\r\n/g, ' ').replace(/\n/g, ' ')
  return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
}

// ── ICP Classification ─────────────────────────────────────────────────────
const SPORTS_ORGS = [
  'football', 'baseball', 'basketball', 'soccer', 'lacrosse', 'volleyball',
  'softball', 'wrestling', 'swimming', 'tennis', 'track', 'esports', 'athletic',
  'lafc', 'mls', 'nfl', 'nba', 'mlb', 'nhl', 'nwsl', 'usl',
  'city sc', 'city fc', 'united fc', 'united sc', 'galaxy', 'dynamo',
  'colorado rapids', 'sporting kc', 'new england revolution'
]

const GENUINE_T1_COMPANIES = [
  'vistage', 'right management', 'careerminds', 'bravanti', 'zrg',
  'challenger, gray', 'challenger gray', 'lee hecht', 'lhh', 'drake beam',
  'career partners', 'impact group', 'coachsource', 'betterup', 'bts ',
  'center for creative leadership', 'ccl', 'heidrick', 'korn ferry',
  'spencer stuart', 'egon zehnder', 'russell reynolds', 'dhrglobal',
  'caldwell', 'executive coach', 'c-suite coach', 'executive advisory',
  'leadership advisory', 'ceo advisory', 'outplacement', 'transition consulting'
]

const BIZ_SCHOOL_COMPANIES = [
  'harvard business', 'hbs', 'wharton', 'stanford gsb', 'booth school',
  'kellogg school', 'sloan school', 'columbia business', 'tuck school',
  'haas school', 'ross school', 'darden school', 'mcdonough school',
  'stern school', 'fuqua school', 'johnson school', 'mendoza college',
  'cox school', 'marshall school', 'kelley school', 'london business',
  'insead', 'imd', 'ie business', 'esade', 'mit sloan', 'chicago booth',
  'carnegie mellon tepper', 'yale school of management', 'anderson school'
]

function isSportsOrg(company, title) {
  const c = company.toLowerCase(), t = title.toLowerCase()
  for (const s of SPORTS_ORGS) {
    if (c.includes(s) || t.includes(s)) return true
  }
  return false
}

function classifyContact(row) {
  const title    = (row['Title'] || '').toLowerCase()
  const company  = (row['Company Name'] || '').toLowerCase()
  const keywords = (row['Keywords'] || '').toLowerCase()
  const seniority = (row['Seniority'] || '').toLowerCase()
  const emailStatus = (row['Email Status'] || '').toLowerCase()
  const catchAll = (row['Primary Email Catch-all Status'] || '').toLowerCase()
  const emailConf = parseFloat(row['Email Confidence'] || '1')
  const qualifyField = (row['Qualify Contact'] || '').toLowerCase()

  if (qualifyField === 'disqualified') return { tier: 'DISQUALIFIED', reason: 'Marked Disqualified in Apollo' }
  if (emailStatus === 'extrapolated' && emailConf < 0.75) return { tier: 'DISQUALIFIED', reason: `Extrapolated email, conf ${emailConf}` }

  // Wrong roles
  const wrongRoles = ['cheer coach','cheerleading','tight ends','offensive coord','defensive coord',
    'quarterback coach','wide receiver','running back','linebacker','secondary coach','special teams',
    'head coach','assistant coach','associate head coach','graduate assistant coach',
    'sports performance','strength and conditioning','athletic trainer',
    'swim coach','tennis coach','golf coach','lacrosse coach','baseball coach','softball coach',
    'basketball coach','football coach','soccer coach','volleyball coach','wrestling coach',
    'rowing coach','track coach','cross country coach','fencing coach',
    'teacher','professor','faculty','adjunct','lecturer','instructor',
    'principal','librarian','registrar','custodian','k-12','elementary','middle school']
  for (const p of wrongRoles) {
    if (title.includes(p)) return { tier: 'DISQUALIFIED', reason: `Wrong role: "${row['Title']}"` }
  }
  if (/\b(isd|unified school district|school district)\b/.test(company)) {
    return { tier: 'DISQUALIFIED', reason: `K-12 district: "${row['Company Name']}"` }
  }

  // TIER 1: explicit company or title match
  for (const p of GENUINE_T1_COMPANIES) {
    if (company.includes(p)) return { tier: 'TIER1', persona: companyPersona(row['Company Name']), reason: `T1 company: "${row['Company Name']}"` }
  }
  const t1Titles = ['executive coach','vistage chair','c-suite coach','ceo coach',
    'executive career coach','executive leadership coach','executive outplacement',
    'chief executive coach','senior executive coach','managing director',
    'leadership development coach','organizational development coach']
  for (const p of t1Titles) {
    if (title.includes(p)) return { tier: 'TIER1', persona: companyPersona(row['Company Name']), reason: `T1 title: "${row['Title']}"` }
  }

  // TIER 2: Business school
  for (const p of BIZ_SCHOOL_COMPANIES) {
    if (company.includes(p)) return { tier: 'TIER2', persona: 'BIZ_SCHOOL', reason: `Biz school: "${row['Company Name']}"` }
  }

  // TIER 3: General career/leadership coach (not sports, not K-12)
  const t3Titles = ['career coach','leadership coach','career counselor','career advisor',
    'career strategist','career consultant','career development','transition coach',
    'life coach','executive development','talent development','college and career',
    'career services']
  for (const p of t3Titles) {
    if (title.includes(p) && !isSportsOrg(company, title)) {
      return { tier: 'TIER3', persona: 'GENERAL_COACH', reason: `T3 title: "${row['Title']}"` }
    }
  }

  return { tier: 'UNQUALIFIED', reason: `No ICP match: "${row['Title']}" at "${row['Company Name']}"` }
}

function companyPersona(company) {
  const c = (company || '').toLowerCase()
  if (c.includes('vistage')) return 'VISTAGE'
  if (c.includes('right management')) return 'RIGHT_MGMT'
  if (c.includes('careerminds')) return 'CAREERMINDS'
  if (c.includes('bravanti') || c.includes('zrg')) return 'BRAVANTI_ZRG'
  if (c.includes('challenger')) return 'CHALLENGER'
  if (c.includes('betterup')) return 'BETTERUP'
  if (c.includes('center for creative leadership') || c.includes('ccl')) return 'CCL'
  if (c.includes('heidrick')) return 'HEIDRICK'
  if (c.includes('korn ferry')) return 'KORN_FERRY'
  if (c.includes('spencer stuart')) return 'SPENCER_STUART'
  if (c.includes('impact group')) return 'IMPACT_GROUP'
  if (c.includes('coachsource')) return 'COACHSOURCE'
  if (c.includes('lee hecht') || c.includes('lhh')) return 'LHH'
  return 'EXEC_COACH_GENERAL'
}

function emailQuality(row) {
  const status = (row['Email Status'] || '').toLowerCase()
  const catchAll = (row['Primary Email Catch-all Status'] || '').toLowerCase()
  if (status === 'verified' && catchAll === 'not catch-all') return 'HIGH'
  if (status === 'verified' && catchAll === '') return 'HIGH'
  if (status === 'verified' && catchAll === 'catch-all') return 'MEDIUM'
  if (status === 'extrapolated') return 'LOW'
  return 'MEDIUM'
}

// ── Email templates by persona ─────────────────────────────────────────────
// Council standard: Voss (label their world, tactical empathy, no desperation)
//                   Cialdini (social proof, authority, liking, reciprocity)
//                   Horstman (one ask, no filler, specific CTA, manager-practical)

function buildEmail(row, tier, persona) {
  const first = row['First Name'] || 'there'
  const company = row['Company Name'] || ''
  const title = row['Title'] || ''
  const city = row['City'] || ''

  const templates = {

    VISTAGE: {
      subject: `One question about your executive transition clients`,
      body: `Your Vistage work puts you in rooms where CEOs are deciding what comes next. I imagine you hear those conversations before anyone formal does.

I built Starting Monday for exactly that moment — the senior executive who has decided to move but doesn't yet have the infrastructure to run a serious search. It handles target company intelligence, interview prep briefs, and outreach strategy so the operational work your member is already doing with you translates into action.

Executive coaches across multiple programs use it as a referral resource when clients are ready to go active. Starting Monday handles the execution layer while the coach stays at the strategic level. It costs less than one coaching session per month.

If that referral fit sounds useful for your practice, I'd welcome a 20-minute call. No pitch — just the product.`
    },

    RIGHT_MGMT: {
      subject: `A tool worth a look for your executive transition clients`,
      body: `Right Management works with executives at real inflection points — people who need more than a resume refresh.

Starting Monday is built for that level: VP and C-suite candidates who need target company intelligence, interview prep briefs calibrated to specific roles, and outreach that reflects their seniority. It's the operational infrastructure that separates a serious executive search from a passive one.

I'm not asking you to change your methodology. I'm asking whether there's a fit for clients who need a structured tool running alongside your coaching work. Happy to walk you through a live brief in 20 minutes so you can judge it on substance.`
    },

    CAREERMINDS: {
      subject: `A tool worth a look for your executive search clients`,
      body: `You've seen more executive job searches than most coaches — which means you know exactly where senior candidates lose time and momentum.

Starting Monday addresses the operational layer most executives don't handle well: target company intelligence, tailored interview prep briefs, and outreach that doesn't read like a template. It's built specifically for VP and C-suite candidates, not generalist job seekers.

I'm not asking you to change what you do. I'm asking whether there's a referral or integration that makes sense for your practice or your Careerminds clients. Happy to show you a live brief in 20 minutes so you can judge it on substance.`
    },

    BRAVANTI_ZRG: {
      subject: `For coaches supporting executives in active transition`,
      body: `BRAVANTI's executive transition work sits at the most critical stage of a senior leader's career. The candidates you support need more than positioning — they need a structured way to run the operational side of a serious search.

Starting Monday provides exactly that: target company intelligence, interview prep briefs calibrated to specific roles, and outreach strategy that reflects C-suite seniority. Executive coaches across multiple programs use it as a referral tool alongside their one-on-one work — the platform handles the execution layer so the coaching conversation stays at the strategic level.

If you have clients currently in active search, I'd welcome a 20-minute walkthrough so you can decide whether it belongs in your toolkit.`
    },

    CHALLENGER: {
      subject: `A targeted tool for your executive-level outplacement clients`,
      body: `Challenger, Gray & Christmas works with executives who need their search to run like a professional operation — not a job board exercise.

Starting Monday is built for that standard: target company intelligence, role-specific interview prep briefs, and outreach that reflects VP and C-suite seniority. It gives the candidate the same quality of preparation infrastructure a retained search firm provides — on the candidate side.

Leading outplacement coaches use it as a resource alongside their direct work — the client runs the operational layer on Starting Monday while the coach focuses on strategy and mindset. If that model sounds relevant for your practice, I'd welcome a 20-minute walkthrough.`
    },

    BETTERUP: {
      subject: `A resource for BetterUp coaches supporting executives in transition`,
      body: `BetterUp's coaching model puts you in direct contact with senior leaders at pivotal career moments — including executives who are quietly evaluating what comes next.

Starting Monday is built for that moment: VP and C-suite candidates who need target company intelligence, tailored interview prep briefs, and outreach strategy before they go public with a search. It's structured, private, and designed to run alongside coaching — not replace it.

If executive career transitions are part of your practice, I'd welcome a 15-minute call to show you how executive coaches across multiple programs are using it.`
    },

    CCL: {
      subject: `For coaches working with executives in leadership transition`,
      body: `The Center for Creative Leadership works with senior leaders at exactly the moments when career direction becomes a live question — not hypothetical.

Starting Monday is built for that intersection: VP and C-suite leaders who need structured support for an executive search. Target company intelligence, interview prep briefs calibrated to the role and the organization, outreach strategy that doesn't read like a template.

Leadership coaches across multiple programs use it as a referral resource for clients who are ready to go active. If that profile matches any of the leaders you work with, I'd welcome a 20-minute walkthrough.`
    },

    HEIDRICK: {
      subject: `A candidate-side resource worth knowing about`,
      body: `Heidrick's work sits at the most selective tier of leadership transitions. The executives you work with expect preparation that matches that standard.

Starting Monday provides the candidate-side infrastructure: target company intelligence, role-specific interview prep briefs, and outreach strategy calibrated to C-suite seniority. It's what the best-prepared candidates are using before they ever engage with a search firm.

If you advise senior candidates or work with executives preparing for high-stakes searches, I'd welcome a 20-minute walkthrough.`
    },

    KORN_FERRY: {
      subject: `A preparation resource for the executives you advise`,
      body: `Korn Ferry's leadership advisory practice works with the executives who need to be best prepared — not just competitive.

Starting Monday provides the operational layer: target company intelligence, interview prep briefs that go beyond generic frameworks, and outreach strategy built for VP and C-suite seniority. It's the structured preparation infrastructure that separates a serious search from a reactive one.

If this is relevant for executives in your practice or pipeline, I'd welcome a 20-minute walkthrough so you can evaluate it directly.`
    },

    SPENCER_STUART: {
      subject: `A preparation resource for the executives you advise`,
      body: `Spencer Stuart's work with senior leaders sits at the point where preparation quality matters most.

Starting Monday is the operational infrastructure for that preparation: target company intelligence, role-specific interview prep briefs, and outreach strategy that reflects C-suite seniority and board-level stakes. Executive coaches and advisors across multiple programs use it as a referral resource for candidates preparing for senior searches.

If you advise executives at that level, I'd welcome a 20-minute walkthrough to show you what it looks like in practice.`
    },

    IMPACT_GROUP: {
      subject: `A tool built for the executives in your transition practice`,
      body: `IMPACT Group's executive transition work is built around serious candidates who need more than encouragement — they need execution infrastructure.

Starting Monday provides exactly that: target company intelligence, interview prep briefs calibrated to specific roles, and outreach strategy for VP and C-suite candidates. It runs alongside coaching, not instead of it — the client handles the operational layer on Starting Monday while the coach focuses on strategy and positioning.

If you have clients in active or near-term transition, I'd welcome a 20-minute walkthrough.`
    },

    COACHSOURCE: {
      subject: `For coaches whose clients are quietly weighing a move`,
      body: `CoachSource coaches often work with executives at inflection points — including those who are starting to ask what comes next, privately, before anything is official.

Starting Monday is built for exactly that stage: structured target company intelligence, role-specific interview prep briefs, and outreach strategy for VP and C-suite candidates who haven't gone public yet. It costs less than one coaching session per month and runs alongside your work, not instead of it.

If any of your clients fit that profile, I'd welcome a 15-minute call to show you how executive coaches across multiple programs are using it.`
    },

    LHH: {
      subject: `A targeted resource for your executive-level outplacement clients`,
      body: `LHH works with executives at the most consequential career transitions of their lives — moments when preparation quality determines outcomes.

Starting Monday is built for that tier: target company intelligence, role-specific interview prep briefs, and outreach strategy that reflects VP and C-suite seniority. Leading outplacement coaches use it as a referral resource — the platform handles the execution layer while the coach focuses on the strategic and personal work.

If you have clients in executive-level transition, I'd welcome a 20-minute walkthrough to show you how it works in practice.`
    },

    EXEC_COACH_GENERAL: {
      subject: `A resource for executives you're coaching through a search`,
      body: `Executive coaches who work with leaders in transition know the operational side of a search is where most candidates underinvest.

Starting Monday closes that gap for VP and C-suite candidates: target company intelligence, interview prep briefs calibrated to specific roles and organizations, and outreach strategy that reflects senior seniority. It runs alongside coaching — the client handles the structured execution work on Starting Monday while coaching conversations stay at the strategic level.

If you have clients actively exploring their next move, I'd welcome a 20-minute walkthrough so you can see whether it fits your practice.`
    },

    BIZ_SCHOOL: {
      subject: `Built for the caliber of executive your program produces`,
      body: `${company} works with professionals who expect their search infrastructure to match their academic credentials.

Starting Monday is built for that standard: target company intelligence, interview prep briefs calibrated to specific roles, and outreach strategy for VP and C-suite candidates. The gap I see consistently is that even strong candidates underinvest in preparation infrastructure — this is designed to close it without requiring a coach to add work.

Executive coaches across multiple programs use it as a referral resource when clients are ready to go active. If it looks relevant for the executives you support${city ? ` in ${city}` : ''}, I'd welcome a 20-minute walkthrough.`
    },

    GENERAL_COACH: {
      subject: `A tool for the executives in your coaching practice`,
      body: `Career coaches who work with senior professionals know the operational side of a search is where momentum stalls.

Starting Monday is built for VP and C-suite candidates: structured target company intelligence, interview prep briefs tailored to specific roles, and outreach strategy that doesn't read like a template. It's the infrastructure gap between good coaching and a search that actually moves.

Executive coaches across multiple programs use it as a referral resource — they introduce it when a client is ready to go active and Starting Monday handles the operational layer so coaching conversations stay strategic. If that model fits any of your current clients, I'd welcome a 15-minute call.`
    },
  }

  const t = templates[persona] || templates.EXEC_COACH_GENERAL
  const greeting = `Hi ${first},\n\n`
  const signature = `\n\nBest,\nRich Rothschild\nStartingMonday.app`
  return {
    subject: t.subject,
    body: greeting + t.body + signature
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
const FILES = [
  'C:\\Users\\roths\\Downloads\\StartingMonday\\Exec coaches lists\\apollo-contacts-export.5.20.26.1.csv',
  'C:\\Users\\roths\\Downloads\\StartingMonday\\Exec coaches lists\\apollo-contacts-export.5.20.26.2.csv',
  'C:\\Users\\roths\\Downloads\\StartingMonday\\Exec coaches lists\\apollo-contacts-export.5.20.26.3.csv',
  'C:\\Users\\roths\\Downloads\\StartingMonday\\Exec coaches lists\\apollo-contacts-export.5.20.26.4.csv',
]

const allRows = []
const seenEmails = new Set()

for (const file of FILES) {
  const rows = parseCsv(readFileSync(file, 'utf8'))
  for (const row of rows) {
    const email = (row['Email'] || '').toLowerCase().trim()
    if (!email || seenEmails.has(email)) continue
    seenEmails.add(email)
    allRows.push(row)
  }
}

// Classify and collect qualified contacts
const qualified = []
const stats = { TIER1: 0, TIER2: 0, TIER3: 0, UNQUALIFIED: 0, DISQUALIFIED: 0 }

for (const row of allRows) {
  const result = classifyContact(row)
  const { tier } = result
  stats[tier] = (stats[tier] || 0) + 1

  if (tier === 'TIER1' || tier === 'TIER2' || tier === 'TIER3') {
    const persona = result.persona || 'EXEC_COACH_GENERAL'
    const eq = emailQuality(row)
    // Only include HIGH and MEDIUM email quality
    if (eq === 'LOW') continue
    const { subject, body } = buildEmail(row, tier, persona)
    qualified.push({ row, tier, persona, eq, subject, body, reason: result.reason })
  }
}

// Write output CSV
const outFile = 'C:\\Users\\roths\\startingmonday\\docs\\outreach\\exec_coaches_full_batch_may2026.csv'
const headers = [
  'first_name','last_name','full_name','email','email_quality','title','company',
  'city','state','linkedin_url','tier','persona','classification_reason',
  'email_subject','email_body','status'
]

const csvLines = [headers.join(',')]
for (const { row, tier, persona, eq, subject, body, reason } of qualified) {
  const fields = [
    row['First Name'],
    row['Last Name'],
    `${row['First Name']} ${row['Last Name']}`,
    row['Email'],
    eq,
    row['Title'],
    row['Company Name'],
    row['City'],
    row['State'],
    row['Person Linkedin Url'],
    tier,
    persona,
    reason,
    subject,
    body,
    'new'
  ]
  csvLines.push(fields.map(csvEscape).join(','))
}

writeFileSync(outFile, csvLines.join('\r\n'), 'utf8')

console.log('\n========================================')
console.log('  EMAIL GENERATION COMPLETE')
console.log('========================================')
console.log(`Total unique contacts processed: ${allRows.length}`)
console.log()
console.log('Classification breakdown:')
for (const [tier, count] of Object.entries(stats)) {
  console.log(`  ${tier.padEnd(15)} ${count}`)
}
console.log()
console.log(`Qualified contacts with emails generated: ${qualified.length}`)
const highCount = qualified.filter(q => q.eq === 'HIGH').length
const medCount  = qualified.filter(q => q.eq === 'MEDIUM').length
console.log(`  HIGH email quality:   ${highCount}`)
console.log(`  MEDIUM email quality: ${medCount}`)
console.log()
console.log('Persona breakdown (Tier 1+2):')
const personaCounts = {}
for (const q of qualified.filter(q => q.tier !== 'TIER3')) {
  personaCounts[q.persona] = (personaCounts[q.persona] || 0) + 1
}
for (const [p, c] of Object.entries(personaCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${p.padEnd(25)} ${c}`)
}
console.log()
console.log(`Output: ${outFile}`)
