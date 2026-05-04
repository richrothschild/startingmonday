import { createClient } from '@/lib/supabase/server'
import { DemoBanner } from '@/components/DemoBanner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const demoId = process.env.DEMO_USER_ID
  const isDemo = !!(user?.id && demoId && user.id === demoId)

  return (
    <>
      {isDemo && <DemoBanner />}
      {children}
    </>
  )
}
