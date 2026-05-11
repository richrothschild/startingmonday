import Link from 'next/link'
import { JsonLd } from '@/components/JsonLd'

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
    quote: 'As a CISO, I am cautious about where my resume, targets, and career notes go. What got my attention was not just the AI, it was the restraint. No recruiter marketplace. No employer visibility. No training on my data.\n\nThat made it usable for the kind of search you cannot afford to have discovered.',
    title: 'Chief Information Security Officer',
    sector: 'Healthcare technology',
  },
  {
    quote: 'My first prep brief was more complete than anything I built manually in years. I walked into the conversation as a peer, not a candidate.',
    title: 'Former Fortune 500 CIO',
    sector: 'Financial services',
  },
  {
    quote: 'I was not actively looking. But I had a dozen companies tracked and signals coming in. When the call came, I was ready.',
    title: 'SVP Technology',
    sector: 'Retail and consumer',
  },
]

const FEATURES = [
  {
    label: 'Level-Calibrated AI',
    body: 'Set your search level - C-Suite, VP/SVP, or Board/Advisor - and every AI output calibrates to that tier. The prep brief, strategy, outreach, and advisor all speak at the right altitude.',
  },
  {
    label: 'Pipeline Command Center',
    body: 'Every company, contact, and conversation - staged, sequenced, and tracked. Nothing falls through. Nothing goes cold.',
  },
  {
    label: 'Early Role Intelligence',
    body: 'We monitor news, 8-K filings, funding rounds, executive moves, and career pages for every company you track. When signals cluster into a pattern, we name it and alert you before the search is formalized and before the posting exists.',
  },
  {
    label: 'Elite Interview Prep Brief',
    body: 'Your win thesis. The objections they will raise, and how to counter each one. The questions only a peer would think to ask. What to leave out entirely. Ready in 60 seconds.',
  },
  {
    label: 'Daily Morning Briefing',
    body: 'New matches, pending actions, and company signals - assembled overnight and in your inbox before the day starts.',
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

const PASSIVE_FEATURES = [
  'Pipeline tracking for up to 25 companies',
  'Company intelligence: news, 8-Ks, exec moves, funding, career pages',
  'Pattern alerts before roles are posted',
  'Weekly signal digest',
  'Contact tracker',
]

const ACTIVE_FEATURES = [
  'Everything in Passive',
  'AI Interview Prep Briefs',
  'Search Strategy Brief',
  'AI Chat advisor',
  'Outreach drafting',
  'Resume tailoring + quality check',
  'Daily morning briefing',
]

const EXECUTIVE_FEATURES = [
  'Everything in Active',
  'Unlimited company pipeline',
  'Career page scanning 2x daily',
  'Immediate pattern and exec departure alerts',
  'Opus AI for interview prep briefs',
  'Salary intelligence and negotiation scripts',
  'Recruiter tracker with firm grouping',
  'Priority contact flagging and CSV export',
]

export function LandingPage({ hero, situations, faqs, showPersonaSelector }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Nav */}
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/optimize" className="hidden sm:inline text-[13px] text-slate-400 hover:text-white transition-colors">
              Free Profile Grade
            </Link>
            <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/demo" className="hidden sm:inline text-[13px] text-slate-400 hover:text-white transition-colors">
              Try demo
            </Link>
            <Link
              href="/signup"
              className="text-[13px] font-semibold text-slate-900 bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors"
            >
              Try free
            </Link>
          </div>
        </div>
      </nav>

      <main>

      {/* Hero */}
      <section className="bg-slate-900 px-4 sm:px-6 pt-16 sm:pt-20 pb-20 sm:pb-24">
        <div className="max-w-3xl mx-auto">
          <p className="text-[16px] sm:text-[21px] text-slate-400 italic leading-relaxed mb-5 sm:mb-7">
            {hero.eyebrow}
          </p>
          <h1 className="text-[38px] sm:text-[54px] font-bold text-white leading-[1.1] tracking-tight mb-5">
            {hero.h1Lines.map((line, i) => (
              <span key={i}>{line}{i < hero.h1Lines.length - 1 && <br />}</span>
            ))}
          </h1>
          <p className="text-[16px] text-slate-300 leading-relaxed max-w-xl mb-3">
            {hero.body}
          </p>
          <p className="text-[13px] text-slate-400 mb-3 max-w-xl leading-relaxed">
            Most candidates don&rsquo;t find out until the role posts. By then, the short list already exists.
          </p>
          {hero.note && (
            <p className="text-[13px] text-slate-500 mb-6">
              {hero.note}
            </p>
          )}

          {/* Confidentiality promise - above the fold, before any CTA */}
          <p className="text-[13px] text-slate-500 mb-8">
            Your search is completely private - we never share your identity, targets, or activity with anyone.
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
              <Link
                href="/signup"
                className="inline-block bg-orange-500 text-slate-900 text-[14px] font-bold px-7 py-3.5 rounded hover:bg-orange-600 transition-colors"
              >
                Start watching now &rarr;
              </Link>
              <p className="text-[12px] text-slate-400 mt-2.5">{hero.trialNote}</p>
            </div>
            <div>
              <Link
                href="/demo"
                className="inline-block text-[14px] text-slate-300 border border-slate-600 px-7 py-3.5 rounded hover:border-slate-400 hover:text-white transition-colors"
              >
                See a live demo &rarr;
              </Link>
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
      </section>

      {/* Differentiation */}
      <section className="bg-white px-4 sm:px-6 py-10 border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[17px] text-slate-500 leading-relaxed mb-2">
            Not a job board. Not a $25,000 coaching engagement.{' '}
            <span className="text-slate-900 font-semibold">The intelligence layer executives in transition didn&rsquo;t have before.</span>
          </p>
          <p className="text-[14px] text-slate-400 leading-relaxed">
            LinkedIn Premium is $70 a month and gives you a better job board. Starting Monday is the campaign infrastructure between those two.
          </p>
        </div>
      </section>

      {/* Persona self-selection */}
      <section className="bg-slate-50 px-4 sm:px-6 py-12 sm:py-16 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[22px] font-bold text-slate-900 mb-1.5">
            Where are you in the search?
          </h2>
          <p className="text-[14px] text-slate-500 mb-8">
            Everyone here is in a different place. The platform meets you where you are.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {situations.map(s => (
              <Link
                key={s.id}
                href="/signup"
                className="group bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-800 hover:shadow-sm transition-all"
              >
                <p className="text-[15px] font-semibold text-slate-900 mb-1.5 group-hover:text-slate-700">
                  {s.headline}
                </p>
                <p className="text-[13px] text-slate-500 leading-relaxed">{s.sub}</p>
              </Link>
            ))}
          </div>
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
                <p className="text-[11px] text-orange-400 font-semibold">Reach out before the search is formalized.</p>
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
            What executives say
          </p>
          <blockquote className="mb-10 border-l-2 border-orange-500 pl-6 max-w-2xl">
            <p className="text-[20px] sm:text-[22px] font-bold text-slate-900 leading-snug mb-2">
              &ldquo;Eleven days before the search went to a firm.<br />That window is the whole game at this level.&rdquo;
            </p>
            <footer className="text-[13px] text-slate-500">CTO in transition, Healthcare technology</footer>
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

      {/* Stats */}
      <section className="bg-slate-900 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
            <div>
              <p className="text-[28px] sm:text-[34px] font-bold text-white leading-none mb-2">6</p>
              <p className="text-[12px] sm:text-[13px] text-slate-400 leading-relaxed">Intelligence sources per target company: news, 8-K filings, exec moves, funding, PR wire, and career pages</p>
            </div>
            <div>
              <p className="text-[28px] sm:text-[34px] font-bold text-white leading-none mb-2">60s</p>
              <p className="text-[12px] sm:text-[13px] text-slate-400 leading-relaxed">To generate the prep brief an executive coach takes days to produce</p>
            </div>
            <div>
              <p className="text-[28px] sm:text-[34px] font-bold text-white leading-none mb-2">$0</p>
              <p className="text-[12px] sm:text-[13px] text-slate-400 leading-relaxed">To start. 30-day trial, no credit card, cancel any time</p>
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

      {/* Pricing */}
      <section className="bg-white px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
            What it costs
          </p>
          <h2 className="text-[22px] font-bold text-slate-900 mb-4 max-w-xl leading-snug">
            Infrastructure pricing. Campaign outcomes.
          </h2>
          <p className="text-[14px] text-slate-500 mb-12 max-w-2xl leading-relaxed">
            You run the campaign. We power it. All plans include a 30-day free trial, no credit card required.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl">
            <div className="border border-slate-200 rounded-lg p-5 sm:p-6 flex flex-col">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-2">Passive</p>
              <p className="text-[32px] font-bold text-slate-900 leading-none mb-1">
                $49<span className="text-[16px] font-normal text-slate-400">/mo</span>
              </p>
              <p className="text-[12px] text-slate-400 mb-0.5">30-day free trial. No credit card.</p>
              <p className="text-[12px] text-slate-500 mb-5">or $490/yr &mdash; 2 months free</p>
              <ul className="space-y-2.5">
                {PASSIVE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="text-slate-300 shrink-0 mt-0.5 text-[12px]">+</span>
                    <span className="text-[13px] text-slate-500 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-4 text-[12px] text-slate-400 leading-relaxed">
                Most users move to Active once they see what prep briefs do before an interview.
              </p>
              <Link
                href="/signup"
                className="mt-4 inline-block w-full text-center border border-slate-200 text-slate-700 text-[13px] font-semibold px-5 py-2.5 rounded hover:border-slate-400 transition-colors"
              >
                Try free &rarr;
              </Link>
            </div>
            <div className="border border-slate-900 rounded-lg p-5 sm:p-6 bg-slate-900 flex flex-col">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-2">Active</p>
              <p className="text-[32px] font-bold text-white leading-none mb-1">
                $199<span className="text-[16px] font-normal text-slate-500">/mo</span>
              </p>
              <p className="text-[12px] text-slate-500 mb-0.5">{hero.trialNote}</p>
              <p className="text-[12px] text-slate-500 mb-5">or $1,990/yr &mdash; 2 months free</p>
              <p className="text-[13px] text-slate-400 mb-4 leading-relaxed">Stop running a reactive search.</p>
              <ul className="space-y-2.5">
                {ACTIVE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="text-slate-600 shrink-0 mt-0.5 text-[12px]">+</span>
                    <span className="text-[13px] text-slate-300 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-auto inline-block w-full text-center bg-orange-500 text-slate-900 text-[13px] font-bold px-5 py-2.5 rounded hover:bg-orange-600 transition-colors"
              >
                Start your campaign &rarr;
              </Link>
            </div>
            <div className="border-2 border-orange-500 rounded-lg p-5 sm:p-6 bg-white flex flex-col">
              <div className="mb-2">
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-600">Executive</p>
              </div>
              <p className="text-[32px] font-bold text-slate-900 leading-none mb-1">
                $499<span className="text-[16px] font-normal text-slate-400">/mo</span>
              </p>
              <p className="text-[12px] text-slate-400 mb-0.5">{hero.trialNote}</p>
              <p className="text-[12px] text-slate-500 mb-5">or $5,000/yr &mdash; 2 months free</p>
              <ul className="space-y-2.5">
                {EXECUTIVE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="text-orange-500 shrink-0 mt-0.5 text-[12px]">+</span>
                    <span className="text-[13px] text-slate-700 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-auto inline-block w-full text-center bg-orange-500 text-slate-900 text-[13px] font-bold px-5 py-2.5 rounded hover:bg-orange-600 transition-colors"
              >
                Start your campaign &rarr;
              </Link>
            </div>
          </div>

          {/* Concierge band */}
          <div className="mt-6 max-w-4xl border border-slate-200 rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1.5">
                <p className="text-[13px] font-bold text-slate-900">Executive Concierge</p>
                <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">Waitlist open</span>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-lg">
                Everything in Active, plus a monthly 45-minute strategy session. AI prepares the agenda from your live pipeline. Notes carry forward every call.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[22px] font-bold text-slate-900 leading-none mb-0.5">
                $1,299<span className="text-[13px] font-normal text-slate-400">/mo</span>
              </p>
              <p className="text-[11px] text-slate-400 mb-3">or $13,999/yr</p>
              <Link
                href="/concierge"
                className="inline-block text-[13px] font-semibold text-orange-600 border border-orange-200 bg-orange-50 px-5 py-2 rounded hover:bg-orange-100 transition-colors"
              >
                Join the waitlist &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

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
              Explore a live demo &rarr;
            </Link>
          </p>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
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
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} Starting Monday. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  )
}
