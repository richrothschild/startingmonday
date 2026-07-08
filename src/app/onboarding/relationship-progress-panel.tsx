'use client'

export type RelationshipStatusPayload = {
  companies: Array<{
    companyId: string
    name: string
    contacts: number
    enrichedContacts: number
    status: string
  }>
  progress: {
    total: number
    completed: number
    done: boolean
    totalContacts: number
    totalEnriched: number
  }
}

export function RelationshipProgressPanel({
  enrichmentStarted,
  progress,
  contactName,
  contactTitle,
  contactCompanyName,
  selectedCompanyId,
  addingContact,
  onContactName,
  onContactTitle,
  onContactCompanyName,
  onSelectedCompany,
  onAddContact,
}: {
  enrichmentStarted: boolean
  progress: RelationshipStatusPayload | null
  contactName: string
  contactTitle: string
  contactCompanyName: string
  selectedCompanyId: string
  addingContact: boolean
  onContactName: (value: string) => void
  onContactTitle: (value: string) => void
  onContactCompanyName: (value: string) => void
  onSelectedCompany: (value: string) => void
  onAddContact: () => void
}) {
  const rows = progress?.companies ?? []
  const done = progress?.progress?.done ?? false
  const canAdd = rows.length > 0
  const effectiveSelectedCompanyId = selectedCompanyId || rows[0]?.companyId || ''
  const canSubmit = Boolean(contactName.trim()) && (canAdd ? Boolean(effectiveSelectedCompanyId) : Boolean(contactCompanyName.trim()))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-serif font-bold text-white leading-tight mb-2">
          Start mapping relationships while enrichment runs.
        </h1>
        <p className="text-[15px] text-slate-300">
          We are identifying likely decision-path contacts for your target companies now. Add anyone you already know in parallel.
        </p>
      </div>

      <div className="border border-white/10 rounded-lg bg-white/5 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-200">Relationship enrichment</p>
          <span className="text-[12px] text-slate-400">{done ? 'Contact map ready' : enrichmentStarted ? 'Finding contacts...' : 'Waiting to start'}</span>
        </div>

        {rows.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {rows.map((row) => (
              <div key={row.companyId} className="flex items-center justify-between gap-3 border border-white/10 rounded px-3 py-2 bg-slate-950/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={[
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      row.status === 'complete' ? 'bg-emerald-400' : 'bg-orange-400 animate-pulse',
                    ].join(' ')}
                  />
                  <span className="text-[13px] text-slate-200 truncate">{row.name}</span>
                </div>
                <span className="text-[12px] text-slate-400 shrink-0">
                  {row.contacts} total, {row.enrichedContacts} enriched
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-slate-400">
            Add companies first so we can build your contact map.
          </p>
        )}

        <p className="text-[12px] text-slate-400">
          {progress?.progress?.totalContacts ?? 0} contacts tracked, {progress?.progress?.totalEnriched ?? 0} discovered by enrichment.
        </p>
      </div>

      <div className="border border-white/10 rounded-lg bg-slate-950/40 p-5 flex flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">Add a contact now</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input
            type="text"
            value={contactName}
            onChange={(event) => onContactName(event.target.value)}
            placeholder="Contact name"
            className="w-full border border-white/15 rounded px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-white/40 bg-slate-950/60"
          />
          <input
            type="text"
            value={contactTitle}
            onChange={(event) => onContactTitle(event.target.value)}
            placeholder="Title (optional)"
            className="w-full border border-white/15 rounded px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-white/40 bg-slate-950/60"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
          {canAdd ? (
            <select
              value={effectiveSelectedCompanyId}
              onChange={(event) => onSelectedCompany(event.target.value)}
              aria-label="Company for contact"
              className="flex-1 border border-white/15 rounded px-3 py-2 text-[13px] text-slate-100 focus:outline-none focus:border-white/40 bg-slate-950/60"
            >
              <option value="">Choose a company</option>
              {rows.map((row) => (
                <option key={row.companyId} value={row.companyId}>{row.name}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={contactCompanyName}
              onChange={(event) => onContactCompanyName(event.target.value)}
              placeholder="Company name"
              aria-label="Company for contact"
              className="flex-1 border border-white/15 rounded px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-white/40 bg-slate-950/60"
            />
          )}
          <button
            type="button"
            onClick={onAddContact}
            disabled={addingContact || !canSubmit}
            className="bg-white/10 hover:bg-white/15 text-slate-100 text-[13px] font-semibold px-4 py-2 rounded transition-colors cursor-pointer border border-white/15 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {addingContact ? 'Adding...' : 'Add contact'}
          </button>
        </div>
        {!canAdd && (
          <p className="text-[12px] text-slate-400">
            Company list is still loading. Type the company name and we will create it with your contact.
          </p>
        )}
      </div>
    </div>
  )
}
