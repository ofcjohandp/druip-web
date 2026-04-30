'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/home`,
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '18px 20px 8px', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => router.push('/sign-in')} aria-label="back"
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--cream-warm)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon.back size={18}/>
        </button>
      </header>

      <main style={{ padding: '12px 24px 32px', flex: 1 }}>
        {!sent ? (
          <>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 36, lineHeight: 1.05, letterSpacing: '-.02em', color: 'var(--charcoal)', margin: '0 0 8px' }}>Reset your password.</h1>
            <p style={{ fontSize: 14, color: 'var(--charcoal-soft)', margin: '0 0 28px', lineHeight: 1.5 }}>Enter your email and we&apos;ll send you a reset link.</p>
            <form onSubmit={handleSubmit}>
              <Input label="Email" type="email" icon={<Icon.mail size={18}/>} placeholder="you@gmail.com" value={email} onChange={e => setEmail(e.target.value)}/>
              <Button variant="primary" full size="lg" type="submit" disabled={loading || !email} style={{ marginTop: 8 }}>
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          </>
        ) : (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--sage-soft)', color: 'var(--sage-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Icon.mail size={28}/>
            </div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 32, lineHeight: 1.05, letterSpacing: '-.02em', color: 'var(--charcoal)', margin: '0 0 12px' }}>Check your email.</h1>
            <p style={{ fontSize: 14, color: 'var(--charcoal-soft)', margin: '0 0 28px', lineHeight: 1.6 }}>
              We&apos;ve sent a reset link to <strong>{email}</strong>. It might take a minute to arrive - check your spam folder too.
            </p>
            <Button variant="ghost" full size="lg" onClick={() => router.push('/sign-in')}>Back to sign in</Button>
          </>
        )}
      </main>
    </div>
  )
}
