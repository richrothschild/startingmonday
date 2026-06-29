import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Starting Monday | Handshake Partner Demo',
  description:
    'Compact meeting-ready demo for Handshake leadership showing an add-on model for executive-transition support within or alongside Handshake.',
  alternates: { canonical: 'https://startingmonday.app/handshake-review' },
  openGraph: {
    title: 'Starting Monday | Handshake Partner Demo',
    description:
      'A one-screen partner walkthrough mapping to Handshake student, employer, and career-center workflows with two add-on deployment options.',
    url: 'https://startingmonday.app/handshake-review',
  },
}

const QUICK_POINTS = [
  'Handshake today: student opportunity discovery, employer engagement, and career-center reporting at institutional scale.',
  'Add-on target: experienced alumni and career restarters who need confidential, high-touch execution not covered by early-talent defaults.',
  'Pilot decision in 30 days based on qualified introductions, interview-readiness quality, and advisor time saved.',
]

const MEETING_FLOW = [
  {
    title: 'Option A: In-product enhancement',
    body: 'Expose an Executive Transition mode inside Handshake for eligible alumni cohorts. Keep Handshake identity, events, and employer discovery as the front door.',
  },
  {
    title: 'Option B: Companion application',
    body: 'Launch a connected companion app for high-discretion users. Handshake remains system of engagement while the companion handles prep, outreach sequencing, and coaching workflow.',
  },
  {
    title: 'Shared rollout path',
    body: 'Start with one private alumni cohort, one career-center sponsor, and a weekly review cadence before broader deployment.',
  },
]

export default function HandshakeReviewPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.2),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_30%),linear-gradient(180deg,_rgba(9,14,26,0.98)_0%,_rgba(10,15,28,0.96)_60%,_rgba(10,15,28,1)_100%)]" />

      <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/78 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/alumni-networks-review" className="text-[13px] text-slate-200 transition-colors hover:text-white">
              Alumni Networks Demo
            </Link>
            <a
              href="https://joinhandshake.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-orange-500 px-4 py-1.5 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-400"
            >
              Handshake site
            </a>
          </div>
        </div>
      </nav>

      <main className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto grid h-[calc(100vh-5.5rem)] max-w-6xl gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-5">
          <section className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(150deg,rgba(26,22,20,0.72),rgba(10,14,24,0.92))] p-5 shadow-[0_18px_56px_rgba(15,23,42,0.24)] backdrop-blur-sm sm:p-7 lg:flex lg:flex-col lg:justify-between lg:p-8">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-200">Handshake partner briefing</p>
              <h1 className="max-w-3xl font-serif text-[33px] leading-[1.05] tracking-tight text-white sm:text-[46px]">
                Add executive-transition depth to Handshake without disrupting the core product.
              </h1>
              <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-slate-200 sm:text-[18px]">
                Handshake already delivers personalized opportunities, events, employer access, and career-center outcomes reporting. Starting Monday extends that value for advanced alumni transitions as either an embedded feature set or a companion experience.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 lg:mt-7">
              <Link
                href="/demo/michael-strategy-brief"
                className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-orange-400"
              >
                Strategy brief demo
              </Link>
              <Link
                href="/demo/executive-brief"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5"
              >
                Interview brief demo
              </Link>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 lg:grid-rows-[auto_auto]">
            <article className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-200">How Handshake works today + add-on fit</p>
              <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-slate-200">
                {QUICK_POINTS.map((point) => (
                  <li key={point} className="flex gap-2.5">
                    <span className="font-bold text-orange-300">+</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-200">Delivery model options</p>
              <div className="mt-3 space-y-3">
                {MEETING_FLOW.map((item) => (
                  <div key={item.title}>
                    <h2 className="text-[14px] font-semibold text-white">{item.title}</h2>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-200">{item.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  href="/alumni-networks-review"
                  className="rounded-full border border-white/20 px-4 py-2 text-[12px] font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5"
                >
                  Alumni version
                </Link>
                <Link
                  href="/search-firms/executive-recruiter-demo"
                  className="rounded-full border border-white/20 px-4 py-2 text-[12px] font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5"
                >
                  Recruiter reference
                </Link>
              </div>
            </article>
          </section>
        </div>
      </main>
    </div>
  )
}
