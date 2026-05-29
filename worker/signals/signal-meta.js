const FOCUS_BY_SIGNAL_TYPE = {
  funding: ['growth', 'operations'],
  exec_departure: ['leadership', 'governance'],
  exec_hire: ['leadership', 'operations'],
  acquisition: ['operations', 'growth'],
  expansion: ['growth', 'operations'],
  layoffs: ['restructuring', 'operations'],
  ipo: ['governance', 'growth'],
  new_product: ['product', 'growth'],
  award: ['growth'],
  breach_disclosure: ['security', 'compliance'],
  regulatory_change: ['compliance', 'governance'],
  data_platform: ['data', 'operations'],
  ai_investment: ['ai', 'data'],
  board_change: ['governance', 'leadership'],
  transformation_budget: ['operations', 'growth'],
  filing_trend: ['governance', 'leadership'],
  partnership: ['partnership', 'growth'],
}

const PARTNERSHIP_PATTERNS = [
  /(?:signed|announced|entered into)\s+(?:a\s+)?(?:strategic\s+)?(?:partnership|agreement|deal|alliance)\s+with\s+([A-Z][A-Za-z0-9&.,\- ]{1,80})/gi,
  /(?:selected|chooses?|chose|deploys?|implements?)\s+([A-Z][A-Za-z0-9&.,\- ]{1,80})\s+(?:as|for|to)\s+(?:its\s+)?(?:erp|platform|solution|stack)/gi,
  /(?:supplier|supply|supply agreement)\s+with\s+([A-Z][A-Za-z0-9&.,\- ]{1,80})/gi,
]

export function inferSourceKindFromUrl(url) {
  if (!url) return 'unknown'
  const lower = url.toLowerCase()
  if (lower.includes('sec.gov')) return 'sec_filing'
  if (lower.includes('prnewswire') || lower.includes('businesswire') || lower.includes('globenewswire')) return 'press_wire'
  if (lower.includes('bizjournals')) return 'business_journal'
  if (lower.includes('cio.com') || lower.includes('computerworld') || lower.includes('informationweek') || lower.includes('dive.com')) return 'trade_press'
  if (lower.includes('/press') || lower.includes('/newsroom') || lower.includes('/media')) return 'company_press_room'
  return 'news'
}

export function inferFocusTags(signalType, modelTags = []) {
  const base = FOCUS_BY_SIGNAL_TYPE[signalType] ?? []
  const merged = [...base, ...modelTags.map(t => String(t || '').toLowerCase())]
  return Array.from(new Set(merged)).filter(Boolean).slice(0, 3)
}

export function extractEvidenceSnippets(article = {}, modelSnippets = []) {
  const snippets = []
  const title = String(article.title || '').trim()
  const description = String(article.description || '').trim()
  if (title) snippets.push(title)
  if (description) snippets.push(description.slice(0, 220))
  for (const s of modelSnippets) {
    const value = String(s || '').trim()
    if (value) snippets.push(value.slice(0, 220))
  }
  return Array.from(new Set(snippets)).slice(0, 2)
}

export function extractPartnershipEntities(article = {}, modelPartners = []) {
  const text = `${String(article.title || '')} ${String(article.description || '')}`
  const entities = []

  for (const regex of PARTNERSHIP_PATTERNS) {
    regex.lastIndex = 0
    let match
    while ((match = regex.exec(text)) !== null) {
      const candidate = String(match[1] || '').trim().replace(/[\s,.]+$/, '')
      if (candidate && candidate.length >= 2 && candidate.length <= 80) {
        entities.push(candidate)
      }
      if (entities.length >= 3) break
    }
    if (entities.length >= 3) break
  }

  for (const p of modelPartners) {
    const candidate = String(p || '').trim()
    if (candidate) entities.push(candidate)
  }

  return Array.from(new Set(entities)).slice(0, 3)
}
