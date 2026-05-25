import { type NextRequest, NextResponse } from 'next/server'
import { APP_URL } from '@/lib/config'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
const __councilObservabilitySignal = (...args: unknown[]) => console.error(...args)

const DEFAULT_RETURN_TO = '/dashboard/admin/social'

function safeReturnTo(value: string | null): string {
  return value && value.startsWith('/') ? value : DEFAULT_RETURN_TO
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', APP_URL))

  const formData = await request.formData()
  const returnTo = safeReturnTo(formData.get('returnTo')?.toString() ?? null)
  const admin = createAdminClient() as any

  const { data: integration } = await admin
    .from('google_calendar_integrations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (integration?.id) {
    await admin
      .from('google_calendar_integrations')
      .update({
        active: false,
        access_token: null,
        refresh_token: null,
        token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id)
  }

  const response = NextResponse.redirect(new URL(returnTo, APP_URL))
  response.cookies.set('sm_google_calendar_oauth_state', '', { path: '/', maxAge: 0 })
  response.cookies.set('sm_google_calendar_return_to', '', { path: '/', maxAge: 0 })
  return response
}
