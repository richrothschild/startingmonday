import Link from 'next/link'
import { ActivityChart, type WeekActivity } from '@/components/ActivityChart'
import { PipelineVelocity, type VelocityRow } from '@/components/PipelineVelocity'

type MomentumData = {
  momentum_score: number | null
  momentum_computed_at: string | null
} | null

type DashboardWeeklyPerformanceSectionProps = {
  weeklyGoal: number | null
  outreachThisWeek: number
  onSaveWeeklyGoal: (formData: FormData) => void | Promise<void>
  momentumData: MomentumData
  daysSinceLastAction: number | null
  weekSlots: WeekActivity[]
  velocityRows: VelocityRow[]
  isCoach: boolean
  isExecutiveMode: boolean
  executiveStageLabel: string
  riskItems: Array<{
    id: string
    label: string
    level: 'low' | 'medium' | 'high'
    detail: string
    href: string
    cta: string
  }>
  offerCockpit: {
    show: boolean
    offerCount: number
    offerCompanyName: string | null
    contextSignals: Array<{ label: string; ok: boolean }>
  }
}

export function DashboardWeeklyPerformanceSection({
  weeklyGoal,
  outreachThisWeek,
  onSaveWeeklyGoal,
  momentumData,
  daysSinceLastAction,
  weekSlots,
  velocityRows,
  isCoach,
  isExecutiveMode,
  executiveStageLabel,
  riskItems,
  offerCockpit,
}: DashboardWeeklyPerformanceSectionProps) {
  const riskTone = {
    low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    medium: 'border-amber-200 bg-amber-50 text-amber-700',
    high: 'border-red-200 bg-red-50 text-red-700',
  } as const

  const quickActions = isExecutiveMode
    ? (
      executiveStageLabel === 'Offer and Decision'
        ? [
            { href: '/dashboard/offers', label: 'Offer Tradeoffs' },
            { href: '/dashboard/strategy', label: 'No-go Criteria' },
            { href: '/dashboard/contacts', label: 'Reference Push' },
            { href: '/dashboard/calendar', label: 'Decision Timeline' },
            { href: '/dashboard/briefing', label: 'Risk Review' },
            { href: '/dashboard/wrap-up', label: 'Transition Plan' },
          ]
        : executiveStageLabel === 'Interviewing and Conversion'
          ? [
              { href: '/dashboard/strategy', label: 'Prep Brief' },
              { href: '/dashboard/signals', label: 'Signal Angle' },
              { href: '/dashboard/contacts', label: 'Warm Intros' },
              { href: '/dashboard/calendar', label: 'Follow-up SLA' },
              { href: '/dashboard/briefing', label: 'Daily Priorities' },
              { href: '/dashboard/positioning', label: 'Narrative Tighten' },
            ]
          : [
              { href: '/dashboard/briefing', label: 'Daily Briefing' },
              { href: '/dashboard/companies/new', label: 'Add Target' },
              { href: '/dashboard/contacts', label: 'Build Sponsor Map' },
              { href: '/dashboard/signals', label: 'Signals' },
              { href: '/dashboard/strategy', label: 'Strategy Brief' },
              { href: '/dashboard/profile', label: 'Profile Inputs' },
            ]
    )
    : [
        { href: '/dashboard/briefing', label: 'Daily Briefing' },
        { href: '/dashboard/strategy', label: 'Strategy Brief' },
        { href: '/dashboard/discover', label: 'Discover' },
        { href: '/dashboard/calendar', label: 'Calendar' },
        { href: '/optimize', label: 'LinkedIn' },
        { href: '/dashboard/positioning', label: 'Positioning' },
        { href: '/dashboard/profile', label: 'Configure Search' },
        ...(isCoach ? [{ href: '/dashboard/coach', label: 'My Clients' }] : []),
      ]

  return (
    <>
      {(() => {
        const goal = weeklyGoal
        const done = outreachThisWeek
        if (goal) {
          const remaining = Math.max(0, goal - done)
          return (
            <div className="bg-white border border-slate-200 rounded p-5 mb-6 sm:mb-8 flex items-center gap-5">
              <div className={`text-[40px] font-bold leading-none tabular-nums shrink-0 ${
                done >= goal ? 'text-green-600' : done > 0 ? 'text-amber-500' : 'text-slate-300'
              }`}>
                {done}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-slate-900">
                  {done >= goal
                    ? 'Weekly goal hit. Strong week.'
                    : `${remaining} outreach draft${remaining === 1 ? '' : 's'} left to hit your goal.`}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Goal: {goal} per week - {done} done since Monday</div>
              </div>
              <form action={onSaveWeeklyGoal} className="shrink-0">
                <input type="hidden" name="weekly_goal" value={goal === 1 ? 1 : goal + 1} />
                <button type="submit" className="text-[11px] text-slate-400 hover:text-slate-600 border border-slate-200 rounded px-2.5 py-1 cursor-pointer bg-transparent transition-colors">
                  Goal: {goal} &uarr;
                </button>
              </form>
            </div>
          )
        }

        return (
          <div className="bg-white border border-slate-200 rounded p-5 mb-6 sm:mb-8">
            <p className="text-[13px] font-semibold text-slate-900 mb-1">Set a weekly outreach target.</p>
            <p className="text-[12px] text-slate-400 mb-3 leading-relaxed">A weekly target increases follow-through.</p>
            <form action={onSaveWeeklyGoal} className="flex items-center gap-3">
              <select
                name="weekly_goal"
                aria-label="Weekly outreach goal"
                defaultValue="2"
                className="border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 bg-white focus:outline-none focus:border-slate-400"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} per week
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-700 text-white text-[13px] font-semibold px-4 py-2 rounded transition-colors cursor-pointer border-0"
              >
                Set goal
              </button>
            </form>
          </div>
        )
      })()}

      {momentumData?.momentum_score != null && (
        <div className="bg-white border border-slate-200 rounded p-5 mb-6 sm:mb-8 flex items-center gap-5">
          <div
            className={`text-[40px] font-bold leading-none tabular-nums shrink-0 ${
              momentumData.momentum_score >= 70
                ? 'text-green-600'
                : momentumData.momentum_score >= 40
                  ? 'text-amber-500'
                  : 'text-red-600'
            }`}
          >
            {momentumData.momentum_score}
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-900">
              {momentumData.momentum_score >= 70
                ? 'Strong cadence. Keep it moving.'
                : momentumData.momentum_score >= 40
                  ? `Momentum is dropping.${daysSinceLastAction != null ? ` ${daysSinceLastAction}d since your last action.` : ''}`
                  : 'Search at risk. This pace adds months to your timeline.'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Momentum score
              {momentumData.momentum_computed_at && (
                <>
                  {' '}
                  &middot; Updated {Math.floor((Date.now() - new Date(momentumData.momentum_computed_at).getTime()) / 86400000)}d ago
                </>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5">
              Track your activity with{' '}
              <a href="https://www.manager-tools.com/2016/09/job-search-tracking" target="_blank" rel="noopener noreferrer" className="text-slate-500 underline hover:text-slate-700">
                Manager Tools
              </a>{' '}
              or{' '}
              <a href="https://www.manager-tools.com/career-tools-basics" target="_blank" rel="noopener noreferrer" className="text-slate-500 underline hover:text-slate-700">
                Career Tools
              </a>
            </div>
          </div>
        </div>
      )}

      {isExecutiveMode && riskItems.length > 0 && (
        <section id="risk-engine" className="mb-6 sm:mb-8 bg-white border border-slate-200 rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">Emotional risk engine</h2>
            <span className="text-[11px] text-slate-500">Operational state from behavior patterns</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {riskItems.map((risk) => (
              <div key={risk.id} className={`border rounded p-3 ${riskTone[risk.level]}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[12px] font-semibold">{risk.label}</p>
                  <span className="text-[10px] uppercase tracking-[0.08em] font-bold">{risk.level}</span>
                </div>
                <p className="text-[12px] mt-1.5 leading-relaxed">{risk.detail}</p>
                <Link href={risk.href} className="inline-flex mt-2 text-[12px] font-semibold underline">
                  {risk.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {offerCockpit.show && (
        <section id="offer-cockpit" className="mb-6 sm:mb-8 bg-slate-900 border border-slate-700 rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between gap-3">
            <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-orange-400">Offer and tradeoff cockpit</h2>
            <span className="text-[11px] text-slate-300">{offerCockpit.offerCount} offer{offerCockpit.offerCount === 1 ? '' : 's'} in play</span>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-[13px] text-slate-200">
              {offerCockpit.offerCompanyName
                ? `Anchor decision quality around the role at ${offerCockpit.offerCompanyName}.`
                : 'Anchor decision quality around challenge, context, and downside risk.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {offerCockpit.contextSignals.map((signal) => (
                <div key={signal.label} className={`rounded border px-3 py-2 ${signal.ok ? 'border-emerald-700 bg-emerald-950/50 text-emerald-300' : 'border-amber-700 bg-amber-950/40 text-amber-300'}`}>
                  <p className="text-[11px] font-semibold">{signal.label}</p>
                  <p className="text-[10px] mt-1">{signal.ok ? 'Ready' : 'Needs clarity'}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/offers" className="inline-flex min-h-[44px] items-center justify-center bg-white text-slate-900 text-[13px] font-semibold px-4 py-2 rounded hover:bg-slate-100">
                Compare offers
              </Link>
              <Link href="/dashboard/strategy" className="inline-flex min-h-[44px] items-center justify-center border border-slate-500 text-slate-200 text-[13px] font-semibold px-4 py-2 rounded hover:border-slate-300">
                Capture no-go criteria
              </Link>
              <Link href="/dashboard/wrap-up" className="inline-flex min-h-[44px] items-center justify-center border border-emerald-500 text-emerald-200 text-[13px] font-semibold px-4 py-2 rounded hover:border-emerald-300">
                Mark accepted
              </Link>
              <Link href="/dashboard/wrap-up" className="inline-flex min-h-[44px] items-center justify-center border border-slate-500 text-slate-200 text-[13px] font-semibold px-4 py-2 rounded hover:border-slate-300">
                Launch 30/60/90 transition
              </Link>
            </div>
          </div>
        </section>
      )}

      {isExecutiveMode ? (
        <details className="mb-6 sm:mb-8 bg-slate-50 border border-slate-200 rounded overflow-hidden">
          <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400">Review performance</span>
            <span className="text-[11px] text-slate-500">Expand</span>
          </summary>
          <div className="px-5 pb-5">
            <section id="benchmarks" className="bg-white border border-slate-200 rounded px-5 py-4 mb-6">
              <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">What works at this level</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[20px] font-bold text-slate-900 leading-none">12-18</p>
                  <p className="text-[12px] text-slate-500 mt-1">target companies in a 90-day search</p>
                </div>
                <div>
                  <p className="text-[20px] font-bold text-slate-900 leading-none">2-3</p>
                  <p className="text-[12px] text-slate-500 mt-1">new conversations per week to maintain momentum</p>
                </div>
                <div>
                  <p className="text-[20px] font-bold text-slate-900 leading-none">72 hrs</p>
                  <p className="text-[12px] text-slate-500 mt-1">typical response time after a warm intro</p>
                </div>
              </div>
            </section>

            <ActivityChart data={weekSlots} />
            <PipelineVelocity companies={velocityRows} />
          </div>
        </details>
      ) : (
        <>
          <section id="benchmarks" className="bg-slate-50 border border-slate-200 rounded px-5 py-4 mb-6 sm:mb-8">
            <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">What works at this level</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[20px] font-bold text-slate-900 leading-none">12-18</p>
                <p className="text-[12px] text-slate-500 mt-1">target companies in a 90-day search</p>
              </div>
              <div>
                <p className="text-[20px] font-bold text-slate-900 leading-none">2-3</p>
                <p className="text-[12px] text-slate-500 mt-1">new conversations per week to maintain momentum</p>
              </div>
              <div>
                <p className="text-[20px] font-bold text-slate-900 leading-none">72 hrs</p>
                <p className="text-[12px] text-slate-500 mt-1">typical response time after a warm intro</p>
              </div>
            </div>
          </section>

          <ActivityChart data={weekSlots} />
          <PipelineVelocity companies={velocityRows} />
        </>
      )}

      <section id="quick-actions" className="mb-6 sm:mb-2">
        <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">
          {isExecutiveMode ? 'Stage actions' : 'Quick actions'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group bg-white border border-slate-200 rounded p-4 hover:border-slate-400 hover:shadow-sm transition-all"
            >
              <p className="text-[13px] font-semibold text-slate-900 group-hover:text-slate-700">{a.label}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
