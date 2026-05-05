import { createAdminClient } from '@/lib/supabase/admin'

export type StaffRole = 'owner' | 'admin' | 'viewer'

export type StaffMember = {
  id: string
  email: string
  role: StaffRole
  permissions: Record<string, boolean>
  created_at: string
  created_by: string | null
}

export async function getStaffMember(email: string): Promise<StaffMember | null> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('staff_members')
      .select('*')
      .eq('email', email)
      .single()
    return data as StaffMember | null
  } catch {
    return null
  }
}

export async function getAllStaff(): Promise<StaffMember[]> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('staff_members')
      .select('*')
      .order('created_at', { ascending: true })
    return (data ?? []) as StaffMember[]
  } catch {
    return []
  }
}

export async function addStaffMember(email: string, role: StaffRole, createdBy: string): Promise<boolean> {
  try {
    const admin = createAdminClient()
    const { error } = await admin.from('staff_members').insert({ email, role, created_by: createdBy })
    return !error
  } catch {
    return false
  }
}

export async function updateStaffRole(id: string, role: StaffRole): Promise<boolean> {
  try {
    const admin = createAdminClient()
    const { error } = await admin.from('staff_members').update({ role }).eq('id', id)
    return !error
  } catch {
    return false
  }
}

export async function removeStaffMember(id: string): Promise<boolean> {
  try {
    const admin = createAdminClient()
    const { error } = await admin.from('staff_members').delete().eq('id', id)
    return !error
  } catch {
    return false
  }
}
