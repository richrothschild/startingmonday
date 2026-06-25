'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PREP_TASKS = [
  { href: '/prep/interview', label: 'Interview', id: 'interview' },
  { href: '/prep/companies', label: 'Companies', id: 'companies' },
  { href: '/prep/meetings', label: 'Meetings', id: 'meetings' },
  { href: '/prep/communications', label: 'Communications', id: 'communications' },
]

export default function PrepLayout({ 
  children,
}: { 
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Task navigation */}
      <nav className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {PREP_TASKS.map((task) => {
              const isActive = pathname.startsWith(task.href)
              return (
                <Link
                  key={task.id}
                  href={task.href}
                  className={`flex-shrink-0 px-4 py-3 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-orange-400 text-orange-300'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {task.label}
                </Link>
              )
            })}
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
