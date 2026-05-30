'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback?: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
        },
      ) => string | number
      remove?: (widgetId: string | number) => void
    }
  }
}

type TurnstileWidgetProps = {
  onTokenChange: (token: string | null) => void
}

const SCRIPT_ID = 'cf-turnstile-script'
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function ensureTurnstileScript(onLoad: () => void) {
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
  if (existing) {
    if (window.turnstile) onLoad()
    else existing.addEventListener('load', onLoad, { once: true })
    return
  }

  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.src = SCRIPT_SRC
  script.async = true
  script.defer = true
  script.addEventListener('load', onLoad, { once: true })
  document.head.appendChild(script)
}

export default function TurnstileWidget({ onTokenChange }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | number | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    onTokenChange(null)

    if (!siteKey) {
      setLoadError('Security check is unavailable. Please try again later.')
      return
    }

    const render = () => {
      if (!containerRef.current || !window.turnstile) {
        setLoadError('Security check failed to load. Refresh and try again.')
        return
      }

      containerRef.current.innerHTML = ''
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onTokenChange(token),
        'expired-callback': () => onTokenChange(null),
        'error-callback': () => {
          onTokenChange(null)
          setLoadError('Security check failed. Please refresh and retry.')
        },
        theme: 'light',
      })
    }

    ensureTurnstileScript(render)

    return () => {
      if (window.turnstile?.remove && widgetIdRef.current != null) {
        window.turnstile.remove(widgetIdRef.current)
      }
      widgetIdRef.current = null
    }
  }, [onTokenChange, siteKey])

  return (
    <div className="space-y-2">
      <div ref={containerRef} />
      {loadError ? <p className="text-[12px] text-red-600">{loadError}</p> : null}
      <p className="text-[11px] text-slate-400">Complete the security check before signing in.</p>
    </div>
  )
}
