'use client'

import { useEffect } from 'react'

export default function AppShellError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app-shell]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex items-center justify-center px-6">
      <div className="bg-white border border-slate-200 rounded p-8 max-w-md w-full">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
          Starting Monday
        </div>
        <h1 className="text-[20px] font-bold text-slate-900 mb-3">
          Something went wrong.
        </h1>
        <p className="text-[14px] text-slate-500 leading-relaxed mb-6">
          A temporary error occurred. Try refreshing - if it persists, the team has been notified.
        </p>
        <button
          onClick={reset}
          className="bg-slate-900 text-white text-[14px] font-semibold px-6 py-2.5 rounded cursor-pointer border-0"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
