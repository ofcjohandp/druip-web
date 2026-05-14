'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shell } from '@/components/druip/shell'
import { Button, Chip, BlobBg, Toast, Skeleton, ListRow } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'
import { createClient } from '@/lib/supabase/client'

interface Purchase {
  seller_amount: number
  payment_status: string
  created_at: string
  listing_id: string
  listings: { title: string } | null
}

interface BarBucket {
  l: string
  h: number
  active: boolean
}

function getRangeStart(range: string): Date {
  const now = new Date()
  if (range === 'Week') {
    const d = new Date(now)
    d.setDate(d.getDate() - 6)
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (range === 'Month') {
    const d = new Date(now)
    d.setDate(d.getDate() - 27)
    d.setHours(0, 0, 0, 0)
    return d
  }
  const d = new Date(now)
  d.setMonth(d.getMonth() - 11)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function buildBarData(purchases: Purchase[], range: string): BarBucket[] {
  const now = new Date()
  const paid = purchases.filter(p => p.payment_status === 'paid')

  if (range === 'Week') {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const buckets: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      buckets[d.toDateString()] = 0
    }
    for (const p of paid) {
      const key = new Date(p.created_at).toDateString()
      if (key in buckets) buckets[key] += Number(p.seller_amount)
    }
    const keys = Object.keys(buckets)
    const values = keys.map(k => buckets[k])
    const maxVal = Math.max(...values, 1)
    return keys.map((k, i) => {
      const date = new Date(k)
      return {
        l: days[date.getDay()],
        h: (values[i] / maxVal) * 100,
        active: i === keys.length - 1,
      }
    })
  }

  if (range === 'Month') {
    const buckets: Record<string, number> = {}
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      const key = `W${i}`
      buckets[key] = 0
    }
    for (const p of paid) {
      const daysDiff = Math.floor((now.getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24))
      const week = Math.floor(daysDiff / 7)
      const key = `W${week}`
      if (key in buckets) buckets[key] += Number(p.seller_amount)
    }
    const keys = Object.keys(buckets)
    const values = keys.map(k => buckets[k])
    const maxVal = Math.max(...values, 1)
    return keys.map((k, i) => ({
      l: `W${i + 1}`,
      h: (values[i] / maxVal) * 100,
      active: i === keys.length - 1,
    }))
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const buckets: Record<string, number> = {}
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    buckets[key] = 0
  }
  for (const p of paid) {
    const d = new Date(p.created_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (key in buckets) buckets[key] += Number(p.seller_amount)
  }
  const keys = Object.keys(buckets)
  const values = keys.map(k => buckets[k])
  const maxVal = Math.max(...values, 1)
  return keys.map((k, i) => {
    const [year, month] = k.split('-').map(Number)
    const thisMonth = now.getFullYear() === year && now.getMonth() === month
    return {
      l: monthNames[month],
      h: (values[i] / maxVal) * 100,
      active: thisMonth,
    }
  })
}

function getRangePaidTotal(purchases: Purchase[], range: string): number {
  const start = getRangeStart(range)
  return purchases
    .filter(p => p.payment_status === 'paid' && new Date(p.created_at) >= start)
    .reduce((sum, p) => sum + Number(p.seller_amount), 0)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function EarningsPage() {
  const router = useRouter()
  const [range, setRange] = useState('Week')
  const [toast, setToast] = useState<{ tone: 'sage' | 'gold' | 'coral'; msg: string } | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('purchases')
        .select('seller_amount, payment_status, created_at, listing_id, listings(title)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
      setPurchases((data as unknown as Purchase[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  const paidPurchases = purchases.filter(p => p.payment_status === 'paid')
  const available = paidPurchases.reduce((s, p) => s + Number(p.seller_amount), 0)
  const pending = purchases.filter(p => p.payment_status !== 'paid').reduce((s, p) => s + Number(p.seller_amount), 0)
  const lifetime = purchases.reduce((s, p) => s + Number(p.seller_amount), 0)
  const rangeTotal = getRangePaidTotal(purchases, range)
  const barData = buildBarData(purchases, range)

  return (
    <>
      <Shell title="Earnings" sticky>
        {/* Hero balance */}
        <section style={{ padding: '4px 20px 20px' }}>
          <div style={{ background: 'linear-gradient(140deg, var(--sage) 0%, var(--sage-deep) 100%)', color: '#fff', borderRadius: 28, padding: 24, position: 'relative', overflow: 'hidden' }}>
            <BlobBg tone="gold" size={200} top={-60} right={-80} opacity={0.3}/>
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.85 }}>Available balance</div>
              {loading ? (
                <Skeleton h={56} w={160} r={8} style={{ marginTop: 8 }}/>
              ) : (
                <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 48, lineHeight: 1, letterSpacing: '-.02em', marginTop: 8 }}>
                  R {available.toFixed(0)}<span style={{ fontSize: 22, opacity: 0.7 }}>.{(available % 1).toFixed(2).slice(2)}</span>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>Pending</div>
                  {loading ? <Skeleton h={24} w={60} r={4} style={{ marginTop: 4 }}/> : <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 18 }}>R {pending.toFixed(0)}</div>}
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>Lifetime</div>
                  {loading ? <Skeleton h={24} w={60} r={4} style={{ marginTop: 4 }}/> : <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 18 }}>R {lifetime.toFixed(0)}</div>}
                </div>
              </div>
              <Button variant="gold" size="lg" full onClick={() => setToast({ tone: 'sage', msg: 'Nothing to cash out yet.' })} style={{ marginTop: 18 }}>
                <Icon.download size={16}/> Cash out
              </Button>
            </div>
          </div>
        </section>

        {/* Wallet top-up */}
        <section style={{ padding: '0 20px 20px' }}>
          <div style={{ background: 'var(--gold-soft)', borderRadius: 24, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon.card size={20}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--charcoal)' }}>Top up your wallet</div>
              <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', marginTop: 2 }}>Ask a parent or guardian to load funds for you.</div>
            </div>
            <button onClick={() => setToast({ tone: 'gold', msg: 'Top-up links coming soon.' })}
              style={{ padding: '8px 16px', background: 'var(--gold)', border: 'none', borderRadius: 999, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12, color: 'var(--charcoal)', cursor: 'pointer', flexShrink: 0 }}>
              Top up
            </button>
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
                {loading ? (
                  <Skeleton h={28} w={80} r={4} style={{ marginTop: 4 }}/>
                ) : (
                  <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 24, color: 'var(--charcoal)', marginTop: 2 }}>R {rangeTotal.toFixed(0)}</div>
                )}
              </div>
              <Chip tone="sage" size="sm">{paidPurchases.length === 0 ? 'No sales yet' : `${paidPurchases.length} sale${paidPurchases.length === 1 ? '' : 's'}`}</Chip>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
              {barData.map((d, i) => (
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

        {/* Activity */}
        <section style={{ padding: '0 20px 24px' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 18, letterSpacing: '-.02em', margin: '0 0 12px', color: 'var(--charcoal)' }}>Recent activity</h2>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3].map(i => <Skeleton key={i} h={56} r={14}/>)}
            </div>
          ) : purchases.length === 0 ? (
            <div style={{ background: 'var(--white)', borderRadius: 20, border: '1px solid var(--hairline)', padding: '32px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: 'var(--charcoal-soft)' }}>No transactions yet.</div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 6 }}>Sales will appear here once students buy your notes.</div>
              <button onClick={() => router.push('/sell')} style={{ marginTop: 16, padding: '10px 20px', background: 'var(--sage)', color: '#fff', border: 'none', borderRadius: 999, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Start selling
              </button>
            </div>
          ) : (
            <div style={{ background: 'var(--white)', borderRadius: 20, border: '1px solid var(--hairline)', overflow: 'hidden' }}>
              {purchases.map((p, i) => (
                <ListRow
                  key={i}
                  label={p.listings?.title || 'Note sale'}
                  sub={formatDate(p.created_at)}
                  right={<span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: 'var(--sage-deep)', fontSize: 14 }}>+R {Number(p.seller_amount).toFixed(2)}</span>}
                />
              ))}
            </div>
          )}
        </section>
      </Shell>

      {toast && <Toast tone={toast.tone} onClose={() => setToast(null)}>{toast.msg}</Toast>}
    </>
  )
}
