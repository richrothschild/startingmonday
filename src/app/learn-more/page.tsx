import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn More | Starting Monday',
  description: 'Why Starting Monday is different: comparison, objections, and common questions.',
}

const COMPARISON_ROWS = [
  {
    area: 'Timing',
    typical: 'Enters after posting and competes in crowded windows.',
    startingMonday: 'Enters while role scope is still being shaped.',
  },
  {
    area: 'Narrative',
    typical: 'Generic profile optimization and resume tuning.',
    startingMonday: 'Mandate-specific narrative built for decision-makers.',
  },
  {
    area: 'Execution',
    typical: 'Spray-and-pray outreach volume.',
    startingMonday: 'Disciplined weekly cadence tied to conversion milestones.',
  },
]

const OBJECTIONS = [
  {
    title: 'Is this just another jobs tool?',
    answer: 'No. It is an operating system for timing, narrative, and relationship momentum before public posting windows.',
  },
  {
    title: 'Will this add complexity?',
    answer: 'It reduces complexity by replacing scattered tools with one decision rhythm: signal, brief, relationship action.',
  },
  {
    title: 'Is my search visible to employers?',
    answer: 'No. Search activity remains private by default and visible only to explicitly invited collaborators.',
  },
]

const FAQS = [
  {
    q: 'How quickly can I see useful signals?',
    a: 'Most users see meaningful signal patterns within the first week after target setup.',
  },
  {
    q: 'What does the brief include?',
    a: 'A role-aware narrative angle, likely objections, and conversation prompts mapped to the mandate context.',
  },
  {
    q: 'Who is this best for?',
    a: 'Individuals in confidential leadership transitions and partners/firms guiding those transitions.',
  },
]

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200">Learn more</p>
        <h1 className="mt-3 max-w-4xl font-serif text-[2.2rem] leading-[1.03] tracking-tight text-white sm:text-[3rem]">
          Why Starting Monday is different.
        </h1>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-orange-200">Comparison chart</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <div className="grid grid-cols-1 bg-slate-900/35 text-[12px] font-semibold uppercase tracking-[0.08em] sm:grid-cols-[1fr_1.2fr_1.2fr]">
              <p className="px-4 py-3 text-slate-300">Decision area</p>
              <p className="border-t border-white/10 px-4 py-3 text-slate-300 sm:border-l sm:border-t-0">Typical spray-and-pray</p>
              <p className="border-t border-white/10 px-4 py-3 text-orange-100 sm:border-l sm:border-t-0">Starting Monday</p>
            </div>
            {COMPARISON_ROWS.map((row) => (
              <div key={row.area} className="grid grid-cols-1 border-t border-white/10 sm:grid-cols-[1fr_1.2fr_1.2fr]">
                <p className="px-4 py-3 text-[13px] font-semibold text-white">{row.area}</p>
                <p className="border-t border-white/10 px-4 py-3 text-[13px] text-slate-300 sm:border-l sm:border-t-0">{row.typical}</p>
                <p className="border-t border-white/10 px-4 py-3 text-[13px] text-slate-100 sm:border-l sm:border-t-0">{row.startingMonday}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-orange-200">Objections</p>
          <div className="mt-3 space-y-3">
            {OBJECTIONS.map((item) => (
              <article key={item.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[14px] font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-300">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-orange-200">Common questions</p>
          <div className="mt-3 space-y-3">
            {FAQS.map((item) => (
              <details key={item.q} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <summary className="cursor-pointer list-none text-[14px] font-semibold text-white">{item.q}</summary>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-300">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
