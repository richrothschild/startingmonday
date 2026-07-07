import Link from 'next/link'

type DashboardStatusBannersProps = {
  isTrialing: boolean
  trialDaysLeft: number
  totalCount: number
  offerCount: number
  offerName: string | null
  offerCompanyName: string | null
  onMarkPlaced: (formData: FormData) => void | Promise<void>
  activationComplete: boolean
  activationCompletedCount: number
  isExecutiveMode: boolean
}

export function DashboardStatusBanners({
  isTrialing,
  trialDaysLeft,
  totalCount,
  offerCount,
  offerName,
  offerCompanyName,
  onMarkPlaced,
  activationComplete,
  activationCompletedCount,
  isExecutiveMode,
}: DashboardStatusBannersProps) {
  return (
    <>
      {isTrialing && (
        <div
          className={`mb-4 px-5 py-3 rounded flex items-center justify-between gap-4 text-[13px] ${
            trialDaysLeft <= 3
              ? 'bg-red-500/10 border border-red-300/40 text-red-200'
              : trialDaysLeft <= 7
                ? 'bg-amber-500/10 border border-amber-300/40 text-amber-200'
                : 'bg-white/5 border border-white/10 text-slate-300'
          }`}
        >
          <span>
            {trialDaysLeft <= 0
              ? 'Your trial has ended. The signal history on your companies is paused.'
              : totalCount > 0
                ? `You have built a pipeline of ${totalCount} ${totalCount === 1 ? 'company' : 'companies'}. That signal history disappears in ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'}.`
                : `Trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'}.`}
          </span>
          <Link href="/settings/billing" className="font-semibold underline shrink-0">
            Billing
          </Link>
        </div>
      )}

      {offerCount > 0 && !isExecutiveMode && (
        <div className="mb-4 px-5 py-3.5 rounded bg-emerald-500/10 border border-emerald-300/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 shrink-0" />
            <span className="text-[13px] font-semibold text-emerald-100">
              {offerCount === 1 ? `${offerName ?? 'Offer'} - offer in hand` : `${offerCount} offers in flight`}
            </span>
          </div>
          <Link href="/dashboard/offers" className="text-[12px] font-semibold text-emerald-200 hover:text-emerald-100 shrink-0">
            Offers
          </Link>
        </div>
      )}

      {offerCompanyName && !isExecutiveMode && (
        <div className="mb-4 bg-green-900 rounded px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-bold text-white">Did you accept the offer?</p>
            <p className="text-[12px] text-green-300 mt-0.5">Mark your search complete and we will take care of the rest.</p>
          </div>
          <form action={onMarkPlaced} className="flex items-center gap-2 shrink-0">
            <input type="hidden" name="company" value={offerCompanyName} />
            <button
              type="submit"
              className="bg-white text-slate-900 text-[13px] font-bold px-5 py-2 rounded cursor-pointer border-0 hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Yes, I accepted
            </button>
            <Link href="/dashboard" className="text-[12px] text-green-400 hover:text-green-200 transition-colors whitespace-nowrap">
              Later
            </Link>
          </form>
        </div>
      )}

      {!activationComplete && (
        <div className="mb-4 bg-white/5 border border-white/10 rounded px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-1 shrink-0">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-5 rounded-full ${i < activationCompletedCount ? 'bg-orange-400' : 'bg-white/20'}`}
                />
              ))}
            </div>
            <span className="text-[12px] text-slate-300 font-semibold shrink-0">{activationCompletedCount} of 6 steps complete</span>
          </div>
          <Link href="/dashboard/start" className="text-[12px] font-semibold text-orange-200 hover:underline shrink-0">
            Setup
          </Link>
        </div>
      )}
    </>
  )
}
