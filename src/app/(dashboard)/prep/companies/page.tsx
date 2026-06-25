import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Companies Research - Starting Monday',
  description: 'Research target companies and identify signals that matter for your search.',
}

export default async function CompaniesPrepPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-[32px] font-bold tracking-tight text-white sm:text-[40px]">
          Target Companies
        </h1>
        <p className="text-[16px] leading-relaxed text-slate-300 max-w-2xl">
          Research the markets, players, and signals that shape your search strategy.
        </p>
      </div>

      {/* Research insight card */}
      <div className="rounded-2xl border border-orange-400/30 bg-orange-500/5 p-6 sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-orange-300 mb-3">
          From coaching research
        </p>
        <p className="text-[15px] leading-relaxed text-slate-100">
          "The leaders who closed offers fastest spent the first 4-5 weeks researching: 40-60 target companies, signals that precede a search, and the pattern of demand. They didn't rush into outreach. They moved when the pattern was clear."
        </p>
      </div>

      {/* Form sections */}
      <form className="space-y-8">
        {/* Market research */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Market Research
          </legend>

          <div>
            <label htmlFor="market-focus" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Markets or verticals you're targeting
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              E.g., "Fintech for SMB", "Enterprise AI infrastructure", "Healthcare SaaS"
            </p>
            <textarea
              id="market-focus"
              placeholder="Your market focus or verticals..."
              rows={3}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="market-dynamics" className="block text-[13px] font-semibold text-slate-200 mb-2">
              What's happening in these markets right now?
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Consolidation, new entrants, talent wars, funding shifts?
            </p>
            <textarea
              id="market-dynamics"
              placeholder="Market trends, consolidation, funding activity, talent dynamics..."
              rows={4}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Target companies */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Target Companies
          </legend>

          <div>
            <label htmlFor="company-list" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Your target list (paste or type)
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Start with 40-60 companies. One per line or comma-separated.
            </p>
            <textarea
              id="company-list"
              placeholder="Company names, one per line:&#10;Figma&#10;Stripe&#10;Notion"
              rows={8}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 font-mono text-[12px] focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="company-criteria" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Selection criteria
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Why you picked these. Size, growth rate, geography, industry?
            </p>
            <textarea
              id="company-criteria"
              placeholder="Company size, funding stage, growth rate, industry factors..."
              rows={3}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Signals */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Signals You're Watching For
          </legend>

          <div>
            <label htmlFor="key-signals" className="block text-[13px] font-semibold text-slate-200 mb-2">
              What precedes a search in your market?
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              Executive departures, board changes, funding announcements, product launches?
            </p>
            <textarea
              id="key-signals"
              placeholder="E.g., executive departures, funding rounds, board changes, product announcements, acquisition activity..."
              rows={4}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="signal-sources" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Where you'll find these signals
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              News feeds, LinkedIn, company career pages, press releases, your network?
            </p>
            <textarea
              id="signal-sources"
              placeholder="News sources, LinkedIn updates, press releases, career pages, your network..."
              rows={3}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Outreach readiness */}
        <fieldset className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <legend className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-300 mb-4">
            Outreach Readiness
          </legend>

          <div>
            <label htmlFor="outreach-timing" className="block text-[13px] font-semibold text-slate-200 mb-2">
              When will you start outreach?
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              After weeks of company research and signal-watching.
            </p>
            <input
              id="outreach-timing"
              type="date"
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div>
            <label htmlFor="outreach-channels" className="block text-[13px] font-semibold text-slate-200 mb-2">
              Your outreach channels
            </label>
            <p className="text-[12px] text-slate-400 mb-3">
              LinkedIn, email, referrals, recruiters, network connections?
            </p>
            <textarea
              id="outreach-channels"
              placeholder="Primary channels: LinkedIn, email, recruiters, referrals, warm introductions..."
              rows={2}
              className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-[14px] text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
            />
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between pt-4">
          <button
            type="button"
            className="px-6 py-3 text-[13px] font-semibold text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
          >
            Save as draft
          </button>
          <button
            type="submit"
            className="px-6 py-3 text-[13px] font-semibold bg-orange-500 text-slate-900 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Save companies research
          </button>
        </div>
      </form>

      {/* Next steps */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 sm:p-8">
        <p className="text-[13px] font-semibold text-slate-300 mb-3">Next: Meetings prep</p>
        <p className="text-[14px] leading-relaxed text-slate-100 mb-4">
          With your target list and signals mapped, you're ready to plan your conversation flow. How will you move from introduction to first meeting?
        </p>
        <Link
          href="/prep/meetings"
          className="inline-flex px-4 py-2 text-[13px] font-semibold text-orange-300 hover:text-orange-200 transition-colors"
        >
          Move to meetings prep →
        </Link>
      </div>
    </div>
  )
}
