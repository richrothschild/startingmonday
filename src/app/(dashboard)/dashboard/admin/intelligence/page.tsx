import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'
import { IntelligenceAdminClient } from './client'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://startingmonday.app'

export default async function AdminIntelligencePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const admin = createAdminClient()

  const { data: companies } = await admin
    .from('intelligence_companies')
    .select('slug, company_name, sector, website, is_featured, created_at')
    .order('created_at', { ascending: false })

  // For each company, fetch signal count and recent tokens
  const companyData = await Promise.all(
    (companies ?? []).map(async co => {
      const [{ count }, { data: tokens }] = await Promise.all([
        admin
          .from('company_signals')
          .select('id', { count: 'exact', head: true })
          .ilike('companies.name', co.company_name)
          .not('companies', 'is', null),
        admin
          .from('intelligence_access_tokens')
          .select('id, label, expires_at, created_at')
          .eq('company_slug', co.slug)
          .order('created_at', { ascending: false })
          .limit(5),
      ])
      return { ...co, signalCount: count ?? 0, tokens: tokens ?? [] }
    })
  )

  return (
    <main>
      <h1 className="sr-only">Intelligence Admin</h1>
      <nav className="sr-only" aria-label="Intelligence admin quick actions">
        <Link href="/dashboard/admin">Back to admin home</Link>
        <Link href="/dashboard/admin/social">Open social admin</Link>
        <Link href="/dashboard/admin/speakers">Open speakers admin</Link>
      </nav>
      <IntelligenceAdminClient
        companies={companyData}
        appUrl={APP_URL}
      />
    </main>
  )
}
