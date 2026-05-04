import Link from 'next/link'

export function UpgradeCTA({ feature }: { feature: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white px-6 py-8 text-center">
      <p className="text-[15px] font-semibold text-slate-900 mb-1">Active plan required</p>
      <p className="text-[13px] text-slate-500 mb-5">
        {feature} is included in the Active plan at $129/month.
      </p>
      <Link
        href="/settings/billing"
        className="inline-block bg-slate-900 text-white text-[13px] font-semibold px-6 py-2.5 rounded hover:bg-slate-700 transition-colors"
      >
        View plans
      </Link>
    </div>
  )
}
