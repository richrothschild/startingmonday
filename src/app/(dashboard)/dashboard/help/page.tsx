import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '../logout-button'
import { FaqAccordion } from '@/components/FaqAccordion'

export default async function HelpPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .single()

  const STEPS = [
    { href: '/dashboard/profile',       label: 'Upload your resume and set target titles', sub: 'Drives all AI context' },
    { href: '/dashboard/companies/new', label: 'Add your first target company',            sub: 'Include the career page URL' },
    { href: '/dashboard/strategy',      label: 'Run your Strategy Brief',                  sub: 'Your narrative and outreach playbook' },
    { href: '/dashboard/profile',       label: 'Set your briefing time',                   sub: 'Daily email when things change' },
    { href: '/dashboard/contacts',      label: 'Map your key contacts',                    sub: 'Who do you know at target companies?' },
  ]

  return (
    <div className="min-h-screen bg-slate-100 font-sans">

      <header className="bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-600 hover:text-slate-400 transition-colors">
            Starting Monday
          </Link>
          <div className="hidden sm:flex items-center gap-5">
            <Link href="/dashboard/chat" className="text-[12px] font-semibold text-slate-500 hover:text-slate-300 transition-colors">Chat</Link>
            <Link href="/dashboard/contacts" className="text-[12px] font-semibold text-slate-500 hover:text-slate-300 transition-colors">Contacts</Link>
            <Link href="/dashboard/profile" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">{profile?.full_name ?? user.email}</Link>
            <Link href="/settings/billing" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">Billing</Link>
            <LogoutButton label="Sign out" />
          </div>
          <div className="flex sm:hidden items-center gap-4">
            <Link href="/dashboard" className="text-[12px] font-semibold text-slate-500 hover:text-slate-300">Dashboard</Link>
            <LogoutButton label="Out" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-slate-900 leading-tight">Help &amp; Getting Started</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">Everything you need to run a disciplined search.</p>
        </div>

        {/* Video walkthrough */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
          <div className="px-6 py-[18px] border-b border-slate-200">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Walkthrough</span>
          </div>
          {/* Replace the div below with your Loom embed once recorded */}
          <div className="bg-slate-50 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
            <div className="text-center px-6">
              <p className="text-[15px] font-semibold text-slate-500">Video walkthrough coming soon</p>
              <p className="text-[13px] text-slate-400 mt-1">A 3-minute tour of the full workflow</p>
            </div>
          </div>
        </div>

        {/* Quick start */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
          <div className="px-6 py-[18px] border-b border-slate-200">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Quick Start — 5 steps</span>
          </div>
          <div className="divide-y divide-slate-50">
            {STEPS.map((s, i) => (
              <Link
                key={s.href + i}
                href={s.href}
                className="group px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors block"
              >
                <span className="text-[13px] font-bold text-slate-300 w-5 shrink-0 mt-0.5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-slate-900 group-hover:text-slate-700">{s.label}</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">{s.sub}</p>
                </div>
                <span className="text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden mb-6">
          <div className="px-6 py-[18px] border-b border-slate-200">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Frequently Asked Questions</span>
          </div>
          <FaqAccordion />
        </div>

        {/* Contact */}
        <div className="bg-white border border-slate-200 rounded px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-semibold text-slate-900">Still have a question?</p>
            <p className="text-[13px] text-slate-500 mt-0.5">Email and you'll hear back within one business day.</p>
          </div>
          <a
            href="mailto:rothschild@startingmonday.app"
            className="shrink-0 text-[13px] font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded transition-colors"
          >
            Email us
          </a>
        </div>

      </main>
    </div>
  )
}
