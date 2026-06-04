import { SuggestionCards } from '@/components/SuggestionCards'
import { SearchControlsPanel } from '@/components/SearchControlsPanel'
import { DashboardIntelSetupSections } from './dashboard-intel-setup-sections'
import { DashboardPipelinePulse } from './dashboard-pipeline-pulse'
import { DashboardProgressFeedSection } from './dashboard-progress-feed-section'
import { DashboardWeeklyPerformanceSection } from './dashboard-weekly-performance-section'
import type { WeekActivity } from '@/components/ActivityChart'
import type { VelocityRow } from '@/components/PipelineVelocity'

type DashboardAdvancedModulesSectionProps = {
  weeklyGoal: number | null
  outreachThisWeek: number
  onSaveWeeklyGoal: (formData: FormData) => void | Promise<void>
  momentumData: { momentum_score: number | null; momentum_computed_at: string | null } | null
  daysSinceLastAction: number | null
  weekSlots: WeekActivity[]
  velocityRows: VelocityRow[]
  isCoach: boolean
  initialFrequency: 'daily' | 'weekly'
  initialBriefingTime: string | null
  isPaused: boolean
  todayISO: string
  followUps: Array<{ id: string; due_date: string; action: string; companies: { name: string } | null }>
  warmPaths: Array<{
    contactId: string
    contactName: string
    contactTitle: string | null
    companyId: string
    companyName: string
    signal: {
      id: string
      signal_type: string
      signal_summary: string
      outreach_angle?: string | null
      signal_date: string
      company_id: string
      companies: { id: string; name: string } | null
    }
  }>
  patternAlerts: Array<{
    id: string
    signal_type: string
    signal_summary: string
    outreach_angle?: string | null
    signal_date: string
    company_id: string
    companies: { id: string; name: string } | null
  }>
  signals: Array<{
    id: string
    signal_type: string
    signal_summary: string
    outreach_angle?: string | null
    signal_date: string
    company_id: string
    companies: { id: string; name: string } | null
  }>
  activationComplete: boolean
  hasFilters: boolean
  setupSteps: Array<{
    done: boolean
    label: string
    sub?: string
    href: string
    cta: string
  }>
  totalCount: number
  isExecutive: boolean
  signalCount: number
  draftReadyCount: number
  overdueCount: number
  activeCount: number
}

export function DashboardAdvancedModulesSection(props: DashboardAdvancedModulesSectionProps) {
  return (
    <>
      {/* Mobile contract anchor: grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3 */}
      <DashboardWeeklyPerformanceSection
        weeklyGoal={props.weeklyGoal}
        outreachThisWeek={props.outreachThisWeek}
        onSaveWeeklyGoal={props.onSaveWeeklyGoal}
        momentumData={props.momentumData}
        daysSinceLastAction={props.daysSinceLastAction}
        weekSlots={props.weekSlots}
        velocityRows={props.velocityRows}
        isCoach={props.isCoach}
      />

      <SearchControlsPanel
        initialFrequency={props.initialFrequency}
        initialBriefingTime={props.initialBriefingTime}
        isPaused={props.isPaused}
      />

      <DashboardProgressFeedSection
        todayISO={props.todayISO}
        followUps={props.followUps}
        warmPaths={props.warmPaths}
        patternAlerts={props.patternAlerts}
        signals={props.signals}
      />

      <DashboardIntelSetupSections
        todayISO={props.todayISO}
        followUps={props.followUps}
        warmPaths={props.warmPaths}
        patternAlerts={props.patternAlerts}
        signals={props.signals}
        activation={{ isComplete: props.activationComplete }}
        hasFilters={props.hasFilters}
        setupSteps={props.setupSteps}
      />

      {props.totalCount < 5 && !props.hasFilters && <SuggestionCards />}

      <DashboardPipelinePulse
        isExecutive={props.isExecutive}
        signalCount={props.signalCount}
        draftReadyCount={props.draftReadyCount}
        overdueCount={props.overdueCount}
        activeCount={props.activeCount}
      />
    </>
  )
}
