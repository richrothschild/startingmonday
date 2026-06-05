import { BrandIcon } from '@/components/BrandIcon'
/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { TrackLink } from '@/components/TrackLink'
import { TrackedAccordionItem } from '@/components/TrackedAccordionItem'
import { CHANNEL_ROUTE_SPECS } from '@/lib/channel-ia'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'
import type { Channel } from '@/lib/channel-metrics-events'

export interface SituationCard {
  id: string
  headline: string
  sub: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface LandingHero {
  eyebrow: string
  h1Lines: string[]
  claimMethodLabel?: string
  claimMethodHref?: string
  claimEvidenceLabel?: string
  claimEvidenceHref?: string
  bodyPreamble?: string
  body: string
  note?: string
  steps?: string[]
  trialNote: string
  testimonial?: {
    quote: string
    source: string
    result: string
  }
  competitiveEdge?: string
}

export interface ProofHighlight {
  metric: string
  detail: string
}

export interface LandingPageProps {
  hero: LandingHero
  situations: SituationCard[]
  faqs?: FAQ[]
  showPersonaSelector?: boolean
  rolePathPriorityByCtaKey?: Record<string, number>
  proofHighlights?: ProofHighlight[]
}

const CHANNEL_BEST_FOR: Record<string, string> = {
  executives: 'Best for active or near-term C-suite transitions',
  coaches: 'Best for coach-led execution between client sessions',
  outplacement: 'Best for cohort delivery and measurable 30-day momentum',
  search_firms: 'Best for retained-search kickoff quality and shortlist speed',
}

type RolePathItem = {
  ctaKey: string
  label: string
  iconToken: string
  priority: number
  href?: string
}

type RolePathGroup = {
  title: string
  iconToken: string
  description: string
  items: RolePathItem[]
}

const ROLE_PATH_GROUPS: RolePathGroup[] = [
  {
    title: 'Partner tracks',
    iconToken: 'PT',
    description: 'For coaches, firms, and partner teams',
    items: [
      { ctaKey: 'search_firms', label: 'Search firms', href: '/for-search-firms', iconToken: 'SF', priority: 1 },
      { ctaKey: 'coaches', label: 'Coaches', href: '/for-coaches', iconToken: 'CH', priority: 2 },
      { ctaKey: 'outplacement_firms', label: 'Outplacement firms', href: '/for-outplacement', iconToken: 'OP', priority: 3 },
      { ctaKey: 'partner_programs', label: 'Partner programs', href: '/partners', iconToken: 'PR', priority: 4 },
      { ctaKey: 'pe_teams', label: 'PE teams', href: '/for-pe-teams', iconToken: 'PE', priority: 5 },
    ],
  },
  {
    title: 'Executive transitions',
    iconToken: 'ET',
    description: 'For VP and near-term C-suite moves',
    items: [
      { ctaKey: 'cio_cto_search', label: 'CIO and CTO search', href: '/for-cio', iconToken: 'CX', priority: 1 },
      { ctaKey: 'vp_to_c_suite', label: 'VP to C-Suite', href: '/for-executives', iconToken: 'VP', priority: 2 },
      { ctaKey: 'vp_of_technology', label: 'VP of Technology', href: '/for-vp-technology', iconToken: 'VT', priority: 3 },
      { ctaKey: 'cio', label: 'CIO', href: '/for-cio', iconToken: 'CI', priority: 4 },
      { ctaKey: 'cto', label: 'CTO', href: '/for-cio', iconToken: 'CT', priority: 5 },
    ],
  },
  {
    title: 'C-suite role paths',
    iconToken: 'CS',
    description: 'Choose your specific functional track',
    items: [
      { ctaKey: 'ciso', label: 'CISO', href: '/for-ciso', iconToken: 'SI', priority: 1 },
      { ctaKey: 'coo', label: 'COO', href: '/for-coo', iconToken: 'OO', priority: 2 },
      { ctaKey: 'chief_digital_officer', label: 'Chief Digital Officer', href: '/for-cdo', iconToken: 'DG', priority: 3 },
      { ctaKey: 'chief_product_officer', label: 'Chief Product Officer', href: '/for-cpo', iconToken: 'PO', priority: 4 },
      { ctaKey: 'chief_data_officer', label: 'Chief Data Officer', href: '/for-data-officer', iconToken: 'DA', priority: 5 },
      { ctaKey: 'cfo', label: 'CFO', iconToken: 'FO', priority: 6 },
      { ctaKey: 'ceo', label: 'CEO', iconToken: 'EO', priority: 7 },
    ],
  },
]

const ROLE_PATH_CTA_PREFIX = 'footer_role_path_'

const EXECUTIVE_WHY = [
  'Most executive roles are shaped before formal posting windows.',
  'Timing and relationship cadence decide outcomes as much as credentials.',
  'Without a weekly operating loop, even strong candidates become reactive.',
]

const EXECUTIVE_GETS = [
  {
    title: 'Signal intelligence',
    detail: 'Early movement alerts across target companies.',
  },
  {
    title: 'Relationship rhythm',
    detail: 'A weekly action cadence so outreach stays intentional.',
  },
  {
    title: 'Narrative control',
    detail: 'Role-aligned positioning you can reuse across conversations.',
  },
  {
    title: 'Interview readiness',
    detail: 'Company-specific prep briefs in about a minute.',
  },
]

const HOME_BLUF_SECTIONS = [
  {
    title: 'Front-of-line timing advantage',
    summary: 'Learn about likely executive openings before formal posting windows appear.',
    detail: 'We surface movement signals so you can engage earlier with stronger context and better timing.',
    href: '/blog/cio-job-search-timeline',
  },
  {
    title: 'Relationship cadence that compounds',
    summary: 'Stay in touch with the right people at the right time without reactive scrambling.',
    detail: 'A weekly rhythm keeps outreach intentional across search firms, coaches, HR partners, peers, and boards.',
    href: '/blog/cio-board-presentation',
  },
  {
    title: 'Strategy over grunt work',
    summary: 'Spend more time on decision quality and less on manual search busywork.',
    detail: 'Signal tracking, prep framing, and recurring operating routines remove low-value repetition from the search.',
    href: '/blog/executive-coaching-job-search',
  },
  {
    title: 'Narrative control by audience',
    summary: 'Refine your narrative for each conversation context without reinventing it every time.',
    detail: 'Positioning is adapted for role paths and audiences so conversations stay consistent and role-aligned.',
    href: '/blog/cio-vs-cto-which-role',
  },
] as const

function getRolePathChannel(href: string): Channel {
  if (href.startsWith('/for-search-firms')) return 'search_firms'
  if (href.startsWith('/for-coaches')) return 'coaches'
  if (href.startsWith('/for-outplacement')) return 'outplacement'
  return 'executives'
}

export function LandingPage({ hero, faqs, rolePathPriorityByCtaKey, proofHighlights }: LandingPageProps) {
  const quickRolePaths = ROLE_PATH_GROUPS
    .flatMap(group => group.items)
    .filter((item): item is RolePathItem & { href: string } => Boolean(item.href))
    .sort((a, b) => {
      const orderA = rolePathPriorityByCtaKey?.[a.ctaKey] ?? a.priority
      const orderB = rolePathPriorityByCtaKey?.[b.ctaKey] ?? b.priority
      if (orderA !== orderB) return orderA - orderB
      return a.label.localeCompare(b.label)
    })
    .slice(0, 8)

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white hover:opacity-80 transition-opacity" aria-label="Go to homepage">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors" aria-label="Log in">
              Log in
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section id="core-clarity" data-emi-section="clarity_block" className="bg-slate-900 px-4 sm:px-6 pt-16 sm:pt-20 pb-20 sm:pb-24">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg sm:text-xl text-slate-300 font-semibold leading-relaxed mb-5 sm:mb-7 whitespace-pre-line [text-wrap:balance]">
              {hero.eyebrow}
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5 [text-wrap:balance]">
              {hero.h1Lines.map((line, i) => (
                <span key={i}>{line}{i < hero.h1Lines.length - 1 && <br />}</span>
              ))}
            </h1>
            {hero.bodyPreamble && (
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl mb-3 whitespace-pre-line [text-wrap:pretty]">
                {hero.bodyPreamble}
              </p>
            )}
            <p className="text-base text-slate-300 leading-relaxed max-w-xl mb-4 [text-wrap:pretty]">
              {hero.body}
            </p>

            {proofHighlights && proofHighlights.length > 0 && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/20 p-4 mb-6" data-emi-proof="landing_proof_highlights">
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-300 mb-3">Proof snapshot</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {proofHighlights.map((item) => (
                    <div key={item.metric} className="rounded-md border border-emerald-500/20 bg-slate-950/50 p-3">
                      <p className="text-[13px] font-semibold text-emerald-100">{item.metric}</p>
                      <p className="text-[12px] text-slate-300 leading-relaxed mt-1">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <TrackLink
                href="/concierge?program=beta&from=landing"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{
                  channel: 'executives',
                  cta_label: 'hero_apply_beta',
                  variant_key: 'executive_proof_v1',
                  source_page: '/',
                }}
                className="inline-flex items-center justify-center bg-orange-500 text-slate-900 text-[14px] font-bold px-6 py-3 rounded hover:bg-orange-600 transition-colors"
              >
                Apply for confidential beta
              </TrackLink>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-5 mb-6" data-emi-proof="landing_clarity_panel">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-3">At a glance</p>
              <p className="text-[13px] text-slate-200 leading-relaxed mb-4 [text-wrap:pretty]">
                Connect with the right relationships at the right time and get to the front of the line before the role is obvious to the market.
              </p>
              <div className="space-y-2.5">
                {HOME_BLUF_SECTIONS.map((section) => (
                  <TrackedAccordionItem
                    key={section.title}
                    title={section.title}
                    summary={section.summary}
                    detail={section.detail}
                    href={section.href}
                    channel="executives"
                    route="/"
                    blockId={`home_bluf_${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs font-bold tracking-[0.08em] uppercase text-green-400 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              Private by default
            </p>
            <p className="text-sm text-slate-500 mb-2 leading-relaxed [text-wrap:pretty]">
              Your search stays private. We never share your identity, targets, or activity with employers or recruiters.
            </p>
          </div>
        </section>

        <section id="executive-why" data-emi-section="executive_why_block" className="bg-slate-800 px-4 sm:px-6 py-14 sm:py-18 border-b border-slate-700">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-300 mb-3">Why it matters to executives</p>
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-5">
              <ul className="space-y-2.5">
                {EXECUTIVE_WHY.map((item) => (
                  <li key={item} className="text-[14px] text-slate-200 leading-relaxed flex items-start gap-2.5">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {hero.competitiveEdge && (
              <p className="text-sm text-orange-300 leading-relaxed mt-6 font-medium inline-flex items-start gap-1.5">
                <BrandIcon name="performance" className="h-4 w-4 text-orange-400 mt-[1px] shrink-0" />
                <span>{hero.competitiveEdge}</span>
              </p>
            )}
          </div>
        </section>

        <section id="what-you-get" data-emi-section="what_you_get_block" className="bg-white px-4 sm:px-6 py-16 sm:py-20 border-b border-slate-100">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">What you get</p>
            <h2 className="text-[22px] font-bold text-slate-900 mb-9 max-w-xl leading-snug">
              Four outcomes built for executive transition speed.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl">
              {EXECUTIVE_GETS.map((item) => (
                <details key={item.title} className="border-t-2 border-slate-200 pt-5">
                  <summary className="cursor-pointer list-none text-[14px] font-semibold text-slate-900 mb-2 inline-flex items-center gap-2">
                    <span>{item.title}</span>
                    <span className="text-[11px] text-orange-600">Open</span>
                  </summary>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{item.detail}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="next-step" data-emi-section="next_step_block" className="bg-slate-800 px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-700">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-300 mb-3">Choose your next step</p>
            <h2 className="text-[22px] font-bold text-white mb-6 leading-snug">
              Pick a channel and role path, then take the next step.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {CHANNEL_ROUTE_SPECS.map((spec) => (
                <TrackLink
                  key={`next_${spec.channel}`}
                  href={spec.route}
                  event={EVENT_NAMES.channelEntryClicked}
                  logToUserEvents
                  properties={{
                    channel: spec.channel,
                    cta_label: 'next_step_channel_card',
                    variant_key: 'executive_proof_v1',
                    source_page: '/',
                  }}
                  className="block rounded-md border border-slate-700 bg-slate-900 px-4 py-3 hover:border-orange-500 transition-colors"
                >
                  <p className="text-[13px] font-semibold text-white">{spec.label}</p>
                  <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">{CHANNEL_BEST_FOR[spec.channel]}</p>
                </TrackLink>
              ))}
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 mb-6">
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-400 mb-3">Role paths</p>
              <div className="flex flex-wrap gap-2.5">
                {quickRolePaths.map((item) => (
                  <TrackLink
                    key={item.ctaKey}
                    href={item.href}
                    event={EVENT_NAMES.channelEntryClicked}
                    logToUserEvents
                    properties={{
                      channel: getRolePathChannel(item.href),
                      cta_label: `${ROLE_PATH_CTA_PREFIX}${item.ctaKey}`,
                      variant_key: 'executive_proof_v1',
                      source_page: '/',
                    }}
                    className="inline-flex items-center rounded-md border border-slate-700/80 bg-slate-950/70 px-2.5 py-1.5 text-[12px] font-medium text-slate-200 transition-all duration-200 ease-out hover:text-white hover:border-orange-400/70"
                  >
                    {item.label}
                  </TrackLink>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/concierge?program=beta&from=landing"
                data-emi-cta="next_step_apply_beta"
                data-emi-to="/concierge?program=beta&from=landing"
                className="inline-flex items-center justify-center text-[14px] font-bold text-white border border-slate-500 px-6 py-3 rounded hover:border-slate-300 transition-colors"
              >
                Apply for confidential beta
              </Link>
            </div>
            <p className="text-[12px] text-slate-400 mt-3">{hero.trialNote}</p>
          </div>
        </section>

        {faqs && faqs.length > 0 && (
          <JsonLd data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }} />
        )}

        <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400">
                <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
              </span>
              <div className="flex items-center gap-4 sm:gap-5 flex-wrap text-[12px] text-slate-400">
                <Link href="/method-and-evidence" className="hover:text-slate-300 transition-colors">Method and evidence</Link>
                <Link href="/evidence-room" className="hover:text-slate-300 transition-colors">Evidence room</Link>
                <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
                <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
                <Link href="/about" className="hover:text-slate-300 transition-colors">About</Link>
                <Link href="/optimize" className="hover:text-slate-300 transition-colors">Free Profile Grade</Link>
                <a href="https://www.linkedin.com/company/starting-monday" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">LinkedIn</a>
                <Link href="/security" className="hover:text-slate-300 transition-colors">Security</Link>
                <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-5">Privacy-first by design. No sale of user data, ever.</p>
            <p className="text-[11px] text-slate-500 mt-2">&copy; {new Date().getFullYear()} Starting Monday. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
