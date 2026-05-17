import { createClient } from '@/lib/supabase/server'

export async function verifyCoachAccess(coachId: string, clientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('team_seats')
    .select('id, coach_access_enabled, access_level, status')
    .eq('owner_id', clientId)
    .eq('member_user_id', coachId)
    .eq('status', 'accepted')
    .single()

  if (error || !data) {
    return { hasAccess: false, level: null }
  }

  return {
    hasAccess: data.coach_access_enabled === true,
    level: data.access_level,
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
}
