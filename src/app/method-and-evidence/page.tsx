import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Method and Evidence - Starting Monday',
  description: 'How Starting Monday estimates timing, evaluates evidence, and turns research into product decisions.',
  alternates: {
    canonical: 'https://startingmonday.app/method-and-evidence',
  },
  openGraph: {
    title: 'Method and Evidence - Starting Monday',
    description: 'How Starting Monday estimates timing, evaluates evidence, and turns research into product decisions.',
    url: 'https://startingmonday.app/method-and-evidence',
    type: 'website',
  },
}

const EVIDENCE_STACK = [
  { label: 'Peer-reviewed coaching research', value: 100, widthClass: 'w-full', note: 'Executive coaching effectiveness, mechanisms, and outcomes' },
  { label: 'Transition and onboarding research', value: 86, widthClass: 'w-[86%]', note: 'Adjustment, identity, and role entry' },
  { label: 'Behavior change research', value: 92, widthClass: 'w-[92%]', note: 'Goal-setting and implementation intentions' },
  { label: 'Weak-signal and decision research', value: 78, widthClass: 'w-[78%]', note: 'Timing, uncertainty, and judgment' },
]

const TIMING_MODEL = [
  { stage: 'Event to signal', value: 72, widthClass: 'w-[72%]', note: 'A public or observable change begins to surface' },
  { stage: 'Signal to company posting', value: 58, widthClass: 'w-[58%]', note: 'Company-level evidence appears before broad distribution' },
  { stage: 'Posting to broad market', value: 84, widthClass: 'w-[84%]', note: 'Recruiting channels and job boards catch up later' },
]

function BarChart({ items, labelKey, valueKey, noteKey, widthKey }: { items: Array<Record<string, string | number>>, labelKey: string, valueKey: string, noteKey: string, widthKey: string }) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const label = String(item[labelKey])
        const value = Number(item[valueKey])
        const note = String(item[noteKey])
        const widthClass = String(item[widthKey])
        return (
          <div key={label}>
            <div className="flex items-end justify-between gap-4 mb-2">
              <div>
                <p className="text-[13px] font-semibold text-slate-900">{label}</p>
                <p className="text-[12px] text-slate-500 leading-relaxed">{note}</p>
              </div>
              <p className="text-[12px] font-semibold text-slate-500">{value}%</p>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full rounded-full bg-orange-500 ${widthClass}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function MethodAndEvidencePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white hover:text-slate-300 transition-colors">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/references" className="text-[13px] text-slate-400 hover:text-white transition-colors">References</Link>
            <Link href="/evidence-room" className="text-[13px] text-slate-400 hover:text-white transition-colors">Evidence room</Link>
            <Link href="/signup" className="text-[13px] font-semibold text-slate-900 bg-white px-4 py-1.5 rounded hover:bg-slate-100 transition-colors">Try free</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-18">
                <section className="mb-6 border border-slate-200 rounded-lg bg-slate-50 px-4 py-3">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-1">Quick navigation</h2>
          <p className="text-[12px] text-slate-600 leading-relaxed">Use the section headers on this page to scan fast and jump to what matters first.</p>
        </section>
        <details className="mb-6 border border-slate-200 rounded-lg bg-white px-4 py-3">
          <summary className="cursor-pointer text-[12px] font-semibold text-slate-800">TL;DR</summary>
          <p className="mt-2 text-[12px] text-slate-600 leading-relaxed">This page is organized for quick scanning. Start with the first major section, then use headings to move directly to the next action.</p>
        </details>
<header className="mb-12 max-w-3xl">
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">Method and evidence</p>
          <h1 className="text-[34px] sm:text-[44px] font-bold text-slate-900 leading-tight mb-4">How Starting Monday turns research into product decisions.</h1>
          <p className="text-[15px] text-slate-600 leading-relaxed">
            We use peer-reviewed coaching, transition, behavior-change, and weak-signal research to decide what to build, what to claim, and what to measure.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="border border-slate-200 rounded-lg p-5">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">Evidence stack</p>
            <BarChart items={EVIDENCE_STACK} labelKey="label" valueKey="value" noteKey="note" widthKey="widthClass" />
          </div>
          <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">Timing model</p>
            <BarChart items={TIMING_MODEL} labelKey="stage" valueKey="value" noteKey="note" widthKey="widthClass" />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="border-t-2 border-orange-500 pt-4">
            <h2 className="text-[16px] font-bold text-slate-900 mb-2">Coaching becomes infrastructure</h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">The research says outcomes depend on what happens between sessions, so the product should support that layer directly.</p>
          </div>
          <div className="border-t-2 border-slate-200 pt-4">
            <h2 className="text-[16px] font-bold text-slate-900 mb-2">Plans beat intention</h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">If-then planning and clear goals are the design basis for prep briefs, prompts, and accountability loops.</p>
          </div>
          <div className="border-t-2 border-slate-200 pt-4">
            <h2 className="text-[16px] font-bold text-slate-900 mb-2">Signals beat waiting</h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">Weak signals and transition cues matter before formal postings, so the platform should make early movement visible.</p>
          </div>
        </section>

        <section className="mb-12 border border-slate-200 rounded-lg p-5 sm:p-6 bg-slate-900 text-white">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-orange-300 mb-3">What this means for the website</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[14px] text-slate-300 leading-relaxed">
            <p>Use the homepage to state the promise in plain language, then point to this page for the method.</p>
            <p>Use the references page for citations, the evidence room for the public asset map, and the pilot page for analytical outcomes.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/references" className="inline-block bg-white text-slate-900 text-[13px] font-semibold px-4 py-2 rounded hover:bg-slate-100 transition-colors">View references</Link>
            <Link href="/evidence-room" className="inline-block border border-slate-600 text-slate-200 text-[13px] font-semibold px-4 py-2 rounded hover:border-slate-400 transition-colors">Open evidence room</Link>
            <Link href="/blog/how-we-estimate-early-role-signals" className="inline-block border border-slate-600 text-slate-200 text-[13px] font-semibold px-4 py-2 rounded hover:border-slate-400 transition-colors">Method post</Link>
          </div>
        </section>
      </main>
    </div>
  )
}
