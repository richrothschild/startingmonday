import * as cheerio from 'cheerio'
import { logger } from '../lib/logger.js'

const EDGAR_CGI     = 'https://www.sec.gov/cgi-bin'
const EDGAR_ARCHIVE = 'https://www.sec.gov/Archives/edgar/data'
const EDGAR_ORIGIN  = 'https://www.sec.gov'
const HEADERS       = { 'User-Agent': 'StartingMonday/1.0 contact@startingmonday.app' }

// Only open-market sales are meaningful departure signals.
// Excludes: F (tax withholding), M (option exercise), G (gift), A (grant), P (purchase).
const SALE_CODES = new Set(['S'])

const MIN_SALE_VALUE = 100_000 // $100K
const MIN_SALE_PCT   = 0.20   // 20% of pre-sale holdings

// Detect material open-market share sales by named officers via SEC Form 4.
// Returns an array of signal objects for any qualifying transactions found.
//
// Guards:
// - Only runs for public companies (sec_cik_padded must be set — gated in signal-job).
// - 7-day throttle via insider_checked_at on the companies row.
export async function fetchInsiderSales(companyName, { supabase, companyId, insiderCheckedAt }) {
  if (insiderCheckedAt) {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    if (new Date(insiderCheckedAt).getTime() > sevenDaysAgo) return []
  }

  const { data: co } = await supabase
    .from('companies')
    .select('sec_cik_padded')
    .eq('id', companyId)
    .maybeSingle()

  await touchCheckedAt(supabase, companyId)
  if (!co?.sec_cik_padded) return []

  const cikPadded = co.sec_cik_padded
  const cutoff90  = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Fetch the EDGAR Atom feed of Form 4 filings where this company is the issuer.
  const entries = await fetchAtomEntries(cikPadded)
  const recent  = entries.filter(e => e.filingDate >= cutoff90)
  if (!recent.length) return []

  // Dedup against already-recorded filings.
  const { data: existing } = await supabase
    .from('insider_sales')
    .select('accession_number')
    .eq('company_id', companyId)
    .in('accession_number', recent.map(e => e.accession))

  const known    = new Set((existing ?? []).map(r => r.accession_number))
  const newItems = recent.filter(e => !known.has(e.accession))
  if (!newItems.length) return []

  const signals = []

  for (const entry of newItems) {
    try {
      // Two hops: filing index HTML → Form 4 XML URL, then the XML itself.
      const xmlUrl = await findXmlUrl(entry.filingHref)
      if (!xmlUrl) continue

      const parsed = await parseForm4Xml(xmlUrl)
      if (!parsed) continue

      const { ownerName, ownerTitle, isOfficer, transactions } = parsed

      // Only flag named officers. Directors-only and 10%-owners are lower signal.
      if (!isOfficer) continue

      const sales = transactions.filter(t => SALE_CODES.has(t.code) && t.shares > 0)
      if (!sales.length) continue

      // Aggregate across all transactions in this filing.
      const totalShares = sales.reduce((s, t) => s + t.shares, 0)
      const totalValue  = sales.reduce((s, t) => s + t.shares * t.price, 0)
      const remaining   = sales.at(-1)?.remaining ?? 0
      const pctSold     = totalShares + remaining > 0
        ? totalShares / (totalShares + remaining)
        : 0

      const material = totalValue >= MIN_SALE_VALUE || pctSold >= MIN_SALE_PCT
      if (!material) continue

      // Record in training dataset.
      const { error: insertErr } = await supabase.from('insider_sales').insert({
        company_id:        companyId,
        accession_number:  entry.accession,
        filing_date:       entry.filingDate,
        transaction_date:  sales[0]?.date ?? null,
        exec_name:         ownerName,
        exec_title:        ownerTitle,
        shares_sold:       totalShares,
        price_per_share:   totalValue / totalShares,
        sale_value:        totalValue,
        shares_remaining:  remaining,
        pct_holdings_sold: pctSold,
      })

      if (insertErr) {
        logger.warn('fetch-sec-insider: insert failed', { company: companyName, error: insertErr.message })
        continue
      }

      const valueStr  = formatCurrency(totalValue)
      const pctStr    = pctSold > 0 ? ` (${Math.round(pctSold * 100)}% of holdings)` : ''
      const titleStr  = ownerTitle ? `${ownerTitle} ` : ''
      const lastName  = ownerName ? ownerName.split(' ').at(-1) : null
      const signalDate = sales[0]?.date ?? entry.filingDate

      signals.push({
        signal_summary:  `${titleStr}${ownerName} sold ${valueStr}${pctStr} of ${companyName} stock in the open market. Large insider sales by named officers often precede departure announcements by 60-180 days.`,
        outreach_angle:  `Insider share liquidation by ${ownerName} at ${companyName} may signal an upcoming leadership transition. Begin relationship-building now${lastName ? ` — if ${lastName} departs` : ''}, the board will need a replacement quickly.`,
        signalDate,
      })
    } catch (err) {
      logger.warn('fetch-sec-insider: filing failed', { company: companyName, accession: entry.accession, error: err.message })
    }
  }

  return signals
}

// Fetch the EDGAR Atom feed listing Form 4 filings where cikPadded is the issuer.
async function fetchAtomEntries(cikPadded) {
  const url = `${EDGAR_CGI}/browse-edgar?action=getcompany&CIK=${cikPadded}&type=4&dateb=&owner=include&count=20&output=atom`
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(10000) })
    if (!res.ok) return []

    const xml = await res.text()
    const $   = cheerio.load(xml, { xmlMode: true })
    const entries = []

    $('entry').each((_, el) => {
      const $el        = $(el)
      const accession  = $el.find('accession-number').text().trim()
      const filingDate = $el.find('filing-date').text().trim()
      const filingHref = $el.find('filing-href').text().trim()
      if (accession && filingDate) entries.push({ accession, filingDate, filingHref })
    })

    return entries
  } catch (err) {
    logger.warn('fetch-sec-insider: atom fetch failed', { cik: cikPadded, error: err.message })
    return []
  }
}

// Fetch the filing index HTML and find the primary Form 4 XML document URL.
async function findXmlUrl(indexHref) {
  if (!indexHref) return null
  try {
    const res = await fetch(indexHref, { headers: HEADERS, signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null

    const html = await res.text()
    const $    = cheerio.load(html)
    let xmlUrl = null

    $('a[href]').each((_, el) => {
      if (xmlUrl) return
      const href = $(el).attr('href') ?? ''
      if (href.endsWith('.xml')) {
        xmlUrl = href.startsWith('http') ? href : `${EDGAR_ORIGIN}${href}`
      }
    })

    return xmlUrl
  } catch {
    return null
  }
}

// Fetch and parse a Form 4 XML document.
// Returns { ownerName, ownerTitle, isOfficer, transactions } or null.
async function parseForm4Xml(xmlUrl) {
  try {
    const res = await fetch(xmlUrl, { headers: HEADERS, signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null

    const xml = await res.text()
    const $   = cheerio.load(xml, { xmlMode: true })

    // Reporting owner identity
    const ownerName  = $('rptOwnerName').first().text().trim()
    const ownerTitle = $('officerTitle').first().text().trim()
    const isOfficerVal = $('isOfficer').first().text().trim()
    const isOfficer  = isOfficerVal === '1' || isOfficerVal === 'true'

    // Non-derivative transactions (common stock) only.
    const transactions = []
    $('nonDerivativeTransaction').each((_, el) => {
      const $tx      = $(el)
      const code     = $tx.find('transactionCode').first().text().trim()
      const adCode   = $tx.find('transactionAcquiredDisposedCode value').first().text().trim()
      const shares   = parseFloat($tx.find('transactionShares value').first().text()) || 0
      const price    = parseFloat($tx.find('transactionPricePerShare value').first().text()) || 0
      const remaining = parseFloat($tx.find('sharesOwnedFollowingTransaction value').first().text()) || 0
      const date     = $tx.find('transactionDate value').first().text().trim()

      // 'S' code = open market sale; 'D' adCode confirms disposal (not acquisition)
      if (code && shares > 0) {
        transactions.push({ code, adCode, shares, price, remaining, date })
      }
    })

    return { ownerName, ownerTitle, isOfficer, transactions }
  } catch {
    return null
  }
}

function formatCurrency(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`
  return `$${Math.round(n)}`
}

async function touchCheckedAt(supabase, companyId) {
  await supabase
    .from('companies')
    .update({ insider_checked_at: new Date().toISOString() })
    .eq('id', companyId)
}
