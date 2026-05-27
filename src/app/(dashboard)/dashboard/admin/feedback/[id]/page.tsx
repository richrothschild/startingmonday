'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { FeedbackItem } from '@/lib/database.types'

type FeedbackStatus = 'new' | 'under_review' | 'planned' | 'in_progress' | 'shipped' | 'declined'

const STATUS_COLORS: Record<FeedbackStatus, string> = {
  new: 'bg-slate-100 text-slate-700',
  under_review: 'bg-blue-100 text-blue-700',
  planned: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-orange-100 text-orange-700',
  shipped: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: 'New',
  under_review: 'Under Review',
  planned: 'Planned',
  in_progress: 'In Progress',
  shipped: 'Shipped',
  declined: 'Declined',
}

type StatusHistoryItem = {
  id: string
  old_status: string | null
  new_status: string
  changed_by: string
  change_note: string | null
  created_at: string
  user_profiles: { full_name: string } | null
}

export default function FeedbackDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [item, setItem] = useState<FeedbackItem | null>(null)
  const [history, setHistory] = useState<StatusHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newStatus, setNewStatus] = useState<FeedbackStatus | ''>('')
  const [changeNote, setChangeNote] = useState('')
  const [staffNotes, setStaffNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState(false)

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      const res = await fetch(`/api/feedback/items?search=${params.id}`)
      const data = await res.json()
      if (data.items && data.items.length > 0) {
        const found = data.items.find((i: FeedbackItem) => i.id === params.id)
        if (found) {
          setItem(found)
          setNewStatus(found.status as FeedbackStatus)
          setStaffNotes(found.staff_notes || '')
        }
      }

      // Fetch status history
      const histRes = await fetch(`/api/feedback/items/${params.id}/status`)
      const histData = await histRes.json()
      if (histData.history) {
        setHistory(histData.history)
      }
    } catch (err) {
      console.error('Error fetching:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!newStatus || !item || newStatus === item.status) {
      setUpdateError('Please select a different status')
      return
    }

    setIsUpdating(true)
    setUpdateError('')
    setUpdateSuccess(false)

    try {
      const res = await fetch(`/api/feedback/items/${item.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          change_note: changeNote,
          staff_notes: staffNotes,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }

      setUpdateSuccess(true)
      setChangeNote('')
      fetchFeedback()
      setTimeout(() => setUpdateSuccess(false), 3000)
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Feedback item not found</p>
          <Link href="/dashboard/admin/feedback" className="text-orange-600 hover:text-orange-700 mt-4 inline-block">
            ← Back to Feedback
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard/admin/feedback" className="text-[13px] font-semibold text-slate-900 hover:text-orange-600 transition-colors">
            ← Feedback Admin
          </Link>
          <h1 className="text-[16px] font-bold text-slate-900 truncate">{item.title}</h1>
          <div className="w-32" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                <section className="mb-6 border border-slate-200 rounded-lg bg-slate-50 px-4 py-3">
          <h2 className="text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-1">Quick navigation</h2>
          <p className="text-[12px] text-slate-600 leading-relaxed">Use the section headers on this page to scan fast and jump to what matters first.</p>
        </section>
        <details className="mb-6 border border-slate-200 rounded-lg bg-white px-4 py-3">
          <summary className="cursor-pointer text-[12px] font-semibold text-slate-800">TL;DR</summary>
          <p className="mt-2 text-[12px] text-slate-600 leading-relaxed">This page is organized for quick scanning. Start with the first major section, then use headings to move directly to the next action.</p>
        </details>
{/* Item Details */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-[18px] font-bold text-slate-900 mb-2">{item.title}</h2>
              <p className="text-[13px] text-slate-600 mb-3">{item.body}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded text-[12px] font-semibold">
                  {item.category}
                </span>
                <span className={`inline-block px-3 py-1 rounded text-[12px] font-semibold ${STATUS_COLORS[item.status as FeedbackStatus]}`}>
                  {STATUS_LABELS[item.status as FeedbackStatus]}
                </span>
              </div>
            </div>
            <div className="text-right text-[12px] text-slate-500">
              <p><strong>Votes:</strong> {item.vote_count}</p>
              <p><strong>Comments:</strong> {item.comment_count}</p>
              <p className="mt-2"><strong>By:</strong> {item.user_profiles?.full_name || 'Unknown'}</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[12px] text-slate-600 space-y-1">
            <p><strong>Submitted:</strong> {new Date(item.created_at).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> {new Date(item.updated_at).toLocaleString()}</p>
            {item.first_staff_response_at && (
              <p><strong>First Response:</strong> {new Date(item.first_staff_response_at).toLocaleString()}</p>
            )}
            {item.status_decided_at && (
              <p><strong>Decision Made:</strong> {new Date(item.status_decided_at).toLocaleString()}</p>
            )}
          </div>
        </section>

        {/* Status Update Form */}
        <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <h3 className="text-[16px] font-bold text-slate-900">Update Status</h3>

          {updateError && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-[13px] text-red-700">
              {updateError}
            </div>
          )}
          {updateSuccess && (
            <div className="bg-green-50 border border-green-200 rounded p-3 text-[13px] text-green-700">
              Status updated successfully
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="status-select" className="block text-[12px] font-semibold text-slate-900 mb-2">
                Status
              </label>
              <select
                id="status-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as FeedbackStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="new">New</option>
                <option value="under_review">Under Review</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="shipped">Shipped</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-900 mb-2">
                Change Note (visible to user)
              </label>
              <textarea
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                placeholder="E.g., 'We're working on this bug and expect to ship in v2.1'"
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-900 mb-2">
                Internal Staff Notes
              </label>
              <textarea
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder="Internal notes about this item"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              onClick={handleStatusUpdate}
              disabled={isUpdating || newStatus === item.status}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white px-4 py-2 rounded font-semibold text-[13px] transition-colors"
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </section>

        {/* Status History */}
        {history.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h3 className="text-[16px] font-bold text-slate-900">Status History</h3>
            <div className="space-y-3">
              {history.map((entry, i) => (
                <div key={entry.id} className="border-l-2 border-orange-300 pl-4 pb-3">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div>
                      <p className="text-[12px] font-semibold text-slate-900">
                        {entry.old_status || 'Created'} → {entry.new_status}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        by {entry.user_profiles?.full_name || 'Unknown'}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                  </div>
                  {entry.change_note && (
                    <p className="text-[12px] text-slate-600 italic">"{entry.change_note}"</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
