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
}: DashboardStatusBannersProps) {
  return (
    <>
      {isTrialing && (
        <div
          className={`mb-6 px-5 py-3 rounded flex items-center justify-between gap-4 text-[13px] ${
            trialDaysLeft <= 3
              ? 'bg-red-50 border border-red-200 text-red-800'
              : trialDaysLeft <= 7
                ? 'bg-amber-50 border border-amber-200 text-amber-800'
                : 'bg-slate-100 border border-slate-200 text-slate-600'
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
            Upgrade
          </Link>
        </div>
      )}

      {offerCount > 0 && (
        <div className="mb-6 px-5 py-3.5 rounded bg-green-50 border border-green-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-[13px] font-semibold text-green-900">
              {offerCount === 1 ? `${offerName ?? 'Offer'} - offer in hand` : `${offerCount} offers in flight`}
            </span>
          </div>
          <Link href="/dashboard/offers" className="text-[12px] font-semibold text-green-700 hover:text-green-900 shrink-0">
            Compare &amp; negotiate ?
          </Link>
        </div>
      )}

      {offerCompanyName && (
        <div className="mb-6 bg-green-900 rounded px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              Not yet
            </Link>
          </form>
        </div>
      )}

      {!activationComplete && (
        <div className="mb-6 bg-white border border-slate-200 rounded px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-1 shrink-0">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-5 rounded-full ${i < activationCompletedCount ? 'bg-slate-900' : 'bg-slate-200'}`}
                />
              ))}
            </div>
            <span className="text-[12px] text-slate-500 font-semibold shrink-0">{activationCompletedCount} of 6 steps complete</span>
          </div>
          <Link href="/dashboard/start" className="text-[12px] font-semibold text-slate-900 hover:underline shrink-0">
            Finish setup ?
          </Link>
        </div>
      )}
    </>
  )
}
