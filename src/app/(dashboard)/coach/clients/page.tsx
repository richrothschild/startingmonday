import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'My Clients - Starting Monday',
  description: 'View and manage your coaching clients.',
}

export default async function CoachClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Query coach_clients relationship to get list of assigned clients
  const { data: coachClientsData } = await supabase
    .from('coach_clients')
    .select('id, user:users(id, name, email), status')
    .eq('coach_id', user.id)
  
  const clients = (coachClientsData ?? []).map((client: any) => ({
    id: client.id as string,
    name: client.user?.name ?? 'Unknown Client',
    status: (client.status as string) ?? 'New',
    completionPercent: 0,
    lastActivity: 'Just started',
    avatar: (client.user?.name ?? 'C').substring(0, 2).toUpperCase(),
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Prep':
        return 'bg-blue-500/10 text-blue-300 border-blue-400/30'
      case 'Interviewing':
        return 'bg-amber-500/10 text-amber-300 border-amber-400/30'
      case 'New':
        return 'bg-slate-500/10 text-slate-300 border-slate-400/30'
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-400/30'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-white sm:text-[40px]">
            Your Clients
          </h1>
          <p className="text-[14px] leading-relaxed text-slate-400 mt-2">
            {clients.length} active client{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Clients grid */}
      {clients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/coach/${client.id}`}
              className="group rounded-2xl border border-white/10 bg-slate-900/40 p-6 transition-all hover:border-orange-400/40 hover:bg-slate-900/60"
            >
              {/* Avatar & Name */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 text-[14px] font-semibold text-orange-300">
                    {client.avatar}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white group-hover:text-orange-300 transition-colors">
                      {client.name}
                    </p>
                    <p className="text-[12px] text-slate-400">{client.lastActivity}</p>
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div className={`inline-block mb-4 px-3 py-1 rounded-full text-[11px] font-semibold border ${getStatusColor(client.status)}`}>
                {client.status}
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-slate-400">Prep completion</p>
                  <p className="text-[12px] font-semibold text-slate-300">{client.completionPercent}%</p>
                </div>
                <div className="h-2 rounded-full bg-slate-950/50 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                    style={{ width: `${client.completionPercent}%` }}
                  />
                </div>
              </div>

              {/* CTA */}
              <p className="text-[12px] text-orange-400 font-semibold mt-4 group-hover:text-orange-300 transition-colors">
                View progress →
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-12 text-center">
          <p className="text-[14px] text-slate-400">
            You don't have any active clients yet.
          </p>
        </div>
      )}

      {/* Info card */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-6 sm:p-8">
        <p className="text-[13px] font-semibold text-slate-300 mb-3">How to add clients</p>
        <p className="text-[14px] leading-relaxed text-slate-100 mb-4">
          Clients are added through the partnership setup. Once a client accepts your coaching arrangement, they'll appear here automatically.
        </p>
        <Link
          href="/help"
          className="text-[13px] font-semibold text-orange-400 hover:text-orange-300 transition-colors"
        >
          Learn more about client management →
        </Link>
      </div>
    </div>
  )
}
