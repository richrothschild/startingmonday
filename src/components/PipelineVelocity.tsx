import Link from 'next/link'

const STAGE_LABELS: Record<string, string> = {
  watching:     'Watching',
  researching:  'Researching',
  applied:      'In Process',
  interviewing: 'Interviewing',
  offer:        'Offer',
}

const STAGE_CLS: Record<string, string> = {
  watching:     'bg-slate-100 text-slate-500',
  researching:  'bg-blue-50 text-blue-700',
  applied:      'bg-indigo-50 text-indigo-700',
  interviewing: 'bg-amber-50 text-amber-700',
  offer:        'bg-green-50 text-green-700',
}

export type VelocityRow = { id: string; name: string; stage: string; updated_at: string | null }

export function PipelineVelocity({ companies }: { companies: VelocityRow[] }) {
  const rows = companies
    .map(c => ({
      ...c,
      daysSince: c.updated_at
        ? Math.floor((Date.now() - new Date(c.updated_at).getTime()) / 86400000)
        : 999,
    }))
    .sort((a, b) => b.daysSince - a.daysSince)
    .slice(0, 12)

  if (rows.length === 0) return null

  return (
    <div className="bg-white border border-slate-200 rounded mb-6 sm:mb-8 overflow-hidden">
      <div className="px-5 py-[14px] border-b border-slate-100 flex items-baseline justify-between">
        <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
          Pipeline Velocity
        </p>
        <p className="text-[11px] text-slate-300">days since last activity</p>
      </div>
      <div className="divide-y divide-slate-50">
        {rows.map(row => {
          const staleCls =
            row.daysSince >= 30 ? 'text-red-600 font-semibold' :
            row.daysSince >= 14 ? 'text-amber-600 font-semibold' :
            'text-slate-400'
          return (
            <div key={row.id} className="px-5 py-3 flex items-center gap-3">
              <Link
                href={`/dashboard/companies/${row.id}`}
                className="flex-1 text-[13px] font-medium text-slate-900 hover:text-slate-600 truncate"
              >
                {row.name}
              </Link>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${STAGE_CLS[row.stage] ?? 'bg-slate-100 text-slate-500'}`}>
                {STAGE_LABELS[row.stage] ?? row.stage}
              </span>
              <span className={`text-[12px] shrink-0 tabular-nums w-10 text-right ${staleCls}`}>
                {row.daysSince === 999 ? '--' : `${row.daysSince}d`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
