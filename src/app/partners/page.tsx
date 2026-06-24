import type { Metadata } from 'next'
import Link from 'next/link'
import { PartnersForm } from './partners-form'

export const metadata: Metadata = {
  title: 'Coach Partner Program | Starting Monday',
  description: 'A private partner evaluation for executive coaches. Test the workflow with 2 to 3 clients, verify outcome quality, and refer with confidence.',
  alternates: { canonical: 'https://startingmonday.app/partners' },
  openGraph: {
    title: 'Coach Partner Program | Starting Monday',
    description: 'Test the workflow. Refer with confidence. Earn 20% recurring commission.',
    url: 'https://startingmonday.app/partners',
  },
}

const PARTNER_TERMS = [
  'Free enrollment with referral tracking.',
  '20% recurring commission on active referrals.',
  'Preview-first: clients evaluate from workflow quality, not pitch.',
  'Client access remains client-controlled throughout.',
]

export default function PartnersPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-100">
      <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/for-coaches" className="text-[13px] text-slate-100 transition-colors hover:text-white">Coach preview</Link>
            <Link href="/login" className="text-[13px] text-slate-100 transition-colors hover:text-white">Log in</Link>
          </div>
        </div>
      </nav>

      <header className="border-b border-white/10 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200">Coach Partner Program</p>
          <h1 className="mb-5 max-w-3xl font-serif text-[34px] leading-[1.05] tracking-tight text-white sm:text-[48px]">
            Test the workflow with live clients.
            <br className="hidden sm:block" />
            Refer only when the evidence is clear.
          </h1>
          <p className="mb-7 max-w-2xl text-[16px] leading-relaxed text-slate-200">
            The partner path starts with a private 30-day evaluation, not a pitch. Run Starting Monday with 2 to 3 clients, observe operating quality, then decide whether to refer.
          </p>
          <a
            href="#apply"
            className="inline-flex items-center justify-center rounded bg-orange-500 px-6 py-3 text-[14px] font-semibold text-slate-950 transition-colors hover:bg-orange-400"
          >
            Apply for partner access
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6">

        <section className="rounded-[2rem] border border-amber-200/20 bg-[linear-gradient(155deg,rgba(26,22,20,0.82),rgba(10,14,24,0.9))] p-6 sm:p-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-amber-200">Partner terms</p>
          <h2 className="mb-4 font-serif text-[26px] leading-tight text-white sm:text-[30px]">One enrollment. Ongoing commission. No minimum referral volume.</h2>
          <ul className="space-y-2 text-[14px] leading-relaxed text-slate-200">
            {PARTNER_TERMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section id="apply" className="scroll-mt-20 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-amber-200">Private application</p>
          <h2 className="mb-2 font-serif text-[26px] leading-tight text-white sm:text-[30px]">Apply for the 30-day coach evaluation.</h2>
          <p className="mb-6 text-[14px] leading-relaxed text-slate-200">We respond within 2 business days with your referral link and partner activation. Run the evaluation and decide from observed outcomes.</p>
          <PartnersForm />
        </section>

        <section className="border-t border-white/10 pt-8">
          <p className="mb-3 text-[12px] text-slate-400">Other partner paths</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/partners/reporting" className="text-[13px] text-slate-400 transition-colors hover:text-white">Partner reporting &rarr;</Link>
            <Link href="/search-firms" className="text-[13px] text-slate-400 transition-colors hover:text-white">Search firms &rarr;</Link>
            <Link href="/for-outplacement" className="text-[13px] text-slate-400 transition-colors hover:text-white">Outplacement providers &rarr;</Link>
            <Link href="/for-pe-teams" className="text-[13px] text-slate-400 transition-colors hover:text-white">PE talent teams &rarr;</Link>
          </div>
        </section>

      </div>

      <footer className="border-t border-white/10 bg-slate-950/80 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-80">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/evidence-hub#coaching-transitions" className="text-slate-500 transition-colors hover:text-slate-200">
              Proof
            </Link>
            <p className="text-slate-500">
              Questions?{' '}
              <a href="mailto:contact@startingmonday.app" className="transition-colors hover:text-slate-200">
                contact@startingmonday.app
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
