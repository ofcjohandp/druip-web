'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell } from '@/components/druip/shell'
import { Button, BlobBg, Toast, IconButton } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'

interface Props { firstName: string; streak: number; earnings: number }

export default function HomeClient({ firstName, streak, earnings }: Props) {
  const router = useRouter()
  const [toast, setToast] = useState<{ tone: 'sage' | 'gold' | 'coral'; msg: string } | null>(null)

  const showToast = (tone: 'sage' | 'gold' | 'coral', msg: string) => setToast({ tone, msg })
  const formatted = `R ${earnings.toFixed(2)}`

  return (
    <>
      <Shell
        headerVariant="logo"
        sticky
        rightAction={
          <div style={{ display: 'flex', gap: 8 }}>
            <IconButton ariaLabel="search" onClick={() => router.push('/search')}><Icon.search size={18}/></IconButton>
            <IconButton ariaLabel="alerts"><Icon.bell size={18}/></IconButton>
          </div>
        }
      >
        {/* Greeting */}
        <section style={{ padding: '4px 20px 20px', position: 'relative' }}>
          <div style={{ fontSize: 13, color: 'var(--charcoal-soft)', fontWeight: 600 }}>Sawubona, {firstName} 👋</div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 30, lineHeight: 1.05, letterSpacing: '-.02em', color: 'var(--charcoal)', margin: '6px 0 0' }}>Let&apos;s make this term count.</h1>
        </section>

        {/* Earnings card */}
        <section style={{ padding: '0 20px 24px' }}>
          <div onClick={() => router.push('/earnings')} style={{ background: 'linear-gradient(140deg, var(--sage) 0%, var(--sage-deep) 100%)', color: '#fff', borderRadius: 28, padding: 22, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
            <BlobBg tone="gold" size={180} top={-60} right={-60} opacity={0.25}/>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.85 }}>Available to cash out</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 40, lineHeight: 1, letterSpacing: '-.02em', marginTop: 6 }}>{formatted}</div>
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>{earnings > 0 ? 'Ready to cash out' : 'Start selling to earn'}</div>
              </div>
              {streak > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--gold-soft)', borderRadius: 999, color: 'var(--gold-deep)' }}>
                  <Icon.flame size={14} fill="currentColor"/>
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{streak}-day streak</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18, position: 'relative' }}>
              <button
                onClick={e => { e.stopPropagation(); earnings > 0 ? router.push('/earnings') : showToast('gold', 'Nothing to cash out yet.') }}
                style={{ flex: 1, padding: '12px 16px', borderRadius: 999, background: 'var(--gold)', color: 'var(--charcoal)', border: 'none', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Cash out
              </button>
              <button
                onClick={e => { e.stopPropagation(); router.push('/sell') }}
                style={{ flex: 1, padding: '12px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.16)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                + New listing
              </button>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section style={{ padding: '0 20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { icon: <Icon.upload size={18}/>, label: 'Sell', tone: 'sage', href: '/sell' },
              { icon: <Icon.search size={18}/>, label: 'Find', tone: 'gold', href: '/browse' },
              { icon: <Icon.bookmark size={18}/>, label: 'Saved', tone: 'turquoise', href: '/browse' },
              { icon: <Icon.zap size={18}/>, label: 'Earn', tone: 'coral', href: '/earnings' },
            ].map((q, i) => (
              <button key={i} onClick={() => router.push(q.href)}
                style={{ background: `var(--${q.tone}-soft)`, color: `var(--${q.tone}-deep)`, border: 'none', borderRadius: 18, padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12, transition: 'transform 200ms' }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                {q.icon}{q.label}
              </button>
            ))}
          </div>
        </section>

        {/* Empty library */}
        <section style={{ padding: '0 20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 22, letterSpacing: '-.02em', margin: 0, color: 'var(--charcoal)' }}>Your library</h2>
            <span onClick={() => router.push('/browse')} style={{ fontSize: 13, color: 'var(--sage-deep)', fontWeight: 700, cursor: 'pointer' }}>Browse →</span>
          </div>
          <div style={{ background: 'var(--cream-warm)', borderRadius: 24, padding: '32px 20px', textAlign: 'center', border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 6 }}>Nothing here yet.</div>
            <div style={{ fontSize: 13, color: 'var(--charcoal-soft)', marginBottom: 18 }}>Your library starts the moment you buy your first set of notes.</div>
            <Button variant="primary" size="sm" onClick={() => router.push('/browse')}>Browse notes</Button>
          </div>
        </section>

        {/* Sell prompt */}
        <section style={{ padding: '0 20px 24px' }}>
          <div onClick={() => router.push('/sell')} style={{ background: 'var(--cream-warm)', borderRadius: 24, padding: 20, display: 'flex', alignItems: 'center', gap: 14, border: '1px solid var(--hairline)', cursor: 'pointer' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--gold-soft)', color: 'var(--gold-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon.sparkle size={22}/></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)' }}>Got notes from last term?</div>
              <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', marginTop: 3 }}>List them in 2 min — average seller earns R 480/mo.</div>
            </div>
            <Icon.chevron size={18}/>
          </div>
        </section>
      </Shell>

      {toast && <Toast tone={toast.tone} onClose={() => setToast(null)}>{toast.msg}</Toast>}
    </>
  )
}
