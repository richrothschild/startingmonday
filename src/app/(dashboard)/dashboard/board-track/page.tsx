import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { LIFECYCLE_TEMPLATES } from '@/lib/executive-lifecycle'

export const metadata: Metadata = {
  title: 'Board & Governance Track | Starting Monday',
  description: 'Board narrative, governance thesis, committee-fit preparation, and long-horizon relationship cadence.',
}

/**
 * Board and Governance Workflow Pack - Sprint ITS-3 Ticket 20
 *
 * AC: board/governance route and artifact pack published
 */
export default async function BoardGovernancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const template = LIFECYCLE_TEMPLATES.find(
    (t) => t.state === 'board_track' && t.persona === 'board_governance',
  )!

  const GOVERNANCE_THESIS_PROMPTS = [
    { label: 'My operating edge as a director', placeholder: 'e.g. I bring PE-side operating credibility and have scaled teams through three transitions.' },
    { label: 'Committee fit (where I add the most value)', placeholder: 'e.g. Audit (financial controls background) and Comp (people-cost optimization).' },
    { label: 'Governance narrative (why I am ready for a board seat now)', placeholder: 'e.g. I have operated at scale alongside two boards. I understand what good governance looks like from the operator side.' },
    { label: 'Risk posture (what I ask hard questions about)', placeholder: 'e.g. I push on technology risk, executive succession, and capital allocation discipline.' },
  ]

  const RELATIONSHIP_TIERS = [
    { tier: 'Tier 1 (monthly)', description: 'Directors or board chairs who know your work and could sponsor a nomination' },
    { tier: 'Tier 2 (quarterly)', description: 'PE partners, institutional investors, or senior executives who influence board composition' },
    { tier: 'Tier 3 (bi-annual)', description: 'Search professionals and governance advisors who place independent directors' },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_26%),linear-gradient(180deg,_#0b1220_0%,_#0a1020_46%,_#0b1324_100%)] font-sans text-slate-100">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[13px] font-semibold text-slate-300">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <nav className="flex items-center gap-4 text-[13px] text-slate-300">
            <Link href="/dashboard/optionality" className="hover:text-white transition-colors">Optionality</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-white/15 bg-white/5 px-6 py-6 shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">
          <p className="text-[13px] font-semibold text-orange-400 mb-2">
            Board &amp; Governance Track
          </p>
          <h1 className="text-[26px] font-bold text-white leading-tight">
            {firstName}&apos;s board pursuit workflow
          </h1>
          <p className="text-[14px] text-slate-200 mt-2 max-w-xl leading-relaxed">
            Board seats are built over quarters, not weeks. The goal is narrative consistency, relationship compounding, and patient signal monitoring.
          </p>
        </div>

        {/* Governance thesis builder */}
        <div className="rounded-xl border border-white/15 bg-white/5 px-5 py-5 space-y-4 shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">
          <h2 className="text-[13px] font-bold text-white">Governance thesis</h2>
          <p className="text-[13px] text-slate-300">
            Articulate your unique value as a director - not what you have done as an operator, but what you bring to a governance context.
          </p>
          {GOVERNANCE_THESIS_PROMPTS.map(({ label, placeholder }) => (
            <div key={label}>
              <label className="block text-[13px] font-semibold text-slate-300 mb-1">{label}</label>
              <textarea
                rows={2}
                placeholder={placeholder}
                className="w-full border border-white/15 rounded-lg px-3 py-2 text-[13px] text-slate-100 bg-slate-950/70 placeholder:text-slate-500 focus:outline-none focus:border-white/30 resize-none"
              />
            </div>
          ))}
        </div>

        {/* Board composition watchlist */}
        <div className="rounded-xl border border-white/15 bg-white/5 px-5 py-5 space-y-3 shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">
          <h2 className="text-[13px] font-bold text-white">Board composition watchlist</h2>
          <p className="text-[13px] text-slate-300">
            Track target companies where the board composition is aging, lacks your functional profile, or has a term expiry coming up.
          </p>
          <div className="rounded-lg border border-white/10 overflow-hidden bg-slate-950/30">
            <table className="w-full text-[13px]">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  {['Company', 'Board gap you fill', 'Next inflection signal', 'Relationship in', 'Warmth'].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-[13px] font-semibold text-slate-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {[...Array(4)].map((_, i) => (
                  <tr key={i} className="bg-slate-950/30">
                    <td className="px-3 py-2"><input className="w-full border-0 bg-transparent text-[13px] text-slate-100 focus:outline-none placeholder-slate-500" placeholder="Company name" /></td>
                    <td className="px-3 py-2"><input className="w-full border-0 bg-transparent text-[13px] text-slate-100 focus:outline-none placeholder-slate-500" placeholder="e.g. Technology risk" /></td>
                    <td className="px-3 py-2"><input className="w-full border-0 bg-transparent text-[13px] text-slate-100 focus:outline-none placeholder-slate-500" placeholder="e.g. IPO in 18 months" /></td>
                    <td className="px-3 py-2"><input className="w-full border-0 bg-transparent text-[13px] text-slate-100 focus:outline-none placeholder-slate-500" placeholder="e.g. via John S." /></td>
                    <td className="px-3 py-2">
                      <select title="Relationship warmth" aria-label="Relationship warmth" className="border border-white/15 rounded px-2 py-1 text-[13px] bg-slate-950/70 text-slate-100 focus:outline-none focus:border-white/30">
                        <option>Cold</option>
                        <option>Warm</option>
                        <option>Hot</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Relationship cadence tiers */}
        <div className="rounded-xl border border-white/15 bg-white/5 px-5 py-5 space-y-4 shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">
          <h2 className="text-[13px] font-bold text-white">Relationship cadence</h2>
          <div className="space-y-3">
            {RELATIONSHIP_TIERS.map(({ tier, description }) => (
              <div key={tier} className="rounded-lg border border-white/10 bg-slate-950/30 px-4 py-3">
                <p className="text-[13px] font-bold text-slate-100">{tier}</p>
                <p className="text-[13px] text-slate-300 mt-0.5 mb-2">{description}</p>
                <textarea
                  rows={2}
                  placeholder="List names and last-touched date..."
                  className="w-full border border-white/15 rounded px-3 py-2 text-[13px] text-slate-100 bg-slate-950/70 placeholder:text-slate-500 focus:outline-none focus:border-white/30 resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Session prompts */}
        <div className="rounded-xl border border-white/15 bg-white/5 px-5 py-5 shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">
          <h2 className="text-[13px] font-bold text-white mb-3">Coach session opening prompts</h2>
          <ul className="space-y-2">
            {template.sessionOpeningPrompts.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[13px] text-slate-300 italic">
                <span className="text-slate-500 not-italic flex-shrink-0">?</span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Positioning guidance */}
        <div className="rounded-xl border border-blue-300/20 bg-blue-500/10 px-5 py-4 backdrop-blur-md">
          <p className="text-[13px] font-semibold text-blue-200 mb-2">External positioning</p>
          <p className="text-[13px] text-blue-50 leading-relaxed">{template.positioningGuidance}</p>
        </div>
      </main>
    </div>
  )
}
