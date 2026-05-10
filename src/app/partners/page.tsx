import type { Metadata } from 'next'
import Link from 'next/link'
import { PartnersForm } from './partners-form'

export const metadata: Metadata = {
  title: 'Partners — Starting Monday',
  description: 'Partner with Starting Monday to deliver better outcomes for senior executives in transition. Outplacement, relocation, executive coaching, and search firm programs.',
  alternates: { canonical: 'https://startingmonday.app/partners' },
}

const PARTNER_TYPES = [
  {
    label: 'Outplacement',
    body: 'Give your executives an active search tool, not a workshop binder.',
  },
  {
    label: 'Relocation',
    body: 'Help relocating executives land faster in their new market.',
  },
  {
    label: 'Executive coaching',
    body: 'Extend your coaching practice with AI-powered prep and pipeline tracking.',
  },
  {
    label: 'Search firms',
    body: 'Help your candidates prepare thoroughly for every company you place them with.',
  },
]

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <Link href="/pricing" className="text-[13px] text-slate-400 hover:text-white transition-colors">
            Pricing
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-10">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-3">
            Partners
          </p>
          <h1 className="text-[34px] sm:text-[42px] font-bold text-slate-900 leading-tight tracking-tight mb-4">
            Work with us
          </h1>
          <p className="text-[15px] text-slate-500 leading-relaxed">
            Starting Monday works with outplacement firms, relocation firms, executive coaches,
            and retained search practices to deliver better outcomes for senior candidates in transition.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-12">
          {PARTNER_TYPES.map(({ label, body }) => (
            <div key={label} className="border border-slate-200 rounded p-4">
              <p className="text-[13px] font-semibold text-slate-900 mb-1">{label}</p>
              <p className="text-[12px] text-slate-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="mb-12 space-y-4 text-[14px] text-slate-500 leading-relaxed border-t border-slate-100 pt-8">
          <p>
            Partnership arrangements vary by type. Outplacement and relocation programs run on bulk seat pricing with centralized billing and activation tracking. Coaching practices use a referral model. Search firms get candidate-facing prep and pipeline tools.
          </p>
          <p>
            If you work with executive coaches,{' '}
            <Link href="/coaches-guide" className="text-slate-700 underline hover:text-slate-900 transition-colors">
              read the coaches guide
            </Link>
            . It covers how the platform works in practice and what clients can expect.
          </p>
        </div>

        <PartnersForm />
      </main>
    </div>
  )
}
