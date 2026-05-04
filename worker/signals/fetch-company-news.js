// Fetches recent news for a company.
// Uses GNews.io when GNEWS_API_KEY is set (structured JSON, targeted queries).
// Falls back to Google News RSS (no key required).
// Returns up to 8 articles: { title, link, pubDate, description }

export async function fetchCompanyNews(companyName) {
  return process.env.GNEWS_API_KEY
    ? fetchViaGNews(companyName)
    : fetchViaGoogleRss(companyName)
}

// ── GNews.io ──────────────────────────────────────────────────────────────────

async function fetchViaGNews(companyName) {
  const query = `"${companyName}" (funding OR acquisition OR "executive hire" OR "executive departure" OR expansion OR layoffs OR IPO OR "new product" OR award)`
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const params = new URLSearchParams({
    q:    query,
    lang: 'en',
    max:  '8',
    from,
    token: process.env.GNEWS_API_KEY,
  })

  let data
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/search?${params}`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      const { logger } = await import('../lib/logger.js')
      logger.warn('fetch-company-news: gnews non-200', { company: companyName, status: res.status, body: text.slice(0, 200) })
      return []
    }
    data = await res.json()
  } catch (err) {
    const { logger } = await import('../lib/logger.js')
    logger.warn('fetch-company-news: gnews fetch failed', { company: companyName, error: err.message })
    return []
  }

  return (data?.articles ?? []).map(article => ({
    title:       article.title,
    link:        article.url,
    pubDate:     article.publishedAt,
    description: article.description ?? '',
  }))
}

// ── Google News RSS fallback ──────────────────────────────────────────────────

async function fetchViaGoogleRss(companyName) {
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
