'use client'
import { useState, useTransition, useActionState } from 'react'
import type { StaffMember, StaffRole } from '@/lib/staff'
import { addTeamMember, changeTeamRole, removeTeamMember } from './actions'

type Props = {
  members: StaffMember[]
  currentRole: StaffRole
}

function roleBadge(role: string) {
  return role === 'owner' ? 'bg-amber-50 text-amber-700'
    : role === 'admin'    ? 'bg-blue-50 text-blue-700'
    : 'bg-slate-100 text-slate-500'
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
        <p className="text-[13px] text-slate-900 truncate">{member.email}</p>
        {rowError && <p className="text-[11px] text-red-600 mt-0.5">{rowError}</p>}
      </div>

      {editing && isOwner ? (
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={role}
            onChange={e => setRole(e.target.value as StaffRole)}
            disabled={member.role === 'owner' || isPending}
            className="text-[12px] border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-slate-400 disabled:opacity-50"
          >
            <option value="viewer">viewer</option>
            <option value="admin">admin</option>
            <option value="owner">owner</option>
          </select>
          <button
            onClick={handleRoleChange}
            disabled={isPending}
            className="text-[12px] font-semibold text-white bg-slate-900 hover:bg-slate-700 px-3 py-1 rounded transition-colors disabled:opacity-40 cursor-pointer border-0"
          >
            Save
          </button>
          <button
            onClick={() => { setEditing(false); setRole(member.role) }}
            className="text-[12px] text-slate-400 hover:text-slate-700 cursor-pointer bg-transparent border-0"
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
                className="text-[12px] text-slate-400 hover:text-slate-700 cursor-pointer bg-transparent border-0"
              >
                Edit
              </button>
              <button
                onClick={handleRemove}
                disabled={isPending}
                className="text-[12px] text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-0 disabled:opacity-40"
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
        className="flex-1 border border-slate-200 rounded px-3 py-2 text-[13px] placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
      />
      <select
        name="role"
        defaultValue="viewer"
        className="border border-slate-200 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-slate-400"
      >
        <option value="viewer">viewer</option>
        <option value="admin">admin</option>
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-700 px-5 py-2 rounded transition-colors disabled:opacity-40 cursor-pointer border-0 shrink-0"
      >
        {isPending ? 'Adding...' : 'Add member'}
      </button>
      {state.error && (
        <p className="text-[12px] text-red-600 self-center">{state.error}</p>
      )}
    </form>
  )
}

export function TeamClient({ members, currentRole }: Props) {
  const isOwner = currentRole === 'owner'

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <div className="px-6 py-[18px] border-b border-slate-200">
          <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Team Members</span>
        </div>
        <div className="divide-y divide-slate-50">
          {members.map(m => (
            <MemberRow key={m.id} member={m} isOwner={isOwner} />
          ))}
          {members.length === 0 && (
            <p className="px-6 py-8 text-[13px] text-slate-400">No team members yet.</p>
          )}
        </div>
        {isOwner && (
          <>
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-3">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Add Member</span>
            </div>
            <AddMemberForm />
          </>
        )}
      </div>
    </div>
  )
}
