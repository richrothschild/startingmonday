'use client'
import { createContext, useContext, useState, useCallback, useRef } from 'react'

type ToastType = 'success' | 'error' | 'info'
type Toast = { id: number; message: string; type: ToastType }

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let _idCounter = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id !== id))
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++_idCounter
    setToasts(t => [...t.slice(-4), { id, message, type }])
    const timer = setTimeout(() => dismiss(id), 3500)
    timers.current.set(id, timer)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className={[
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-[13px] font-medium max-w-sm transition-all',
              t.type === 'success' ? 'bg-slate-900 text-white' :
              t.type === 'error'   ? 'bg-red-600 text-white' :
                                     'bg-white text-slate-900 border border-slate-200',
            ].join(' ')}
          >
            {t.type === 'success' && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7" stroke="white" strokeOpacity="0.5" strokeWidth="1.4" />
                <path d="M5 8l2.5 2.5L11 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {t.type === 'error' && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7" stroke="white" strokeOpacity="0.5" strokeWidth="1.4" />
                <path d="M8 5v4M8 11v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100 bg-transparent border-0 cursor-pointer p-0 text-inherit leading-none"
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.showToast
}
