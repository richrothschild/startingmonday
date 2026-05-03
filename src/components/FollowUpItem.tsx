'use client'
import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [donePending, startDone] = useTransition()
  const [savePending, startSave] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleDone() {
    const fd = new FormData()
    fd.append('id', id)
    startDone(async () => {
      await markFollowUpDone(fd)
      router.refresh()
    })
  }

  function handleSave(fd: FormData) {
    startSave(async () => {
      await updateFollowUp(fd)
      setEditing(false)
      router.refresh()
    })
  }

  if (editing) {
    return (
      <div className="px-6 py-4">
        <form action={handleSave} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={id} />
          <input
            ref={inputRef}
            name="action"
            defaultValue={action}
            aria-label="Action text"
            className="w-full border border-slate-300 rounded px-3 py-2 text-[14px] font-semibold text-slate-900 focus:outline-none focus:border-slate-500"
          />
          <div className="flex items-center gap-3">
            <input
              type="date"
              name="due_date"
              defaultValue={dueDate}
              aria-label="Due date"
              className="border border-slate-300 rounded px-3 py-1.5 text-[13px] text-slate-700 focus:outline-none focus:border-slate-500"
            />
            {companyName && (
              <span className="text-[12px] text-slate-400">{companyName}</span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="submit"
                disabled={savePending}
                className="text-[12px] text-white bg-slate-800 rounded px-3 py-1.5 hover:bg-slate-700 cursor-pointer disabled:opacity-50"
              >
                {savePending ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-[12px] text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <button
        type="button"
        onClick={startEdit}
        className="flex-1 min-w-0 text-left group cursor-pointer"
      >
        <div className="text-[14px] font-semibold text-slate-900 truncate group-hover:text-slate-600">
          {action}
        </div>
        {companyName && (
          <div className="text-[12px] text-slate-400 mt-0.5">{companyName}</div>
        )}
      </button>

      <span className={`text-[12px] font-semibold shrink-0 ${isToday ? 'text-slate-400' : 'text-red-600'}`}>
        {dateLabel}
      </span>

      <button
        type="button"
        onClick={handleDone}
        disabled={donePending}
        className="text-[12px] text-slate-400 border border-slate-200 rounded px-3 py-1 hover:border-slate-400 hover:text-slate-700 cursor-pointer bg-transparent disabled:opacity-50"
      >
        {donePending ? '…' : 'Done'}
      </button>
    </div>
  )
}
