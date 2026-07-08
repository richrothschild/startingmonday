'use client'

type ContextOption = {
  key: string
  label: string
  hint: string
}

const LOCATION_OPTIONS: ContextOption[] = [
  { key: 'new_york', label: 'New York', hint: 'In-person heavy opportunities' },
  { key: 'bay_area', label: 'Bay Area', hint: 'Platform and product-heavy roles' },
  { key: 'remote_us', label: 'Remote (US)', hint: 'Distributed leadership teams' },
  { key: 'london', label: 'London', hint: 'Global and EMEA scope' },
]

const SECTOR_OPTIONS: ContextOption[] = [
  { key: 'saas', label: 'B2B SaaS', hint: 'Revenue and GTM depth' },
  { key: 'ai_data', label: 'AI / Data', hint: 'Applied AI transformation' },
  { key: 'fintech', label: 'Fintech', hint: 'Regulated growth environments' },
  { key: 'healthcare', label: 'Healthcare', hint: 'Complex stakeholder ecosystems' },
]

const COMP_OPTIONS: ContextOption[] = [
  { key: 'base_bonus', label: 'Base + Bonus', hint: 'Predictable cash-heavy package' },
  { key: 'equity_weighted', label: 'Equity-weighted', hint: 'Upside with medium cash floor' },
  { key: 'balanced', label: 'Balanced', hint: 'Cash and upside in equal measure' },
]

const POSITIONING_OPTIONS: ContextOption[] = [
  { key: 'operator', label: 'Execution Operator', hint: 'Scale teams and delivery cadence' },
  { key: 'transformer', label: 'Transformation Lead', hint: 'Drive change across functions' },
  { key: 'builder', label: 'Builder', hint: 'Create new systems and foundations' },
  { key: 'stabilizer', label: 'Stabilizer', hint: 'Calm complexity and de-risk operations' },
]

function OptionGroup({
  title,
  options,
  selected,
  onToggle,
  multi,
}: {
  title: string
  options: ContextOption[]
  selected: string[]
  onToggle: (key: string) => void
  multi: boolean
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-slate-400">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const active = selected.includes(opt.key)
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onToggle(opt.key)}
              className={[
                'text-left rounded border px-4 py-3 transition-colors cursor-pointer',
                active
                  ? 'border-orange-400/70 bg-orange-500/20 text-white'
                  : 'border-white/15 bg-white/5 text-slate-200 hover:border-white/35',
              ].join(' ')}
            >
              <p className="text-[13px] font-semibold">{active ? '✓ ' : ''}{opt.label}</p>
              <p className={['text-[12px] mt-1', active ? 'text-slate-200' : 'text-slate-400'].join(' ')}>{opt.hint}</p>
              {!multi && active && <p className="text-[10px] mt-1 text-orange-200 uppercase tracking-[0.12em]">Selected</p>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function OnboardingContextStep({
  targetLocations,
  sectors,
  compensation,
  positioning,
  onTargetLocations,
  onSectors,
  onCompensation,
  onPositioning,
}: {
  targetLocations: string[]
  sectors: string[]
  compensation: string[]
  positioning: string[]
  onTargetLocations: (v: string[]) => void
  onSectors: (v: string[]) => void
  onCompensation: (v: string[]) => void
  onPositioning: (v: string[]) => void
}) {
  const toggleMulti = (items: string[], key: string, setter: (v: string[]) => void) => {
    if (items.includes(key)) {
      setter(items.filter((item) => item !== key))
      return
    }
    setter([...items, key])
  }

  const toggleSingle = (items: string[], key: string, setter: (v: string[]) => void) => {
    setter(items[0] === key ? [] : [key])
  }

  const completedCount = [
    targetLocations.length > 0,
    sectors.length > 0,
    compensation.length > 0,
    positioning.length > 0,
  ].filter(Boolean).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-serif font-bold text-white leading-tight mb-2">
          Add optional search context.
        </h1>
        <p className="text-[15px] text-slate-300">
          This sharpens recommendations and prioritization. You can skip and refine later from the dashboard.
        </p>
      </div>

      <OptionGroup
        title="Target locations"
        options={LOCATION_OPTIONS}
        selected={targetLocations}
        onToggle={(key) => toggleMulti(targetLocations, key, onTargetLocations)}
        multi
      />

      <OptionGroup
        title="Preferred sectors"
        options={SECTOR_OPTIONS}
        selected={sectors}
        onToggle={(key) => toggleMulti(sectors, key, onSectors)}
        multi
      />

      <OptionGroup
        title="Compensation preference"
        options={COMP_OPTIONS}
        selected={compensation}
        onToggle={(key) => toggleSingle(compensation, key, onCompensation)}
        multi={false}
      />

      <OptionGroup
        title="Positioning style"
        options={POSITIONING_OPTIONS}
        selected={positioning}
        onToggle={(key) => toggleSingle(positioning, key, onPositioning)}
        multi={false}
      />

      <p className="text-[12px] text-slate-400">
        {completedCount}/4 context blocks selected. More context improves ranking precision but is optional.
      </p>
    </div>
  )
}
