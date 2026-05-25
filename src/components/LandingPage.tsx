import { BrandIcon } from '@/components/BrandIcon'
/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'
import { PricingSection } from '@/components/PricingSection'
import { SamplePrepBrief } from '@/components/SamplePrepBrief'
import { TrackLink } from '@/components/TrackLink'
import { CHANNEL_ROUTE_SPECS } from '@/lib/channel-ia'
import { EVENT_NAMES } from '@/lib/channel-metrics-events'

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

export interface LandingPageProps {
  hero: LandingHero
  situations: SituationCard[]
  faqs?: FAQ[]
  showPersonaSelector?: boolean
}

const FEATURES = [
  {
    label: 'Level-Calibrated AI',
    body: 'Set your search level - C-Suite, VP/SVP, or Board/Advisor - and every AI output calibrates to that tier. The prep brief, strategy, outreach, and advisor all speak at the right altitude. If you\'re making the VP-to-CIO move, every output is calibrated to where you\'re going, not where you\'ve been.',
  },
  {
    label: 'Relationship Command Center',
    body: 'Every company, contact, and conversation - staged, sequenced, and tracked. You can see who matters, what changed, and what to do next. Nothing falls through. Nothing goes cold.',
  },
  {
    label: 'Early Role Intelligence',
    body: 'We monitor news, 8-K filings, funding rounds, executive moves, and career pages for every company you track. When signals cluster into a pattern, we name it and alert you before the search is formalized and before the posting exists. 8-K filings and funding events surface transformation windows before the search is authorized.',
  },
  {
    label: 'Elite Interview Prep Brief',
    body: 'Your win thesis. The objections they will raise, and how to counter each one. The questions only a peer would think to ask. What to leave out entirely. Usually ready in about a minute. If a brief misses the mark, flag it in one click — we track every report and improve the prompt.',
  },
  {
    label: 'Daily Accountability Briefing',
    body: 'Every morning you know exactly what happened overnight, which relationships need attention, and the first action to take today. New signals, pending actions, and what to prioritize - assembled overnight and in your inbox before the market opens. Set it up once. The briefing becomes your check-in.',
  },
  {
    label: 'AI Career Advisor',
    body: 'A strategic advisor with full visibility into your pipeline. Ask anything - how to frame a gap, what to say to a contact, which companies to prioritize. It takes action when you ask it to.',
  },
  {
    label: 'Search Strategy Brief',
    body: 'One AI synthesis of your full positioning - target roles, sectors, narrative, and outreach approach. Built from your background and the companies you are tracking. Regenerate when your focus shifts.',
  },
  {
    label: 'Resume Tailoring',
    body: 'Paste the job description and generate a targeted resume in minutes. Match the role language without keyword stuffing. Run a quality check for ATS score, recruiter grade, and weak bullets before you send.',
  },
]

function splitFeatureBody(body: string) {
  const sentences = body.split(/(?<=[.!?])\s+/).filter(Boolean)
  return {
    summary: sentences[0] ?? body,
    detail: sentences[1] ?? '',
  }
}

const PERSONA_LINKS = [
  { href: '/for-cio', label: 'CIO and CTO search' },
  { href: '/for-vp', label: 'VP to CIO transition' },
  { href: '/for-vp-technology', label: 'VP of Technology' },
  { href: '/for-cpo', label: 'Chief Product Officer' },
  { href: '/for-data-officer', label: 'Chief Data Officer' },
  { href: '/for-cdo', label: 'Chief Digital Officer' },
  { href: '/for-ciso', label: 'CISO' },
  { href: '/for-coo', label: 'COO' },
  { href: '/for-search-firms', label: 'Search firms and executive coaches' },
  { href: '/for-pe-partners', label: 'PE and transformation operators' },
]

const CHANNEL_BEST_FOR: Record<string, string> = {
  executives: 'Best for active or near-term C-suite transitions',
  coaches: 'Best for coach-led execution between client sessions',
  outplacement: 'Best for cohort delivery and measurable 30-day momentum',
  search_firms: 'Best for retained-search kickoff quality and shortlist speed',
}


export function LandingPage({ hero, situations, faqs, showPersonaSelector }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Nav */}
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white hover:opacity-80 transition-opacity" aria-label="Go to homepage">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/partners" className="text-[13px] text-slate-400 hover:text-white transition-colors" title="For partners and alliances" aria-label="Partner entry and info">
              Partners
            </Link>
            <Link href="/for-search-firms" className="hidden md:inline text-[13px] text-slate-400 hover:text-white transition-colors" title="For executive search firms" aria-label="Search-firm route">
              Search Firms
            </Link>
            <Link href="/for-coaches" className="hidden lg:inline text-[13px] text-slate-400 hover:text-white transition-colors" title="For executive coaches" aria-label="Executive coach route">
              Coaches
            </Link>
            <Link href="/about" className="hidden sm:inline text-[13px] text-slate-400 hover:text-white transition-colors" title="About the company and commitments" aria-label="About Starting Monday">
              About
            </Link>
            <Link href="/optimize" className="hidden sm:inline text-[13px] text-slate-400 hover:text-white transition-colors" title="Free executive profile grade" aria-label="Free executive profile grade">
              Free Profile Grade
            </Link>
            <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors" title="Log in to your account" aria-label="Log in">
              Log in
            </Link>
          </div>
        </div>
      </nav>

      <main>
      <section className="bg-slate-900 px-4 sm:px-6 pt-16 sm:pt-20 pb-20 sm:pb-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-[16px] sm:text-[21px] text-slate-300 font-semibold leading-relaxed mb-5 sm:mb-7">
            {hero.eyebrow}
          </p>
          <h1 className="text-[36px] sm:text-[46px] font-bold text-white leading-[1.1] tracking-tight mb-5">
            {hero.h1Lines.map((line, i) => (
              <span key={i}>{line}{i < hero.h1Lines.length - 1 && <br />}</span>
            ))}
          </h1>
          {hero.bodyPreamble && (
            <p className="text-[15px] text-slate-400 leading-relaxed max-w-xl mb-3 whitespace-pre-line">
              {hero.bodyPreamble}
            </p>
          )}
          <p className="text-[16px] text-slate-300 leading-relaxed max-w-xl mb-3">
            {hero.body}
          </p>
          <p className="text-[13px] text-slate-400 leading-relaxed max-w-xl mb-5">
            Built for executive scrutiny: every brief, recommendation, and next step is calibrated for C-suite transitions.
          </p>

          {/* Competitive edge / FOMO */}
          {hero.competitiveEdge && (
            <p className="text-[13px] text-orange-300 leading-relaxed max-w-xl mb-6 font-medium inline-flex items-start gap-1.5">
              <BrandIcon name="performance" className="h-4 w-4 text-orange-400 mt-[1px] shrink-0" />
              <span>{hero.competitiveEdge}</span>
            </p>
          )}

          {/* Proof point / Testimonial */}
          {hero.testimonial && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 mb-8 max-w-xl">
              <p className="text-[14px] text-slate-200 italic leading-relaxed mb-3">
                "{hero.testimonial.quote}"
              </p>
              <p className="text-[12px] text-slate-400 font-semibold">{hero.testimonial.source}</p>
              <p className="text-[12px] text-orange-400 font-semibold mt-2">{hero.testimonial.result}</p>
            </div>
          )}

          {/* Confidentiality promise - moved to before the main CTA for trust anchor */}
          <p className="text-[12px] font-bold tracking-[0.08em] uppercase text-green-400 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
            Private by default
          </p>
          <p className="text-[13px] text-slate-500 mb-8">
            Your search is completely private. We never share your identity, targets, or activity. No credit card. No employer access. No recruiter visibility.
          </p>

          <div className="mb-8 rounded-lg border border-slate-700 bg-slate-800/70 p-5">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-3">Pick your channel first</p>
            <p className="text-[13px] text-slate-300 leading-relaxed mb-4">
              Choose the path that matches your context. Messaging, proof, and next actions adapt to your role.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CHANNEL_ROUTE_SPECS.map((spec) => (
                <TrackLink
                  key={spec.channel}
                  href={spec.route}
                  event={EVENT_NAMES.channelEntryClicked}
                  logToUserEvents
                  properties={{
                    channel: spec.channel,
                    cta_label: 'hero_channel_ia_card',
                    source_page: '/',
                  }}
                  className="block rounded-md border border-slate-700 bg-slate-900 px-4 py-3 hover:border-orange-500 transition-colors"
                >
                  <p className="text-[13px] font-semibold text-white">{spec.label}</p>
                  <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">{CHANNEL_BEST_FOR[spec.channel]}</p>
                </TrackLink>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-[12px] text-slate-400 mb-2">Not sure which path fits yet?</p>
              <TrackLink
                href="/for-vp"
                event={EVENT_NAMES.channelEntryClicked}
                logToUserEvents
                properties={{
                  channel: 'executives',
                  cta_label: 'hero_channel_ia_default',
                  source_page: '/',
                }}
                className="inline-block text-[12px] font-semibold text-orange-300 underline underline-offset-2 hover:text-orange-200 transition-colors"
              >
                Start with the executive path and refine from there
              </TrackLink>
            </div>
          </div>

          {hero.claimMethodLabel && hero.claimMethodHref && (
            <p className="text-[12px] text-slate-400 mb-7">
              <Link href={hero.claimMethodHref} className="underline decoration-slate-600 underline-offset-2 hover:text-slate-200 transition-colors">
                {hero.claimMethodLabel}
              </Link>
              {hero.claimEvidenceLabel && hero.claimEvidenceHref && (
                <>
                  {' '}
                  ·{' '}
                  <Link href={hero.claimEvidenceHref} className="underline decoration-slate-600 underline-offset-2 hover:text-slate-200 transition-colors">
                    {hero.claimEvidenceLabel}
                  </Link>
                </>
              )}
            </p>
          )}

          {hero.steps && hero.steps.length > 0 && (
            <div className="flex flex-col gap-2.5 mb-9">
              {hero.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[11px] font-bold text-orange-500 shrink-0 w-4 mt-0.5">{i + 1}</span>
                  <p className="text-[13px] text-slate-400 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div>
              <Link
                href="/signup"
                className="inline-block bg-orange-500 text-slate-900 text-[14px] font-bold px-7 py-3.5 rounded hover:bg-orange-600 transition-colors"
              >
                Start free trial &rarr;
              </Link>
              <p className="text-[12px] text-slate-400 mt-2.5">{hero.trialNote}</p>
            </div>
            <div>
              <Link
                href="/demo"
                className="inline-block text-[14px] font-bold text-white border border-slate-500 px-7 py-3.5 rounded hover:border-slate-300 transition-colors"
              >
                See it in action &rarr;
              </Link>
              <p className="text-[12px] text-slate-400 mt-2.5">Live prep brief demo. No signup required.</p>
            </div>
          </div>
          <p className="text-[12px] text-slate-300 mt-4 font-medium">
            Start in minutes: define your targets, set your level, and begin a disciplined daily cadence.
          </p>

        </div>

        {/* Dashboard preview */}
        <div className="mt-14 sm:mt-16 max-w-5xl mx-auto px-0">
          <div className="max-w-4xl mx-auto mb-6">
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-300 mb-2 text-center">Current-state briefing view</p>
            <p className="text-[14px] text-slate-400 leading-relaxed text-center mb-5">
              One screen aligned to the hero promise: what changed overnight, what to do first, and why now.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
              <div className="rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-300">
                <span className="font-semibold text-orange-300">What changed overnight:</span> signal and leadership movement
              </div>
              <div className="rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-300">
                <span className="font-semibold text-orange-300">What to do first:</span> one highest-value outreach action
              </div>
              <div className="rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-300">
                <span className="font-semibold text-orange-300">Why now:</span> timing window closes before formal posting
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-2 sm:-inset-3 rounded-2xl bg-gradient-to-r from-orange-500/20 via-sky-500/10 to-indigo-500/20 blur-xl" />
            <div className="relative rounded-2xl border border-slate-700 bg-slate-950 p-3 sm:p-4 shadow-2xl">
              <div className="flex items-center gap-2 px-1 pb-3 border-b border-slate-800 text-[11px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-700" />
                <span className="w-2 h-2 rounded-full bg-slate-700" />
                <span className="w-2 h-2 rounded-full bg-slate-700" />
                <span className="ml-2">Morning briefing</span>
                <span className="ml-auto rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-slate-300">Focused view</span>
              </div>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Overnight changes</p>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-orange-500/30 bg-slate-950 p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[13px] font-semibold text-white">Accenture</p>
                        <span className="text-[10px] font-semibold text-orange-300 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-full">Pattern alert</span>
                      </div>
                      <p className="text-[12px] text-slate-300 leading-relaxed">Leadership bench shift plus deal integration signal suggests a near-term VP Technology window.</p>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[13px] font-semibold text-white">Workday</p>
                        <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">Exec departure</span>
                      </div>
                      <p className="text-[12px] text-slate-300 leading-relaxed">CIO role is open with no formal posting yet, creating an early outreach window.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">First action</p>
                  <p className="text-[13px] font-semibold text-white mb-2">Contact first:</p>
                  <p className="text-[12px] text-slate-300 leading-relaxed mb-3">SVP Platform at Accenture. Reference the integration timeline and open VP scope in your message.</p>
                  <div className="rounded-md border border-orange-500/40 bg-orange-500/10 px-3 py-2">
                    <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-orange-300">Why now</p>
                    <p className="text-[12px] text-slate-200 leading-relaxed mt-1">This window typically closes before the role is visible on major job boards.</p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-3">Estimated prep time: 5 minutes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Objection Discovery — addressing real executive concerns */}
      <section id="fit-check" className="bg-slate-800 px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-700">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[20px] font-bold text-white mb-10 leading-snug">
            You might be thinking: Here's exactly where we fit in.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Objection 1: I have a coach */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <p className="text-[13px] font-bold text-orange-400 mb-2">If you work with a coach</p>
              <p className="text-[13px] text-white font-semibold mb-3">"My coach handles this."</p>
              <p className="text-[13px] text-slate-300 leading-relaxed mb-3">
                Exactly. We handle the infrastructure layer your coach builds on. Every morning, your briefing surfaces which conversations to prioritize. Before each session with your coach, you have your prep brief ready. We make what they teach executable.
              </p>
              <p className="text-[12px] text-slate-500 italic">20% of our early users brought the briefing into every coaching session.</p>
            </div>

            {/* Objection 2: I use LinkedIn Premium / have a recruiter */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <p className="text-[13px] font-bold text-orange-400 mb-2">If you use LinkedIn Premium or have a recruiter</p>
              <p className="text-[13px] text-white font-semibold mb-3">"I already have those tools."</p>
              <p className="text-[13px] text-slate-300 leading-relaxed mb-3">
                LinkedIn is a job board; we are intelligence + cadence. Your recruiter works inside the formal process; we work before it exists. The signal comes 11 days before the search goes to a firm. We catch it.
              </p>
              <p className="text-[12px] text-slate-500 italic">Your recruiter will have better context because you reached out sooner.</p>
            </div>

            {/* Objection 3: Will my employer find out */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <p className="text-[13px] font-bold text-orange-400 mb-2">Privacy is non-negotiable</p>
              <p className="text-[13px] text-white font-semibold mb-3">"Will my employer find out?"</p>
              <p className="text-[13px] text-slate-300 leading-relaxed mb-3">
                No. We have no relationship with employers, search firms, or recruiters. We do not sell leads. We do not train AI on your data. Your account is completely private. We never share your activity.
              </p>
              <p className="text-[12px] text-slate-500 italic">Delete everything anytime, from Settings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Persona self-selection — immediately after hero per Kahneman: System 1 before System 2 */}
      <section id="situations" className="bg-slate-50 px-4 sm:px-6 py-12 sm:py-16 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-xl mb-7">
            The hardest part isn&rsquo;t finding the role. It&rsquo;s admitting you&rsquo;re looking for one.
          </p>

          <h2 className="text-[22px] font-bold text-slate-900 mb-2">
            Where are you in the search?
          </h2>
          <p className="text-[14px] text-slate-500 mb-8">
            Pick the one that fits. The platform adjusts to where you are and what you need to do next.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {situations.map(s => (
              <Link
                key={s.id}
                href={`/signup?from=${s.id}`}
                className="group bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-800 hover:shadow-sm transition-all"
              >
                <p className="text-[15px] font-semibold text-slate-900 mb-1.5 group-hover:text-slate-700">
                  {s.headline}
                </p>
                <p className="text-[13px] text-slate-500 leading-relaxed">{s.sub}</p>
              </Link>
            ))}
          </div>

          {/* Founder Trust Block - after situation self-selection */}
          <div className="bg-slate-800 rounded-lg px-5 py-4 mt-8 text-left shadow-md border border-slate-700">
            <p className="text-[15px] text-white font-semibold mb-1">From the founder</p>
            <p className="text-[14px] text-slate-200 leading-relaxed">I built Starting Monday for executives who need total privacy, real leverage, and a process that works at the highest level. If you have questions before starting, use the <Link href="/concierge" className="underline hover:text-orange-400">concierge contact path</Link> — <span className="italic">Richard Rothschild, Founder</span></p>
          </div>
        </div>
      </section>

      {/* Intelligence Scanner spotlight */}
      <section id="signal-scanner" className="bg-slate-900 px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-800">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">
            Intelligence Scanner
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <h2 className="text-[26px] sm:text-[32px] font-bold text-white leading-tight mb-4">
                We watch for the signals<br />that come before the<br />search begins.
              </h2>
              <p className="text-[15px] text-slate-400 leading-relaxed mb-5">
                Executive departures. 8-K filings. Funding rounds. Acquisition announcements. We monitor all of it for every company you are tracking. When signals cluster into a pattern, we name it. This company has a transition window. Reach out now, before the formal search begins.
              </p>
              <details className="mb-5 rounded-md border border-slate-700 bg-slate-800/60 px-4 py-3">
                <summary className="cursor-pointer text-[12px] font-semibold tracking-[0.08em] uppercase text-slate-300">Reactive search vs campaign mindset</summary>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-2">Reactive search</p>
                    <ul className="space-y-1.5 text-[12px] text-slate-400 leading-relaxed list-disc pl-4">
                      <li>Checking job boards daily, hoping something surfaces.</li>
                      <li>Applying cold to posted roles where hundreds already applied.</li>
                      <li>Preparing the night before an interview.</li>
                      <li>Losing track of who said what and when.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-orange-300 mb-2">Campaign mindset</p>
                    <ul className="space-y-1.5 text-[12px] text-slate-300 leading-relaxed list-disc pl-4">
                      <li>Watching targets for signals before a search opens.</li>
                      <li>Building relationships before a role is authorized.</li>
                      <li>Walking in with a brief assembled from company context.</li>
                      <li>Tracking every conversation with clear follow-through.</li>
                    </ul>
                  </div>
                </div>
              </details>
              <div className="flex flex-wrap gap-2 mb-6">
                {['News', '8-K Filings', 'Exec Snapshots', 'Funding Rounds', 'PR Wire', 'Career Pages'].map(src => (
                  <span key={src} className="text-[10px] font-semibold text-slate-500 border border-slate-700 rounded px-2 py-1">
                    {src}
                  </span>
                ))}
              </div>
              <Link
                href="/method-and-evidence"
                className="inline-block text-[13px] font-semibold text-slate-100 border border-slate-500 px-5 py-2.5 rounded hover:border-slate-300 transition-colors"
              >
                Review method and evidence &rarr;
              </Link>
              <p className="text-[12px] text-slate-600 mt-4 leading-relaxed">
                We continuously process signals from companies being tracked by executives in active search. Yours update every 48 hours.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {/* Card 1 - pattern alert: before search exists */}
              <div className="bg-slate-800 border border-orange-500 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-slate-200">Accenture</span>
                  <span className="text-[10px] font-semibold text-orange-400 bg-slate-900 px-2 py-0.5 rounded-full">Pattern Alert</span>
                </div>
                <p className="text-[13px] font-semibold text-white mb-1">Leadership Transition Window</p>
                <p className="text-[12px] text-slate-400 leading-relaxed mb-2">CIO departed last week. Combined with a digital transformation announcement, this is a high-probability window for external technology leadership.</p>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-orange-400 font-semibold">Reach out before the search is formalized.</p>
                  <p className="text-[11px] text-slate-600">High watch activity from executives in transition</p>
                </div>
              </div>
              {/* Card 2 - exec departure: before search is announced */}
              <div className="bg-slate-800 border border-amber-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-slate-200">Workday</span>
                  <span className="text-[10px] font-semibold text-amber-400 bg-slate-900 px-2 py-0.5 rounded-full">Exec Departure</span>
                </div>
                <p className="text-[13px] font-semibold text-white mb-1">Chief Information Officer departed</p>
                <p className="text-[12px] text-slate-400 leading-relaxed mb-2">No replacement announced. No active search posted. The vacancy is open.</p>
                <p className="text-[11px] text-slate-500">Detected via exec snapshot &mdash; yesterday.</p>
              </div>
              {/* Card 3 - role posted: before LinkedIn */}
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-slate-200">ServiceNow</span>
                  <span className="text-[10px] font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded-full">Role Posted</span>
                </div>
                <p className="text-[13px] font-semibold text-white mb-1">VP, Enterprise Technology</p>
                <p className="text-[12px] text-slate-400 leading-relaxed mb-2">Posted to their career page recently.</p>
                <p className="text-[11px] text-slate-500">Before LinkedIn, before any recruiter.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="feature-stack" className="bg-slate-50 px-4 sm:px-6 py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-7 sm:mb-8">
            What it does
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map(f => {
              const copy = splitFeatureBody(f.body)
              return (
              <div key={f.label} className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6">
                <p className="text-[14px] font-semibold text-slate-900 mb-2">{f.label}</p>
                <p className="text-[14px] text-slate-700 leading-relaxed">{copy.summary}</p>
                {copy.detail && (
                  <p className="text-[13px] text-slate-500 leading-relaxed mt-2">{copy.detail}</p>
                )}
                <details className="mt-3">
                  <summary className="text-[12px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer">See full capability</summary>
                  <p className="text-[13px] text-slate-500 leading-relaxed mt-2">{f.body}</p>
                </details>
              </div>
            )})}
          </div>
          <div className="mt-8 text-center">
            <p className="text-[12px] text-slate-500">Feature details expanded for scan speed; conversion paths stay concentrated in the hero and close.</p>
          </div>
        </div>
      </section>

      <SamplePrepBrief />
      {/* Board & Advisory positioning */}
      <section id="long-horizon" className="bg-slate-50 px-4 sm:px-6 py-12 sm:py-14 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <details className="group rounded-lg border border-slate-200 bg-white p-5 sm:p-6" open={false}>
            <summary className="cursor-pointer list-none">
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-2">
                Multi-year positioning
              </p>
              <h2 className="text-[22px] sm:text-[26px] font-bold text-slate-900 leading-tight">
                Board seeking, advisor roles, or C-suite positioning on your own timeline.
              </h2>
              <p className="text-[14px] text-slate-600 leading-relaxed mt-3 max-w-2xl">
                Expand to view long-horizon operating guidance for board, advisory, and PE-network momentum.
              </p>
            </summary>
            <div className="mt-8">
              <p className="text-[15px] text-slate-600 leading-relaxed max-w-2xl mb-8">
                Board and advisory paths run on multi-year relationship momentum. Starting Monday keeps your research, signal watch, and outreach cadence active so nothing goes cold.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 sm:p-6">
                  <p className="text-[14px] font-semibold text-slate-900 mb-2">Monitor Board Composition</p>
                  <ul className="space-y-2 text-[13px] text-slate-600 leading-relaxed list-disc pl-4">
                    <li>Track governance changes across target companies in one view.</li>
                    <li>Spot board-seat and PE transition openings earlier.</li>
                  </ul>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 sm:p-6">
                  <p className="text-[14px] font-semibold text-slate-900 mb-2">Maintain Relationship Momentum</p>
                  <ul className="space-y-2 text-[13px] text-slate-600 leading-relaxed list-disc pl-4">
                    <li>Keep long-horizon outreach cadence alive with less overhead.</li>
                    <li>Prevent key sponsor and board-track relationships from going cold.</li>
                  </ul>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 sm:p-6">
                  <p className="text-[14px] font-semibold text-slate-900 mb-2">Evolve Your Narrative</p>
                  <ul className="space-y-2 text-[13px] text-slate-600 leading-relaxed list-disc pl-4">
                    <li>Refresh your board/advisor narrative as market conditions shift.</li>
                    <li>Anchor outreach in fresh, company-specific signals.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 bg-slate-50 border border-slate-200 rounded-lg p-6 max-w-3xl">
                <p className="text-[14px] text-slate-700 leading-relaxed">
                  <span className="font-semibold">For PE-backed companies:</span> Track portfolio company signals and governance composition. Build relationships with operating partners before board opportunities are formal. Stay top-of-mind over 24-36 months.
                </p>
                <p className="text-[14px] text-slate-700 leading-relaxed mt-4">
                  <span className="font-semibold">For advisors:</span> Monitor 8-K filings and funding rounds at 30+ portfolio companies. Maintain weekly outreach without it feeling like work. Track which companies you're advising and which conversations are active.
                </p>
              </div>
            </div>
          </details>
        </div>
      </section>
      {/* Operating cadence */}
      <section id="operating-cadence" className="bg-white px-4 sm:px-6 py-16 sm:py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
            How it runs
          </p>
          <h2 className="text-[22px] font-bold text-slate-900 mb-9 max-w-xl leading-snug">
            Three touchpoints. No wasted motion.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl">
            <div className="border-t-2 border-orange-500 pt-5">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Monday morning</p>
              <p className="text-[14px] font-semibold text-slate-900 mb-2">Review your pipeline.</p>
              <ul className="space-y-1.5 text-[13px] text-slate-500 leading-relaxed list-disc pl-4">
                <li>Update stages and remove stale opportunities.</li>
                <li>Pick who moves to outreach this week.</li>
              </ul>
            </div>
            <div className="border-t-2 border-slate-200 pt-5">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Every morning</p>
              <p className="text-[14px] font-semibold text-slate-900 mb-2">Act on overnight signals.</p>
              <ul className="space-y-1.5 text-[13px] text-slate-500 leading-relaxed list-disc pl-4">
                <li>Use the briefing to pick your first high-value action.</li>
                <li>Turn signal movement into same-day outreach.</li>
              </ul>
            </div>
            <div className="border-t-2 border-slate-200 pt-5">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Before each interview</p>
              <p className="text-[14px] font-semibold text-slate-900 mb-2">Run the prep brief.</p>
              <ul className="space-y-1.5 text-[13px] text-slate-500 leading-relaxed list-disc pl-4">
                <li>Generate your win thesis and likely objections in about a minute.</li>
                <li>Walk in with sharper questions and tighter positioning.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Proof + Metrics */}
      <section id="proof-metrics" className="bg-slate-900 px-4 sm:px-6 py-16 sm:py-20 border-b border-slate-800">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3 text-center">
            Proof + Metrics
          </p>
          <h2 className="text-[24px] sm:text-[28px] font-bold text-white text-center mb-10 leading-snug">
            Measurable evidence, verification context, and the operating window.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-5">
              <p className="text-[28px] sm:text-[34px] font-bold text-white leading-none mb-2">10+</p>
              <p className="text-[12px] sm:text-[13px] text-slate-300 leading-relaxed">Intelligence sources per target company: SEC filings, exec moves, news, business journals, PR wire, trade press, and career pages.</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-5">
              <p className="text-[28px] sm:text-[34px] font-bold text-white leading-none mb-2">60s</p>
              <p className="text-[12px] sm:text-[13px] text-slate-300 leading-relaxed">To generate a role-specific prep brief with company context, likely objections, and peer-level questions.</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-5">
              <p className="text-[28px] sm:text-[34px] font-bold text-white leading-none mb-2">11 days</p>
              <p className="text-[12px] sm:text-[13px] text-slate-300 leading-relaxed">Average window between first signal and retained-search handoff.</p>
              <Link href="/blog/how-we-estimate-early-role-signals" className="text-[12px] underline text-slate-200 hover:text-white transition-colors">
                Method and source notes
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg border border-slate-200 px-5 sm:px-6 py-6 text-slate-900">
            <h3 className="text-[18px] font-bold mb-3 text-center">Verified pilot evidence</h3>
            <p className="text-[12px] text-slate-600 mb-5 text-center">Verification-first policy: we publish outcomes only after explicit permission and methodology checks.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-8 mb-4 text-center">
              <div>
                <p className="text-[28px] font-bold text-green-600 leading-none mb-1">81%</p>
                <p className="text-[13px] text-slate-700">Reached first interview inside 30 days</p>
              </div>
              <div>
                <p className="text-[28px] font-bold text-green-600 leading-none mb-1">27</p>
                <p className="text-[13px] text-slate-700">Pilot executives in Jan-May 2026 cohort</p>
              </div>
              <div>
                <p className="text-[28px] font-bold text-green-600 leading-none mb-1">9 days</p>
                <p className="text-[13px] text-slate-700">Median time to first qualified outreach from setup</p>
              </div>
            </div>
            <p className="text-[12px] text-slate-500 text-center">Updated May 2026. Denominator: 27 pilot executives. Window: Jan-May 2026.</p>
          </div>

          <div className="mt-8 border-t border-slate-700 pt-7">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-300 mb-3 text-center">From the brief</p>
            <div className="flex flex-col gap-2 max-w-3xl mx-auto">
              <Link href="/blog/executive-hiring-patterns-2026" className="text-[13px] text-slate-300 hover:text-white underline underline-offset-2 transition-colors">
                We analyzed 300+ executive hiring profiles: what actually gets senior leaders interviewed.
              </Link>
              <Link href="/blog/why-executive-recruiters-go-quiet" className="text-[13px] text-slate-300 hover:text-white underline underline-offset-2 transition-colors">
                Why executive recruiters go quiet and how senior candidates can break the pattern.
              </Link>
              <Link href="/blog/why-starting-monday-exists" className="text-[13px] text-slate-300 hover:text-white underline underline-offset-2 transition-colors">
                Why Starting Monday exists: executive search is not a resume problem.
              </Link>
            </div>
          </div>

          <div className="mt-9 text-center">
            <p className="text-[13px] text-slate-400 mb-4">Built for senior executives in active search.</p>
          </div>
        </div>
      </section>

      <PricingSection trialNote={hero.trialNote} />

      {/* FAQ */}
      {faqs && faqs.length > 0 && (
        <>
          <JsonLd data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(f => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }} />
          <section id="faq" className="bg-white px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-100">
            <div className="max-w-3xl mx-auto">
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
                Common questions
              </p>
              <h2 className="text-[22px] font-bold text-slate-900 mb-10 leading-snug">
                What executives ask before they start.
              </h2>
              <dl className="space-y-8">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-t border-slate-100 pt-7">
                    <dt className="text-[15px] font-semibold text-slate-900 mb-3">{faq.question}</dt>
                    <dd className="text-[14px] text-slate-500 leading-relaxed">{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </>
      )}

      {/* Final CTA */}
      <section id="start-now" className="bg-slate-900 px-4 sm:px-6 py-16 sm:py-24 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[30px] sm:text-[36px] font-bold text-white mb-4 leading-tight">
            The signal comes before<br />the search begins.<br />Be watching when it does.
          </h2>
          <p className="text-[15px] text-slate-400 mb-4 max-w-xl mx-auto leading-relaxed">
            The people who land the best roles aren&rsquo;t luckier. They stopped feeling behind. They started sooner, watched closer, and walked in knowing what everyone else was about to find out.
          </p>
          <p className="text-[13px] text-slate-500 mb-8 max-w-lg mx-auto leading-relaxed">
            Every week you are not watching your targets is a week another candidate is. The window before a search is posted closes in days, not weeks.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-orange-500 text-slate-900 text-[14px] font-bold px-8 py-3.5 rounded hover:bg-orange-600 transition-colors"
          >
            Start your campaign &rarr;
          </Link>
          <p className="text-[12px] text-slate-400 mt-3">{hero.trialNote}</p>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-5 pb-5 border-b border-slate-800">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-500 mb-3">Utility rail</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-slate-400">
              <Link href="/partners" className="hover:text-slate-200 transition-colors">Partner program</Link>
              <Link href="/for-coaches" className="hover:text-slate-200 transition-colors">Coaches</Link>
              <Link href="/for-search-firms" className="hover:text-slate-200 transition-colors">Search firms</Link>
              <Link href="/for-pe-teams" className="hover:text-slate-200 transition-colors">PE teams</Link>
              <span className="text-slate-600">|</span>
              {PERSONA_LINKS.slice(0, showPersonaSelector ? PERSONA_LINKS.length : 5).map((p) => (
                <Link key={p.href} href={p.href} className="hover:text-slate-200 transition-colors">
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-5 pb-5 border-b border-slate-800">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400">
              <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
            </span>
            <div className="flex items-center gap-4 sm:gap-5 flex-wrap">
              <Link href="/blog" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Blog</Link>
              <Link href="/about" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">About</Link>
              <Link href="/optimize" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Free Profile Grade</Link>
              <a href="https://www.linkedin.com/company/starting-monday" target="_blank" rel="noopener noreferrer" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">LinkedIn</a>
              <Link href="/security" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Security</Link>
              <Link href="/privacy" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Terms</Link>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Legal trust line: privacy-first by design, no employer visibility, and no sale of user search activity.
          </p>
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} Starting Monday. All rights reserved.
          </p>
        </div>
      </footer>

    </main>

    </div>
  )
}





