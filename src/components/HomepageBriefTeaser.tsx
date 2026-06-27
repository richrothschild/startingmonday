import Link from 'next/link'

const BOTTOM_LINE = [
  "Your decisive advantage is your acquisition integration record: you have closed the books, rationalized the cost structure, and produced investor-grade reporting under the timelines a PE sponsor actually runs on.",
  "The objection that surfaces first is whether your experience is in sponsor-directed exit preparation or founder-led growth. If it leans toward the latter, expect the first 20 minutes to test your comfort with cost discipline under board scrutiny.",
  "Win this conversation by naming the specific deal, the exit multiple your finance work contributed to, and the one CFO decision in the 90 days before close that most shaped the outcome.",
]

export function HomepageBriefTeaser() {
  return (
    <section className="border-y border-white/10 bg-slate-950/50 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">The preparation</p>
          <h2 className="mb-8 font-serif text-[1.5rem] leading-tight text-white sm:text-[1.9rem]">
            This is what you walk in with.
          </h2>

          <div className="mb-6 space-y-5">
            {BOTTOM_LINE.map((sentence, i) => (
              <div key={i} className="flex gap-4">
                <span className="mt-0.5 shrink-0 text-[11px] font-bold text-orange-400">{i + 1}</span>
                <p className="text-[15px] leading-relaxed text-slate-200">{sentence}</p>
              </div>
            ))}
          </div>

          <p className="mb-8 text-[12px] text-slate-600">
            Sample — Chief Financial Officer · PE-backed software company
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/demo"
              className="inline-flex items-center rounded-full bg-orange-500 px-5 py-2.5 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-600"
            >
              Generate yours
            </Link>
            <Link
              href="/learn-more"
              className="inline-flex items-center rounded-full border border-white/15 px-5 py-2.5 text-[13px] font-semibold text-slate-200 transition-colors hover:border-white/25 hover:text-white"
            >
              See the full brief
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
