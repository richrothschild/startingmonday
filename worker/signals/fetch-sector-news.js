// Fetches recent news about executive appointments in a role type's sector.
// Used by industry-pulse-job to gather raw material for sector intelligence bullets.

const ROLE_TITLE_QUERIES = {
  cio:          '"chief information officer" OR "CIO"',
  cto:          '"chief technology officer" OR "CTO"',
  cdo_data:     '"chief data officer" OR "chief analytics officer" OR "head of data"',
  cdo_digital:  '"chief digital officer" OR "chief transformation officer"',
  ciso:         '"chief information security officer" OR "CISO"',
  cpo:          '"chief product officer" OR "CPO" OR "head of product"',
  coo:          '"chief operating officer" OR "COO"',
  vp_technology:'"VP of Technology" OR "VP Technology" OR "SVP Technology" OR "head of technology"',
}

const ACTION_TERMS = 'appointed OR named OR hired OR "joins as" OR "announced as"'

export async function fetchSectorNews(roleType, sectors = []) {
  const roleQuery = ROLE_TITLE_QUERIES[roleType] ?? '"executive" OR "C-suite"'
  const sectorPart = sectors.length > 0
    ? ` AND (${sectors.map(s => `"${s}"`).join(' OR ')})`
    : ''
  const terms = `(${roleQuery}) AND (${ACTION_TERMS})${sectorPart}`
  const query = encodeURIComponent(terms)
  const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StartingMondayBot/1.0)' },
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return []
    const xml = await res.text()
    return parseRssItems(xml).slice(0, 12)
  } catch {
    return []
  }
}

function parseRssItems(xml) {
  const items = []
  const blocks = xml.split('<item>').slice(1)
  for (const block of blocks) {
    const end = block.indexOf('</item>')
    const content = end > -1 ? block.slice(0, end) : block
    const title       = extractCdata(content, 'title')       || extractTag(content, 'title')
    const link        = extractTag(content, 'link')          || extractTag(content, 'guid')
    const pubDate     = extractTag(content, 'pubDate')
    const description = extractCdata(content, 'description') || extractTag(content, 'description')
    if (title && link) items.push({ title, link, pubDate, description })
  }
  return items
}

function extractCdata(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, 'i'))
  return m?.[1]?.trim() ?? ''
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]+)<\\/${tag}>`, 'i'))
  return m?.[1]?.trim() ?? ''
}
