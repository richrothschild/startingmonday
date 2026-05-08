import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: pingError } = await supabase.from('users').select('id').limit(1)
  if (pingError) {
    console.error(JSON.stringify({ ts: new Date().toISOString(), event: 'health_check', ok: false, db: 'unreachable', error: pingError.message }))
    return NextResponse.json({ ok: false, db: 'unreachable', error: pingError.message }, { status: 503 })
  }

  const warnings: string[] = []

  // migration 030: role_type column in user_profiles
  const { error: roleTypeError } = await supabase.from('user_profiles').select('role_type').limit(0)
  if (roleTypeError) warnings.push(`migration_030_role_type: ${roleTypeError.message}`)

  // migration 039: team_seats table
  const { error: seatsError } = await supabase.from('team_seats').select('id').limit(0)
  if (seatsError) warnings.push(`migration_039_team_seats: ${seatsError.message}`)

  // migration 040: llm_traces table
  const { error: tracesError } = await supabase.from('llm_traces').select('id').limit(0)
  if (tracesError) warnings.push(`migration_040_llm_traces: ${tracesError.message}`)

  console.log(JSON.stringify({ ts: new Date().toISOString(), event: 'health_check', ok: warnings.length === 0, warnings }))

  if (warnings.length > 0) {
    return NextResponse.json({ ok: false, db: 'ok', migration_warnings: warnings }, { status: 200 })
  }

  return NextResponse.json({ ok: true, db: 'ok' })
}
