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
      className="text-[12px] text-slate-300 hover:text-white transition-colors bg-transparent border-0 cursor-pointer p-0 whitespace-nowrap"
    >
      {label}
    </button>
  )
}
