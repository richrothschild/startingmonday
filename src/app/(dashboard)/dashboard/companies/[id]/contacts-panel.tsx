import Link from 'next/link'
import { addContact, archiveContact } from './actions'
import { CHANNEL, OUTREACH_STATUS } from './company-detail-constants'

type ContactRow = {
  id: string
  name: string
  title: string | null
  firm: string | null
  channel: string | null
  notes: string | null
  outreach_status: string | null
}

type Props = {
  companyId: string
  contacts: ContactRow[]
  nextFollowUpByContact: Map<string, { due_date: string; action: string }>
  todayISO: string
}

export function ContactsPanel(props: Props) {
  const { companyId, contacts, nextFollowUpByContact, todayISO } = props

  return (
    <>
      {contacts.length > 0 && (
        <div className="divide-y divide-slate-50">
          {contacts.map((ct) => {
            const ch = ct.channel ? (CHANNEL[ct.channel] ?? { label: ct.channel, cls: 'bg-slate-100 text-slate-500' }) : null
            const os = OUTREACH_STATUS[ct.outreach_status ?? 'prospect'] ?? OUTREACH_STATUS.prospect
            const nextFollowUp = nextFollowUpByContact.get(ct.id)
            const nextAction = nextFollowUp
              ? `Follow up ${new Date(nextFollowUp.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : ct.outreach_status === 'prospect'
                ? 'Draft first outreach'
                : ct.outreach_status === 'meeting_scheduled'
                  ? 'Prep for meeting'
                  : ct.outreach_status === 'closed'
                    ? 'Keep warm monthly'
                    : 'Set next follow-up'
            return (
              <div key={ct.id} className="px-6 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/dashboard/contacts/${ct.id}`} className="text-[14px] font-semibold text-slate-900 hover:text-slate-600">
                      {ct.name}
                    </Link>
                    {ct.title && <span className="text-[13px] text-slate-400">{ct.title}{ct.firm ? ` - ${ct.firm}` : ''}</span>}
                    {ch && <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.04em] ${ch.cls}`}>{ch.label}</span>}
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${os.cls}`}>{os.label}</span>
                  </div>
                  {ct.notes && <p className="text-[12px] text-slate-400 mt-1 truncate max-w-xl">{ct.notes}</p>}
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Next relationship action: <span className="font-semibold text-slate-700">{nextAction}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link href={`/dashboard/contacts/${ct.id}/outreach`} className="text-[11px] text-slate-400 hover:text-slate-700 font-medium">
                    Draft
                  </Link>
                  <form action={archiveContact.bind(null, ct.id, companyId)}>
                    <button
                      type="submit"
                      className="text-[11px] text-slate-300 hover:text-red-500 cursor-pointer bg-transparent border-0 p-0"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="px-6 py-5 border-t border-slate-100 bg-slate-50">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">Add person</div>
        <form id="add-contact-form" action={addContact.bind(null, companyId)} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Jane Smith"
                className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">Title</label>
              <input
                name="title"
                type="text"
                placeholder="VP Engineering"
                className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 bg-white"
              />
            </div>
            <div>
              <label htmlFor="channel" className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">Channel</label>
              <select
                id="channel"
                name="channel"
                className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-slate-400 bg-white"
              >
                <option value="">-</option>
                <option value="linkedin">LinkedIn</option>
                <option value="referral">Referral</option>
                <option value="cold">Cold</option>
                <option value="inbound">Inbound</option>
                <option value="event">Event</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">Email</label>
              <input
                name="email"
                type="text"
                placeholder="jane@company.com"
                className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">LinkedIn URL</label>
              <input
                name="linkedin_url"
                type="text"
                placeholder="https://linkedin.com/in/jane"
                className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">Notes</label>
            <input
              name="notes"
              type="text"
              placeholder="Met at SaaStr, warm connection..."
              className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 bg-white"
            />
          </div>
          <div>
            <button type="submit" className="bg-slate-900 text-white text-[13px] font-semibold px-5 py-2 rounded cursor-pointer border-0">
              Add person
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
