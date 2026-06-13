import Link from 'next/link'
import { DailyMomentumPlan, type DailyMomentumAction } from '@/components/DailyMomentumPlan'
import { DashboardPrimaryNavSections } from './dashboard-primary-nav-sections'
import { DashboardStatusBanners } from './dashboard-status-banners'

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
  greeting: string
  firstName: string
  today: string
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
        <section className="mb-6 rounded border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500">Executive Mode</span>
              {props.isExecutivePreview && (
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Preview
                </span>
              )}
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                Stage: {props.executiveStageLabel}
              </span>
            </div>
            <div className={`inline-flex items-center gap-2 text-[11px] font-semibold border px-2.5 py-1 rounded-full ${riskTone[props.executivePrimaryRisk.level]}`}>
              <span>Primary risk: {props.executivePrimaryRisk.label}</span>
              <Link href={props.executivePrimaryRisk.href} className="underline">
                {props.executivePrimaryRisk.cta}
              </Link>
            </div>
          </div>

          <div className="px-5 py-4 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
            <div>
              <h2 className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 mb-2">Decision brief</h2>
              <div className="space-y-2.5">
                <p className="text-[13px] text-slate-700"><span className="font-semibold text-slate-900">What changed:</span> {props.executiveDecisionBrief.changed}</p>
                <p className="text-[13px] text-slate-700"><span className="font-semibold text-slate-900">Why now:</span> {props.executiveDecisionBrief.whyNow}</p>
                <p className="text-[13px] text-slate-700"><span className="font-semibold text-slate-900">Recommended move:</span> {props.executiveDecisionBrief.recommendedMove}</p>
                <p className="text-[13px] text-slate-700"><span className="font-semibold text-slate-900">Downside if delayed:</span> {props.executiveDecisionBrief.downsideIfDelayed}</p>
              </div>
            </div>
            <Link
              href={props.executiveDecisionBrief.href}
              className="inline-flex min-h-[44px] items-center justify-center rounded bg-slate-900 hover:bg-slate-700 text-white text-[13px] font-semibold px-4 py-2 whitespace-nowrap"
            >
              {props.executiveDecisionBrief.cta}
            </Link>
          </div>
        </section>
      )}

      <div className="mb-6 sm:mb-8">
        <h1 className="text-[22px] sm:text-[26px] font-bold text-slate-900 leading-tight">
          {props.greeting}, {props.firstName}.
        </h1>
        <p className="text-[13px] text-slate-600 mt-1.5">{props.today}</p>
        <p className="text-[13px] text-slate-500 mt-2 leading-relaxed sm:whitespace-nowrap">
          Start with the briefing, then work the next relationship and the next action.
        </p>
      </div>

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
