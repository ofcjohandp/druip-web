'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shell } from '@/components/druip/shell'
import { Avatar, Chip, ListRow } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'

interface Listing {
  id: string
  title: string
  code: string
  price: number
  pages: number
  tone: string
  status: string
  created_at: string
}

interface Props {
  firstName: string
  lastName: string
  email: string
  university: string
  listings: Listing[]
  salesCount: number
}

export default function ProfileClient({ firstName, lastName, email, university, listings, salesCount }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'listings' | 'reviews' | 'settings'>('listings')

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const publishedListings = listings.filter(l => l.status === 'published')

  return (
    <Shell title="You" sticky>
      <section style={{ padding: '8px 20px 20px' }}>
        <div style={{ background: 'linear-gradient(140deg, var(--cream-warm) 0%, var(--gold-soft) 100%)', borderRadius: 28, padding: 22, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar name={firstName} tone="sage" size={64}/>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 22, lineHeight: 1.1, letterSpacing: '-.02em', margin: 0, color: 'var(--charcoal)' }}>{firstName} {lastName}</h1>
              <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', marginTop: 4 }}>{university}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <Chip tone="white" size="sm"><Icon.shield size={10}/> Student</Chip>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 18 }}>
            {[
              { n: String(salesCount), l: 'Sales' },
              { n: '-', l: 'Rating' },
              { n: String(publishedListings.length), l: 'Listings' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.55)', borderRadius: 14, padding: '10px 8px', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 20, color: 'var(--charcoal)', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 10, color: 'var(--charcoal-soft)', fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ padding: '0 20px', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ k: 'listings', l: 'My listings' }, { k: 'reviews', l: 'Reviews' }, { k: 'settings', l: 'Settings' }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k as typeof tab)}
              style={{ background: 'none', border: 'none', padding: '12px 12px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: tab === t.k ? 'var(--charcoal)' : 'var(--fg-muted)', borderBottom: `2px solid ${tab === t.k ? 'var(--sage)' : 'transparent'}`, marginBottom: -1, cursor: 'pointer' }}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {tab === 'listings' && (
        <section style={{ padding: '20px' }}>
          {listings.length === 0 ? (
            <div onClick={() => router.push('/sell')} style={{ background: 'var(--cream-warm)', border: '1.5px dashed var(--sage)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, padding: 32, cursor: 'pointer', color: 'var(--sage-deep)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.sell size={20}/></div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Create your first listing</div>
              <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', textAlign: 'center' }}>Upload notes and start earning today</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {listings.map(l => (
                <div key={l.id} style={{ background: 'var(--white)', borderRadius: 20, border: '1px solid var(--hairline)', padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `var(--${['sage','gold','turquoise','coral'].includes(l.tone) ? l.tone : 'sage'}-soft)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon.doc size={20}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', marginTop: 2 }}>{l.code} · {l.pages} pages</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 16, color: 'var(--charcoal)' }}>R {Number(l.price).toFixed(0)}</div>
                    <Chip tone={l.status === 'published' ? 'sage' : 'neutral'} size="sm" style={{ marginTop: 4 }}>{l.status}</Chip>
                  </div>
                </div>
              ))}
              <div onClick={() => router.push('/sell')} style={{ background: 'var(--cream-warm)', border: '1.5px dashed var(--sage)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', cursor: 'pointer', color: 'var(--sage-deep)' }}>
                <Icon.sell size={16}/>
                <span style={{ fontWeight: 700, fontSize: 13 }}>Add another listing</span>
              </div>
            </div>
          )}
        </section>
      )}

      {tab === 'reviews' && (
        <section style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--fg-muted)' }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 18, color: 'var(--charcoal)', marginBottom: 8 }}>No reviews yet.</div>
          <div style={{ fontSize: 13 }}>Reviews appear after your first sale.</div>
        </section>
      )}

      {tab === 'settings' && (
        <section style={{ padding: '14px 0' }}>
          <div style={{ background: 'var(--white)', margin: '0 16px 12px', borderRadius: 20, border: '1px solid var(--hairline)', overflow: 'hidden' }}>
            <ListRow icon={<Icon.user size={18}/>} label="Personal info" sub={email}/>
            <ListRow icon={<Icon.card size={18}/>} label="Payout method" sub="Not set up yet"/>
            <ListRow icon={<Icon.shield size={18}/>} label="Verification" sub={university} right={<Chip tone="sage" size="sm">Active</Chip>}/>
            <ListRow icon={<Icon.bell size={18}/>} label="Notifications" last/>
          </div>
          <div style={{ background: 'var(--white)', margin: '0 16px 12px', borderRadius: 20, border: '1px solid var(--hairline)', overflow: 'hidden' }}>
            <ListRow icon={<Icon.help size={18}/>} label="Help & support"/>
            <ListRow icon={<Icon.settings size={18}/>} label="App settings" last/>
          </div>
          <div style={{ background: 'var(--white)', margin: '0 16px 12px', borderRadius: 20, border: '1px solid var(--hairline)', overflow: 'hidden' }}>
            <ListRow icon={<Icon.logout size={18}/>} label="Sign out" danger last onClick={signOut} right={null}/>
          </div>
        </section>
      )}
    </Shell>
  )
}
