'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/home')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '18px 20px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => router.push('/')} aria-label="back" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--cream-warm)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon.back size={18}/>
        </button>
      </header>

      <main style={{ padding: '12px 24px 32px', flex: 1 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 36, lineHeight: 1.05, letterSpacing: '-.02em', color: 'var(--charcoal)', margin: '0 0 8px' }}>Welcome back.</h1>
        <p style={{ fontSize: 14, color: 'var(--charcoal-soft)', margin: '0 0 28px', lineHeight: 1.5 }}>Sign in to keep selling and studying.</p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <button onClick={signInWithGoogle} style={{ flex: 1, padding: '12px 16px', background: 'var(--white)', border: '1px solid var(--hairline)', borderRadius: 16, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--charcoal)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'background 200ms' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream-warm)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--white)')}>
            <Icon.google size={18}/> Google
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 18px', color: 'var(--fg-muted)' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }}/>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>or with email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }}/>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--coral-soft)', color: '#B05B3F', borderRadius: 14, fontSize: 13, fontWeight: 600 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <Input label="Email" type="email" icon={<Icon.mail size={18}/>} placeholder="you@gmail.com" value={email} onChange={e => setEmail(e.target.value)}/>
          <Input label="Password" type="password" icon={<Icon.lock size={18}/>} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}/>
          <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
            <span onClick={() => router.push('/forgot-password')} style={{ fontSize: 13, color: 'var(--sage-deep)', fontWeight: 700, cursor: 'pointer' }}>Forgot password?</span>
          </div>
          <Button variant="primary" full size="lg" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
        </form>
      </main>

      <footer style={{ padding: '0 24px 28px', textAlign: 'center', fontSize: 13, color: 'var(--charcoal-soft)' }}>
        New to Druip?{' '}
        <span onClick={() => router.push('/sign-up')} style={{ color: 'var(--sage-deep)', fontWeight: 700, cursor: 'pointer' }}>Sign up</span>
      </footer>
    </div>
  )
}
