'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfileResumeUpload() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('uploading')
    setMessage('')

    const body = new FormData()
    body.append('file', file)

    const res = await fetch('/api/profile/upload-resume', { method: 'POST', body })
    const json = await res.json().catch(() => ({}))

    if (res.ok) {
      setStatus('done')
      setMessage('Resume extracted — text populated below.')
      router.refresh()
    } else {
      setStatus('error')
      setMessage(json.error ?? 'Upload failed.')
    }

    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="mb-2">
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <span className="text-[12px] text-slate-500 border border-slate-200 rounded px-3 py-1.5 hover:border-slate-400 transition-colors">
          {status === 'uploading' ? 'Extracting…' : 'Upload PDF or DOCX'}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="sr-only"
          disabled={status === 'uploading'}
          onChange={handleChange}
        />
      </label>
      {message && (
        <p className={`mt-1.5 text-[12px] ${status === 'error' ? 'text-red-600' : 'text-green-700'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
