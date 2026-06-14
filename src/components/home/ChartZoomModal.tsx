'use client'

import { useState, type ReactNode } from 'react'

type ChartZoomModalProps = {
  title: string
  buttonLabel: string
  children: ReactNode
}

export function ChartZoomModal({ title, buttonLabel, children }: ChartZoomModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-full border border-white/25 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-200 transition-colors hover:border-orange-200/70 hover:text-orange-100"
        aria-label={`Open ${title} in full view`}
      >
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/90 px-3 py-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-slate-950 p-3 shadow-[0_30px_100px_rgba(15,23,42,0.45)] sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-orange-200">{title}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-200 transition-colors hover:border-slate-200 hover:text-white"
                aria-label={`Close ${title}`}
              >
                Close
              </button>
            </div>
            <div className="max-h-[78vh] overflow-auto rounded-xl border border-white/10 bg-slate-900/80 p-2 sm:p-4">{children}</div>
          </div>
        </div>
      )}
    </>
  )
}
