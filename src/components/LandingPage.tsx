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
  note: string
  steps: string[]
  trialNote: string
}

export interface LandingPageProps {
  hero: LandingHero
  situations: SituationCard[]
  faqs?: FAQ[]
  showPersonaSelector?: boolean
}

const FEATURES = [
  {
    label: 'Pipeline Command Center',
    body: 'Every company, contact, and conversation — staged, sequenced, and tracked. Nothing falls through. Nothing goes cold.',
  },
  {
    label: 'Early Role Intelligence',
    body: 'Your target companies are being watched. Three times a week, we scan their career pages and flag matching roles before they reach LinkedIn or Indeed.',
  },
  {
    label: 'Elite Interview Prep Brief',
    body: 'Your win thesis. The objections they will raise, and how to counter each one. The questions only a peer would think to ask. What to leave out entirely. Ready in 60 seconds.',
  },
  {
    label: 'Daily Morning Briefing',
    body: 'New matches, pending actions, and company signals — assembled overnight and in your inbox before the day starts.',
  },
  {
    label: 'AI Career Advisor',
    body: 'A strategic advisor with full visibility into your pipeline. Ask anything — how to frame a gap, what to say to a contact, which companies to prioritize. It takes action when you ask it to.',
  },
  {
    label: 'Search Strategy Brief',
    body: 'One AI synthesis of your full positioning — target roles, sectors, narrative, and outreach approach. Built from your background and the companies you are tracking. Regenerate when your focus shifts.',
  },
  {
    label: 'Resume Tailoring',
    body: 'Paste the job description. Get a tailored resume that matches their language without keyword stuffing. Run the quality check for an ATS score, recruiter grade, and a list of weak bullets to fix before you send it.',
  },
  {
    label: 'Level-Calibrated AI',
    body: 'Set your search level — C-Suite, VP/SVP, or Board/Advisor — and every AI output calibrates to that tier. The prep brief, strategy, outreach, and advisor all speak at the right altitude.',
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
    body: 'We have no relationship with employers and no way for them to search our platform. Your account and activity are entirely private.',
  },
  {
    heading: 'We do not sell or share your data',
    body: 'We sell subscriptions, not data. Your profile, targets, and career information are never shared with third parties, recruiters, or anyone else.',
  },
  {
    heading: 'You can delete everything',
    body: 'At any time, from Settings, you can permanently delete your account and all associated data. No friction. No waiting period.',
  },
  {
    heading: 'The output sounds like you, not like AI',
    body: 'Before writing a word, the AI reads your original resume for sentence rhythm, vocabulary, and formality. Every tailored output calibrates to your voice. You review everything before it leaves your desk.',
  },
  {
    heading: 'Search firms and recruiters cannot find you here',
    body: 'We have no data-sharing relationships with executive search firms, staffing agencies, or recruiters. We do not sell leads. Your search activity is invisible to anyone you have not chosen to contact.',
  },
]

const PASSIVE_FEATURES = [
  'Pipeline tracking for up to 25 companies',
  'Career page scanning 3x per week',
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
              className="text-[13px] font-semibold text-white bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors"
            >
              Try free
            </Link>
          </div>
        </div>
      </nav>

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
          <p className="text-[13px] text-slate-500 mb-8">
            {hero.note}
          </p>

          <div className="flex flex-col gap-2.5 mb-9">
            {hero.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[11px] font-bold text-orange-500 shrink-0 w-4 mt-0.5">{i + 1}</span>
                <p className="text-[13px] text-slate-400 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div>
              <Link
                href="/signup"
                className="inline-block bg-orange-500 text-white text-[14px] font-bold px-7 py-3.5 rounded hover:bg-orange-600 transition-colors"
              >
                Start your campaign &rarr;
              </Link>
              <p className="text-[12px] text-slate-500 mt-2.5">{hero.trialNote}</p>
            </div>
            <div>
              <Link
                href="/demo"
                className="inline-block text-[14px] text-slate-300 border border-slate-600 px-7 py-3.5 rounded hover:border-slate-400 hover:text-white transition-colors"
              >
                See a live demo &rarr;
              </Link>
              <p className="text-[12px] text-slate-600 mt-2.5">No signup required</p>
            </div>
          </div>
          <p className="text-[13px] text-slate-400 mt-5 leading-relaxed max-w-md">
            <span className="font-semibold text-white">Your search stays invisible.</span>{' '}
            We never share your identity, your targets, or your activity with employers, recruiters, or anyone else.
          </p>

          {showPersonaSelector && (
            <p className="text-[12px] text-slate-600 mt-6">
              Searching at a specific level?{' '}
              <Link href="/for-vp" className="text-slate-400 hover:text-slate-200 underline transition-colors">
                For VPs making the move
              </Link>
              {' · '}
              <Link href="/for-cio" className="text-slate-400 hover:text-slate-200 underline transition-colors">
                For active CIO/CTO search
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* Persona self-selection */}
      <section className="bg-slate-50 px-4 sm:px-6 py-12 sm:py-16 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[22px] font-bold text-slate-900 mb-1.5">
            Which of these sounds like you?
          </h2>
          <p className="text-[14px] text-slate-400 mb-8">
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
                <p className="text-[13px] text-slate-400 leading-relaxed">{s.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiation */}
      <section className="bg-white px-4 sm:px-6 py-10 border-b border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[17px] text-slate-500 leading-relaxed">
            Not a job board. Not a $15,000 coaching engagement.{' '}
            <span className="text-slate-900 font-semibold">The operating system for your search.</span>
          </p>
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

      {/* Trust */}
      <section className="bg-white px-4 sm:px-6 py-14 sm:py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">
            Your search is confidential
          </p>
          <h2 className="text-[22px] font-bold text-slate-900 mb-10 max-w-xl leading-snug">
            You&rsquo;re sharing your real situation. You should know exactly how we handle it.
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

      {/* Social proof + stats */}
      <section className="bg-slate-900 px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <blockquote className="text-[18px] sm:text-[23px] font-semibold text-white leading-relaxed mb-3 max-w-2xl">
            &ldquo;StartingMonday helped me stop chasing roles and start targeting the right one. It sharpened how I presented my leadership, clarified where I could create the most impact, and ultimately helped me land a Fortune 500 CTO role. It was the difference between searching and arriving.&rdquo;
          </blockquote>
          <p className="text-[13px] text-slate-500 mb-10 sm:mb-14">Travis, CTO</p>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center border-t border-slate-800 pt-10 sm:pt-12">
            <div>
              <p className="text-[28px] sm:text-[34px] font-bold text-white leading-none mb-2">3&times;</p>
              <p className="text-[12px] sm:text-[13px] text-slate-400 leading-relaxed">Career page checks per week at every target company you add</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 sm:mt-12 border-t border-slate-800 pt-10 sm:pt-12">
            {[
              {
                quote: 'StartingMonday gave me a clearer picture of where I belonged as a technology leader. Instead of sending out resumes blindly, I was able to position myself for the right opportunities and connect my experience to real business impact. That focus helped me land the right CIO role at the right time.',
                name: 'Melissa, CIO',
              },
              {
                quote: 'Most executive recruiting platforms feel transactional. StartingMonday felt strategic. It helped me refine my story, focus on companies that matched my leadership style, and approach the search with confidence instead of guesswork. I landed a role that was a perfect fit.',
                name: 'Daniel, COO',
              },
              {
                quote: 'StartingMonday helped me translate years of financial leadership into a compelling executive narrative. The process brought clarity to what I wanted next and helped me stand out in a competitive market. I accepted a CMO role within weeks of using it seriously.',
                name: 'Priya, CMO',
              },
            ].map(t => (
              <div key={t.name} className="bg-slate-800 rounded-lg p-5">
                <p className="text-[13px] text-slate-300 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-[12px] text-slate-500">{t.name}</p>
              </div>
            ))}
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
            Less than one hour with an executive coach. Every month.
          </h2>
          <p className="text-[14px] text-slate-500 mb-12 max-w-2xl leading-relaxed">
            Executive coaches charge $10,000&ndash;$25,000 for a search engagement. LinkedIn Premium runs $70/mo and gets you better job board access. Starting Monday is the infrastructure between those two &mdash; the campaign operating system you run yourself.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            <div className="border border-slate-200 rounded-lg p-5 sm:p-6">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-2">Passive</p>
              <p className="text-[32px] font-bold text-slate-900 leading-none mb-1">
                $49<span className="text-[16px] font-normal text-slate-400">/mo</span>
              </p>
              <p className="text-[12px] text-slate-400 mb-6">30-day free trial. No credit card.</p>
              <ul className="space-y-2.5">
                {PASSIVE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="text-slate-300 shrink-0 mt-0.5 text-[12px]">+</span>
                    <span className="text-[13px] text-slate-500 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-6 inline-block w-full text-center border border-slate-200 text-slate-700 text-[13px] font-semibold px-5 py-2.5 rounded hover:border-slate-400 transition-colors"
              >
                Try free &rarr;
              </Link>
            </div>
            <div className="border border-slate-900 rounded-lg p-5 sm:p-6 bg-slate-900">
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-2">Active</p>
              <p className="text-[32px] font-bold text-white leading-none mb-1">
                $199<span className="text-[16px] font-normal text-slate-500">/mo</span>
              </p>
              <p className="text-[12px] text-slate-500 mb-6">{hero.trialNote}</p>
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
                className="mt-6 inline-block w-full text-center bg-orange-500 text-white text-[13px] font-bold px-5 py-2.5 rounded hover:bg-orange-600 transition-colors"
              >
                Start your campaign &rarr;
              </Link>
            </div>
          </div>

          <div className="mt-8 max-w-2xl border-t border-slate-100 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-slate-700">
                Executive &mdash; $499/mo <span className="text-[11px] font-normal text-slate-400 ml-1">Coming soon</span>
              </p>
              <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">
                Unlimited pipeline, board and PE firm intelligence, priority brief generation, dedicated account review.
              </p>
            </div>
            <Link
              href="/signup"
              className="shrink-0 text-[12px] font-semibold text-slate-500 border border-slate-200 px-4 py-2 rounded hover:border-slate-400 hover:text-slate-700 transition-colors"
            >
              Join waitlist &rarr;
            </Link>
          </div>
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
            The call will come.<br />Be ready when it does.
          </h2>
          <p className="text-[15px] text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
            The people who land the best roles aren&rsquo;t luckier. They started sooner, stayed closer to their targets, and walked in prepared.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-orange-500 text-white text-[14px] font-bold px-8 py-3.5 rounded hover:bg-orange-600 transition-colors"
          >
            Start your campaign &rarr;
          </Link>
          <p className="text-[12px] text-slate-500 mt-3">{hero.trialNote}</p>
          <p className="text-[13px] text-slate-600 mt-4">
            Want to see it first?{' '}
            <Link href="/demo" className="text-slate-400 hover:text-slate-200 underline transition-colors">
              Explore a live demo &rarr;
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
              <Link href="/blog" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Blog</Link>
              <Link href="/about" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">About</Link>
              <Link href="/optimize" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">Free Profile Grade</Link>
              <a href="https://www.linkedin.com/company/starting-monday" target="_blank" rel="noopener noreferrer" className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors">LinkedIn</a>
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
