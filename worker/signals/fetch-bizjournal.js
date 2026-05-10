import { logger } from '../lib/logger.js'

// E2.1 — Local business journal coverage via Google News RSS.
// Bizjournals.com network covers 40+ city editions with structured
// "People on the Move" sections. Key value: private and mid-market
// companies that never issue press releases or file 8-Ks.
// Returns up to 5 articles: { title, description, link, pubDate }
export async function fetchBizJournalMentions(companyName) {
  try {
    // Scope to the bizjournals.com network only.
    const query = `"${companyName}" site:bizjournals.com`
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return []

    const xml = await res.text()
    return parseRssItems(xml, 5)
  } catch (err) {
    logger.warn('fetch-bizjournal: failed', { company: companyName, error: err.message })
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
    if (title && link) items.push({ title, description, link, pubDate })
  }

  return items
}

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's')
  const m = re.exec(xml)
  return m ? m[1].trim() : ''
}

function stripHtml(str) {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500)
}
