'use client'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { archiveContactSilent, toggleContactPriority } from '@/app/(dashboard)/dashboard/contacts/actions'
import { STATUS_STEPS, STATUS_CLS } from '@/components/ContactStatusStepper'

const CHANNEL: Record<string, { label: string; cls: string }> = {
  linkedin:  { label: 'LinkedIn',  cls: 'bg-blue-50 text-blue-700' },
  referral:  { label: 'Referral',  cls: 'bg-green-50 text-green-700' },
  cold:      { label: 'Cold',      cls: 'bg-slate-100 text-slate-500' },
  inbound:   { label: 'Inbound',   cls: 'bg-indigo-50 text-indigo-700' },
  event:     { label: 'Event',     cls: 'bg-amber-50 text-amber-700' },
  recruiter: { label: 'Recruiter', cls: 'bg-purple-50 text-purple-700' },
}

const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  STATUS_STEPS.map(s => [s.value, s.label])
)

const CHANNEL_VALUES = ['linkedin', 'referral', 'recruiter', 'cold', 'inbound', 'event']

export type ContactListItem = {
  id: string
  name: string
  title: string | null
  firm: string | null
  channel: string | null
  notes: string | null
  outreach_status: string | null
  is_priority: boolean
  companies: { id: string; name: string } | null
}

function exportContactsCsv(contacts: ContactListItem[]) {
  const headers = ['Name', 'Title', 'Firm', 'Company', 'Channel', 'Status', 'Priority', 'Notes']
  const rows = contacts.map(ct => [
    ct.name,
    ct.title ?? '',
    ct.firm ?? '',
    ct.companies?.name ?? '',
    ct.channel ?? '',
    ct.outreach_status ?? 'prospect',
    ct.is_priority ? 'Yes' : '',
    ct.notes ?? '',
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function generateOutreachList(contacts: ContactListItem[], criteria: { channel?: string; isPriority?: boolean }) {
  const filteredContacts = contacts.filter(ct => {
    const matchesChannel = criteria.channel ? ct.channel === criteria.channel : true;
    const matchesPriority = criteria.isPriority !== undefined ? ct.is_priority === criteria.isPriority : true;
    return matchesChannel && matchesPriority;
  });

  const headers = ['Name', 'Title', 'Firm', 'Company', 'Channel', 'Status', 'Priority', 'Notes'];
  const rows = filteredContacts.map(ct => [
    ct.name,
    ct.title ?? '',
    ct.firm ?? '',
    ct.companies?.name ?? '',
    ct.channel ?? '',
    ct.outreach_status ?? 'prospect',
    ct.is_priority ? 'Yes' : '',
    ct.notes ?? '',
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `outreach-list-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ContactsList({ contacts, isExecutive = false }: { contacts: ContactListItem[]; isExecutive?: boolean }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState('')
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [priorities, setPriorities] = useState<Record<string, boolean>>(
    Object.fromEntries(contacts.map(c => [c.id, c.is_priority]))
  )
  const [, startTransition] = useTransition()

  const usedChannels = new Set(contacts.map(c => c.channel).filter(Boolean) as string[])
  const activeChannelFilters = CHANNEL_VALUES.filter(v => usedChannels.has(v))

  const filtered = contacts.filter(ct => {
    if (removedIds.has(ct.id)) return false
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      ct.name.toLowerCase().includes(q) ||
      (ct.title ?? '').toLowerCase().includes(q) ||
      (ct.firm ?? '').toLowerCase().includes(q) ||
      (ct.companies?.name ?? '').toLowerCase().includes(q)
    const matchesChannel = !channelFilter || ct.channel === channelFilter
    return matchesSearch && matchesChannel
  })

  // For executive: group recruiters by firm, non-recruiters flat
  function buildRows() {
    if (!isExecutive) return { grouped: null, flat: filtered }

    const recruiters = filtered.filter(ct => ct.channel === 'recruiter' && ct.firm)
    const others = filtered.filter(ct => !(ct.channel === 'recruiter' && ct.firm))

    const byFirm: Record<string, ContactListItem[]> = {}
    for (const ct of recruiters) {
      const firm = ct.firm!
      if (!byFirm[firm]) byFirm[firm] = []
      byFirm[firm].push(ct)
    }

    return { grouped: byFirm, flat: others }
  }

  const { grouped, flat } = buildRows()

  function togglePriority(ct: ContactListItem) {
    const next = !priorities[ct.id]
    setPriorities(prev => ({ ...prev, [ct.id]: next }))
    startTransition(async () => {
      await toggleContactPriority(ct.id, !next)
      router.refresh()
    })
  }

  if (contacts.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">All contacts</span>
          <span className="text-[12px] text-slate-400">0 contacts</span>
        </div>
        <div className="px-6 py-12 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7" r="4" stroke="#94a3b8" strokeWidth="1.5"/>
              <path d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-[14px] font-semibold text-slate-900 mb-1">No contacts yet</p>
          <p className="text-[13px] text-slate-500 max-w-xs mx-auto">Add recruiters, hiring managers, and warm connections. Roles at this level fill through relationships.</p>
        </div>
      </div>
    )
  }

  function ContactRow({ ct }: { ct: ContactListItem }) {
    const ch = ct.channel ? (CHANNEL[ct.channel] ?? null) : null
    const companyName = ct.companies?.name ?? null
    const subtitle = [ct.title, ct.firm ?? companyName].filter(Boolean).join(' · ')
    const status = ct.outreach_status ?? 'prospect'
    const statusLabel = STATUS_LABELS[status] ?? status
    const statusCls = STATUS_CLS[status] ?? 'bg-slate-100 text-slate-500'
    const isPriority = priorities[ct.id] ?? ct.is_priority
    const nextAction = status === 'prospect'
      ? 'Draft first outreach'
      : status === 'meeting_scheduled'
        ? 'Prep for scheduled meeting'
        : status === 'closed'
          ? 'Keep warm monthly'
          : 'Schedule next follow-up'

    return (
      <div className="px-6 py-4 flex items-start gap-3">
        {isExecutive && (
          <button
            type="button"
            title={isPriority ? 'Remove priority' : 'Mark as priority'}
            onClick={() => togglePriority(ct)}
            className={`shrink-0 mt-0.5 text-[16px] leading-none cursor-pointer bg-transparent border-0 p-0 transition-opacity ${isPriority ? 'opacity-100' : 'opacity-20 hover:opacity-60'}`}
          >
            ★
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/dashboard/contacts/${ct.id}`} className="text-[14px] font-semibold text-slate-900 hover:text-slate-600">
              {ct.name}
            </Link>
            {ch && (
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.04em] ${ch.cls}`}>
                {ch.label}
              </span>
            )}
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCls}`}>
              {statusLabel}
            </span>
          </div>
          {subtitle && (
            <p className="text-[13px] text-slate-400 mt-0.5">{subtitle}</p>
          )}
          <div className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-2 flex-wrap">
            {ct.companies?.id && (
              <Link href={`/dashboard/companies/${ct.companies.id}`} className="font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                {ct.companies.name}
              </Link>
            )}
            <span>
              Next: <span className="font-semibold text-slate-700">{nextAction}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 mt-0.5">
          <Link
            href={`/dashboard/contacts/${ct.id}/outreach`}
            className="text-[11px] text-slate-400 hover:text-slate-700 font-medium"
          >
            Draft
          </Link>
          <button
            type="button"
            onClick={() => {
              setRemovedIds(prev => new Set([...prev, ct.id]))
              startTransition(async () => {
                await archiveContactSilent(ct.id)
                router.refresh()
              })
            }}
            className="text-[11px] text-slate-300 hover:text-red-500 cursor-pointer bg-transparent border-0 p-0 min-h-[32px] min-w-[44px]"
          >
            Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded overflow-hidden">
      <div className="px-6 py-[18px] border-b border-slate-200 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">All contacts</span>
        <div className="flex items-center gap-3">
          {isExecutive && filtered.length > 0 && (
            <button
              type="button"
              onClick={() => exportContactsCsv(filtered)}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 cursor-pointer bg-transparent border-0 p-0"
            >
              Export CSV
            </button>
          )}
          <span className="text-[12px] text-slate-400">
            {filtered.length !== contacts.length
              ? `${filtered.length} of ${contacts.length}`
              : `${contacts.length} ${contacts.length === 1 ? 'contact' : 'contacts'}`}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-slate-100">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, title, or company..."
          className="w-full text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Channel filter */}
      {activeChannelFilters.length > 1 && (
        <div className="px-6 py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setChannelFilter('')}
            className={[
              'text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 cursor-pointer border-0 transition-colors',
              !channelFilter ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
            ].join(' ')}
          >
            All
          </button>
          {activeChannelFilters.map(v => {
            const ch = CHANNEL[v]
            return (
              <button
                key={v}
                type="button"
                onClick={() => setChannelFilter(channelFilter === v ? '' : v)}
                className={[
                  'text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 cursor-pointer border-0 transition-colors',
                  channelFilter === v ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                ].join(' ')}
              >
                {ch?.label ?? v}
              </button>
            )
          })}
        </div>
      )}

      {/* Rows */}
      {filtered.length === 0 ? (
        <div className="px-6 py-8 text-center text-[13px] text-slate-400">
          No contacts match that filter.
        </div>
      ) : (
        <div className="divide-y divide-slate-50">

          {/* Executive: firm-grouped recruiters first */}
          {isExecutive && grouped && Object.entries(grouped).sort(([,a],[,b]) => b.length - a.length).map(([firm, cts]) => (
            <div key={firm}>
              <div className="px-6 py-2 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-purple-600">{firm}</span>
                <span className="text-[10px] text-purple-400">{cts.length} {cts.length === 1 ? 'contact' : 'contacts'}</span>
              </div>
              {cts.map(ct => <ContactRow key={ct.id} ct={ct} />)}
            </div>
          ))}

          {/* Non-recruiter contacts (or all contacts for non-executive) */}
          {flat.map(ct => <ContactRow key={ct.id} ct={ct} />)}

        </div>
      )}
    </div>
  )
}
