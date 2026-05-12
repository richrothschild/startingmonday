import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { addContact } from './actions'
import { ContactsList, type ContactListItem } from '@/components/ContactsList'
import { getUserSubscription, canAccessFeature } from '@/lib/subscription'

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const { saved, error: saveError } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: rawContacts }, { data: companies }, sub] = await Promise.all([
    supabase
      .from('contacts')
      .select('id, name, title, firm, channel, notes, outreach_status, is_priority, companies(id, name)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('is_priority', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('companies')
      .select('id, name')
      .eq('user_id', user.id)
      .is('archived_at', null)
      .order('name', { ascending: true }),
    getUserSubscription(user.id),
  ])

  const contacts = (rawContacts ?? []) as unknown as ContactListItem[]
  const companyList = companies ?? []
  const isExecutive = canAccessFeature(sub, 'recruiter_enhancements')

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </span>
          <Link
            href="/dashboard"
            className="text-[13px] text-slate-300 hover:text-white transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Contacts</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">
            Recruiters, hiring managers, and warm connections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

          <ContactsList contacts={contacts} isExecutive={isExecutive} />

          {/* Add contact form */}
          <div className="bg-white border border-slate-200 rounded p-5">
            <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-4">
              Add contact
            </div>

            {saved && (
              <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 rounded text-[12px] text-green-700">
                Contact saved.
              </div>
            )}
            {saveError && (
              <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded text-[12px] text-red-700">
                Could not save contact. Please try again.
              </div>
            )}

            <form action={addContact} className="flex flex-col gap-3">

              <div>
                <label htmlFor="contact-name" className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Jane Smith"
                  className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label htmlFor="contact-title" className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                  Title
                </label>
                <input
                  id="contact-title"
                  name="title"
                  type="text"
                  placeholder="VP of Engineering"
                  className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label htmlFor="contact-firm" className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                  Firm
                </label>
                <input
                  id="contact-firm"
                  name="firm"
                  type="text"
                  placeholder="Korn Ferry"
                  className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label htmlFor="contact-channel" className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                  Channel
                </label>
                <select
                  id="contact-channel"
                  name="channel"
                  className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-slate-400 bg-white"
                >
                  <option value="">-</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Referral</option>
                  <option value="cold">Cold</option>
                  <option value="inbound">Inbound</option>
                  <option value="event">Event</option>
                </select>
              </div>

              {companyList.length > 0 && (
                <div>
                  <label htmlFor="contact-company" className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                    Company <span className="text-slate-300 font-normal">(optional)</span>
                  </label>
                  <select
                    id="contact-company"
                    name="company_id"
                    className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 focus:outline-none focus:border-slate-400 bg-white"
                  >
                    <option value="">- No company -</option>
                    {companyList.map(co => (
                      <option key={co.id} value={co.id}>{co.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="contact-email" className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="text"
                  placeholder="jane@company.com"
                  className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label htmlFor="contact-linkedin" className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                  LinkedIn URL
                </label>
                <input
                  id="contact-linkedin"
                  name="linkedin_url"
                  type="text"
                  placeholder="https://linkedin.com/in/jane"
                  className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label htmlFor="contact-notes" className="block text-[11px] font-bold tracking-[0.07em] uppercase text-slate-400 mb-1.5">
                  Notes
                </label>
                <input
                  id="contact-notes"
                  name="notes"
                  type="text"
                  placeholder="Met at SaaStr, warm connection…"
                  className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white text-[13px] font-semibold py-2 rounded cursor-pointer border-0 mt-1"
              >
                Add contact
              </button>

            </form>
          </div>

        </div>
      </main>
    </div>
  )
}
