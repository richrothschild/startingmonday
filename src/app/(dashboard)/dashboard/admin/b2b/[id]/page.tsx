import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffMember } from '@/lib/staff'
import { STAGES, TYPE_LABELS } from '../page'
import { addContact, logActivity, updateProspect, deleteMaterial } from './actions'
import { archiveProspect } from '../actions'
import MaterialClient from './material-client'

export const metadata = { title: 'Prospect — B2B Sales' }

const ACTIVITY_TYPES = [
  { value: 'call',      label: 'Call' },
  { value: 'email',     label: 'Email' },
  { value: 'demo',      label: 'Demo' },
  { value: 'linkedin',  label: 'LinkedIn' },
  { value: 'intro',     label: 'Intro' },
  { value: 'proposal',  label: 'Proposal' },
  { value: 'other',     label: 'Other' },
]

export default async function ProspectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const staff = await getStaffMember(user.email ?? '')
  if (!staff) notFound()

  const admin = createAdminClient()

  const { data: prospect } = await admin
    .from('b2b_prospects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!prospect) notFound()

  const [{ data: contacts }, { data: activities }, { data: materials }] = await Promise.all([
    admin.from('b2b_contacts').select('*').eq('prospect_id', params.id).order('created_at', { ascending: true }),
    admin.from('b2b_activities').select('*').eq('prospect_id', params.id).order('occurred_at', { ascending: false }),
    admin.from('b2b_materials').select('*').eq('prospect_id', params.id).order('created_at', { ascending: false }),
  ])

  const stage = STAGES.find(s => s.key === prospect.stage)
  const typLabel = TYPE_LABELS[prospect.type] ?? prospect.type

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/b2b" className="text-[13px] text-slate-300 hover:text-white">
              Pipeline
            </Link>
            <Link href="/dashboard/admin" className="text-[12px] font-semibold text-slate-400 hover:text-slate-200">Admin</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">

        {/* Prospect header */}
        <div className="bg-white border border-slate-200 rounded p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400">{typLabel}</span>
                <span className={`text-[10px] font-bold tracking-[0.06em] uppercase rounded-full px-2.5 py-0.5 ${stage?.cls ?? 'bg-slate-100 text-slate-500'}`}>
                  {stage?.label ?? prospect.stage}
                </span>
              </div>
              <h1 className="text-[26px] font-bold text-slate-900">{prospect.name}</h1>
              {prospect.website && (
                <a href={prospect.website} target="_blank" rel="noreferrer" className="text-[13px] text-slate-400 hover:text-slate-700 mt-0.5 inline-block">
                  {prospect.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
            <div className="text-right shrink-0">
              {prospect.estimated_arr && (
                <div className="text-[20px] font-bold text-slate-900">
                  ${prospect.estimated_arr >= 1000 ? `${Math.round(prospect.estimated_arr / 1000)}K` : prospect.estimated_arr}
                  <span className="text-[12px] font-normal text-slate-400 ml-1">ARR</span>
                </div>
              )}
              {prospect.estimated_seats && (
                <div className="text-[13px] text-slate-500">{prospect.estimated_seats} seats</div>
              )}
            </div>
          </div>

          {prospect.notes && (
            <p className="text-[14px] text-slate-600 mb-5 border-t border-slate-100 pt-4">{prospect.notes}</p>
          )}

          {/* Edit form */}
          <details className="mt-2">
            <summary className="text-[12px] font-semibold text-slate-400 cursor-pointer hover:text-slate-700 select-none">
              Edit prospect
            </summary>
            <form action={updateProspect} className="mt-4 flex flex-col gap-4">
              <input type="hidden" name="id" value={prospect.id} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Name</label>
                  <input name="name" defaultValue={prospect.name} className="w-full border border-slate-200 rounded px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Website</label>
                  <input name="website" type="url" defaultValue={prospect.website ?? ''} className="w-full border border-slate-200 rounded px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Notes</label>
                <textarea name="notes" rows={2} defaultValue={prospect.notes ?? ''} className="w-full border border-slate-200 rounded px-3 py-2 text-[14px] text-slate-900 focus:outline-none focus:border-slate-400 resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" className="bg-slate-900 text-white text-[12px] font-semibold px-4 py-2 rounded cursor-pointer border-0 hover:bg-slate-700 transition-colors">
                  Save changes
                </button>
                <form action={archiveProspect}>
                  <input type="hidden" name="id" value={prospect.id} />
                  <button type="submit" className="text-[12px] text-red-400 hover:text-red-700 cursor-pointer bg-transparent border-0">
                    Archive prospect
                  </button>
                </form>
              </div>
            </form>
          </details>
        </div>

        {/* Contacts */}
        <section>
          <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">Contacts</h2>
          <div className="bg-white border border-slate-200 rounded">
            {(contacts ?? []).length > 0 && (
              <div className="divide-y divide-slate-50">
                {(contacts ?? []).map(c => (
                  <div key={c.id} className="px-5 py-3.5 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[14px] font-semibold text-slate-900">{c.name}</div>
                      {c.title && <div className="text-[12px] text-slate-500">{c.title}</div>}
                      <div className="flex items-center gap-3 mt-0.5">
                        {c.email && <a href={`mailto:${c.email}`} className="text-[12px] text-slate-400 hover:text-slate-700">{c.email}</a>}
                        {c.linkedin_url && <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="text-[12px] text-slate-400 hover:text-slate-700">LinkedIn</a>}
                      </div>
                      {c.notes && <p className="text-[12px] text-slate-400 mt-1">{c.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="px-5 py-4 border-t border-slate-50">
              <details>
                <summary className="text-[12px] font-semibold text-slate-400 cursor-pointer hover:text-slate-700 select-none">
                  + Add contact
                </summary>
                <form action={addContact} className="mt-4 flex flex-col gap-3">
                  <input type="hidden" name="prospect_id" value={prospect.id} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Name *</label>
                      <input name="name" required placeholder="Jane Smith" className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Title</label>
                      <input name="title" placeholder="VP of HR" className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Email</label>
                      <input name="email" type="email" placeholder="jane@example.com" className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">LinkedIn URL</label>
                      <input name="linkedin_url" type="url" placeholder="https://linkedin.com/in/..." className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Notes</label>
                    <input name="notes" placeholder="Decision-maker, warm intro via..." className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-slate-400" />
                  </div>
                  <button type="submit" className="self-start bg-slate-900 text-white text-[12px] font-semibold px-4 py-2 rounded cursor-pointer border-0 hover:bg-slate-700 transition-colors">
                    Add contact
                  </button>
                </form>
              </details>
            </div>
          </div>
        </section>

        {/* Activity log */}
        <section>
          <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">Activity log</h2>
          <div className="bg-white border border-slate-200 rounded">
            {(activities ?? []).length === 0 ? (
              <div className="px-5 py-6 text-[13px] text-slate-400">No activity logged yet.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {(activities ?? []).map(a => (
                  <div key={a.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-[0.06em] uppercase text-slate-400 bg-slate-50 rounded px-2 py-0.5">
                          {ACTIVITY_TYPES.find(t => t.value === a.activity_type)?.label ?? a.activity_type}
                        </span>
                        <span className="text-[12px] text-slate-400">{a.occurred_at}</span>
                      </div>
                      {a.logged_by && <span className="text-[11px] text-slate-300">{a.logged_by}</span>}
                    </div>
                    <p className="text-[14px] text-slate-800 mt-1.5">{a.summary}</p>
                    {a.next_action && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.06em]">Next:</span>
                        <span className="text-[13px] text-slate-700">{a.next_action}</span>
                        {a.next_action_due && <span className="text-[12px] text-slate-400">by {a.next_action_due}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="px-5 py-4 border-t border-slate-100">
              <details>
                <summary className="text-[12px] font-semibold text-slate-400 cursor-pointer hover:text-slate-700 select-none">
                  + Log activity
                </summary>
                <form action={logActivity} className="mt-4 flex flex-col gap-3">
                  <input type="hidden" name="prospect_id" value={prospect.id} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Type</label>
                      <select name="activity_type" defaultValue="call" className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] bg-white focus:outline-none focus:border-slate-400">
                        {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Date</label>
                      <input name="occurred_at" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Next action due</label>
                      <input name="next_action_due" type="date" className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Summary *</label>
                    <textarea name="summary" required rows={2} placeholder="What happened, what was discussed..." className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-slate-400 resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1">Next action</label>
                    <input name="next_action" placeholder="Send proposal, schedule follow-up demo..." className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-slate-400" />
                  </div>
                  <button type="submit" className="self-start bg-slate-900 text-white text-[12px] font-semibold px-4 py-2 rounded cursor-pointer border-0 hover:bg-slate-700 transition-colors">
                    Log activity
                  </button>
                </form>
              </details>
            </div>
          </div>
        </section>

        {/* Leave-behind materials */}
        <section>
          <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">Leave-behind materials</h2>
          <MaterialClient
            prospectId={prospect.id}
            prospectName={prospect.name}
            prospectType={prospect.type}
            estimatedSeats={prospect.estimated_seats}
            estimatedArr={prospect.estimated_arr}
            notes={prospect.notes}
            contacts={(contacts ?? []).slice(0, 1).map(c => ({ name: c.name, title: c.title }))}
          />

          {(materials ?? []).length > 0 && (
            <div className="mt-4 flex flex-col gap-3">
              {(materials ?? []).map(m => (
                <div key={m.id} className="bg-white border border-slate-200 rounded">
                  <div className="px-5 py-3 flex items-center justify-between border-b border-slate-100">
                    <div>
                      <span className="text-[14px] font-semibold text-slate-900">{m.title}</span>
                      <span className="text-[11px] text-slate-400 ml-3">{new Date(m.created_at).toLocaleDateString()}</span>
                    </div>
                    <form action={deleteMaterial}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="prospect_id" value={prospect.id} />
                      <button type="submit" className="text-[11px] text-slate-300 hover:text-red-400 cursor-pointer bg-transparent border-0">
                        Delete
                      </button>
                    </form>
                  </div>
                  <div className="px-5 py-4 text-[13px] text-slate-700 whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto">
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  )
}
