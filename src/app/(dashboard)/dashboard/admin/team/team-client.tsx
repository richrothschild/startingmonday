'use client'
import { useState, useTransition, useActionState } from 'react'
import type { StaffMember, StaffRole } from '@/lib/staff'
import { addTeamMember, changeTeamRole, removeTeamMember } from './actions'
import {
  ADMIN_DARK_BUTTON_MD,
  ADMIN_DARK_BUTTON_SM,
  ADMIN_DARK_FIELD_MD,
  ADMIN_DARK_FIELD_SM,
  ADMIN_DARK_MUTED_ACTION,
  ADMIN_DARK_SUB_CARD,
  ADMIN_DARK_TABLE_PANEL,
  adminRoleBadgeClass,
} from '../admin-dark-theme'

type Props = {
  members: StaffMember[]
  currentRole: StaffRole
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
            className={`${ADMIN_DARK_FIELD_SM} text-[12px] disabled:opacity-50`}
          >
            <option value="viewer">viewer</option>
            <option value="admin">admin</option>
            <option value="owner">owner</option>
          </select>
          <button
            onClick={handleRoleChange}
            disabled={isPending}
            className={ADMIN_DARK_BUTTON_SM}
          >
            Save
          </button>
          <button
            onClick={() => { setEditing(false); setRole(member.role) }}
            className={ADMIN_DARK_MUTED_ACTION}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${adminRoleBadgeClass(member.role)}`}>
            {member.role}
          </span>
          {isOwner && member.role !== 'owner' && (
            <>
              <button
                onClick={() => setEditing(true)}
                className={ADMIN_DARK_MUTED_ACTION}
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
        className={`${ADMIN_DARK_FIELD_MD} flex-1 text-[13px] placeholder:text-slate-500`}
      />
      <select
        name="role"
        defaultValue="viewer"
        aria-label="Role for new team member"
        title="New member role"
        className={`${ADMIN_DARK_FIELD_MD} text-[13px]`}
      >
        <option value="viewer">viewer</option>
        <option value="admin">admin</option>
      </select>
      <button
        type="submit"
        disabled={isPending}
        className={`${ADMIN_DARK_BUTTON_MD} shrink-0`}
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
      <div className={ADMIN_DARK_TABLE_PANEL}>
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
            <div className={`${ADMIN_DARK_SUB_CARD} border-t border-white/10 px-6 py-3`}>
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Add Member</span>
            </div>
            <AddMemberForm />
          </>
        )}
      </div>
    </div>
  )
}
