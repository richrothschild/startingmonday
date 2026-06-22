import { readFileSync } from 'fs'

// Minimal RFC-4180 CSV parser (no external deps)
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

function parse(text) { return parseCsv(text) }

const FILES = [
  'C:\\Users\\roths\\Downloads\\StartingMonday\\Exec coaches lists\\apollo-contacts-export.5.20.26.1.csv',
  'C:\\Users\\roths\\Downloads\\StartingMonday\\Exec coaches lists\\apollo-contacts-export.5.20.26.2.csv',
  'C:\\Users\\roths\\Downloads\\StartingMonday\\Exec coaches lists\\apollo-contacts-export.5.20.26.3.csv',
  'C:\\Users\\roths\\Downloads\\StartingMonday\\Exec coaches lists\\apollo-contacts-export.5.20.26.4.csv',
]

// ICP scoring logic
function classifyContact(row) {
  const title = (row['Title'] || '').toLowerCase()
  const company = (row['Company Name'] || '').toLowerCase()
  const industry = (row['Industry'] || '').toLowerCase()
  const keywords = (row['Keywords'] || '').toLowerCase()
  const subdept = (row['Sub Departments'] || '').toLowerCase()
  const seniority = (row['Seniority'] || '').toLowerCase()
  const emailStatus = (row['Email Status'] || '').toLowerCase()
  const emailConf = parseFloat(row['Email Confidence'] || '1')
  const qualifyField = (row['Qualify Contact'] || '').toLowerCase()

  // Hard disqualifiers
  if (qualifyField === 'disqualified') return { tier: 'DISQUALIFIED', reason: 'Marked Disqualified in Apollo' }
  if (emailStatus === 'extrapolated' && emailConf < 0.75) return { tier: 'DISQUALIFIED', reason: `Extrapolated email, low confidence (${emailConf})` }

  // Wrong role signals
  const wrongRolePhrases = [
    'cheer coach', 'cheerleading', 'football coach', 'basketball coach',
    'baseball coach', 'soccer coach', 'lacrosse coach', 'wrestling coach',
    'swim coach', 'track coach', 'tennis coach', 'volleyball coach',
    'softball coach', 'cross country', 'tight ends', 'offensive coordinator',
    'defensive coordinator', 'athletic director', 'sports performance',
    'teacher', 'professor', 'faculty', 'adjunct', 'lecturer', 'instructor',
    'k-12', 'elementary', 'middle school', 'high school', 'principal',
    'librarian', 'custodian', 'administrator', 'registrar'
  ]
  for (const phrase of wrongRolePhrases) {
    if (title.includes(phrase)) return { tier: 'DISQUALIFIED', reason: `Wrong role: "${row['Title']}"` }
  }

  // Wrong company type
  const wrongCompanyPhrases = ['isd', 'unified school', 'school district', 'k-12', 'elementary school', 'middle school', 'high school']
  for (const phrase of wrongCompanyPhrases) {
    if (company.includes(phrase)) return { tier: 'DISQUALIFIED', reason: `Wrong company type: "${row['Company Name']}"` }
  }

  // TIER 1: Premium executive coaching / outplacement ICP
  const tier1TitlePhrases = [
    'executive coach', 'vistage chair', 'c-suite coach', 'ceo coach',
    'executive career coach', 'chief executive coach', 'executive leadership coach',
    'executive outplacement', 'retained executive', 'managing director',
    'partner', 'principal', 'vistage'
  ]
  const tier1CompanyPhrases = [
    'vistage', 'careerminds', 'right management', 'lee hecht', 'lhh',
    'challenger gray', 'drake beam', 'career partners', 'heidrick',
    'korn ferry', 'spencer stuart', 'egon zehnder', 'russell reynolds',
    'executive coach', 'ceo advisory', 'ceo peer', 'executive advisory',
    'executive transition', 'outplacement', 'c-suite'
  ]
  for (const phrase of tier1TitlePhrases) {
    if (title.includes(phrase)) return { tier: 'TIER1_EXEC_COACH', reason: `Title match: "${row['Title']}"` }
  }
  for (const phrase of tier1CompanyPhrases) {
    if (company.includes(phrase)) return { tier: 'TIER1_EXEC_COACH', reason: `Company match: "${row['Company Name']}"` }
  }
  if (seniority === 'head' && (title.includes('coach') || keywords.includes('executive coaching'))) {
    return { tier: 'TIER1_EXEC_COACH', reason: `Head seniority + coaching role` }
  }

  // TIER 2: Business school / MBA career coaches (work with executives)
  const tier2Companies = [
    'harvard business', 'hbs', 'wharton', 'stanford gsb', 'booth',
    'kellogg', 'sloan', 'columbia business', 'tuck', 'haas', 'ross',
    'darden', 'mcdonough', 'stern', 'fuqua', 'johnson', 'mendoza',
    'cox school', 'marshall school', 'kelley school', 'london business',
    'insead', 'imd', 'ie business', 'esade'
  ]
  for (const phrase of tier2Companies) {
    if (company.includes(phrase)) return { tier: 'TIER2_BIZ_SCHOOL', reason: `Business school: "${row['Company Name']}"` }
  }
  if (title.includes('career coach') && (company.includes('university') || company.includes('college')) && keywords.includes('mba')) {
    return { tier: 'TIER2_BIZ_SCHOOL', reason: `MBA career coach at university` }
  }

  // TIER 3: General career coach / leadership coach (may work with senior professionals)
  const tier3TitlePhrases = [
    'career coach', 'leadership coach', 'career counselor', 'career advisor',
    'career strategist', 'career consultant', 'life coach', 'transition coach',
    'executive development', 'talent development', 'organizational development'
  ]
  for (const phrase of tier3TitlePhrases) {
    if (title.includes(phrase)) return { tier: 'TIER3_CAREER_COACH', reason: `Title: "${row['Title']}"` }
  }
  if (subdept.includes('learning') || subdept.includes('organizational development') || subdept.includes('talent')) {
    if (title.includes('coach') || title.includes('advisor') || title.includes('consultant')) {
      return { tier: 'TIER3_CAREER_COACH', reason: `L&D/OD sub-dept + coaching role` }
    }
  }

  // TIER 4: Academic career services (undergrad/grad, occasional senior exec contact)
  if ((title.includes('career') || title.includes('coach')) && 
      (industry.includes('higher education') || company.includes('university') || company.includes('college'))) {
    return { tier: 'TIER4_ACADEMIC_CAREER', reason: `Academic career services: "${row['Title']}" at "${row['Company Name']}"` }
  }

  return { tier: 'UNCLASSIFIED', reason: `No matching ICP signals: "${row['Title']}" at "${row['Company Name']}"` }
}

function emailQuality(row) {
  const status = (row['Email Status'] || '').toLowerCase()
  const catchAll = (row['Primary Email Catch-all Status'] || '').toLowerCase()
  if (status === 'verified' && catchAll === 'not catch-all') return 'HIGH'
  if (status === 'verified' && catchAll === '') return 'HIGH'
  if (status === 'verified' && catchAll === 'catch-all') return 'MEDIUM'
  if (status === 'extrapolated') return 'LOW'
  return 'UNKNOWN'
}

// Load and parse all files
const allRows = []
const seenEmails = new Set()
let dupeCount = 0

for (const file of FILES) {
  const raw = readFileSync(file, 'utf8')
  const rows = parse(raw)
  for (const row of rows) {
    const email = (row['Email'] || '').toLowerCase().trim()
    if (email && seenEmails.has(email)) {
      dupeCount++
      continue
    }
    if (email) seenEmails.add(email)
    allRows.push(row)
  }
}

// Classify
const tiers = { TIER1_EXEC_COACH: [], TIER2_BIZ_SCHOOL: [], TIER3_CAREER_COACH: [], TIER4_ACADEMIC_CAREER: [], DISQUALIFIED: [], UNCLASSIFIED: [] }
for (const row of allRows) {
  const { tier, reason } = classifyContact(row)
  tiers[tier].push({ row, reason })
}

// Summary output
console.log('\n========================================')
console.log('  COACH CONTACTS — ICP TIER ANALYSIS')
console.log('========================================')
console.log(`Total raw rows across 4 files: ${allRows.length + dupeCount}`)
console.log(`Duplicates removed (by email):  ${dupeCount}`)
console.log(`Unique contacts analyzed:        ${allRows.length}`)
console.log()

const tierLabels = {
  TIER1_EXEC_COACH:     'TIER 1 — Executive Coach / Outplacement (Top ICP)',
  TIER2_BIZ_SCHOOL:     'TIER 2 — Business School Career Coach (MBA/Exec Ed)',
  TIER3_CAREER_COACH:   'TIER 3 — Career / Leadership Coach (General)',
  TIER4_ACADEMIC_CAREER:'TIER 4 — Academic Career Services (Undergrad/Grad)',
  DISQUALIFIED:         'DISQUALIFIED — Wrong role, flagged, or low confidence',
  UNCLASSIFIED:         'UNCLASSIFIED — No ICP signal match',
}

for (const [tier, contacts] of Object.entries(tiers)) {
  console.log(`${tierLabels[tier]}`)
  console.log(`  Count: ${contacts.length}`)

  // Email quality breakdown for qualified tiers
  if (tier !== 'DISQUALIFIED' && tier !== 'UNCLASSIFIED') {
    const highEmail = contacts.filter(c => emailQuality(c.row) === 'HIGH').length
    const medEmail  = contacts.filter(c => emailQuality(c.row) === 'MEDIUM').length
    const lowEmail  = contacts.filter(c => emailQuality(c.row) === 'LOW').length
    console.log(`  Email quality → HIGH: ${highEmail}  MEDIUM: ${medEmail}  LOW: ${lowEmail}`)
  }

  // Sample names
  const sample = contacts.slice(0, 5).map(c => `${c.row['First Name']} ${c.row['Last Name']} (${c.row['Title']}, ${c.row['Company Name']}) [${c.reason}]`)
  if (sample.length > 0) {
    console.log('  Sample:')
    for (const s of sample) console.log(`    • ${s}`)
  }
  console.log()
}

// Top companies in Tier 1
console.log('--- TOP COMPANIES IN TIER 1 ---')
const tier1Companies = {}
for (const { row } of tiers.TIER1_EXEC_COACH) {
  const co = row['Company Name'] || 'Unknown'
  tier1Companies[co] = (tier1Companies[co] || 0) + 1
}
const sorted = Object.entries(tier1Companies).sort((a, b) => b[1] - a[1]).slice(0, 20)
for (const [co, count] of sorted) console.log(`  ${count.toString().padStart(3)}  ${co}`)

console.log('\n--- TOP DISQUALIFIED REASONS ---')
const dqReasons = {}
for (const { reason } of tiers.DISQUALIFIED) {
  const key = reason.split(':')[0]
  dqReasons[key] = (dqReasons[key] || 0) + 1
}
for (const [reason, count] of Object.entries(dqReasons).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${count.toString().padStart(3)}  ${reason}`)
}
