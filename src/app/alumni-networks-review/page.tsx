import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Starting Monday | Alumni Networks Demo',
  description:
    'Compact meeting-ready demo for alumni network leadership showing how Starting Monday helps experienced alumni land the next role through targeted, private, behavior-driven execution.',
  alternates: { canonical: 'https://startingmonday.app/alumni-networks-review' },
  openGraph: {
    title: 'Starting Monday | Alumni Networks Demo',
    description:
      'A one-screen walkthrough of how Starting Monday helps alumni find their next role and why it is different from standard job search tools.',
    url: 'https://startingmonday.app/alumni-networks-review',
  },
}

const ALUMNI_POINTS = [
  'Warm network introductions through former peers, sponsors, and board-level relationships.',
  'Targeted outreach to decision-adjacent leaders before roles are publicly posted.',
  'Retained search and executive recruiter conversations that run through trusted referrals.',
  'Selective applications to high-fit roles, usually after relationship context is already in place.',
]

const ALUMNI_FLOW = [
  {
    title: '1) Target the right next role',
    body: 'Define role lane, target companies, and timing so the search stays focused on realistic next opportunities.',
  },
  {
    title: '2) Build the right relationships',
    body: 'Map and sequence warm connectors, mentors, and decision-adjacent contacts who can unlock real conversations.',
  },
  {
    title: '3) Execute with weekly behavior',
    body: 'Use behavior-focused weekly priorities, outreach sequencing, and brief prep so momentum does not stall.',
  },
]

const WHY_DIFFERENT = [
  'Network introductions happen today. We enhance them with a ranked relationship map, outreach timing, and clear follow-up ownership.',
  'Executives already do targeted outreach. We enhance it by identifying likely-to-open roles earlier and aligning outreach to real business signals.',
  'Retained search remains important. We enhance recruiter conversations with better narrative precision and decision-ready prep before every call.',
  'Selective applications still matter. We enhance them by focusing on high-fit opportunities where relationship context already exists.',
  'Most tools stop at tracking. We are behavior-focused: every week ends with a specific next-action plan and visible momentum.',
  'Most tools are built for volume. We are premium and private by design for confidential executive transitions.',
]

export default function AlumniNetworksReviewPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.22),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_30%),linear-gradient(180deg,_rgba(9,14,26,0.98)_0%,_rgba(10,15,28,0.96)_60%,_rgba(10,15,28,1)_100%)]" />

      <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/78 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[13px] sm:text-[14px] font-bold uppercase tracking-[0.14em] transition-opacity hover:opacity-80">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/handshake-review" className="text-[13px] text-slate-200 transition-colors hover:text-white">
              Handshake Demo
            </Link>
            <Link
              href="/for-coaches"
              className="rounded bg-orange-500 px-4 py-1.5 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-400"
            >
              Coach page reference
            </Link>
          </div>
        </div>
      </nav>

      <main className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto grid min-h-[calc(100vh-5.5rem)] max-w-6xl gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-5">
          <section className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(150deg,rgba(26,22,20,0.72),rgba(10,14,24,0.92))] p-5 shadow-[0_18px_56px_rgba(15,23,42,0.24)] backdrop-blur-sm sm:p-7 lg:flex lg:flex-col lg:justify-between lg:p-8">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-200">Alumni network partner briefing</p>
              <h1 className="max-w-3xl font-serif text-[33px] leading-[1.05] tracking-tight text-white sm:text-[46px]">
                Help alumni find their next role with a clear, private, relationship-led system.
              </h1>
              <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-slate-200 sm:text-[18px]">
                Starting Monday gives alumni a premium search experience: target the right roles early, build the relationships that matter, and follow weekly behavior guidance so progress is visible and consistent.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 lg:mt-7">
              <Link
                href="/demo/wedge-30s"
                className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-orange-400"
              >
                30-second shortlist demo
              </Link>
              <Link
                href="/demo/executive-brief"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5"
              >
                Executive brief demo
              </Link>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 lg:grid-rows-[auto_auto]">
            <article className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-200">How executives find jobs today</p>
              <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-slate-200">
                {ALUMNI_POINTS.map((point) => (
                  <li key={point} className="flex gap-2.5">
                    <span className="font-bold text-orange-300">+</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-200">How we enhance how executives find jobs today</p>
              <div className="mt-3 space-y-3">
                {WHY_DIFFERENT.map((point) => (
                  <div key={point} className="flex gap-2.5">
                    <span className="font-bold text-orange-300">+</span>
                    <p className="text-[13px] leading-relaxed text-slate-200">{point}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-200">Simple operating flow</p>
                <div className="mt-3 space-y-3">
                  {ALUMNI_FLOW.map((item) => (
                  <div key={item.title}>
                    <h2 className="text-[14px] font-semibold text-white">{item.title}</h2>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-200">{item.body}</p>
                  </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  href="/handshake-review"
                  className="rounded-full border border-white/20 px-4 py-2 text-[12px] font-semibold text-slate-100 transition-colors hover:border-orange-300/70 hover:bg-white/5"
                >
                  Handshake version
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

      <footer className="border-t border-white/10 bg-slate-950/70 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-[12px] text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>Starting Monday alumni demo. Private meeting preview.</p>
          <div className="flex items-center gap-4">
            <Link href="/handshake-review" className="transition-colors hover:text-white">
              Handshake demo
            </Link>
            <Link href="/demo/michael-dashboard" className="transition-colors hover:text-white">
              Michael dashboard
            </Link>
          </div>
        </div>
      
          <p className="text-[11px] text-slate-500 mt-2">Privacy-first by design.</p>
</footer>
    </div>
  )
}

