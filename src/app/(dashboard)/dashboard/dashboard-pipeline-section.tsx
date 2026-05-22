import Link from 'next/link'
import { PipelineFilter } from './PipelineFilter'
import { EmptyState, EMPTY_ICONS } from '@/components/EmptyState'

type CompanyRow = {
  id: string
  name: string
  sector: string | null
  stage: string
  fit_score: number | null
  notes: string | null
}

type StageLabel = {
  key: string
  label: string
}

type StageMap = Record<string, { label: string; cls: string }>

type Props = {
  q: string
  stage: string
  page: number
  start: number
  pageSize: number
  totalCount: number
  totalFiltered: number
  totalPages: number
  hasFilters: boolean
  filtered: CompanyRow[]
  contactCountMap: Map<string, number>
  stageMap: StageMap
  stageOptions: StageLabel[]
  activationResumeDone: boolean
  showWrapUpLink: boolean
}

export function DashboardPipelineSection(props: Props) {
  const {
    q,
    stage,
    page,
    start,
    pageSize,
    totalCount,
    totalFiltered,
    totalPages,
    hasFilters,
    filtered,
    contactCountMap,
    stageMap,
    stageOptions,
    activationResumeDone,
    showWrapUpLink,
  } = props

  return (
    <section id="pipeline" className="bg-white border border-slate-200 rounded overflow-hidden">
      <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">
          Company Pipeline
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-slate-400">
            {hasFilters && totalFiltered === 0
              ? `0 of ${totalCount}`
              : totalPages > 1 || hasFilters
                ? `${start + 1}-${Math.min(start + pageSize, totalFiltered)} of ${totalFiltered}`
                : totalCount} {totalCount === 1 ? 'company' : 'companies'}
          </span>
          <Link
            href="/dashboard/companies/new"
            className="text-[12px] font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition-colors"
          >
            + Add
          </Link>
        </div>
      </div>

      <PipelineFilter q={q} stage={stage} stages={stageOptions} />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-2.5 pl-6 pr-4 text-left text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400">
                Company
              </th>
              <th className="py-2.5 px-4 text-left text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400 hidden sm:table-cell">
                Sector
              </th>
              <th className="py-2.5 px-4 text-left text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400">
                Stage
              </th>
              <th className="py-2.5 pl-4 pr-6 text-right text-[10px] font-bold tracking-[0.09em] uppercase text-slate-400">
                Fit
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  {totalCount === 0 ? (
                    !activationResumeDone ? (
                      <EmptyState
                        icon={EMPTY_ICONS.companies}
                        title="Start here: upload your resume"
                        body="Paste your LinkedIn profile text or upload your resume. It's what drives prep briefs, daily briefings, and every AI response you get."
                        cta={{ label: 'Go to profile ->', href: '/dashboard/profile' }}
                      />
                    ) : (
                      <EmptyState
                        icon={EMPTY_ICONS.companies}
                        title="No target companies yet"
                        body="Add companies you want to work for. We'll scan for signals - exec moves, funding, openings - and alert you when the timing is right. Then use the briefing to decide who to contact first."
                        cta={{ label: 'Add your first company', href: '/dashboard/companies/new' }}
                      />
                    )
                  ) : (
                    <div className="py-10 text-center text-[14px] text-slate-400">
                      No companies match that filter.
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((co, i) => {
                const s = stageMap[co.stage] ?? { label: co.stage, cls: 'bg-slate-100 text-slate-500' }
                const contactCount = contactCountMap.get(co.id) ?? 0
                return (
                  <tr
                    key={co.id}
                    className={i < filtered.length - 1 ? 'border-b border-slate-50' : ''}
                  >
                    <td className="py-3.5 pl-6 pr-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/companies/${co.id}`} className="text-[14px] font-semibold text-slate-900 hover:text-slate-600">{co.name}</Link>
                        {contactCount > 0 && (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">
                            {contactCount} {contactCount === 1 ? 'contact' : 'contacts'}
                          </span>
                        )}
                      </div>
                      {co.notes && (
                        <div className="text-[12px] text-slate-400 mt-0.5 truncate max-w-[200px] sm:max-w-[340px]">
                          {co.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[13px] text-slate-500 hidden sm:table-cell">
                      {co.sector ?? '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-[0.04em] ${s.cls}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 pr-6 text-right text-[14px] font-bold text-slate-900">
                      {co.fit_score ?? '-'}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[12px] text-slate-400">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            {page > 0 && (
              <a
                href={`/dashboard?${new URLSearchParams({ ...(q ? { q } : {}), ...(stage ? { stage } : {}), page: String(page - 1) }).toString()}`}
                className="text-[12px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:border-slate-400"
              >
                &larr; Previous
              </a>
            )}
            {page < totalPages - 1 && (
              <a
                href={`/dashboard?${new URLSearchParams({ ...(q ? { q } : {}), ...(stage ? { stage } : {}), page: String(page + 1) }).toString()}`}
                className="text-[12px] font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:border-slate-400"
              >
                Next &rarr;
              </a>
            )}
          </div>
        </div>
      )}

      {/* Search wrap-up link - discreet, for users who found a role outside the pipeline */}
      {showWrapUpLink && (
        <div className="mt-10 text-center">
          <Link
            href="/dashboard/wrap-up"
            className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            Did your search wrap up? Mark it complete.
          </Link>
        </div>
      )}
    </section>
  )
}
