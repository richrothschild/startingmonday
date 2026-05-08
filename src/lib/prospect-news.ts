export type NewsItem = {
  title: string
  pubDate: string
  description: string
}

const TYPE_QUERY_TERMS: Record<string, string> = {
  outplacement: 'executive OR "leadership transition" OR "career transition" OR outplacement OR "layoffs" OR "workforce reduction"',
  mba_program:  'executive OR alumni OR "career services" OR "leadership program" OR "executive education"',
  vc_pe:        'portfolio OR executive OR "leadership transition" OR investment OR fund OR "management change"',
  other:        'executive OR leadership OR hiring OR expansion OR "management change"',
}

export async function fetchProspectNews(prospectName: string, prospectType: string): Promise<NewsItem[]> {
  const terms = TYPE_QUERY_TERMS[prospectType] ?? TYPE_QUERY_TERMS.other
  return process.env.GNEWS_API_KEY
    ? fetchViaGNews(prospectName, terms)
    : fetchViaGoogleRss(prospectName, terms)
}

async function fetchViaGNews(prospectName: string, terms: string): Promise<NewsItem[]> {
  const query = `"${prospectName}" (${terms})`
  const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const params = new URLSearchParams({
    q:     query,
    lang:  'en',
    max:   '5',
    from,
    token: process.env.GNEWS_API_KEY!,
  })

  try {
    const res = await fetch(`https://gnews.io/api/v4/search?${params}`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const data = await res.json() as { articles?: { title: string; publishedAt: string; description?: string }[] }
    return (data.articles ?? []).slice(0, 3).map(a => ({
      title:       a.title,
      pubDate:     a.publishedAt,
      description: a.description ?? '',
    }))
  } catch {
    return []
  }
}

async function fetchViaGoogleRss(prospectName: string, terms: string): Promise<NewsItem[]> {
  const query = encodeURIComponent(`"${prospectName}" (${terms})`)
  const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StartingMondayBot/1.0)' },
      signal:  AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const xml = await res.text()
    return parseRss(xml).slice(0, 3)
  } catch {
    return []
  }
}

function parseRss(xml: string): NewsItem[] {
  const items: NewsItem[] = []
  const blocks = xml.split('<item>').slice(1)
  for (const block of blocks) {
    const end = block.indexOf('</item>')
    const content = end > -1 ? block.slice(0, end) : block
    const title = extractCdata(content, 'title') || extractTag(content, 'title')
    const pubDate = extractTag(content, 'pubDate')
    const description = extractCdata(content, 'description') || extractTag(content, 'description')
    if (title) items.push({ title, pubDate, description })
  }
  return items
}

function extractCdata(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, 'i'))
  return m?.[1]?.trim() ?? ''
}

function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]+)<\\/${tag}>`, 'i'))
  return m?.[1]?.trim() ?? ''
}
