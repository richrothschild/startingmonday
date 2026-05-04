import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — Starting Monday',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white">
            Starting Monday
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <script
          src="https://app.termly.io/embed-policy.min.js"
          data-auto-block="on"
          async
        />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <div {...({ name: 'termly-embed', 'data-id': '2737f35f-7008-46e2-8b4f-28c2f5478dfb' } as any)} />
      </main>

      <footer className="border-t border-slate-100 px-6 py-6 mt-12">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400">
            Starting Monday
          </span>
          <Link href="/" className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors">
            Back to home
          </Link>
        </div>
      </footer>
    </div>
  )
}
