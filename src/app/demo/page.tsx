'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DemoPage() {
  const router = useRouter()

  useEffect(() => {
    const email = process.env.NEXT_PUBLIC_DEMO_USER_EMAIL
    const password = process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD
    if (!email || !password) {
      router.push('/login')
      return
    }
    const supabase = createClient()
    supabase.auth.signInWithPassword({ email, password }).then(({ error }) => {
      if (error) {
        router.push('/login')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    })
  }, [router])

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <p className="text-[14px] text-slate-400">Loading demo account...</p>
    </div>
  )
}
