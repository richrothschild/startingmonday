import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { DemoContent } from '../page'

export const metadata: Metadata = {
  title: 'Starting Monday | CIO Demo',
  description: 'A direct CIO-specific demo entry point for Starting Monday.',
  robots: { index: false, follow: false },
}

export default function CIODemoPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-slate-950 border-b border-slate-900 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white hover:opacity-80 transition-opacity">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/demo/presenter" className="text-[13px] text-slate-400 hover:text-white transition-colors">Presenter mode</Link>
            <Link href="/mark-demo" className="text-[13px] font-semibold text-white bg-orange-500 px-4 py-1.5 rounded hover:bg-orange-600 transition-colors">No-gate demo</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Suspense fallback={null}>
          <DemoContent
            bypassGate
            initialCompany="ServiceNow"
            initialRole="Chief Information Officer"
            autoGenerate
          />
        </Suspense>
      </main>
    </div>
  )
}
