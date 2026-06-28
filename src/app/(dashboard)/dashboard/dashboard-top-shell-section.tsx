import Link from 'next/link'
import { DailyMomentumPlan, type DailyMomentumAction } from '@/components/DailyMomentumPlan'
import { DashboardPrimaryNavSections } from './dashboard-primary-nav-sections'
import { DashboardStatusBanners } from './dashboard-status-banners'
import { DashboardGreetingBlock } from './dashboard-greeting-block'

type ExecutiveRiskLevel = 'low' | 'medium' | 'high'

type ExecutiveDecisionBrief = {
  changed: string
  whyNow: string
  recommendedMove: string
  downsideIfDelayed: string
  href: string
  cta: string
}

type DashboardTopShellSectionProps = {
  firstName: string
  briefingTimezone: string | null
  signalCount: number
  overdueCount: number
  canUseOutreachHub: boolean
  isRothschildAdmin: boolean
  dailyMomentumActions: DailyMomentumAction[]
  todayISO: string
  momentumStatus: 'low' | 'medium' | 'strong'
  profileSaved: boolean
  isTrialing: boolean
  trialDaysLeft: number
  totalCount: number
  offerCount: number
  offerName: string | null
  offerCompanyName: string | null
  onMarkPlaced: (formData: FormData) => void | Promise<void>
  activationComplete: boolean
  activationCompletedCount: number
  isExecutiveMode: boolean
  isExecutivePreview: boolean
  executiveStageLabel: string
  executivePrimaryRisk: {
    label: string
    level: ExecutiveRiskLevel
    href: string
    cta: string
  }
  executiveDecisionBrief: ExecutiveDecisionBrief
}

export function DashboardTopShellSection(props: DashboardTopShellSectionProps) {
  const riskTone = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-red-50 text-red-700 border-red-200',
  } as const

  return (
    <>
      {props.isExecutiveMode && (
        <section className="mb-6 rounded-2xl border border-white/15 bg-white/5 overflow-hidden shadow-[0_22px_66px_rgba(15,23,42,0.18)] backdrop-blur-md">
          <div className="px-5 py-3.5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-semibold text-orange-300">Executive mode</span>
              {props.isExecutivePreview && (
                <span className="text-[13px] font-semibold text-indigo-200 bg-indigo-500/20 border border-indigo-300/30 px-2 py-0.5 rounded-full">
                  Preview mode
                </span>
              )}
              <span className="text-[13px] font-semibold text-slate-200 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                Stage: {props.executiveStageLabel}
              </span>
            </div>
            <div className={`inline-flex items-center gap-2 text-[13px] font-semibold border px-2.5 py-1 rounded-full ${riskTone[props.executivePrimaryRisk.level]}`}>
              <span>Primary risk: {props.executivePrimaryRisk.label}</span>
              <Link href={props.executivePrimaryRisk.href} className="underline">
                {props.executivePrimaryRisk.cta}
              </Link>
            </div>
          </div>

          <div className="px-5 py-4 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
            <div>
              <h2 className="text-[13px] font-semibold text-slate-300 mb-2">Decision brief</h2>
              <div className="space-y-2.5">
                <p className="text-[13px] text-slate-200"><span className="font-semibold text-white">What changed:</span> {props.executiveDecisionBrief.changed}</p>
                <p className="text-[13px] text-slate-200"><span className="font-semibold text-white">Why now:</span> {props.executiveDecisionBrief.whyNow}</p>
                <p className="text-[13px] text-slate-200"><span className="font-semibold text-white">Recommended move:</span> {props.executiveDecisionBrief.recommendedMove}</p>
                <p className="text-[13px] text-slate-200"><span className="font-semibold text-white">Downside if delayed:</span> {props.executiveDecisionBrief.downsideIfDelayed}</p>
              </div>
            </div>
            <Link
              href={props.executiveDecisionBrief.href}
              className="inline-flex min-h-[44px] items-center justify-center rounded bg-orange-500 hover:bg-orange-400 text-slate-950 text-[13px] font-semibold px-4 py-2 whitespace-nowrap"
            >
              {props.executiveDecisionBrief.cta}
            </Link>
          </div>
        </section>
      )}

      <section className="mb-4 sm:mb-6 rounded-2xl border border-slate-900 bg-[radial-gradient(circle_at_top_left,_rgba(193,127,59,0.2),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_34%),linear-gradient(180deg,_rgba(9,14,26,0.98)_0%,_rgba(11,17,30,0.95)_54%,_rgba(10,15,28,0.98)_100%)] px-5 py-4 sm:px-6 sm:py-5 shadow-[0_20px_48px_rgba(15,23,42,0.14)]">
        <DashboardGreetingBlock firstName={props.firstName} briefingTimezone={props.briefingTimezone} />
        <p className="text-[14px] text-slate-200 mt-2.5 leading-relaxed max-w-3xl">
          Your position is built one clear move at a time. Start with the briefing, move one relationship, then protect follow-through.
        </p>
      </section>

      <DashboardPrimaryNavSections
        signalCount={props.signalCount}
        overdueCount={props.overdueCount}
        canUseOutreachHub={props.canUseOutreachHub}
        isRothschildAdmin={props.isRothschildAdmin}
        isExecutiveMode={props.isExecutiveMode}
      />

      <DailyMomentumPlan actions={props.dailyMomentumActions} dateKey={props.todayISO} status={props.momentumStatus} />

      {props.profileSaved && (
        <div className="mb-6 px-5 py-3 rounded bg-green-50 border border-green-200 text-[13px] text-green-800 flex items-center justify-between gap-4">
          <span>Profile updated. Your briefs and coaching will reflect this now.</span>
          <Link href="/dashboard/profile" className="font-semibold underline shrink-0">
            Finish profile
          </Link>
        </div>
      )}

      <DashboardStatusBanners
        isTrialing={props.isTrialing}
        trialDaysLeft={props.trialDaysLeft}
        totalCount={props.totalCount}
        offerCount={props.offerCount}
        offerName={props.offerName}
        offerCompanyName={props.offerCompanyName}
        onMarkPlaced={props.onMarkPlaced}
        activationComplete={props.activationComplete}
        activationCompletedCount={props.activationCompletedCount}
        isExecutiveMode={props.isExecutiveMode}
      />
    </>
  )
}
