import Link from 'next/link'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/SiteFooter'
import { PublicPageHeader } from '@/components/PublicPageHeader'

import { LEARN_MORE_CITATIONS } from './content'

export function LearnMorePageShell({
  backHref,
  children,
}: {
  backHref: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PublicPageHeader backHref={backHref} />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">{children}</main>
      <SiteFooter className="bg-slate-950" />
    </div>
  )
}

export function CitationSup({ numbers }: { numbers?: number[] }) {
  if (!numbers || numbers.length === 0) return null

  return (
    <sup className="ml-1 whitespace-nowrap text-[10px] font-semibold text-orange-300">
      {numbers.map((number, index) => (
        <span key={number}>
          <Link href={`#citation-${number}`} className="hover:text-orange-200">
            {number}
          </Link>
          {index < numbers.length - 1 ? ',' : ''}
        </span>
      ))}
    </sup>
  )
}

export function ProofAndCitationsSection() {
  return (
    <section className="mt-14 border-t border-white/10 pt-10">
      <div className="max-w-4xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200">Proof and citations</p>
        <h2 className="mt-3 text-[1.7rem] font-serif leading-tight text-white sm:text-[2.1rem]">Proof that is visible, not implied.</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-slate-300">
          Source note: these citations combine public pilot metrics, public method notes, and public references pages already maintained in the product.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {LEARN_MORE_CITATIONS.map((citation) => (
          <article key={citation.id} id={`citation-${citation.id}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <p className="text-[13px] font-semibold text-white">
              [{citation.id}] {citation.claim}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-300">Source: {citation.source}</p>
            {citation.external ? (
              <a href={citation.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-[12px] font-semibold text-orange-200 hover:text-orange-100">
                Source details
              </a>
            ) : (
              <Link href={citation.href} className="mt-3 inline-flex text-[12px] font-semibold text-orange-200 hover:text-orange-100">
                Source details
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}