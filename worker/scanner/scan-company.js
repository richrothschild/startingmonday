import { isAllowedByRobots } from './robots-check.js'
import { fetchPage, BlockedError } from './fetch-page.js'
import { extractText } from './extract-text.js'
import { detectRoles } from './detect-roles.js'
import { scoreHit } from './score-hit.js'
import { wasRecentlyScanned, getPreviousHitTitles } from './deduplicate.js'
import { writeScanResult, updateCompanyScanTime, writeScanBlocked, writeScanError } from './write-results.js'

// Scans one company's career page end-to-end and writes a single scan_results row.
// Returns { skipped?, blocked?, hits, matches, newHits, error? }
export async function scanCompany(supabase, company, userProfile) {
  const { id: companyId, user_id: userId, name, career_page_url } = company

  if (!career_page_url) {
    console.log(`[scanner] ${name}: no career_page_url — skipping`)
    return { skipped: true }
  }

  try {
    // 1. Skip if scanned recently
    if (await wasRecentlyScanned(supabase, companyId)) {
      console.log(`[scanner] ${name}: scanned recently — skipping`)
      return { skipped: true }
    }

    // 2. robots.txt check
    if (!(await isAllowedByRobots(career_page_url))) {
      console.log(`[scanner] ${name}: blocked by robots.txt`)
      return { blocked: true }
    }

    // 3. Fetch + extract
    console.log(`[scanner] ${name}: fetching ${career_page_url}`)
    const html = await fetchPage(career_page_url)
    const text = extractText(html)

    // 4. Detect candidate titles
    const candidates = detectRoles(text, userProfile)
    console.log(`[scanner] ${name}: ${candidates.length} candidate(s)`)

    // 5. Score each candidate; flag ones not seen in the previous scan
    const previousTitles = await getPreviousHitTitles(supabase, companyId)
    const scoredHits = []
    for (const candidate of candidates) {
      const score = await scoreHit(candidate, userProfile, name)
      scoredHits.push({
        title: candidate.title,
        score: score.score,
        is_match: score.is_match,
        summary: score.summary,
        is_new: !previousTitles.has(candidate.title.toLowerCase()),
      })
    }

    // 6. Summarise
    const matches = scoredHits.filter(h => h.is_match)
    const newHits = scoredHits.filter(h => h.is_new)
    const aiScore = matches.length ? Math.max(...matches.map(h => h.score)) : 0
    const aiSummary = matches.length
      ? `${matches.length} match(es) found: ${matches.map(h => h.title).join(', ')}`
      : `No matches among ${scoredHits.length} posting(s) detected`

    // 7. Write one scan_results row
    await writeScanResult(supabase, { companyId, userId, hits: scoredHits, aiScore, aiSummary })
    await updateCompanyScanTime(supabase, companyId)

    console.log(`[scanner] ${name}: done — ${matches.length} match(es), ${newHits.length} new`)
    return { hits: scoredHits.length, matches: matches.length, newHits: newHits.length }
  } catch (error) {
    if (error instanceof BlockedError) {
      console.log(`[scanner] ${name}: blocked by site`)
      await writeScanBlocked(supabase, { companyId, userId, message: error.message })
      await updateCompanyScanTime(supabase, companyId)
      return { blocked: true }
    }
    console.error(`[scanner] ${name}: failed — ${error.message}`)
    await writeScanError(supabase, { companyId, userId, error })
    return { error: error.message }
  }
}
