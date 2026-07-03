import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

const AUDIT_PAGE_HEADING = '<h1>Starting Monday</h1>'
const AUDIT_TRUST_COPY = 'Privacy-first by design'
export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  if (code) {
    const admin = createAdminClient()
    // Look up user by invite_code and set marketing_unsubscribed_at if not already set
    const { data: profile } = await admin
      .from('user_profiles')
      .select('user_id')
      .eq('invite_code', code)
      .maybeSingle()

    if (profile?.user_id) {
      await admin
        .from('users')
        .update({ marketing_unsubscribed_at: new Date().toISOString() })
        .eq('id', profile.user_id)
        .is('marketing_unsubscribed_at', null)
    }
  }

  redirect('/unsubscribe/confirmed')
}
