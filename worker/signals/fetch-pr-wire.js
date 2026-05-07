import { logger } from '../lib/logger.js'

// Google News RSS filtered to the three major PR wire services.
// Returns up to 6 articles: { title, description, link, pubDate }
export async function fetchPrWire(companyName) {
  try {
    const query = `"${companyName}" site:prnewswire.com OR site:businesswire.com OR site:globenewswire.com`
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return []

    const xml = await res.text()
    return parseRssItems(xml, 6)
  } catch (err) {
    logger.warn('fetch-pr-wire: failed', { company: companyName, error: err.message })
    return []
  }
}

function parseRssItems(xml, limit) {
  const items = []
  const itemRe = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRe.exec(xml)) !== null && items.length < limit) {
    const block = match[1]
    const title       = extractTag(block, 'title')
    const link        = extractTag(block, 'link')
    const pubDate     = extractTag(block, 'pubDate')
    const description = stripHtml(extractTag(block, 'description'))

    if (!title || !link) continue

    // Only keep items that appear to be from a wire service (URL check after redirect resolution is not feasible here;
    // trust that the site: filter in the query does the heavy lifting).
    items.push({ title, description, link, pubDate })
  }

  return items
}

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's')
  const m = re.exec(xml)
  return m ? m[1].trim() : ''
}

function stripHtml(str) {
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500)
}
