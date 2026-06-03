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
}: DashboardWeeklyPerformanceSectionProps) {
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

      <section id="quick-actions" className="mb-6 sm:mb-2">
        <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
          {[
            { href: '/dashboard/briefing', label: 'Daily Briefing' },
            { href: '/dashboard/strategy', label: 'Strategy Brief' },
            { href: '/dashboard/discover', label: 'Discover' },
            { href: '/dashboard/calendar', label: 'Calendar' },
            { href: '/optimize', label: 'LinkedIn' },
            { href: '/dashboard/positioning', label: 'Positioning' },
            { href: '/dashboard/profile', label: 'Configure Search' },
            ...(isCoach ? [{ href: '/dashboard/coach', label: 'My Clients' }] : []),
          ].map((a) => (
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
