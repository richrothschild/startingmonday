import Anthropic from '@anthropic-ai/sdk'

let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

// Calls Claude Sonnet to produce structured briefing content from assembled context.
// Returns { subject, intro, matchInsights, followUpSuggestions, closing }
export async function generateBriefing(context) {
  const { userName, targetTitles, totalCompanies, newMatches, followUps, todayStr } = context

  const matchesText = newMatches.length
    ? newMatches.map(m =>
        `Company: ${m.companyName}
Matching roles: ${m.matchingRoles.map(r => `${r.title} (score ${r.score}/100${r.isNew ? ', NEW' : ''})`).join('; ')}
Summary: ${m.aiSummary}`
      ).join('\n\n')
    : 'No new matches.'

  const followUpsText = followUps.length
    ? followUps.map(f => {
        const who = f.contact ? `${f.contact.name}${f.contact.title ? ` (${f.contact.title})` : ''}` : null
        return `Due: ${f.dueDate}${who ? `\nContact: ${who}` : ''}\nAction: ${f.action ?? 'Follow up'}`
      }).join('\n\n')
    : 'No overdue follow-ups.'

  const prompt = `You are writing a morning intelligence briefing for ${userName}, a senior technology executive in active job search.
Target titles: ${targetTitles.join(', ') || 'CIO and senior technology leadership roles'}
Companies tracked: ${totalCompanies}

TODAY'S DATA (${todayStr}):

NEW JOB MATCHES (last 24 hours):
${matchesText}

OVERDUE FOLLOW-UPS:
${followUpsText}

Write a morning briefing as JSON with exactly these keys:
- "subject": email subject line (max 75 chars). Specific and factual — name the company or action. No generic phrases.
- "intro": 1-2 sentences. State what's on the board today and why it matters. No preamble.
- "matchInsights": array of { company, roles (string[]), insight (1-2 sentences, specific to this role and this person's background) } — only for companies with matches.
- "followUpSuggestions": array of { person, action, suggestion (one concrete sentence — what to do and how) } — only if there are follow-ups.
- "closing": 1 sentence. Calm, confident observation about pipeline state. No motivational clichés.

Tone: direct, precise, senior-to-senior. Short sentences. No em dashes. No filler phrases ("great opportunity," "don't miss this," "time is of the essence"). Write as a trusted advisor, not a coach.
Output valid JSON only, no markdown fences.`

  const client = getClient()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0]?.text?.trim() ?? '{}'
  const cleaned = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    // Fallback: construct from raw context data without AI narration
    return {
      subject: `${newMatches.length} new match${newMatches.length !== 1 ? 'es' : ''} found — ${todayStr}`,
      intro: `Good morning, ${userName}. Here's your job search update for today.`,
      matchInsights: newMatches.map(m => ({
        company: m.companyName,
        roles: m.matchingRoles.map(r => r.title),
        insight: m.aiSummary,
      })),
      followUpSuggestions: followUps.map(f => ({
        person: f.contact?.name ?? 'Pending contact',
        action: f.action ?? 'Follow up',
        suggestion: 'Reach out today to keep this relationship warm.',
      })),
      closing: `You have ${totalCompanies} companies being tracked. Every day of consistent outreach compounds.`,
    }
  }
}
