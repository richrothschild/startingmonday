// Fetches recent funding rounds from Crunchbase for a given organization permalink.
// Requires CRUNCHBASE_API_KEY env var (Crunchbase Basic API).
// Returns up to 5 rounds announced in the past 90 days.
export async function fetchCrunchbaseFunding(permalink) {
  const key = process.env.CRUNCHBASE_API_KEY
  if (!key || !permalink) return []

  const url =
    `https://api.crunchbase.com/api/v4/entities/organizations/${encodeURIComponent(permalink)}` +
    `?user_key=${key}&card_ids=funding_rounds&field_ids=short_description`

  let data
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      const { logger } = await import('../lib/logger.js')
      logger.warn('fetch-crunchbase-funding: non-200', { permalink, status: res.status, body: text.slice(0, 200) })
      return []
    }
    data = await res.json()
  } catch (err) {
    const { logger } = await import('../lib/logger.js')
    logger.warn('fetch-crunchbase-funding: fetch failed', { permalink, error: err.message })
    return []
  }

  const rounds = data?.cards?.funding_rounds ?? []
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  return rounds
    .filter(r => {
      const date = r.announced_on?.value ?? r.announced_on
      return date && new Date(date) >= cutoff
    })
    .slice(0, 5)
    .map(r => {
      const date = r.announced_on?.value ?? r.announced_on
      const amountUsd = r.money_raised?.value_usd ?? null
      const roundPermalink = r.identifier?.permalink ?? null
      const roundType = r.investment_type ?? 'funding_round'
      return {
        amount: amountUsd,
        roundType,
        announcedOn: date,
        sourceUrl: roundPermalink
          ? `https://www.crunchbase.com/funding_round/${roundPermalink}`
          : `https://www.crunchbase.com/organization/${permalink}/funding_rounds`,
      }
    })
}

export function formatFundingSignal(companyName, round) {
  const typeLabel = {
    seed:       'a seed round',
    series_a:   'a Series A',
    series_b:   'a Series B',
    series_c:   'a Series C',
    series_d:   'a Series D',
    series_e:   'a Series E',
    venture:    'a venture round',
    angel:      'an angel round',
    debt_financing: 'a debt financing round',
    private_equity: 'a private equity investment',
    grant:      'a grant',
    funding_round: 'a funding round',
  }[round.roundType] ?? 'a funding round'

  const amountStr = round.amount
    ? round.amount >= 1_000_000_000
      ? `$${(round.amount / 1_000_000_000).toFixed(1)}B`
      : `$${Math.round(round.amount / 1_000_000)}M`
    : 'an undisclosed amount'

  return {
    signal_summary: `${companyName} raised ${amountStr} in ${typeLabel} (via Crunchbase).`,
    outreach_angle: `Recent funding at ${companyName} signals a growth phase — executive candidates who can scale teams or drive transformation are well-positioned to open a conversation now.`,
  }
}
