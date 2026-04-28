'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell } from '@/components/druip/shell'
import { Button, Chip, BlobBg, Toast } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'

const BAR_DATA = [
  { l: 'Mon', h: 0 }, { l: 'Tue', h: 0 }, { l: 'Wed', h: 0 },
  { l: 'Thu', h: 0 }, { l: 'Fri', h: 0 }, { l: 'Sat', h: 0 }, { l: 'Sun', h: 0, active: true },
]

export default function EarningsPage() {
  const router = useRouter()
  const [range, setRange] = useState('Week')
  const [toast, setToast] = useState<{ tone: 'sage' | 'gold' | 'coral'; msg: string } | null>(null)

  return (
    <>
      <Shell title="Earnings" sticky>
        {/* Hero balance */}
        <section style={{ padding: '4px 20px 20px' }}>
          <div style={{ background: 'linear-gradient(140deg, var(--sage) 0%, var(--sage-deep) 100%)', color: '#fff', borderRadius: 28, padding: 24, position: 'relative', overflow: 'hidden' }}>
            <BlobBg tone="gold" size={200} top={-60} right={-80} opacity={0.3}/>
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.85 }}>Available balance</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 48, lineHeight: 1, letterSpacing: '-.02em', marginTop: 8 }}>R 0<span style={{ fontSize: 22, opacity: 0.7 }}>.00</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
                <div><div style={{ fontSize: 11, opacity: 0.75 }}>Pending</div><div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 18 }}>R 0</div></div>
                <div><div style={{ fontSize: 11, opacity: 0.75 }}>Lifetime</div><div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 18 }}>R 0</div></div>
              </div>
              <Button variant="gold" size="lg" full onClick={() => setToast({ tone: 'sage', msg: 'Nothing to cash out yet.' })} style={{ marginTop: 18 }}>
                <Icon.download size={16}/> Cash out
              </Button>
            </div>
          </div>
        </section>

        {/* Range picker */}
        <section style={{ padding: '0 20px 16px' }}>
          <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--cream-warm)', borderRadius: 14 }}>
            {['Week', 'Month', 'Year'].map(r => (
              <button key={r} onClick={() => setRange(r)}
                style={{ flex: 1, padding: '8px 12px', background: range === r ? 'var(--white)' : 'transparent', border: 'none', borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: range === r ? 'var(--charcoal)' : 'var(--charcoal-soft)', cursor: 'pointer', boxShadow: range === r ? 'var(--shadow-card)' : 'none', transition: 'all 200ms' }}>
                {r}
              </button>
            ))}
          </div>
        </section>

        {/* Chart */}
        <section style={{ padding: '0 20px 24px' }}>
          <div style={{ background: 'var(--white)', borderRadius: 24, padding: 20, border: '1px solid var(--hairline)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 600 }}>This {range.toLowerCase()}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 24, color: 'var(--charcoal)', marginTop: 2 }}>R 0</div>
              </div>
              <Chip tone="sage" size="sm">No sales yet</Chip>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
              {BAR_DATA.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: '100%', maxWidth: 26, height: 80, display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', height: `${Math.max(d.h, 4)}%`, background: d.active ? 'var(--sage)' : 'var(--sage-soft)', borderRadius: 6 }}/>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--fg-muted)', fontWeight: 700 }}>{d.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Empty transactions */}
        <section style={{ padding: '0 20px 24px' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 18, letterSpacing: '-.02em', margin: '0 0 12px', color: 'var(--charcoal)' }}>Recent activity</h2>
          <div style={{ background: 'var(--white)', borderRadius: 20, border: '1px solid var(--hairline)', padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: 'var(--charcoal-soft)' }}>No transactions yet.</div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 6 }}>Sales will appear here once students buy your notes.</div>
            <button onClick={() => router.push('/sell')} style={{ marginTop: 16, padding: '10px 20px', background: 'var(--sage)', color: '#fff', border: 'none', borderRadius: 999, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Start selling
            </button>
          </div>
        </section>
      </Shell>

      {toast && <Toast tone={toast.tone} onClose={() => setToast(null)}>{toast.msg}</Toast>}
    </>
  )
}
