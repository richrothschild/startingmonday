export const ADMIN_DARK_PAGE_BG =
  'min-h-screen bg-[radial-gradient(1200px_circle_at_10%_-10%,rgba(249,115,22,0.16),transparent_45%),radial-gradient(1000px_circle_at_90%_-20%,rgba(59,130,246,0.14),transparent_42%),linear-gradient(180deg,#020617_0%,#0b1120_55%,#111827_100%)] font-sans text-slate-100'

export const ADMIN_DARK_STAT_CARD =
  'rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md'

export const ADMIN_DARK_SECTION_CARD =
  'rounded-2xl border border-white/10 bg-white/5 p-5 mb-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md'

export const ADMIN_DARK_ACTION_CARD =
  'block rounded-xl border border-white/10 bg-slate-950/40 p-4 hover:border-white/30 transition-colors'

export const ADMIN_DARK_TABLE_PANEL =
  'rounded-2xl border border-white/10 bg-white/5 overflow-hidden mb-6 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md'

export const ADMIN_DARK_SUB_CARD =
  'border border-white/10 bg-slate-950/60 rounded'

export const ADMIN_DARK_FIELD_BASE =
  'border border-white/10 bg-slate-950/60 rounded text-slate-100 focus:outline-none focus:border-white/30'

export const ADMIN_DARK_FIELD_MD = `${ADMIN_DARK_FIELD_BASE} px-3 py-2`

export const ADMIN_DARK_FIELD_SM = `${ADMIN_DARK_FIELD_BASE} px-2 py-1.5`

export const ADMIN_DARK_BUTTON_BASE =
  'font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 rounded transition-colors disabled:opacity-40 cursor-pointer'

export const ADMIN_DARK_BUTTON_SM = `${ADMIN_DARK_BUTTON_BASE} text-[12px] px-3 py-1`

export const ADMIN_DARK_BUTTON_MD = `${ADMIN_DARK_BUTTON_BASE} text-[13px] px-5 py-2`

export const ADMIN_DARK_MUTED_ACTION =
  'text-[12px] text-slate-400 hover:text-slate-200 cursor-pointer bg-transparent border-0'

export function adminRoleBadgeClass(role: string): string {
  if (role === 'owner') return 'bg-amber-500/15 text-amber-100 border border-amber-300/25'
  if (role === 'admin') return 'bg-sky-500/15 text-sky-100 border border-sky-300/25'
  return 'bg-white/10 text-slate-300 border border-white/10'
}