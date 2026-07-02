import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SecurityClient } from './security-client'

export const metadata = { title: 'Security - Starting Monday' }

export default async function SecuritySettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.14em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[13px] text-slate-300 hover:text-white transition-colors">
              &larr; Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-slate-900">Security</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Manage how you sign in.
          </p>
        </div>

        <SecurityClient accountEmail={user.email ?? 'your account'} />
      </main>
    </div>
  )
}
