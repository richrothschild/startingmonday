'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-[12px] text-slate-300 hover:text-white transition-colors"
    >
      Print / Export PDF
    </button>
  )
}
