import Link from 'next/link'
import { DailyMomentumPlan, type DailyMomentumAction } from '@/components/DailyMomentumPlan'
import { DashboardPrimaryNavSections } from './dashboard-primary-nav-sections'
import { DashboardStatusBanners } from './dashboard-status-banners'

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
}

export function DashboardTopShellSection(props: DashboardTopShellSectionProps) {
  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-[22px] sm:text-[26px] font-bold text-slate-900 leading-tight">
          {props.greeting}, {props.firstName}.
        </h1>
        <p className="text-[13px] text-slate-600 mt-1.5">{props.today}</p>
        <p className="text-[13px] text-slate-500 mt-2 leading-relaxed max-w-[38ch]">
          Start with the briefing, then work the next relationship and the next action.
        </p>
      </div>

      <DashboardPrimaryNavSections
        signalCount={props.signalCount}
        overdueCount={props.overdueCount}
        canUseOutreachHub={props.canUseOutreachHub}
        isRothschildAdmin={props.isRothschildAdmin}
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
      />
    </>
  )
}
