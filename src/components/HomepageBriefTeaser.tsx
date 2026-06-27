import Link from 'next/link'

export function HomepageBriefTeaser() {
  return (
    <section className="border-y border-white/10 bg-slate-950/50 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">
            Find the role · Create advocates · Follow the plan
          </p>
          <h2 className="mb-8 font-serif text-[1.5rem] leading-tight text-white sm:text-[1.9rem]">
            Before you apply, you're already in the conversation.
          </h2>

          <div className="mb-8 space-y-6">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-2">Find the role</p>
              <p className="text-[15px] leading-relaxed text-slate-200">
                Salesforce is under pressure from Elliott Management and betting everything on Agentforce. The CIO role is both internal and external — you're running IT on your own product. That's not a job posting. That's an opportunity.
              </p>
            </div>

            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-2">Create advocates</p>
              <p className="text-[15px] leading-relaxed text-slate-200">
                You've modernized enterprise IT at scale. You understand what it takes to run internal systems as a proof point for external customers. You know how Agentforce deployment becomes your credibility architecture. That narrative—told to the platform team, the CFO, the board—makes you the person they want to talk to.
              </p>
            </div>

            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-2">Follow the plan</p>
              <p className="text-[15px] leading-relaxed text-slate-200">
                Week one: conversations with the platform team and finance about integration priorities. Week two: internal Agentforce pilots that become reference cases. By week four, you're the executive who gets this mandate — not because you applied, but because advocates on the inside already know you're the answer.
              </p>
            </div>
          </div>

          <p className="mb-6 text-[12px] text-slate-600">
            Salesforce · Chief Information Officer · Generate the brief at any company
          </p>

          <Link
            href="/demo"
            className="inline-flex items-center rounded-full bg-orange-500 px-5 py-2.5 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-600"
          >
            See the brief
          </Link>
        </div>
      </div>
    </section>
  )
}
