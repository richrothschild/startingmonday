'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SuggestedPerson } from '@/lib/enrichment'

type Props = {
  companyName: string
  sector: string
  suggestedPeople: SuggestedPerson[]
}

export function RecommendationActions({ companyName, sector, suggestedPeople }: Props) {
  const router = useRouter()
  const [busyAction, setBusyAction] = useState<'contact' | 'outreach' | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const primaryPerson = suggestedPeople[0] ?? null

  async function createContactAndMaybeRoute(mode: 'contact' | 'outreach') {
    if (!primaryPerson) return
    setBusyAction(mode)
    setMessage(null)
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: primaryPerson.name,
          title: primaryPerson.title,
          firm: companyName,
          channel: 'cold',
          notes: `Added from discover recommendation. Reason: ${primaryPerson.reason}`,
          source: mode === 'outreach' ? 'discover_recommendation_outreach' : 'discover_recommendation_contact',
          enrichment_source: primaryPerson.source,
          enrichment_confidence: primaryPerson.confidence,
          enrichment_retention_days: primaryPerson.source === 'apollo' ? 90 : 30,
        }),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        setMessage(payload?.error ?? 'Failed to create contact from recommendation.')
        return
      }

      const createdId = payload?.id as string | undefined
      if (!createdId) {
        setMessage('Contact created but no contact id was returned.')
        return
      }

      if (mode === 'outreach') {
        router.push(`/dashboard/contacts/${createdId}/outreach`)
        return
      }

      setMessage('Contact added to your pipeline.')
      router.refresh()
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard/discover"
          className="text-center text-[13px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded transition-colors"
        >
          Back to recommendations
        </Link>
        <Link
          href={`/dashboard/companies/new?name=${encodeURIComponent(companyName)}&sector=${encodeURIComponent(sector ?? '')}&source=discover_recommendation_detail`}
          className="text-center text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-700 px-4 py-2.5 rounded transition-colors"
        >
          Add company to watchlist
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => createContactAndMaybeRoute('contact')}
          disabled={!primaryPerson || busyAction !== null}
          className="text-center text-[13px] font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 px-4 py-2.5 rounded transition-colors"
        >
          {busyAction === 'contact' ? 'Adding contact...' : 'Add suggested contact'}
        </button>
        <button
          type="button"
          onClick={() => createContactAndMaybeRoute('outreach')}
          disabled={!primaryPerson || busyAction !== null}
          className="text-center text-[13px] font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-4 py-2.5 rounded transition-colors"
        >
          {busyAction === 'outreach' ? 'Preparing draft...' : 'Start outreach draft'}
        </button>
      </div>

      {message && <p className="text-[12px] text-slate-500">{message}</p>}
      {!primaryPerson && <p className="text-[12px] text-slate-500">No suggested people available for direct actions yet.</p>}
    </div>
  )
}
