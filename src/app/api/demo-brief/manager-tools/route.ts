import { type NextRequest, NextResponse } from 'next/server'
import { POST as executiveBriefPost } from '../executive-brief/route'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember, hasAdminHeaderAccess } from '@/lib/staff'

export async function POST(request: NextRequest) {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	const staff = await getStaffMember(user.email ?? '')
	if (!hasAdminHeaderAccess(staff)) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
	}

	return executiveBriefPost(request)
}
