'use client'
import { useState, useTransition, useActionState } from 'react'
import type { StaffMember, StaffRole } from '@/lib/staff'
import { addTeamMember, changeTeamRole, removeTeamMember } from './actions'

type Props = {
  members: StaffMember[]
  currentRole: StaffRole
}

function roleBadge(role: string) {
  return role === 'owner' ? 'bg-amber-500/15 text-amber-100 border border-amber-300/25'
    : role === 'admin'    ? 'bg-sky-500/15 text-sky-100 border border-sky-300/25'
    : 'bg-white/10 text-slate-300 border border-white/10'
}

function MemberRow({ member, isOwner }: { member: StaffMember; isOwner: boolean }) {
  const [editing, setEditing]     = useState(false)
  const [role, setRole]           = useState<StaffRole>(member.role)
  const [isPending, startTransition] = useTransition()
  const [rowError, setRowError]   = useState('')

  function handleRoleChange() {
    setRowError('')
    startTransition(async () => {
      const result = await changeTeamRole(member.id, role)
      if (result.error) setRowError(result.error)
      else setEditing(false)
    })
  }

  function handleRemove() {
    if (!confirm(`Remove ${member.email} from the team?`)) return
    setRowError('')
    startTransition(async () => {
      const result = await removeTeamMember(member.id)
      if (result.error) setRowError(result.error)
    })
  }

  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-slate-100 truncate">{member.email}</p>
        {rowError && <p className="text-[11px] text-red-300 mt-0.5">{rowError}</p>}
      </div>

      {editing && isOwner ? (
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={role}
            onChange={e => setRole(e.target.value as StaffRole)}
            disabled={member.role === 'owner' || isPending}
            aria-label={`Role for ${member.email}`}
            title="Team member role"
            className="text-[12px] border border-white/10 bg-slate-950/60 text-slate-100 rounded px-2 py-1 focus:outline-none focus:border-white/30 disabled:opacity-50"
          >
            <option value="viewer">viewer</option>
            <option value="admin">admin</option>
            <option value="owner">owner</option>
          </select>
          <button
            onClick={handleRoleChange}
            disabled={isPending}
            className="text-[12px] font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 px-3 py-1 rounded transition-colors disabled:opacity-40 cursor-pointer"
          >
            Save
          </button>
          <button
            onClick={() => { setEditing(false); setRole(member.role) }}
            className="text-[12px] text-slate-400 hover:text-slate-200 cursor-pointer bg-transparent border-0"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${roleBadge(member.role)}`}>
            {member.role}
          </span>
          {isOwner && member.role !== 'owner' && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="text-[12px] text-slate-400 hover:text-slate-200 cursor-pointer bg-transparent border-0"
              >
                Edit
              </button>
              <button
                onClick={handleRemove}
                disabled={isPending}
                className="text-[12px] text-red-300 hover:text-red-200 cursor-pointer bg-transparent border-0 disabled:opacity-40"
              >
                Remove
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function AddMemberForm() {
  const [state, formAction, isPending] = useActionState(addTeamMember, {})

  return (
    <form action={formAction} className="px-6 py-5 flex flex-col sm:flex-row gap-3">
      <input
        name="email"
        type="email"
        required
        placeholder="colleague@company.com"
        className="flex-1 border border-white/10 bg-slate-950/60 text-slate-100 rounded px-3 py-2 text-[13px] placeholder:text-slate-500 focus:outline-none focus:border-white/30"
      />
      <select
        name="role"
        defaultValue="viewer"
        aria-label="Role for new team member"
        title="New member role"
        className="border border-white/10 bg-slate-950/60 text-slate-100 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-white/30"
      >
        <option value="viewer">viewer</option>
        <option value="admin">admin</option>
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="text-[13px] font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 px-5 py-2 rounded transition-colors disabled:opacity-40 cursor-pointer shrink-0"
      >
        {isPending ? 'Adding...' : 'Add member'}
      </button>
      {state.error && (
        <p className="text-[12px] text-red-300 self-center">{state.error}</p>
      )}
    </form>
  )
}

export function TeamClient({ members, currentRole }: Props) {
  const isOwner = currentRole === 'owner'

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md">
        <div className="px-6 py-[18px] border-b border-white/10">
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Team Members</span>
        </div>
        <div className="divide-y divide-white/10">
          {members.map(m => (
            <MemberRow key={m.id} member={m} isOwner={isOwner} />
          ))}
          {members.length === 0 && (
            <p className="px-6 py-8 text-[13px] text-slate-300">No team members yet.</p>
          )}
        </div>
        {isOwner && (
          <>
            <div className="border-t border-white/10 bg-slate-950/40 px-6 py-3">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Add Member</span>
            </div>
            <AddMemberForm />
          </>
        )}
      </div>
    </div>
  )
}
