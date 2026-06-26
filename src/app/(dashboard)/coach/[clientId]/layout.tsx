import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const COACH_TASKS = [
  { href: 'interview', label: 'Interview', id: 'interview' },
  { href: 'companies', label: 'Companies', id: 'companies' },
  { href: 'meetings', label: 'Meetings', id: 'meetings' },
  { href: 'communications', label: 'Communications', id: 'communications' },
]

export default async function CoachClientLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ clientId: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { clientId } = await params

  // Fetch client details from Supabase
  const { data: coachClientData } = await supabase
    .from('coach_clients')
    .select('id, user:users(name, email), status')
    .eq('id', clientId)
    .maybeSingle()

  if (!coachClientData) {
    redirect('/coach/clients')
  }

  const clientDetails = {
    id: (coachClientData as any).id,
    name: (coachClientData as any).user?.name ?? 'Client',
    email: (coachClientData as any).user?.email ?? '',
    status: ((coachClientData as any).status as string) ?? 'In Prep',
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/coach/clients"
              className="text-[12px] text-slate-400 hover:text-slate-300 transition-colors"
            >
              ← Back to clients
            </Link>
          </div>
          <h1 className="text-[24px] font-bold text-white mb-1">{clientDetails.name}</h1>
          <p className="text-[13px] text-slate-400">{clientDetails.email}</p>
        </div>
      </div>

      {/* Task navigation */}
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {COACH_TASKS.map((task) => (
              <Link
                key={task.id}
                href={`/coach/${clientId}/${task.href}`}
                className="flex-shrink-0 px-4 py-3 text-[13px] font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-300 transition-colors whitespace-nowrap"
              >
                {task.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </div>
    </div>
  )
}
