import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStaffMember, hasAdminHeaderAccess } from '@/lib/staff'
import { ADMIN_DARK_PAGE_BG, ADMIN_DARK_SECTION_CARD } from '../admin-dark-theme'

export const metadata = { title: 'QA - Admin' }

export default async function AdminQaLandingPage() {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) redirect('/login')

	const staff = await getStaffMember(user.email ?? '')
	if (!hasAdminHeaderAccess(staff)) notFound()

	return (
		<div className={ADMIN_DARK_PAGE_BG}>
			<header className="border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
				<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
					<span className="text-[13px] font-bold tracking-[0.14em] uppercase text-slate-400 sm:text-[14px]">
						<span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
					</span>
					<div className="flex items-center gap-4">
						<Link href="/dashboard/admin" className="text-[13px] font-semibold text-slate-400 transition-colors hover:text-slate-200">
							Admin
						</Link>
						<Link href="/dashboard/admin/onboarding/qa" className="text-[13px] font-semibold text-orange-300 transition-colors hover:text-orange-200">
							Onboarding QA
						</Link>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
				<section className={ADMIN_DARK_SECTION_CARD}>
					<h1 className="text-[26px] font-bold leading-tight text-white">Admin QA</h1>
					<p className="mt-2 text-[13px] leading-relaxed text-slate-300">
						QA operations are consolidated in the onboarding scorecard and automation reporting surfaces.
					</p>
					<div className="mt-5 flex flex-wrap gap-3">
						<Link
							href="/dashboard/admin/onboarding/qa"
							className="inline-flex min-h-[40px] items-center rounded border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/20"
						>
							Open Onboarding QA Scorecard
						</Link>
						<Link
							href="/dashboard/admin/metrics"
							className="inline-flex min-h-[40px] items-center rounded border border-white/20 bg-slate-950/50 px-4 py-2 text-[13px] font-semibold text-slate-200 transition-colors hover:border-white/35 hover:text-white"
						>
							Open Metrics
						</Link>
					</div>
				</section>
			</main>
		</div>
	)
}