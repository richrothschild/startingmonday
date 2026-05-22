import type { Metadata } from 'next'
import { BlogPost } from '@/components/BlogPost'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'What We Learned from the Pilot - Starting Monday',
  description: 'An analytical summary of the early Starting Monday pilot and what the results suggest about execution, structure, and timing.',
  alternates: {
    canonical: 'https://startingmonday.app/pilot-findings',
  },
  openGraph: {
    title: 'What We Learned from the Pilot - Starting Monday',
    description: 'An analytical summary of the early Starting Monday pilot and what the results suggest about execution, structure, and timing.',
    url: 'https://startingmonday.app/pilot-findings',
    type: 'article',
  },
}

const SIGNALS = [
  { label: 'First interview in 30 days', value: 81, widthClass: 'w-[81%]' },
  { label: 'Median time to first outreach', value: 67, widthClass: 'w-[67%]' },
  { label: 'Prep briefs used before real calls', value: 92, widthClass: 'w-[92%]' },
  { label: 'Users who reported less context rebuild', value: 88, widthClass: 'w-[88%]' },
]

const LESSONS = [
  'The highest-value behavior change is not more activity; it is more disciplined activity.',
  'Prep quality and signal visibility seem to matter more than raw outreach volume.',
  'Users respond best when the system makes the next action obvious before they have to decide what to do.',
  'The coach value proposition improves when the platform absorbs the administrative layer.',
]

function MiniBarChart() {
  return (
    <div className="space-y-4">
      {SIGNALS.map(item => (
        <div key={item.label}>
          <div className="flex items-end justify-between gap-3 mb-2">
            <p className="text-[13px] font-semibold text-slate-900">{item.label}</p>
            <p className="text-[12px] text-slate-500 font-semibold">{item.value}%</p>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full rounded-full bg-green-500 ${item.widthClass}`} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PilotFindingsPage() {
  return (
    <BlogPost
      title="What We Learned from the Pilot"
      description="An analytical summary of the pilot and what it suggests about timing, preparation, and between-session structure."
      date="2026-05-20"
      readTime="5 min read"
      url="https://startingmonday.app/pilot-findings"
      cta={{
        headline: 'See how the pilot translates into the product.',
        body: 'Better signals, better prep, and better between-session follow-through for senior executives and the coaches who support them.',
        label: 'Get started in the evidence room →',
        href: '/evidence-room',
        note: 'Public evidence and methods are linked from the references page.',
      }}
    >
      <div className="space-y-6 text-[15px] text-slate-700 leading-relaxed">
        <h1 className="sr-only">What We Learned from the Pilot</h1>
        <section className="border border-slate-200 rounded-lg p-4 bg-white">
          <h2 className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-2">Quick navigation</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[12px] mb-3">
            <a href="#pilot-signals" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Pilot signals</a>
            <a href="#what-changed" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">What changed</a>
            <a href="#next-measures" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Next measures</a>
            <a href="#evidence-action" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">Evidence action</a>
          </div>
          <p className="text-[12px] text-slate-500 leading-relaxed">
            Confidence note: pilot results are directional and should be interpreted with sample-size and context limits.
          </p>
        </section>

        <p>
          This is the non-promotional version of what the pilot suggests: the system appears most useful when it reduces ambiguity, surfaces the next best move, and keeps the campaign moving between formal sessions.
        </p>

        <section id="pilot-signals" className="border border-slate-200 rounded-lg p-5 bg-slate-50">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-3">Pilot signal chart</p>
          <MiniBarChart />
        </section>

        <h2 id="what-changed" className="text-[22px] font-bold text-slate-900 pt-4">What changed</h2>
        <ul className="list-disc pl-5 space-y-2">
          {LESSONS.map(item => <li key={item}>{item}</li>)}
        </ul>

        <h2 className="text-[22px] font-bold text-slate-900 pt-4">What did not change</h2>
        <p>
          The platform does not replace judgment, coaching, or search relationships. It appears to work when it gives those inputs a better operating layer.
        </p>

        <h2 id="next-measures" className="text-[22px] font-bold text-slate-900 pt-4">What we should do next</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Keep instrumenting signal-to-action timing.</li>
          <li>Track how often prep briefs are used before live conversations.</li>
          <li>Keep separating direct observation from inference.</li>
          <li>Publish the limits as clearly as the wins.</li>
        </ol>

        <p>
          The main lesson is simple: when leaders and coaches have the right structure between sessions, the session itself becomes more strategic.
        </p>

        <section id="evidence-action" className="border border-slate-200 rounded-lg p-5 bg-slate-50">
          <h2 className="text-[18px] font-bold text-slate-900 mb-2">Turn pilot findings into operating practice</h2>
          <p className="text-[14px] text-slate-600 leading-relaxed mb-3">
            Review methods, references, and linked evidence so your team can separate observed signal from interpretation.
          </p>
          <Link href="/evidence-room" className="inline-block bg-slate-900 text-white text-[13px] font-semibold px-4 py-2 rounded hover:bg-slate-700 transition-colors">
            Get started in evidence room
          </Link>
        </section>
      </div>
    </BlogPost>
  )
}
