import { createClient } from '@/lib/supabase/server'
import { DemoBanner } from '@/components/DemoBanner'
import { PersonalEmailNudge } from '@/components/PersonalEmailNudge'
import { WatermarkOverlay } from '@/components/WatermarkOverlay'
import { BottomNav } from '@/components/BottomNav'
import { PHProvider } from '@/components/PosthogProvider'
import { CommandPalette } from '@/components/CommandPalette'
import { ToastProvider } from '@/lib/toast'
import { DashboardFooter } from '@/components/DashboardFooter'
import { BackToTop } from '@/components/BackToTop'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const demoId = process.env.DEMO_USER_ID
  const isDemo = !!(user?.id && demoId && user.id === demoId)

  return (
    <ToastProvider>
      <PHProvider>
        <>
          {isDemo && <DemoBanner />}
          {!isDemo && user?.email && <WatermarkOverlay email={user.email} />}
          <div id="top" className="nav-content-spacer min-h-screen bg-slate-950 text-slate-100">
            {children}
            <DashboardFooter />
          </div>
          {!isDemo && user?.email && <PersonalEmailNudge email={user.email} />}
          <BottomNav />
          <BackToTop />
          <CommandPalette />
        </>
      </PHProvider>
    </ToastProvider>
  )
}
