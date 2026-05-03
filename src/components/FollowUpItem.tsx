'use client'
import { useState, useRef } from 'react'
import { markFollowUpDone, updateFollowUp } from '@/app/(dashboard)/dashboard/actions'

interface Props {
  id: string
  action: string
  dueDate: string
  dateLabel: string
  isToday: boolean
  companyName?: string
}

export function FollowUpItem({ id, action, dueDate, dateLabel, isToday, companyName }: Props) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function cancelEdit() {
    setEditing(false)
  }

  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        {editing ? (
          <form
            action={async (fd) => {
              await updateFollowUp(fd)
              setEditing(false)
            }}
            className="flex items-center gap-2"
          >
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="due_date" value={dueDate} />
            <input
              ref={inputRef}
              name="action"
              defaultValue={action}
              className="flex-1 border border-slate-300 rounded px-2 py-1 text-[14px] font-semibold text-slate-900 focus:outline-none focus:border-slate-500"
            />
            <button
              type="submit"
              className="text-[12px] text-white bg-slate-800 rounded px-3 py-1 hover:bg-slate-700 cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-[12px] text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="text-left w-full group cursor-pointer"
          >
            <div className="text-[14px] font-semibold text-slate-900 truncate group-hover:text-slate-600">
              {action}
            </div>
            {companyName && (
              <div className="text-[12px] text-slate-400 mt-0.5">{companyName}</div>
            )}
          </button>
        )}
      </div>

      {!editing && (
        <>
          <span className={`text-[12px] font-semibold shrink-0 ${isToday ? 'text-slate-400' : 'text-red-600'}`}>
            {dateLabel}
          </span>
          <form action={markFollowUpDone}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="text-[12px] text-slate-400 border border-slate-200 rounded px-3 py-1 hover:border-slate-400 hover:text-slate-700 cursor-pointer bg-transparent"
            >
              Done
            </button>
          </form>
        </>
      )}
    </div>
  )
}
