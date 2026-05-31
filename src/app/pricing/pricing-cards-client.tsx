'use client'

import dynamic from 'next/dynamic'

export const PricingCardsClient = dynamic(() => import('./pricing-cards').then((mod) => mod.PricingCards), {
  ssr: false,
  loading: () => (
    <section className="mb-8 rounded-lg border border-slate-200 bg-white p-8 text-center text-[13px] text-slate-500">
      Loading pricing plans...
    </section>
  ),
})
