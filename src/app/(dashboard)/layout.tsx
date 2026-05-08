import { createClient } from '@/lib/supabase/server'
import { DemoBanner } from '@/components/DemoBanner'
import { PersonalEmailNudge } from '@/components/PersonalEmailNudge'
import { WatermarkOverlay } from '@/components/WatermarkOverlay'
import { BottomNav } from '@/components/BottomNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const demoId = process.env.DEMO_USER_ID
  const isDemo = !!(user?.id && demoId && user.id === demoId)

  return (
    <>
      {isDemo && <DemoBanner />}
      {!isDemo && user?.email && <PersonalEmailNudge email={user.email} />}
      {!isDemo && user?.email && <WatermarkOverlay email={user.email} />}
      <div className="nav-content-spacer">
        {children}
      </div>
      <BottomNav />
    </>
  )
}
