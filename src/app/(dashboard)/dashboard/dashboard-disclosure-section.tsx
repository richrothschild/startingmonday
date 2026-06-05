import type { ReactNode } from 'react'

type DashboardDisclosureSectionProps = {
  id: string
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

export function DashboardDisclosureSection({
  id,
  title,
  defaultOpen = false,
  children,
}: DashboardDisclosureSectionProps) {
  const panelId = `${id}-panel`

  return (
    <details id={id} open={defaultOpen} className="mb-6 sm:mb-8 bg-white border border-slate-200 rounded overflow-hidden scroll-mt-24">
      <summary
        className="cursor-pointer list-none px-5 py-4 border-b border-slate-100 flex items-center justify-between"
        aria-controls={panelId}
      >
        <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500">{title}</span>
        <span className="text-[11px] text-slate-400">Expand</span>
      </summary>
      <div id={panelId} className="px-5 py-5">
        {children}
      </div>
    </details>
  )
}
