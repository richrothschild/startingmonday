import { createClient } from '@/lib/supabase/server'

export async function verifyCoachAccess(coachId: string, clientId: string) {
  const supabase = await createClient()

  const { data: seat, error } = await supabase
    .from('team_seats')
    .select('id, coach_access_enabled, access_level, status')
    .eq('owner_id', coachId)
    .eq('member_user_id', clientId)
    .eq('status', 'accepted')
    .single()

  if (error || !seat) {
    return { hasAccess: false, level: null }
  }

  const { data: permission } = await supabase
    .from('coach_client_permissions')
    .select('access_enabled, access_level')
    .eq('coach_id', coachId)
    .eq('client_id', clientId)
    .maybeSingle()

  const enabled = permission ? permission.access_enabled : true
  const level = permission?.access_level ?? seat.access_level ?? 'read_write'

  return {
    hasAccess: enabled,
    level,
  }
}

export async function logCoachAccess(
  coachId: string,
  clientId: string,
  tableName: string,
  recordId: string,
  action: 'view' | 'update' | 'create' | 'delete',
  oldValues?: unknown,
  newValues?: unknown
) {
  const supabase = await createClient()

  await supabase.from('coach_access_logs').insert({
    coach_id: coachId,
    client_id: clientId,
    table_name: tableName,
    record_id: recordId,
    action,
    old_values: oldValues || null,
    new_values: newValues || null,
  })

  await supabase
    .from('team_seats')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('owner_id', coachId)
    .eq('member_user_id', clientId)
    .eq('status', 'accepted')
}
