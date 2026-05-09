import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Congratulations — Starting Monday' }

export default async function PlacedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: userRow }] = await Promise.all([
    supabase.from('user_profiles').select('full_name, placement_company').eq('user_id', user.id).single(),
    supabase.from('users').select('subscription_status, subscription_tier').eq('id', user.id).single(),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const company = profile?.placement_company
  const isTrialing = userRow?.subscription_status === 'trialing'
  const isActive = userRow?.subscription_status === 'active'
  const tier = userRow?.subscription_tier ?? 'free'

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
      <header className="px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase">
          <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
        </Link>
        <Link href="/dashboard" className="text-[12px] text-slate-400 hover:text-slate-200 transition-colors">
          Back to dashboard
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full">

          <p className="text-[13px] text-slate-500 mb-4">You did it.</p>
          <h1 className="text-[36px] font-bold text-white leading-tight mb-4">
            Congratulations, {firstName}.
          </h1>

          {company ? (
            <p className="text-[16px] text-slate-300 leading-relaxed mb-6">
              The offer from <span className="text-white font-semibold">{company}</span> is a real accomplishment.
              Running a senior-level search well takes discipline. You ran yours.
            </p>
          ) : (
            <p className="text-[16px] text-slate-300 leading-relaxed mb-6">
              Accepting an offer at this level takes discipline and persistence.
              You earned this.
            </p>
          )}

          <p className="text-[14px] text-slate-400 leading-relaxed mb-10">
            Your account, companies, contacts, and research history are all still here.
            Most executives search again within 3 years. When you are ready, everything you built will be waiting.
          </p>

          {/* What to do next */}
          <div className="flex flex-col gap-3 mb-10">
            {(isTrialing || isActive) && tier !== 'free' ? (
              <Link
                href="/settings/billing"
                className="block text-center bg-orange-500 text-white text-[14px] font-bold px-7 py-3.5 rounded hover:bg-orange-600 transition-colors"
              >
                Keep my subscription active
              </Link>
            ) : isTrialing ? (
              <Link
                href="/settings/billing"
                className="block text-center bg-orange-500 text-white text-[14px] font-bold px-7 py-3.5 rounded hover:bg-orange-600 transition-colors"
              >
                Stay sharp -- upgrade to Intelligence ($49/mo)
              </Link>
            ) : null}
            <Link
              href="/dashboard"
              className="block text-center border border-slate-600 text-slate-300 text-[14px] font-semibold px-7 py-3.5 rounded hover:border-slate-400 transition-colors"
            >
              Go to my dashboard
            </Link>
          </div>

          <p className="text-[12px] text-slate-600 leading-relaxed">
            Questions? Reply to the congratulations email or reach Rich directly at
            {' '}<a href="mailto:rothschild@gmail.com" className="text-slate-400 hover:text-slate-200">rothschild@gmail.com</a>.
          </p>

        </div>
      </main>
    </div>
  )
}
