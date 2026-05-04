import Link from 'next/link'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export const metadata = { title: 'Join Starting Monday' }

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data: profile } = await admin
    .from('user_profiles')
    .select('full_name')
    .eq('invite_code', code)
    .single()

  const referrerName = profile?.full_name?.split(' ')[0] ?? null

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">

      <header className="px-6 h-14 flex items-center">
        <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-600 hover:text-slate-400 transition-colors">
          Starting Monday
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full">

          {referrerName ? (
            <p className="text-[14px] text-slate-500 mb-4">
              {referrerName} is using Starting Monday for their executive search
              and thought you should know about it.
            </p>
          ) : (
            <p className="text-[14px] text-slate-500 mb-4">
              Someone on Starting Monday thought you should know about this.
            </p>
          )}

          <h1 className="text-[38px] sm:text-[48px] font-bold text-white leading-[1.1] tracking-tight mb-5">
            Your next role<br />isn&rsquo;t on a<br />job board.
          </h1>

          <p className="text-[15px] text-slate-400 leading-relaxed mb-8 max-w-sm">
            Starting Monday watches your target companies, surfaces openings before
            they go public, and has your prep brief ready before the first call.
          </p>

          <Link
            href={`/signup?ref=${code}`}
            className="inline-block bg-white text-slate-900 text-[14px] font-bold px-7 py-3.5 rounded hover:bg-slate-100 transition-colors"
          >
            Create your free account &rarr;
          </Link>
          <p className="text-[12px] text-slate-600 mt-3">Free for 30 days. No credit card.</p>

          <div className="mt-10 pt-8 border-t border-slate-800">
            <p className="text-[13px] text-slate-500 mb-4">Want to see it first?</p>
            <Link
              href="/demo"
              className="text-[13px] font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Explore a live demo &rarr;
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}
