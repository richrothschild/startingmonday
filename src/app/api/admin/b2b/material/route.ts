import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember } from '@/lib/staff'
import { anthropic, MODELS } from '@/lib/anthropic'
import { streamErrorMessage } from '@/lib/stream-error'

const TYPE_CONTEXT: Record<string, string> = {
  outplacement: `The prospect is an executive outplacement firm. Their business is helping organizations transition senior leaders out gracefully. They provide career coaching, positioning, networking introductions, and job search support to executives at VP level and above. They sell this service to HR departments and CEOs. Starting Monday would be a tool they license for their executive clients, either white-labeled or branded.

Key value props to emphasize:
- Starting Monday is built specifically for VP+ job search. Generic career tools are embarrassing to put in front of an SVP.
- AI that reads the executive's actual profile before every interaction, not a generic chatbot.
- Daily briefing keeps the search moving without requiring the coach to drive every action.
- Prep briefs at the individual company level: what the interviewer is actually looking for, likely objections, win thesis.
- Outreach drafting calibrated to the executive's voice, not templates.
- Pricing: $30-50/seat/month, or flat per-cohort licensing. Volume discounts available.
- White-label option for brand consistency.`,

  mba_program: `The prospect is an MBA program or executive education career center. They serve alumni and current students who are VPs, SVPs, and C-suite executives in active or passive job search. The career center provides coaching, networking events, and job boards, but struggles with the 9-18 month search timeline that senior executives experience.

Key value props to emphasize:
- Starting Monday is specifically designed for the VP+ search, which is where MBA career centers lose touch with alumni after graduation.
- Alumni are more likely to use it than generic tools because it reads their profile and provides specific intelligence on their target companies.
- Institutional license model: $8,000-$25,000/year for alumni access. No per-seat management.
- White-label option for a branded alumni career tool the school controls.
- Reporting dashboard so the career center sees aggregate engagement without compromising alumni confidentiality.
- Implementation lift is minimal: alumni receive a login link and set up in under 10 minutes.`,

  vc_pe: `The prospect is a venture capital or private equity fund. They regularly transition portfolio executives, whether departing founders, CEOs replaced during scaling, or functional leaders exiting after a restructuring. These transitions are sensitive, and the fund wants to handle them well for reputation and relationship reasons.

Key value props to emphasize:
- Starting Monday is a tool you give a departing portfolio executive as part of a professional separation. It signals you're investing in their next chapter.
- Confidential by design: no social features, no public profile, no peer comparison.
- The executive gets: daily briefing on their target companies, AI prep for interviews, outreach drafting to the network they built at your portfolio company.
- Pricing: $1,500-2,500/year per executive. For 10 transitions/year, that's a rounding error on a typical severance package.
- Better than a human coach for the systematic parts of the search: signal monitoring, interview prep, outreach quality. The coach handles the relationship work.`,

  other: `Starting Monday is an AI platform built specifically for VP and C-suite executives in active job search. Unlike generic career tools, it reads the executive's actual profile before every interaction. Key capabilities: daily company signal briefing, interview prep briefs tailored to the executive and the specific company, outreach drafting calibrated to their voice, and pipeline tracking. Pricing is $49-129/month direct or $30-50/seat/month for institutional licenses.`,
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) return new Response('Forbidden', { status: 403 })

  let body: {
    prospectName: string
    prospectType: string
    estimatedSeats?: number | null
    estimatedArr?: number | null
    notes?: string | null
    contactName?: string | null
    contactTitle?: string | null
    additionalContext?: string
  }
  try { body = await request.json() } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const { prospectName, prospectType, estimatedSeats, estimatedArr, notes, contactName, contactTitle, additionalContext } = body

  const typeContext = TYPE_CONTEXT[prospectType] ?? TYPE_CONTEXT.other

  const prompt = `You are writing a leave-behind document for a B2B sales meeting. The document will be shared with the decision-maker after the conversation.

PROSPECT
Name: ${prospectName}
Type: ${prospectType.replace('_', ' ')}${estimatedSeats ? `\nEstimated users: ${estimatedSeats}` : ''}${estimatedArr ? `\nEstimated annual value: $${estimatedArr.toLocaleString()}` : ''}${contactName ? `\nKey contact: ${contactName}${contactTitle ? `, ${contactTitle}` : ''}` : ''}${notes ? `\nContext and notes: ${notes}` : ''}${additionalContext ? `\nAdditional context for this meeting: ${additionalContext}` : ''}

PROSPECT TYPE CONTEXT
${typeContext}

PRODUCT
Starting Monday is an AI-native platform built specifically for VP+ and C-suite executives in active job search. It is not a job board. It is not a resume builder. It runs the executive's search: tracking target companies, surfacing signals when timing shifts, preparing them for interviews with company-specific briefs, drafting outreach in their voice, and keeping actions moving with a daily briefing.

THE TASK
Write a leave-behind document (700-900 words) for a meeting between Richard Rothschild (founder, Starting Monday) and a representative of ${prospectName}.

Structure:
1. A single headline that captures what Starting Monday does for their specific use case. Not generic. Not "AI for job search." Something that lands for this type of organization.
2. The problem it solves for them specifically (2-3 sentences). What happens today without Starting Monday for their executives.
3. What their executives get: 4-5 specific capabilities with one concrete sentence each. No bullet padding.
4. What the engagement looks like: pricing, implementation, what they don't have to manage.
5. Why this, why now: one paragraph on timing and positioning.
6. A specific next step with Richard's name and contact.

Tone: direct and confident. Peer-level. Written as if Richard is in the room. No hedging. No motivational language. No em dashes. No filler phrases.

Format: use ## for section headers. Bold key terms where it adds clarity. This will be rendered as markdown.`

  const stream = await anthropic.messages.stream({
    model: MODELS.sonnet,
    max_tokens: 1400,
    messages: [{ role: 'user', content: prompt }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } catch (err) {
        controller.enqueue(encoder.encode(streamErrorMessage(err)))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
