'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/druip/ui'

export default function OnboardingPage() {
  const router = useRouter()
  const [role, setRole] = useState<'student' | 'tutor' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!role) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/sign-in'); return }
    const { error: err } = await supabase.from('profiles').upsert({ id: user.id, role }, { onConflict: 'id' })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/home')
    router.refresh()
  }

  const card = (r: 'student' | 'tutor', title: string, desc: string) => (
    <button type="button" onClick={() => setRole(r)}
      style={{
        width: '100%', padding: '20px 20px', borderRadius: 20, textAlign: 'left', cursor: 'pointer',
        border: `2px solid ${role === r ? 'var(--sage)' : 'var(--hairline)'}`,
        background: role === r ? 'var(--sage-soft)' : 'var(--white)',
        marginBottom: 12, transition: 'all 200ms',
      }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: 'var(--charcoal)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--charcoal-soft)', lineHeight: 1.5 }}>{desc}</div>
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      <main style={{ padding: '48px 24px 32px', flex: 1 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 36, lineHeight: 1.05, letterSpacing: '-.02em', color: 'var(--charcoal)', margin: '0 0 8px' }}>One last thing.</h1>
        <p style={{ fontSize: 14, color: 'var(--charcoal-soft)', margin: '0 0 32px', lineHeight: 1.5 }}>Tell us who you are so we can set up your experience.</p>

        {card('student', 'Student', 'Browse and buy study notes, join classrooms, and ace your modules.')}
        {card('tutor', 'Tutor', 'Sell your notes, run classrooms, and earn while you share knowledge.')}

        {error && <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--coral-soft)', color: '#B05B3F', borderRadius: 14, fontSize: 13, fontWeight: 600 }}>{error}</div>}

        <Button variant="primary" full size="lg" type="button" disabled={!role || loading} onClick={handleSubmit} style={{ marginTop: 8 }}>
          {loading ? 'Setting up…' : 'Get started →'}
        </Button>
      </main>
    </div>
  )
}
