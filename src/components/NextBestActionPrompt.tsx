import Link from 'next/link'

export function NextBestActionPrompt({ action, href, description }: { action: string, href: string, description?: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-5 flex items-center gap-4 shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-amber-900 mb-1">Next best action</p>
        <p className="text-[13px] text-amber-800 leading-relaxed mb-2">{description}</p>
        <Link
          href={href}
          className="inline-block text-[12px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded hover:bg-amber-200 transition-colors"
        >
          {action} →
        </Link>
      </div>
    </div>
  )
}
