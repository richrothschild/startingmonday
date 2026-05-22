import { DraftPanel } from '@/components/DraftPanel'
import { SIGNAL_LABELS, type SignalDetailRow } from './company-detail-constants'

type Props = {
  signals: SignalDetailRow[]
}

export function SignalsPanel(props: Props) {
  if (!props.signals.length) {
    return (
      <div className="px-6 py-10 text-center">
        <p className="text-[14px] text-slate-400 mb-2">No signals logged yet.</p>
        <p className="text-[12px] text-slate-300">Paste a news headline or LinkedIn post above to log one.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-50">
      {props.signals.map((sig) => {
        const sl = SIGNAL_LABELS[sig.signal_type] ?? { label: sig.signal_type, cls: 'bg-slate-100 text-slate-500' }
        const dateLabel = new Date(sig.signal_date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        return (
          <div key={sig.id} className="px-6 py-5">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-[13px] text-slate-400">{dateLabel}</span>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-[0.04em] ${sl.cls}`}>
                {sl.label}
              </span>
            </div>
            <p className="text-[14px] text-slate-900 leading-relaxed mb-1.5">{sig.signal_summary}</p>
            {sig.outreach_angle && <p className="text-[13px] text-slate-500 leading-relaxed italic">{sig.outreach_angle}</p>}
            {sig.outreach_draft && <DraftPanel draft={sig.outreach_draft} />}
            {sig.source_url && (
              <a
                href={sig.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-[12px] text-slate-400 hover:text-slate-700 transition-colors"
              >
                Source {'->'}
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}
