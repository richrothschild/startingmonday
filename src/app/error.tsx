'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-[24px] font-bold text-slate-900">Something went wrong</h1>
        <p className="text-[14px] text-slate-500 mt-2">An unexpected error occurred.</p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={reset}
            className="text-[14px] font-semibold text-white bg-slate-900 px-4 py-2.5 rounded hover:bg-slate-700 cursor-pointer border-0"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="text-[14px] font-semibold text-slate-600 hover:text-slate-900"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
