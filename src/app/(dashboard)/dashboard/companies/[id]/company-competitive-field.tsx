type Props = {
  competitiveContext: string | null
}

export function CompanyCompetitiveField({ competitiveContext }: Props) {
  return (
    <div className="pt-1 border-t border-slate-100">
      <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-orange-500 mb-2">Competitive Field</p>
      <textarea
        name="competitive_context"
        rows={3}
        defaultValue={competitiveContext ?? ''}
        placeholder="Known candidates, internal shortlist, search firm intel, who else they're considering..."
        className="w-full border border-slate-200 rounded px-3 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none"
      />
      <p className="mt-1.5 text-[11px] text-slate-400">Private. Used to sharpen your Win Thesis and pushback prep.</p>
    </div>
  )
}
