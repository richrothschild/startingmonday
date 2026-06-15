'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton({ label }: { label: string }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center min-h-[44px] px-2 text-[12px] text-slate-300 hover:text-white transition-colors bg-transparent border-0 cursor-pointer whitespace-nowrap"
    >
      {label}
    </button>
  )
}
