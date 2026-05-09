import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateContact } from '../actions'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white'

const CHANNELS = [
  { value: 'linkedin',  label: 'LinkedIn' },
  { value: 'referral',  label: 'Referral' },
  { value: 'cold',      label: 'Cold' },
  { value: 'inbound',   label: 'Inbound' },
  { value: 'event',     label: 'Event' },
  { value: 'recruiter', label: 'Recruiter' },
]

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: rawContact }, { data: companies }] = await Promise.all([
    supabase
      .from('contacts')
      .select('id, name, title, firm, channel, email, linkedin_url, notes, company_id, contact_type, last_role_discussed')
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single(),
    supabase
      .from('companies')
      .select('id, name')
      .eq('user_id', user.id)
      .is('archived_at', null)
      .order('name', { ascending: true }),
  ])

  if (!rawContact) notFound()

  type ContactRow = typeof rawContact & { email?: string | null; linkedin_url?: string | null; contact_type?: string | null; last_role_discussed?: string | null }
  const contact = rawContact as unknown as ContactRow
  const companyList = companies ?? []

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link href={`/dashboard/contacts/${id}`} className="text-[13px] text-slate-300 hover:text-white transition-colors">
            Cancel
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-slate-900">Edit contact</h1>
          <p className="text-[13px] text-slate-500 mt-1">{contact.name}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <form action={updateContact.bind(null, id)} className="flex flex-col gap-4">

            <div>
              <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                required
                defaultValue={contact.name}
                placeholder="Jane Smith"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">Title</label>
                <input name="title" defaultValue={contact.title ?? ''} placeholder="VP of Engineering" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">Firm</label>
                <input name="firm" defaultValue={contact.firm ?? ''} placeholder="Korn Ferry" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">Email</label>
                <input
                  name="email"
                  type="text"
                  defaultValue={contact.email ?? ''}
                  placeholder="jane@company.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">LinkedIn URL</label>
                <input
                  name="linkedin_url"
                  type="text"
                  defaultValue={contact.linkedin_url ?? ''}
                  placeholder="https://linkedin.com/in/jane"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">Channel</label>
                <select name="channel" defaultValue={contact.channel ?? ''} className={inputCls}>
                  <option value="">—</option>
                  {CHANNELS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              {companyList.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">Company</label>
                  <select name="company_id" defaultValue={contact.company_id ?? ''} className={inputCls}>
                    <option value="">— No company —</option>
                    {companyList.map(co => (
                      <option key={co.id} value={co.id}>{co.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">Relationship type</label>
                <select name="contact_type" defaultValue={contact.contact_type ?? ''} className={inputCls}>
                  <option value="">—</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="hiring_manager">Hiring Manager</option>
                  <option value="peer">Peer</option>
                  <option value="coach">Coach</option>
                  <option value="board">Board</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">Last role discussed</label>
                <input
                  name="last_role_discussed"
                  defaultValue={contact.last_role_discussed ?? ''}
                  placeholder="CIO at Acme Corp"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400 mb-1.5">Notes</label>
              <textarea
                name="notes"
                defaultValue={contact.notes ?? ''}
                rows={3}
                placeholder="Met at SaaStr, warm connection..."
                className={inputCls + ' resize-none'}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Link
                href={`/dashboard/contacts/${id}`}
                className="text-[13px] text-slate-400 hover:text-slate-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-700 text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors cursor-pointer border-0"
              >
                Save changes
              </button>
            </div>

          </form>
        </div>

      </main>
    </div>
  )
}
