'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/druip/ui'

export default function NotFound() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 80, color: 'var(--sage)', lineHeight: 1, marginBottom: 8 }}>404</div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 26, letterSpacing: '-.02em', color: 'var(--charcoal)', margin: '0 0 10px' }}>Page not found</h1>
      <p style={{ fontSize: 14, color: 'var(--charcoal-soft)', lineHeight: 1.6, margin: '0 0 28px', maxWidth: 280 }}>
        This page doesn't exist or the link may have expired.
      </p>
      <Button variant="primary" size="lg" onClick={() => router.push('/home')}>Go home</Button>
      <button onClick={() => router.back()} style={{ marginTop: 14, fontSize: 13, color: 'var(--sage-deep)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
        ← Go back
      </button>
    </div>
  )
}
