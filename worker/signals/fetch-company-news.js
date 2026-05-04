// Fetches recent news for a company via Google News RSS (no API key required).
// Returns up to 8 articles: { title, link, pubDate, description }
export async function fetchCompanyNews(companyName) {
  const terms = `"${companyName}" (funding OR acquisition OR executive OR expansion OR layoffs OR IPO OR "going public" OR "new product")`
  const query = encodeURIComponent(terms)
  const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`

  let xml
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StartingMondayBot/1.0)' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    xml = await res.text()
  } catch {
    return []
  }

  return parseRssItems(xml).slice(0, 8)
}

function parseRssItems(xml) {
  const items = []
  const blocks = xml.split('<item>').slice(1)
  for (const block of blocks) {
    const end = block.indexOf('</item>')
    const content = end > -1 ? block.slice(0, end) : block
    const title = extractCdata(content, 'title') || extractTag(content, 'title')
    const link  = extractTag(content, 'link')   || extractTag(content, 'guid')
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
