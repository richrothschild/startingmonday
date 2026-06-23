import type { Metadata } from 'next'
import Link from 'next/link'
import { PartnersForm } from './partners-form'

export const metadata: Metadata = {
  title: 'Coach Partner Program - Starting Monday',
  description: 'Coach-first partner program for executive coaches. Help clients execute between sessions, keep strategy in the coaching room, and earn recurring partner revenue.',
  alternates: { canonical: 'https://startingmonday.app/partners' },
  openGraph: {
    title: 'Coach Partner Program | Starting Monday',
    description: 'A simple, coach-first partner path: preview the workflow, refer clients with confidence, and earn 20% recurring commission.',
    url: 'https://startingmonday.app/partners',
  },
}

const COACH_PROOF = [
  {
    metric: '81%',
    detail: 'pilot clients reached a first interview within 30 days',
  },
  {
    metric: '9 days',
    detail: 'median time from setup to first qualified outreach',
  },
  {
    metric: '20%',
    detail: 'recurring commission on every active referral',
  },
]

const COST_OF_STAYING_THE_SAME = [
  {
    title: 'Session preparation quality affects coaching ROI',
    body: 'Structured prep reduces administrative rework in early sessions.',
  },
  {
    title: 'Great coaching still loses to weak execution',
    body: 'Without between-session structure, even strong clients miss timing and momentum windows.',
  },
  {
    title: 'Invisible progress creates trust friction',
    body: 'When neither coach nor client can see movement clearly, confidence drops before results arrive.',
  },
]

const OFFER_BULLETS = [
  'Free partner enrollment with referral tracking',
  '20% recurring commission on active referrals',
  'Coach-ready onboarding and talking points',
  'Preview-first motion so clients decide from workflow, not pitch',
]

const DOUBT_BLOCKS = [
  {
    q: '"I need to think about it."',
    a: 'Usually this means the result still feels abstract. Run the preview with two clients so the decision is based on visible workflow change, not theory.',
  },
  {
    q: '"My clients already have tools."',
    a: 'Starting Monday is not another CRM. It is the between-session operating layer that keeps prep, signals, and follow-through visible for coach and client.',
  },
  {
    q: '"I am not sure clients will pay."',
    a: 'That is exactly why the partner path starts with a short preview. Belief comes after the client feels the difference in session quality.',
  },
]

const OTHER_PARTNERS = [
  { label: 'Search firms', href: '/search-firms' },
  { label: 'Outplacement providers', href: '/for-outplacement' },
  { label: 'PE talent teams', href: '/for-pe-teams' },
  { label: 'Relocation firms', href: '/for-relocation' },
]

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      <nav className="bg-slate-950 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">

            <Link href="/login" className="text-[13px] text-slate-200 hover:text-white transition-colors">Log in</Link>
          </div>
        </div>
      </nav>

      <main>

        <header className="border-b border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.16),_transparent_38%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-400">Coach Partner Program</p>
              <h1 className="max-w-3xl text-[34px] font-bold leading-[1.03] tracking-tight text-white sm:text-[48px]">
                Your client should arrive ready
                <br className="hidden sm:block" />
                before your call starts.
              </h1>
              <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-slate-200 sm:text-[17px]">
                If they do not, you spend expensive coaching time rebuilding context. Starting Monday gives coaches a private operating layer for prep briefs, client signals, and between-session follow-through.
              </p>
              <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-200">
                Join free. Earn 20% recurring commission on active referrals.
              </p>

              <div className="mt-7">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="#apply"
                    className="inline-flex items-center justify-center rounded bg-orange-500 px-6 py-3 text-[14px] font-semibold text-slate-900 transition-colors hover:bg-orange-600"
                  >
                    Apply now
                  </a>
                  <Link
                    href="/features/white-label"
                    className="inline-flex items-center justify-center rounded border border-slate-600 px-5 py-3 text-[13px] font-semibold text-slate-100 transition-colors hover:border-slate-400"
                  >
                    White-label guide
                  </Link>
                  <Link
                    href="/features/executive-coaches"
                    className="inline-flex items-center justify-center rounded border border-slate-600 px-5 py-3 text-[13px] font-semibold text-slate-100 transition-colors hover:border-slate-400"
                  >
                    Coach feature guide
                  </Link>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-[13px] text-slate-200">
                <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5">Preview-first partner motion</span>
                <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5">Client-controlled coach visibility</span>
                <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5">Recurring commission tracking</span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-6 shadow-xl shadow-black/20">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-200">Cost of staying the same</p>
              <div className="space-y-3">
                {COST_OF_STAYING_THE_SAME.map((item) => (
                  <article key={item.title} className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                    <p className="text-[12px] font-semibold text-slate-200">{item.title}</p>
                    <p className="mt-1 text-[13px] text-slate-200">{item.body}</p>
                  </article>
                ))}
              </div>
              <p className="mt-4 text-[12px] leading-relaxed text-slate-200">
                Partnering works when clients feel this shift quickly in real sessions.
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl space-y-14 px-4 py-12 sm:px-6 sm:py-16">

          <section>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Why coaches partner</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {COACH_PROOF.map((item) => (
                <article key={item.metric} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="mb-1 text-[30px] font-bold leading-none text-slate-900">{item.metric}</p>
                  <p className="text-[13px] leading-relaxed text-slate-600">{item.detail}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 text-[12px] leading-relaxed text-slate-500">
              Pilot evidence is from the Jan.-May 2026 cohort snapshot. Use the preview to validate fit with your own client workflow.
            </p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Clear offer</p>
            <h2 className="text-[24px] font-bold leading-tight text-slate-900 sm:text-[30px]">
              One partner offer. One decision.
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
              Free enrollment, 20% recurring commission, and a short preview path so clients buy based on real coaching outcomes.
            </p>
            <ul className="mt-5 space-y-2 text-[14px] leading-relaxed text-slate-700">
              {OFFER_BULLETS.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <a
              href="#apply"
              className="mt-6 inline-flex items-center justify-center rounded bg-slate-950 px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-slate-700"
            >
              Apply now
            </a>
          </section>

          <section>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Common doubts</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {DOUBT_BLOCKS.map((item) => (
                <article key={item.q} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="mb-2 text-[13px] font-semibold text-slate-900">{item.q}</p>
                  <p className="text-[14px] leading-relaxed text-slate-600">{item.a}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="apply" className="border-t border-slate-100 pt-12">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500">
                  Apply now
                </p>
                <h2 className="text-[24px] font-bold leading-tight text-slate-900 sm:text-[30px]">
                  Start simple. Prove it with clients. Scale if it works.
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600">
                  We respond within 2 business days with your referral link and coach partner kit. Then you run a short preview and decide from visible results.
                </p>
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">What happens next</p>
                  <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-700">
                    <li>• Get your referral link and activation tracking</li>
                    <li>• Receive coach-facing onboarding and talk tracks</li>
                    <li>• Run a short preview and decide from real outcomes</li>
                  </ul>
                </div>
              </div>
              <PartnersForm />
            </div>
          </section>

          <section className="border-t border-slate-100 pt-10">
            <p className="mb-3 text-[12px] font-semibold text-slate-600">Not an executive coach?</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link
                href="/partners/reporting"
                className="text-[13px] text-slate-500 transition-colors hover:text-slate-900"
              >
                Partner reporting packet &rarr;
              </Link>
              {OTHER_PARTNERS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[13px] text-slate-500 transition-colors hover:text-slate-900"
                >
                  {label} &rarr;
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>

      <footer className="bg-slate-950 border-t border-slate-800 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <p className="text-[11px] text-slate-500">
            Questions?{' '}
            <a href="mailto:contact@startingmonday.app" className="hover:text-slate-200 transition-colors">
              contact@startingmonday.app
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
