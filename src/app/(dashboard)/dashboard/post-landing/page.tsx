import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { LIFECYCLE_TEMPLATES } from '@/lib/executive-lifecycle'

export const metadata: Metadata = {
  title: 'Post-Landing - 30/60/90 Plan | Starting Monday',
  description: 'Onboarding narrative, stakeholder trust map, early-win planner, and first-90-day milestones.',
}

/**
 * Post-Landing 30/60/90 Mode - Sprint ITS-3 Ticket 19
 *
 * AC:
 * - Distinct executive lifecycle state from active search
 * - 30/60/90 mode available with saved artifacts
 * - First-quarter relationship strategy
 * - Stakeholder trust map
 * - Early-win story planner
 * - Advisor-supported onboarding narrative
 */
export default async function PostLandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, placement_company, placed_at')
    .eq('user_id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const company = profile?.placement_company ?? 'your new organization'
  const placedAt = profile?.placed_at ? new Date(profile.placed_at) : null

  // Calculate days since placement
  const daysSincePlacement = placedAt
    ? Math.floor((Date.now() - placedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const currentPhase =
    daysSincePlacement === null ? null
    : daysSincePlacement <= 30 ? '30'
    : daysSincePlacement <= 60 ? '60'
    : '90'

  const template = LIFECYCLE_TEMPLATES.find(
    (t) => t.state === 'post_landing' && t.persona === 'post_landing_new',
  )!

  const PHASES = [
    {
      id: '30',
      label: 'Days 1–30',
      theme: 'Listen, learn, and build trust',
      goals: [
        'Complete structured stakeholder introductions (all key relationships mapped)',
        'Understand the real mandate - what success looks like in 90 days',
        'Identify the one visible win you can deliver in the first month',
        'Establish your communication cadence with your manager and team',
      ],
      artifacts: [
        'Stakeholder introduction map (who, meeting date, relationship quality, next step)',
        'Mandate clarity document (what I was hired to do, what good looks like)',
        'Day-30 early win: specific, named, and deliverable',
      ],
    },
    {
      id: '60',
      label: 'Days 31–60',
      theme: 'Build credibility and deliver early wins',
      goals: [
        'Complete the first visible win and document it clearly',
        'Identify two more high-value moves in the next 30 days',
        'Run a stakeholder trust check - where do you have credit? Where is it thin?',
        'Begin shaping the narrative of your impact for the 90-day review',
      ],
      artifacts: [
        'Early win story (situation → action → measured outcome)',
        'Stakeholder trust assessment (scored 1–5 per relationship)',
        'Day-60 momentum memo (what has changed since day 30)',
      ],
    },
    {
      id: '90',
      label: 'Days 61–90',
      theme: 'Establish authority and build long-horizon optionality',
      goals: [
        'Articulate your 90-day impact narrative in one paragraph',
        'Define your mandate for the next 6 months',
        'Identify the three external relationships to stay warm (keep optionality alive)',
        'Capture proof points while they are fresh - your future search will need them',
      ],
      artifacts: [
        '90-day impact narrative (for internal reviews and future positioning)',
        'Six-month mandate definition',
        'Proof base: three outcomes with measurable evidence',
        'Optionality warmth list: three external relationships with warmth plan',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <Link href="/dashboard" className="text-[13px] text-slate-300 hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Mode header */}
        <div className="rounded-2xl border border-emerald-200 bg-white px-6 py-6">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-emerald-600 mb-2">
            Post-Landing - 30/60/90 Mode
          </p>
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">
            {firstName}&apos;s first 90 days at {company}
          </h1>
          {daysSincePlacement !== null && (
            <p className="text-[13px] text-slate-500 mt-2">
              Day {daysSincePlacement} · Currently in the{' '}
              <span className="font-semibold text-emerald-700">Days {currentPhase === '30' ? '1–30' : currentPhase === '60' ? '31–60' : '61–90'}</span> phase
            </p>
          )}
          <p className="text-[14px] text-slate-500 mt-2 leading-relaxed max-w-xl">
            The goal now is strong early credibility, documented wins, and laying the foundation for long-horizon optionality.
          </p>
        </div>

        {/* Onboarding narrative frame */}
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-5">
          <h2 className="text-[13px] font-bold text-slate-800 mb-3">Onboarding narrative</h2>
          <p className="text-[12px] text-slate-500 mb-3">
            The same three-layer structure from your search narrative applies here. Legacy from your last role → inflection into this one → what you are building now.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'What I bring from my last role', placeholder: 'The proven operating model, team relationships, and credibility you arrive with.' },
              { label: 'Why this mandate is the right next step', placeholder: 'The scope, timing, and fit that made this the right move.' },
              { label: 'What I am building here', placeholder: 'The specific value I will add in the first 6–12 months.' },
            ].map(({ label, placeholder }) => (
              <div key={label} className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
                <textarea
                  rows={3}
                  placeholder={placeholder}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-[12px] focus:outline-none focus:border-emerald-400 resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Stakeholder trust map */}
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-5">
          <h2 className="text-[13px] font-bold text-slate-800 mb-1">Stakeholder trust map</h2>
          <p className="text-[12px] text-slate-500 mb-4">
            Who are the 5–8 people whose trust determines your first-quarter success? Rate your current relationship quality (1–5) and identify what each one needs to see from you.
          </p>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-[12px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Name / role', 'Trust (1–5)', 'What they need to see', 'Your next move'].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="bg-white">
                    <td className="px-3 py-2"><input className="w-full border-0 bg-transparent text-[12px] focus:outline-none placeholder-slate-300" placeholder="e.g. CFO" /></td>
                    <td className="px-3 py-2"><input type="number" min="1" max="5" title="Trust score 1-5" placeholder="3" className="w-12 border border-slate-200 rounded px-2 py-1 text-[12px] focus:outline-none focus:border-emerald-400" /></td>
                    <td className="px-3 py-2"><input className="w-full border-0 bg-transparent text-[12px] focus:outline-none placeholder-slate-300" placeholder="Quick wins on cost..." /></td>
                    <td className="px-3 py-2"><input className="w-full border-0 bg-transparent text-[12px] focus:outline-none placeholder-slate-300" placeholder="Coffee this week" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 30/60/90 phase cards */}
        <div className="space-y-4">
          {PHASES.map((phase) => (
            <details
              key={phase.id}
              open={phase.id === currentPhase || currentPhase === null}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden group"
            >
              <summary className={`flex items-center justify-between px-5 py-4 cursor-pointer list-none ${
                phase.id === currentPhase ? 'bg-emerald-50/50' : ''
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`h-7 w-7 rounded-full flex items-center justify-center text-[12px] font-bold ${
                    phase.id === currentPhase
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}>{phase.id}</span>
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">{phase.label}</p>
                    <p className="text-[12px] text-slate-500">{phase.theme}</p>
                  </div>
                </div>
                {phase.id === currentPhase && (
                  <span className="rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1">Current</span>
                )}
              </summary>
              <div className="px-5 pb-5 space-y-4 border-t border-slate-100">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">Goals</h4>
                  <ul className="space-y-1.5">
                    {phase.goals.map((g) => (
                      <li key={g} className="flex items-start gap-2 text-[13px] text-slate-700">
                        <span className="text-emerald-500 mt-0.5 flex-shrink-0">→</span>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Artifacts to create</h4>
                  <ul className="space-y-1.5">
                    {phase.artifacts.map((a) => (
                      <li key={a} className="flex items-start gap-2 text-[13px] text-slate-600">
                        <span className="text-slate-300 mt-0.5 flex-shrink-0">□</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Early win planner */}
                {phase.id === '30' && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-4 space-y-2">
                    <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Early win planner</p>
                    {[
                      { label: 'Situation', placeholder: 'What problem or opportunity is visible now?' },
                      { label: 'Action', placeholder: 'What specific action can you take in 30 days?' },
                      { label: 'Measurable outcome', placeholder: 'What is the visible, specific result?' },
                    ].map(({ label, placeholder }) => (
                      <div key={label}>
                        <label className="block text-[10px] font-semibold text-emerald-700 mb-1">{label}</label>
                        <textarea
                          rows={2}
                          placeholder={placeholder}
                          className="w-full border border-emerald-200 rounded px-3 py-2 text-[12px] focus:outline-none focus:border-emerald-400 resize-none bg-white"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>

        {/* Long-horizon optionality reminder */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/30 px-5 py-4">
          <p className="text-[12px] font-bold text-amber-700 mb-1">Keep optionality alive</p>
          <p className="text-[13px] text-amber-800 leading-relaxed">
            {template.weeklyFocus.find((f) => f.includes('external'))}
          </p>
        </div>

        {/* Session opening prompts */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-5">
          <h2 className="text-[13px] font-bold text-slate-700 mb-3">Coach session opening prompts</h2>
          <ul className="space-y-2">
            {template.sessionOpeningPrompts.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[13px] text-slate-600 italic">
                <span className="text-slate-400 mt-0.5 not-italic flex-shrink-0">?</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}
