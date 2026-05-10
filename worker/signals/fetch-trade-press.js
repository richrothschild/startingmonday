import { logger } from '../lib/logger.js'

// E2.2 — Technology executive trade press coverage via Google News RSS.
// These publications are written for CIOs, CTOs, and CISOs — articles
// frame events through the lens of technology leadership, and often
// report executive changes before wire services do.
// Returns up to 5 articles: { title, description, link, pubDate }

const TRADE_SITES = [
  'site:cio.com',
  'site:computerworld.com',
  'site:informationweek.com',
  'site:healthcareitnews.com',
  'site:fiercehealth.com',
  'site:americanbanker.com',
  'site:bankingdive.com',
  'site:retaildive.com',
  'site:supplychaindive.com',
  'site:ciodive.com',
].join(' OR ')

export async function fetchTradePressArticles(companyName) {
  try {
    const query = `"${companyName}" (${TRADE_SITES})`
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return []

    const xml = await res.text()
    return parseRssItems(xml, 5)
  } catch (err) {
    logger.warn('fetch-trade-press: failed', { company: companyName, error: err.message })
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
