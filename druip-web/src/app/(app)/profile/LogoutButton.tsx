'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-container transition-colors text-error"
    >
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-xl">logout</span>
        <span className="font-medium text-sm">Logout</span>
      </div>
      <span className="material-symbols-outlined text-xl">chevron_right</span>
    </button>
  )
}
