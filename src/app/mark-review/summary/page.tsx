'use client'
import Link from 'next/link'

const SECTION_GRADES = [
  { name: 'Landing Page', grade: 'A-', note: 'Positioning is tighter and claims are linked to method and evidence.' },
  { name: 'Persona Pages', grade: 'B', note: 'Still broad and fragmented across many routes.' },
  { name: 'Demo Page', grade: 'A', note: 'Context and trust framing improved before interaction.' },
  { name: 'Pricing Page', grade: 'A-', note: 'Tier clarity is stronger with evidence and references support.' },
  { name: 'About Page', grade: 'A-', note: 'Founder narrative and trust posture are now credible and specific.' },
  { name: 'Blog and Content', grade: 'A-', note: 'Conversion path is clearer with stronger CTA alignment.' },
  { name: 'Signup and Onboarding', grade: 'A-', note: 'Faster first value with seeded quick path and early signal preview.' },
  { name: 'Intelligence Core', grade: 'A-', note: 'References page and method post improved confidence in claim quality.' },
  { name: 'Partners', grade: 'B-', note: 'Messaging is clearer, but hard partner outcomes are still thin.' },
]

const TOP_BLOCKERS = [
  {
    title: '1. Persona sprawl still dilutes category ownership',
    impact: 'Traffic and messaging are split across too many role pages, which weakens the core narrative.',
    next: 'Keep primary acquisition centered on CIO and VP-Tech journeys, and route adjacent personas into those paths.',
  },
  {
    title: '2. Partner proof is still mostly narrative',
    impact: 'Partner pages promise value but do not yet show enough measured partner outcomes.',
    next: 'Add one internal partner outcome snapshot with denominator and timeframe, then cite it from the partner hero.',
  },
  {
    title: '3. Remaining hard-quant language needs ongoing guardrails',
    impact: 'A few phrases can drift into over-precision without linked evidence as content expands.',
    next: 'Maintain claim language as qualitative unless a source, timeframe, and denominator are linked in-line.',
  },
]

const COMPLETED_THIS_ROUND = [
  'Claim window aligned to often 1-3 weeks and linked to method + references.',
  'Speed claims normalized to usually ready in about a minute across user-facing pages.',
  'Stale Mark summary content replaced with current grades and priorities.',
]

function gradeClass(grade: string) {
  if (grade.startsWith('A')) return 'bg-green-100 text-green-800'
  if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800'
  if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

export default function MarkSummaryPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/mark-review" className="text-[13px] text-slate-400 hover:text-white transition-colors">
              Back to Review
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

      <header className="bg-slate-900 px-4 sm:px-6 pt-14 pb-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-4">Mark Re-grade Summary</p>
          <h1 className="text-[30px] sm:text-[40px] font-bold text-white leading-[1.15] tracking-tight mb-5">
            Current Site Grade: A-
          </h1>
          <p className="text-[15px] text-slate-300 leading-relaxed max-w-2xl mb-6">
            The trust layer is substantially stronger than the original audit baseline. Remaining work is now concentration, proof depth, and consistency discipline.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto space-y-14">
          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Updated Section Grades</p>
            <div className="space-y-3">
              {SECTION_GRADES.map(({ name, grade, note }) => (
                <div key={name} className="border border-slate-200 rounded p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-2 gap-4">
                    <p className="text-[13px] font-semibold text-slate-900">{name}</p>
                    <span className={`text-[12px] font-bold px-3 py-1 rounded ${gradeClass(grade)}`}>{grade}</span>
                  </div>
                  <p className="text-[12px] text-slate-600">{note}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-4">Top Remaining Blockers</p>
            <div className="space-y-4">
              {TOP_BLOCKERS.map((item) => (
                <div key={item.title} className="border-l-4 border-red-500 bg-red-50 p-5 rounded">
                  <p className="text-[13px] font-semibold text-slate-900 mb-2">{item.title}</p>
                  <p className="text-[12px] text-slate-700 mb-2">
                    <span className="font-semibold">Impact:</span> {item.impact}
                  </p>
                  <p className="text-[12px] text-red-700">
                    <span className="font-semibold">Next move:</span> {item.next}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-green-600 mb-4">Completed In This Pass</p>
            <div className="space-y-3">
              {COMPLETED_THIS_ROUND.map((item) => (
                <div key={item} className="border border-green-300 bg-green-50 rounded p-4">
                  <p className="text-[12px] text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/mark-review"
              className="inline-block border border-slate-400 hover:border-slate-600 text-slate-800 text-[14px] font-semibold px-6 py-3 rounded transition-colors text-center"
            >
              Back to Full Review
            </Link>
            <Link
              href="/references"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-slate-900 text-[14px] font-semibold px-6 py-3 rounded transition-colors text-center"
            >
              Open Evidence and References
            </Link>
          </section>
        </div>
      </main>

      <footer className="bg-slate-900 px-4 sm:px-6 py-10 border-t border-slate-800">
        <div className="max-w-3xl mx-auto">
          <p className="text-[12px] text-slate-400">Mark review lens: clarity, defensibility, conversion friction, and first-week user value.</p>
        </div>
      </footer>
    </div>
  )
}
