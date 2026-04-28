'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'

const UNIVERSITIES = ['NWU', 'UP', 'UCT', 'Wits', 'Stellenbosch', 'UNISA', 'UJ', 'Other']

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [university, setUniversity] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errs, setErrs] = useState<Record<string, string>>({})

  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrs: Record<string, string> = {}
    if (!name.trim()) newErrs.name = "We need to know what to call you."
    if (!email.includes('@') || !email.includes('.')) newErrs.email = "That doesn't look right — check the email."
    if (password.length < 8) newErrs.pwd = "Make it at least 8 characters."
    if (!university) newErrs.uni = "Select your university."
    setErrs(newErrs)
    if (Object.keys(newErrs).length > 0) return

    setError(null)
    setLoading(true)
    const [firstName, ...rest] = name.trim().split(' ')
    const lastName = rest.join(' ') || null

    const supabase = createClient()
    const { error: signUpError, data } = await supabase.auth.signUp({
      email, password,
      options: { data: { first_name: firstName, last_name: lastName, university } },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('profiles').update({ university }).eq('id', data.user.id)
    }

    router.push('/home')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '18px 20px 8px', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => router.push('/')} aria-label="back" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--cream-warm)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon.back size={18}/>
        </button>
      </header>

      <main style={{ padding: '12px 24px 32px', flex: 1 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 36, lineHeight: 1.05, letterSpacing: '-.02em', color: 'var(--charcoal)', margin: '0 0 8px' }}>Create your account</h1>
        <p style={{ fontSize: 14, color: 'var(--charcoal-soft)', margin: '0 0 28px', lineHeight: 1.5 }}>Free to join. Start selling notes in under 2 minutes.</p>

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

        {error && <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--coral-soft)', color: '#B05B3F', borderRadius: 14, fontSize: 13, fontWeight: 600 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <Input label="Full name" icon={<Icon.user size={18}/>} placeholder="Lerato Mokoena" value={name} onChange={e => setName(e.target.value)} error={errs.name}/>
          <Input label="Varsity email" type="email" icon={<Icon.mail size={18}/>} placeholder="you@nwu.ac.za" value={email} onChange={e => setEmail(e.target.value)} error={errs.email} hint="Use your varsity email so we can verify you're a student."/>
          <Input label="Password" type="password" icon={<Icon.lock size={18}/>} placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} error={errs.pwd}/>

          <div style={{ marginBottom: errs.uni ? 4 : 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8 }}>University</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {UNIVERSITIES.map(u => (
                <button key={u} type="button" onClick={() => setUniversity(u)}
                  style={{ padding: '8px 14px', borderRadius: 999, border: `1.5px solid ${university === u ? 'var(--charcoal)' : 'var(--hairline)'}`, background: university === u ? 'var(--charcoal)' : 'var(--white)', color: university === u ? '#fff' : 'var(--charcoal-soft)', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {u}
                </button>
              ))}
            </div>
            {errs.uni && <div style={{ fontSize: 12, color: '#B05B3F', marginTop: 6 }}>{errs.uni}</div>}
          </div>

          <Button variant="primary" full size="lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p style={{ fontSize: 11, color: 'var(--fg-muted)', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
          By signing up, you agree to Druip&apos;s <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>terms</span> and <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>privacy policy</span>.
        </p>
      </main>

      <footer style={{ padding: '0 24px 28px', textAlign: 'center', fontSize: 13, color: 'var(--charcoal-soft)' }}>
        Already on Druip?{' '}
        <span onClick={() => router.push('/sign-in')} style={{ color: 'var(--sage-deep)', fontWeight: 700, cursor: 'pointer' }}>Sign in</span>
      </footer>
    </div>
  )
}
