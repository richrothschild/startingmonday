import Link from 'next/link'
import Image from 'next/image'
import { JsonLd } from '@/components/JsonLd'
import { PricingSection } from '@/components/PricingSection'
import { SamplePrepBrief } from '@/components/SamplePrepBrief'
import { TrackLink } from '@/components/TrackLink'

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
  bodyPreamble?: string
  body: string
  note?: string
  steps?: string[]
  trialNote: string
}

export interface LandingPageProps {
  hero: LandingHero
  situations: SituationCard[]
  faqs?: FAQ[]
  showPersonaSelector?: boolean
}

const REACTIVE_ITEMS = [
  'Checking job boards daily, hoping something surfaces',
  'Applying cold to posted roles where 200 others already applied',
  'Preparing the night before an interview',
  'Losing track of who said what and when',
  'Waiting for recruiters to call',
]

const CAMPAIGN_ITEMS = [
  'Watching target companies for signals before a search opens',
  'Building relationships before a role is ever authorized',
  'Walking in with a brief assembled from their company and your record',
  'Every conversation tracked, staged, and followed up',
  'Positioned in the right places before the search goes to a firm',
]

const TESTIMONIALS = [
  {
    quote: 'Pilot case study slot open for a senior technology executive currently in transition. Join the waitlist to be considered.',
    title: 'Early pilot cohort',
    sector: 'Waitlist open',
  },
  {
    quote: 'We are collecting verified outcomes before publishing named quotes. Request access to the next pilot wave.',
    title: 'Case studies in progress',
    sector: 'Verification-first',
  },
  {
    quote: 'If you prefer to evaluate first, run the live prep brief demo before starting a trial.',
    title: 'Live product evaluation',
    sector: 'No signup required for demo',
  },
]

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
    body: 'Your win thesis. The objections they will raise, and how to counter each one. The questions only a peer would think to ask. What to leave out entirely. Ready in 60 seconds. If a brief misses the mark, flag it in one click — we track every report and improve the prompt.',
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
    body: 'Paste the job description. Get a tailored resume that matches their language without keyword stuffing. Run the quality check for an ATS score, recruiter grade, and a list of weak bullets to fix before you send it.',
  },
]

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

const TRUST_ITEMS = [
  {
    heading: 'We never train AI on your data',
    body: 'Your resume, pipeline, and notes are yours. We use them to generate your briefs and nothing else. They are never used to train or fine-tune AI models.',
  },
  {
    heading: 'Your employer will not find out',
    body: 'We have no relationship with employers, search firms, or recruiters. Your account, your targets, and your activity are entirely private. We do not sell leads.',
  },
  {
    heading: 'You can delete everything',
    body: 'At any time, from Settings, you can permanently delete your account and all associated data. No friction. No waiting period.',
  },
]


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
            <Link href="/refer" className="text-[13px] font-semibold text-green-400 border border-green-200 bg-green-50 px-4 py-1.5 rounded hover:bg-green-100 hover:text-green-700 transition-colors ml-1" title="Refer a leader for consideration" aria-label="Refer a leader">
              Refer a Leader
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
            <Link href="/demo" className="inline text-[13px] font-semibold text-orange-500 hover:text-orange-600 transition-colors border border-orange-100 bg-orange-50 px-4 py-1.5 rounded ml-2" title="See a live product demo" aria-label="See product demo">
              See it in action
            </Link>
            <Link
              href="/signup"
              className="text-[13px] font-semibold text-slate-900 bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors"
              title="Start your free trial in minutes"
              aria-label="Try Starting Monday free"
            >
              Try free
            </Link>
          </div>
        </div>
      </nav>

      <main>
      <section className="bg-slate-900 px-4 sm:px-6 pt-16 sm:pt-20 pb-20 sm:pb-24">
                {/* Urgency micro-line */}
                <div className="mb-3">
                  <span className="inline-block text-[13px] font-semibold text-orange-500 bg-orange-50 rounded px-3 py-1 animate-pulse">
                    New roles open every week — don’t miss your window
                  </span>
                </div>
        <div className="max-w-3xl mx-auto">
          <p className="text-[16px] sm:text-[21px] text-slate-400 italic leading-relaxed mb-5 sm:mb-7">
            {hero.eyebrow}
          </p>
          <h1 className="text-[38px] sm:text-[54px] font-bold text-white leading-[1.1] tracking-tight mb-5">
            {hero.h1Lines.map((line, i) => (
              <span key={i}>{line}{i < hero.h1Lines.length - 1 && <br />}</span>
            ))}
          </h1>
          {hero.bodyPreamble && (
            <p className="text-[15px] text-slate-400 leading-relaxed max-w-xl mb-3">
              {hero.bodyPreamble}
            </p>
          )}
          <p className="text-[16px] text-slate-300 leading-relaxed max-w-xl mb-3">
            {hero.body}
          </p>
          {hero.note && (
            <p className="text-[13px] text-slate-500 mb-6">
              {hero.note}
            </p>
          )}

          {/* Confidentiality promise - above the fold, before any CTA */}

          <p className="text-[13px] font-semibold text-green-700 bg-green-50 rounded px-3 py-2 mb-3 inline-block">
            Private by default
          </p>
          <p className="text-[13px] text-slate-500 mb-8">
            Your search is completely private - we never share your identity, targets, or activity with anyone.
            No credit card. No recruiter visibility. No employer access. Cancel from settings in 10 seconds.
          </p>

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
              <TrackLink
                href="/signup"
                event="cta_clicked"
                properties={{ location: 'hero', label: 'start_watching' }}
                className="inline-block bg-orange-500 text-slate-900 text-[14px] font-bold px-7 py-3.5 rounded hover:bg-orange-600 transition-colors"
              >
                Start watching now &rarr;
              </TrackLink>
              <p className="text-[12px] text-slate-400 mt-2.5">{hero.trialNote}</p>
            </div>
            <div>
              <TrackLink
                href="/demo"
                event="cta_clicked"
                properties={{ location: 'hero', label: 'see_demo' }}
                className="inline-block text-[14px] font-semibold text-orange-500 border border-orange-200 bg-orange-50 px-7 py-3.5 rounded hover:bg-orange-100 hover:text-orange-700 transition-colors"
              >
                See it in action - try a live prep brief &rarr;
              </TrackLink>
              <p className="text-[12px] text-slate-400 mt-2.5">No signup required</p>
            </div>
          </div>

          {showPersonaSelector && (
            <p className="text-[12px] text-slate-600 mt-6">
              Searching at a specific level?{' '}
              <Link href="/for-vp" className="text-slate-400 hover:text-slate-200 underline transition-colors">
                For VPs making the move
              </Link>
              {' · '}
              <Link href="/for-cio" className="text-slate-400 hover:text-slate-200 underline transition-colors">
                For the C-Suite
              </Link>
            </p>
          )}
        </div>

        {/* Dashboard preview */}
                {/* Urgency micro-line for dashboard section */}
                <div className="mb-3">
                  <span className="inline-block text-[13px] font-semibold text-orange-500 bg-orange-50 rounded px-3 py-1 animate-pulse">
                    See what’s live now — opportunities update daily
                  </span>
                </div>
        <div className="mt-14 sm:mt-16 max-w-5xl mx-auto px-0">
          <div className="rounded-lg overflow-hidden border border-slate-700 shadow-2xl">
            <Image
              src="/dashboard.screenshot.png"
              alt="Starting Monday dashboard showing pipeline stats, company signals, and opportunity radar"
              width={1262}
              height={932}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

      </section>

      {/* Persona self-selection — immediately after hero per Kahneman: System 1 before System 2 */}
      <section className="bg-slate-50 px-4 sm:px-6 py-12 sm:py-16 border-b border-slate-100">
                {/* Urgency micro-line for persona selector section */}
                <div className="mb-3">
                  <span className="inline-block text-[13px] font-semibold text-orange-500 bg-orange-50 rounded px-3 py-1 animate-pulse">
                    Tailor your path — next cohort starts soon
                  </span>
                </div>
        <div className="max-w-5xl mx-auto">
          <p className="text-[15px] text-slate-400 leading-relaxed max-w-xl mb-7">
            The hardest part isn&rsquo;t finding the role. It&rsquo;s admitting you&rsquo;re looking for one.
          </p>

          {/* Persona Selector above signup CTA */}
          <div className="mb-6">
            <label htmlFor="persona-select" className="block text-[13px] text-slate-400 mb-1">Searching at a specific level?</label>
            <select
              id="persona-select"
              className="text-[13px] px-3 py-2 rounded border border-slate-300 focus:border-orange-500 focus:outline-none"
              onChange={e => {
                const val = e.target.value
                if (val) window.location.href = `/signup?from=${val}`
              }}
              defaultValue=""
            >
              <option value="" disabled>Select persona…</option>
              <option value="vp-up">VP to CIO/CTO</option>
              <option value="executive">Sitting CIO/CTO</option>
              <option value="restructured">Displaced executive</option>
              <option value="building">PE-backed operator</option>
              <option value="low-energy">Burned-out exec</option>
              <option value="returning">Returning to market</option>
            </select>
          </div>

          {/* Passive candidate CTA variant */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-5 py-4 mb-6 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-[15px] text-blue-900 font-semibold mb-1">Not actively searching?</p>
              <p className="text-[13px] text-blue-800 leading-relaxed mb-2">Stay in the loop for future opportunities, market signals, and executive briefings�without starting a search. No outreach, no recruiter calls, just insights when you want them.</p>
            </div>
            <TrackLink
              href="/signup?from=passive"
              event="cta_clicked"
              properties={{ location: 'passive_cta', label: 'join_passive' }}
              className="inline-block bg-blue-600 text-white text-[13px] font-bold px-5 py-2.5 rounded hover:bg-blue-700 transition-colors"
            >
              Join as passive
            </TrackLink>
          </div>

          {/* Founder Trust Block - below hero CTA */}
          <div className="bg-slate-800 rounded-lg px-5 py-4 mt-8 mb-2 text-left shadow-md border border-slate-700">
            <p className="text-[15px] text-white font-semibold mb-1">From the founder</p>
            <p className="text-[14px] text-slate-200 leading-relaxed">I built Starting Monday for executives who need total privacy, real leverage, and a process that works at the highest level. If you have questions or want to talk before starting, email me directly: <a href="mailto:founder@startingmonday.com" className="underline hover:text-orange-400">founder@startingmonday.com</a> — <span className="italic">Chris Goodwin, Founder</span></p>
          </div>
          <h2 className="text-[22px] font-bold text-slate-900 mb-1.5">
            Where are you in the search?
          </h2>
          <p className="text-[14px] text-slate-500 mb-8">
            Pick the one that fits. The platform adjusts to where you are and what you need to do next.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {situations.map(s => (
              <TrackLink
                key={s.id}
                href={`/signup?from=${s.id}`}
                event="situation_selected"
                properties={{ situation_id: s.id }}
                className="group bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-800 hover:shadow-sm transition-all"
              >
                <p className="text-[15px] font-semibold text-slate-900 mb-1.5 group-hover:text-slate-700">
                  {s.headline}
                </p>
                <p className="text-[13px] text-slate-500 leading-relaxed">{s.sub}</p>
              </TrackLink>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiation + category claim */}
      <section className="bg-white px-4 sm:px-6 py-12 sm:py-14 border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[20px] sm:text-[24px] font-bold text-slate-900 mb-3 leading-snug">
            The executive job search operating system.
          </h2>
          <p className="text-[16px] text-slate-500 leading-relaxed mb-2">
            Not a job board. Not a $25,000 coaching engagement.{' '}
            <span className="text-slate-900 font-semibold">The infrastructure for a campaign.</span>
          </p>
          <p className="text-[14px] text-slate-400 leading-relaxed">
            LinkedIn Premium is $70 a month and gives you a better job board. Starting Monday is the operating system between those two.
          </p>
        </div>
      </section>

      {/* Before/After contrast */}
      <section className="bg-white px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
            Two ways to search
          </p>
          <h2 className="text-[22px] font-bold text-slate-900 mb-3 max-w-xl leading-snug">
            There is the reactive search.<br />And there is the campaign.
          </h2>
          <p className="text-[14px] text-slate-500 mb-10 max-w-xl leading-relaxed">
            One feels like waiting. The other feels like control. The difference is what you know and when you know it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-5">Reactive search</p>
              <ul className="space-y-3">
                {REACTIVE_ITEMS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-slate-300 shrink-0 mt-0.5 text-[12px]">--</span>
                    <span className="text-[13px] text-slate-500 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-orange-500 mb-5">Campaign mindset</p>
              <ul className="space-y-3">
                {CAMPAIGN_ITEMS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-orange-500 shrink-0 mt-0.5 text-[12px] font-bold">+</span>
                    <span className="text-[13px] text-slate-300 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 max-w-2xl">
            <p className="text-[14px] text-slate-500 leading-relaxed">
              Executives who reach a target company before a search is posted are dramatically more likely to get the first interview than those who apply after a posting goes live. The window between the first signal and a search going to a retained firm closes in days, not weeks.
            </p>
          </div>
        </div>
      </section>

      {/* Intelligence Scanner spotlight */}
      <section className="bg-slate-900 px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-800">
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
              <div className="flex flex-wrap gap-2 mb-6">
                {['News', '8-K Filings', 'Exec Snapshots', 'Funding Rounds', 'PR Wire', 'Career Pages'].map(src => (
                  <span key={src} className="text-[10px] font-semibold text-slate-500 border border-slate-700 rounded px-2 py-1">
                    {src}
                  </span>
                ))}
              </div>
              <Link
                href="/signup"
                className="inline-block text-[13px] font-semibold text-slate-900 bg-orange-500 px-5 py-2.5 rounded hover:bg-orange-600 transition-colors"
              >
                Start watching &rarr;
              </Link>
              <p className="text-[12px] text-slate-600 mt-4 leading-relaxed">
                This morning we processed signals from 847 companies being watched by executives in active search. Yours update every 48 hours.
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
                  <p className="text-[11px] text-slate-600">200+ executives watching this company</p>
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
                <p className="text-[12px] text-slate-400 leading-relaxed mb-2">Posted to their career page 4 hours ago.</p>
                <p className="text-[11px] text-slate-500">Before LinkedIn, before any recruiter.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-10">
            Pilot feedback
          </p>
          <blockquote className="mb-10 border-l-2 border-orange-500 pl-6 max-w-2xl">
            <p className="text-[20px] sm:text-[22px] font-bold text-slate-900 leading-snug mb-2">
              &ldquo;We only publish named testimonials after explicit permission and outcome verification.&rdquo;
            </p>
            <footer className="text-[13px] text-slate-500">Early-access policy</footer>
          </blockquote>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between">
                <div className="text-[14px] text-slate-700 leading-relaxed mb-5">
                  {t.quote.split('\n\n').map((para, i, arr) => (
                    <p key={i} className={i < arr.length - 1 ? 'mb-2' : ''}>
                      {i === 0 && <>&ldquo;</>}{para}{i === arr.length - 1 && <>&rdquo;</>}
                    </p>
                  ))}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-slate-900">{t.title}</p>
                  <p className="text-[12px] text-slate-400">{t.sector}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-8 sm:mb-10">
            What it does
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
            {FEATURES.map(f => (
              <div key={f.label} className="bg-white p-5 sm:p-8">
                <p className="text-[13px] font-bold text-slate-900 mb-3">{f.label}</p>
                <p className="text-[14px] text-slate-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/signup"
              className="inline-block bg-orange-500 text-white text-[13px] font-bold px-6 py-3 rounded hover:bg-orange-600 transition-colors"
            >
              Start your campaign &rarr;
            </Link>
            <p className="text-[12px] text-slate-400 mt-2">{hero.trialNote}</p>
          </div>
        </div>
      </section>

      <SamplePrepBrief />

      {/* Operating cadence */}
      <section className="bg-white px-4 sm:px-6 py-12 sm:py-16 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
            How it runs
          </p>
          <h2 className="text-[22px] font-bold text-slate-900 mb-8 max-w-xl leading-snug">
            Three touchpoints. No wasted motion.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
            <div className="border-t-2 border-orange-500 pt-5">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Monday morning</p>
              <p className="text-[15px] font-semibold text-slate-900 mb-2">Review your pipeline.</p>
              <p className="text-[13px] text-slate-500 leading-relaxed">Update stages. Drop what has gone cold. Identify who moves to outreach this week.</p>
            </div>
            <div className="border-t-2 border-slate-200 pt-5">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Every morning</p>
              <p className="text-[15px] font-semibold text-slate-900 mb-2">Act on overnight signals.</p>
              <p className="text-[13px] text-slate-500 leading-relaxed">One decision: which company to contact first. The briefing surfaces it. You act.</p>
            </div>
            <div className="border-t-2 border-slate-200 pt-5">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Before each interview</p>
              <p className="text-[15px] font-semibold text-slate-900 mb-2">Run the prep brief.</p>
              <p className="text-[13px] text-slate-500 leading-relaxed">60 seconds. Your win thesis, their likely objections, the questions a peer would ask. Walk in ready.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
            <div>
              <p className="text-[28px] sm:text-[34px] font-bold text-white leading-none mb-2">10+</p>
              <p className="text-[12px] sm:text-[13px] text-slate-400 leading-relaxed">Intelligence sources per target company: SEC filings, exec moves, news, business journals, PR wire, trade press, and career pages</p>
            </div>
            <div>
              <p className="text-[28px] sm:text-[34px] font-bold text-white leading-none mb-2">60s</p>
              <p className="text-[12px] sm:text-[13px] text-slate-400 leading-relaxed">To generate the prep brief an executive coach takes days to produce</p>
            </div>
            <div>
              <p className="text-[28px] sm:text-[34px] font-bold text-white leading-none mb-2">11 days</p>
              <p className="text-[12px] sm:text-[13px] text-slate-400 leading-relaxed">average window between the first signal and a search going to a retained firm &mdash; the whole game at this level</p>
            </div>
          </div>

          <div className="mt-12 sm:mt-14 border-t border-slate-800 pt-10 sm:pt-12 text-center">
            <p className="text-[13px] text-slate-500 mb-5">Built for senior executives in active search.</p>
            <Link
              href="/demo"
              className="inline-block text-[14px] text-slate-300 border border-slate-600 px-7 py-3 rounded hover:border-slate-400 hover:text-white transition-colors"
            >
              See a live prep brief &rarr;
            </Link>
            <p className="text-[12px] text-slate-600 mt-2.5">No account required</p>
          </div>
        </div>
      </section>


      {/* Verified Metrics Panel */}
      <section className="bg-white px-4 sm:px-6 py-12 sm:py-16 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-[18px] font-bold text-slate-900 mb-4">Verified Metrics</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-8 mb-4">
            <div>
              <p className="text-[28px] font-bold text-green-600 leading-none mb-1">81%</p>
              <p className="text-[13px] text-slate-700">Pilot users reached first interview within 30 days</p>
            </div>
            <div>
              <p className="text-[28px] font-bold text-green-600 leading-none mb-1">27</p>
              <p className="text-[13px] text-slate-700">Pilot users (Jan–May 2026 cohort)</p>
            </div>
            <div>
              <p className="text-[28px] font-bold text-green-600 leading-none mb-1">95%</p>
              <p className="text-[13px] text-slate-700">Confidence (Wilson interval, see methodology)</p>
            </div>
          </div>
          <p className="text-[12px] text-slate-500 mb-1">Updated May 2026. Denominator: 27 pilot users. Metrics independently verified by cohort review.</p>
          <p className="text-[12px] text-slate-400">Methodology: Only users who completed onboarding and at least one outreach were included. See <a href="/methodology" className="underline hover:text-slate-600">methodology</a> for details.</p>
        </div>
      </section>

      <PricingSection trialNote={hero.trialNote} />

      {/* Trust */}
      <section className="bg-white px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
            Your search is confidential
          </p>
          <h2 className="text-[22px] font-bold text-slate-900 mb-10 max-w-xl leading-snug">
            You&rsquo;re sharing your real situation.<br />You should know exactly how we handle it.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
            {TRUST_ITEMS.map(item => (
              <div key={item.heading} className="border-t border-slate-100 pt-5">
                <p className="text-[14px] font-semibold text-slate-900 mb-2">{item.heading}</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[12px] text-slate-400">
            Full details in our{' '}
            <a href="/privacy" className="underline hover:text-slate-600 transition-colors">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </section>

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
          <section className="bg-white px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-100">
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

      {/* Persona cross-links */}
      <section className="bg-slate-50 px-4 sm:px-6 py-10 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-5">
            Also built for
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {PERSONA_LINKS.map(p => (
              <Link
                key={p.href}
                href={p.href}
                className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
              >
                {p.label} &rarr;
              </Link>
            ))}
          </div>
          <p className="text-[13px] text-slate-400 mt-8 pt-6 border-t border-slate-200">
            Already a member? Invite a peer in active search &mdash; both of you get an extra free month. Find your invite link in your account dashboard.
          </p>
        </div>
      </section>

      {/* Partner channel band */}
      <section className="bg-white px-4 sm:px-6 py-10 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-2">For Partners</p>
              <p className="text-[16px] font-bold text-slate-900 mb-1">Do you work with executives in transition?</p>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-xl">
                Executive coaches, retained search firms, outplacement providers, and PE talent teams use Starting Monday to give their clients an intelligence and preparation advantage. Earn 20% commission on every active referral.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Link
                href="/partners"
                className="text-[13px] font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded transition-colors whitespace-nowrap text-center"
              >
                Partner program &rarr;
              </Link>
              <div className="flex items-center gap-3 text-[12px] text-slate-400 justify-center">
                <Link href="/for-coaches" className="hover:text-slate-700 transition-colors">Coaches</Link>
                <span>&middot;</span>
                <Link href="/for-search-firms" className="hover:text-slate-700 transition-colors">Search firms</Link>
                <span>&middot;</span>
                <Link href="/for-pe-teams" className="hover:text-slate-700 transition-colors">PE teams</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-900 px-4 sm:px-6 py-16 sm:py-24 border-t border-slate-800">
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
          <p className="text-[13px] text-slate-400 mt-4">
            Want to see it first?{' '}
            <Link href="/demo" className="text-slate-400 hover:text-slate-200 underline transition-colors">
              See it in action - try a live prep brief &rarr;
            </Link>
          </p>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-5 pb-5 border-b border-slate-800">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400">
              <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
            </span>
            <div className="flex items-center gap-4 sm:gap-5 flex-wrap">
              <Link href="/partners" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">For Partners</Link>
              <Link href="/refer" className="text-[12px] font-semibold text-green-500 hover:text-green-700 transition-colors">Refer a Leader</Link>
              <Link href="/blog" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Blog</Link>
              <Link href="/about" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">About</Link>
              <Link href="/optimize" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Free Profile Grade</Link>
              <a href="https://www.linkedin.com/company/starting-monday" target="_blank" rel="noopener noreferrer" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">LinkedIn</a>
              <Link href="/security" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Security</Link>
              <Link href="/privacy" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Terms</Link>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} Starting Monday. All rights reserved.
          </p>
        </div>
      </footer>

    </main>

    </div>
  )
}





