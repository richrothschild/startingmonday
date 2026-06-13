/**
 * Narrative Page Standard
 *
 * Every coach/partner/executive-facing conversion page follows this arc:
 *   1. Hero - name the audience, state the problem they already feel
 *   2. Pain - 3 named breakdowns, each title + one-sentence cause
 *   3. Antidote - two columns: platform jobs vs coach/user jobs (no boxes-in-boxes)
 *   4. Objections - 3 skeptical statements + direct antidote responses
 *   5. Brighter future + CTA - 3 outcome lines merged into a dark close section
 *
 * Cognitive load rules (enforced by convention, not compiler):
 *   - Max 1 eyebrow label (small orange uppercase) per section
 *   - No nested card elements - flat content rows only
 *   - One primary CTA per page; a secondary link is permitted but must be visually subordinate
 *   - Pain section: never mention the product. Name the reality only.
 *   - Antidote section: no marketing language. State job-to-be-done precisely.
 *   - Objections: quote the doubt verbatim (italics), respond with one concrete antidote action.
 *   - Brighter future: 3 lines max, present tense, from the reader's perspective.
 */

export interface NarrativePainItem {
  /** Short declarative title. Do not start with "How" or "Why". Max ~8 words. */
  title: string
  /** One sentence. Name the cause, not the solution. */
  detail: string
}

export interface NarrativeObjection {
  /** The exact skeptical statement the reader says to themselves. Use quotes. */
  title: string
  /** One or two sentences. Validate the doubt, then give a concrete antidote action. */
  detail: string
}

export interface NarrativePageData {
  /** Hero headline: address the reader's situation, not the product. Max ~12 words. */
  heroHeadline: string
  /** Hero subhead: one sentence that names the cost of the current state. */
  heroSubhead: string

  /** Eyebrow label for the pain section. Keep short ("Where X quietly breaks down"). */
  painLabel: string
  pain: [NarrativePainItem, NarrativePainItem, NarrativePainItem]

  /** Eyebrow label for the antidote section ("The antidote"). */
  antidoteLabel: string
  antidoteHeadline: string
  /** Jobs the platform does. 3-4 items, action-verb first. */
  platformJobs: string[]
  /** Jobs the human (coach/user) retains. 3-4 items, action-verb first. */
  userJobs: string[]
  /** Label shown above platformJobs column ("Platform handles"). */
  platformColumnLabel: string
  /** Label shown above userJobs column ("Coach handles" / "You handle"). */
  userColumnLabel: string

  /** 3 objections max. */
  objections: [NarrativeObjection, NarrativeObjection, NarrativeObjection]

  /** Closing headline. Future tense or possibility framing. */
  closingHeadline: string
  /** 3 outcome lines. Present tense, reader's perspective. No product name needed. */
  brighterFuture: [string, string, string]

  /** Primary CTA button label. Action verb + object ("Request the coach preview"). */
  primaryCtaLabel: string
  primaryCtaHref: string
  /** Optional secondary link. Visually subordinate. */
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
}
