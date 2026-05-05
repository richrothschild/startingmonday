import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '../logout-button'

export const metadata = {
  title: 'Get Started — Starting Monday',
}

export default async function StartPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, resume_text, positioning_summary, briefing_time, onboarding_completed_at')
    .eq('user_id', user.id)
    .single()

  if (!profile?.onboarding_completed_at) redirect('/onboarding')

  const [
    { count: companyCount },
    { count: contactCount },
    { count: prepBriefCount },
    { count: followUpCount },
  ] = await Promise.all([
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('archived_at', null),
    supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('briefs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', 'prep'),
    supabase
      .from('follow_ups')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  const hasResume    = (profile?.resume_text?.length ?? 0) >= 200 || (profile?.positioning_summary?.length ?? 0) >= 100
  const hasCompanies = (companyCount ?? 0) >= 1
  const hasPrepBrief = (prepBriefCount ?? 0) >= 1
  const hasContacts  = (contactCount ?? 0) >= 1
  const hasBriefing  = !!profile?.briefing_time
  const hasFollowUp  = (followUpCount ?? 0) >= 1

  const tasks = [
    {
      num: 1,
      done: hasResume,
      title: 'Upload your resume or import LinkedIn',
      body: 'Paste your LinkedIn profile text or upload your resume. This drives every brief, every briefing, and every AI response you get.',
      cta: 'Go to profile',
      href: '/dashboard/profile',
      doneNote: 'Profile complete',
    },
    {
      num: 2,
      done: hasCompanies,
      title: 'Add your first target company',
      body: 'Add the companies you want to work for. Include the career page URL — we\'ll scan it within minutes and alert you when something matching your profile appears.',
      cta: 'Add a company',
      href: '/dashboard/companies/new',
      doneNote: `${companyCount ?? 0} ${(companyCount ?? 0) === 1 ? 'company' : 'companies'} added`,
    },
    {
      num: 3,
      done: hasPrepBrief,
      title: 'Generate your first prep brief',
      body: 'Open a target company and generate the prep brief. It surfaces leadership signals, likely objections, and your best outreach angle — specific to that company and your background.',
      cta: 'Go to companies',
      href: '/dashboard/companies',
      doneNote: 'Prep brief generated',
    },
    {
      num: 4,
      done: hasContacts,
      title: 'Add your first contact',
      body: 'Who do you know at target companies? Who can make a warm introduction? Roles at this level are filled through relationships, not applications.',
      cta: 'Add a contact',
      href: '/dashboard/contacts',
      doneNote: `${contactCount ?? 0} ${(contactCount ?? 0) === 1 ? 'contact' : 'contacts'} added`,
    },
    {
      num: 5,
      done: hasBriefing,
      title: 'Set up your daily briefing',
      body: 'Choose a time and timezone for your morning briefing. Every day: signals from your target companies, actions due, and your momentum score — in your inbox before you start work.',
      cta: 'Configure briefing',
      href: '/dashboard/profile',
      doneNote: 'Briefing configured',
    },
    {
      num: 6,
      done: hasFollowUp,
      title: 'Log your first follow-up reminder',
      body: 'Set a follow-up on a company or contact. The difference between an active search and a passive one is whether the next action is scheduled.',
      cta: 'Go to contacts',
      href: '/dashboard/contacts',
      doneNote: 'Follow-up set',
    },
  ]

  const doneCount = tasks.filter(t => t.done).length
  const allDone = doneCount === tasks.length
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      {/* Nav */}
      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600">
            Starting Monday
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[12px] font-semibold text-slate-500 hover:text-slate-300 transition-colors">
              Skip to dashboard
            </Link>
            <LogoutButton label="Sign out" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Header */}
        <div className="mb-8">
          {allDone ? (
            <>
              <h1 className="text-[26px] font-bold text-slate-900 leading-tight mb-2">
                You&rsquo;re set up, {firstName}.
              </h1>
              <p className="text-[14px] text-slate-500 leading-relaxed">
                Everything is in place. Head to your dashboard to see what&rsquo;s moving.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[26px] font-bold text-slate-900 leading-tight mb-2">
                Your first 15 minutes.
              </h1>
              <p className="text-[14px] text-slate-500 leading-relaxed">
                Six moves that make everything else work. Start at the top — each one builds on the last.
              </p>
            </>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-1 shrink-0">
            {tasks.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-7 rounded-full ${i < doneCount ? 'bg-slate-900' : 'bg-slate-200'}`}
              />
            ))}
          </div>
          <span className="text-[12px] font-semibold text-slate-500 shrink-0">
            {doneCount} of {tasks.length} complete
          </span>
        </div>

        {/* Task list */}
        <div className="flex flex-col gap-3 mb-8">
          {tasks.map(task => (
            <div
              key={task.num}
              className={`bg-white border rounded overflow-hidden ${
                task.done ? 'border-slate-200 opacity-70' : 'border-slate-200'
              }`}
            >
              <div className="px-6 py-5">
                <div className="flex items-start gap-4">
                  {/* Number / check */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[12px] font-bold ${
                    task.done
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {task.done ? '✓' : task.num}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className={`text-[15px] font-semibold ${task.done ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'}`}>
                        {task.title}
                      </p>
                      {task.done && (
                        <span className="text-[11px] font-semibold text-emerald-600">
                          {task.doneNote}
                        </span>
                      )}
                    </div>
                    {!task.done && (
                      <>
                        <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
                          {task.body}
                        </p>
                        <Link
                          href={task.href}
                          className="inline-block bg-slate-900 text-white text-[12px] font-semibold px-4 py-2 rounded hover:bg-slate-700 transition-colors"
                        >
                          {task.cta} &rarr;
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-block bg-slate-900 text-white text-[13px] font-bold px-8 py-3 rounded hover:bg-slate-700 transition-colors"
          >
            {allDone ? 'Go to dashboard →' : 'Continue to dashboard →'}
          </Link>
          {!allDone && (
            <p className="text-[12px] text-slate-400 mt-2">You can finish these any time from your dashboard.</p>
          )}
        </div>

      </main>
    </div>
  )
}
