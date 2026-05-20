import type { Metadata } from 'next'
import { BlogPost } from '@/components/BlogPost'

export const metadata: Metadata = {
  title: 'What We Observed in Executive Search in 2026 - Starting Monday',
  description: 'A tiny annual report on executive search behavior, timing, and execution discipline in 2026.',
  alternates: {
    canonical: 'https://startingmonday.app/annual-report-2026',
  },
  openGraph: {
    title: 'What We Observed in Executive Search in 2026 - Starting Monday',
    description: 'A tiny annual report on executive search behavior, timing, and execution discipline in 2026.',
    url: 'https://startingmonday.app/annual-report-2026',
    type: 'article',
  },
}

const THEMES = [
  { label: 'Searches start before postings', value: 84, widthClass: 'w-[84%]' },
  { label: 'Prep quality beats volume', value: 91, widthClass: 'w-[91%]' },
  { label: 'Coach value increases with shared context', value: 86, widthClass: 'w-[86%]' },
  { label: 'Weak-signal tracking creates advantage', value: 88, widthClass: 'w-[88%]' },
]

export default function AnnualReport2026Page() {
  return (
    <BlogPost
      title="What We Observed in Executive Search in 2026"
      description="A tiny annual report on the patterns that seemed to separate disciplined campaigns from reactive ones."
      date="2026-05-20"
      readTime="5 min read"
      url="https://startingmonday.app/annual-report-2026"
      cta={{
        headline: 'See how the observations shape the product.',
        body: 'The annual report is meant to support the evidence room and the method page, not replace them.',
        label: 'Open the evidence room →',
        href: '/evidence-room',
      }}
    >
      <div className="space-y-6 text-[15px] text-slate-700 leading-relaxed">
        <p>
          This is a small annual report, not a press release. It summarizes the recurring patterns we observed across executive search conversations, pilot behavior, and the broader literature we reviewed.
        </p>

        <section className="border border-slate-200 rounded-lg p-5 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">Observed pattern strength</p>
          <div className="space-y-4">
            {THEMES.map(theme => (
              <div key={theme.label}>
                <div className="flex items-end justify-between gap-3 mb-2">
                  <p className="text-[13px] font-semibold text-slate-900">{theme.label}</p>
                  <p className="text-[12px] text-slate-500 font-semibold">{theme.value}%</p>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full bg-slate-900 ${theme.widthClass}`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <h2 className="text-[22px] font-bold text-slate-900 pt-4">Three observations</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Timing advantage compounds before the formal search exists.</li>
          <li>Campaign discipline is more predictive than raw activity volume.</li>
          <li>Coaches become more valuable when the administrative layer is handled elsewhere.</li>
        </ol>

        <h2 className="text-[22px] font-bold text-slate-900 pt-4">What we will keep measuring</h2>
        <p>
          We will keep measuring signal-to-action timing, prep brief usage, relationship maintenance, and the difference between session time spent on strategy versus context recovery.
        </p>
      </div>
    </BlogPost>
  )
}
