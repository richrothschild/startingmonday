// Fetches recent news for a company.
// Uses Bing News Search API when BING_NEWS_API_KEY is set (structured JSON,
// targeted queries). Falls back to Google News RSS (no key required).
// Returns up to 8 articles: { title, link, pubDate, description }

export async function fetchCompanyNews(companyName) {
  return process.env.BING_NEWS_API_KEY
    ? fetchViaBing(companyName)
    : fetchViaGoogleRss(companyName)
}

// ── Bing News Search API v7 ───────────────────────────────────────────────────

async function fetchViaBing(companyName) {
  const query = `"${companyName}" (funding OR acquisition OR "executive hire" OR "executive departure" OR expansion OR layoffs OR IPO OR "new product" OR award)`
  const params = new URLSearchParams({
    q:        query,
    count:    '8',
    freshness: 'Month',
    mkt:      'en-US',
    textDecorations: 'false',
    textFormat: 'Raw',
  })

  let data
  try {
    const res = await fetch(
      `https://api.bing.microsoft.com/v7.0/news/search?${params}`,
      {
        headers: { 'Ocp-Apim-Subscription-Key': process.env.BING_NEWS_API_KEY },
        signal: AbortSignal.timeout(10000),
      }
    )
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      const { logger } = await import('../lib/logger.js')
      logger.warn('fetch-company-news: bing non-200', { company: companyName, status: res.status, body: text.slice(0, 200) })
      return []
    }
    data = await res.json()
  } catch (err) {
    const { logger } = await import('../lib/logger.js')
    logger.warn('fetch-company-news: bing fetch failed', { company: companyName, error: err.message })
    return []
  }

  return (data?.value ?? []).map(article => ({
    title:       article.name,
    link:        article.url,
    pubDate:     article.datePublished,
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
