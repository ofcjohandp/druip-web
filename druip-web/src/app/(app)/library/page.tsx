'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shell } from '@/components/druip/shell'
import { Button, NoteCard, Skeleton, Toast } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'
import type { Pack } from '@/components/druip/ui'

const VALID_TONES = ['sage', 'gold', 'turquoise', 'coral', 'cream'] as const

export default function LibraryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'saved' ? 'saved' : 'mine'
  const [tab, setTab] = useState<'saved' | 'mine'>(initialTab)
  const [saved, setSaved] = useState<Pack[]>([])
  const [mine, setMine] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [showPersonalForm, setShowPersonalForm] = useState(false)
  const [personalTitle, setPersonalTitle] = useState('')
  const [personalDesc, setPersonalDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ tone: 'sage' | 'gold' | 'coral'; msg: string } | null>(null)

  async function load() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/sign-in'); return }

    const [savedRes, mineRes] = await Promise.all([
      supabase.from('saved_items').select('listing_id, listings(*)').eq('user_id', user.id),
      supabase.from('listings').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
    ])

    const toPack = (l: any): Pack => ({
      id: l.id, code: l.code || '', faculty: l.faculty,
      tone: (VALID_TONES.includes(l.tone) ? l.tone : 'sage') as Pack['tone'],
      thumb: '', title: l.title, pages: l.pages || 0, rating: 0,
      seller: '', price: l.status === 'personal' ? 'Personal' : `R ${Number(l.price).toFixed(0)}`,
      desc: l.description,
      badge: l.status === 'personal' ? 'Personal' : undefined,
      badgeTone: l.status === 'personal' ? 'turquoise' : 'sage',
    })

    setSaved((savedRes.data || []).map((s: any) => s.listings).filter(Boolean).map(toPack))
    setMine((mineRes.data || []).map(toPack))
    setLoading(false)
  }

  useEffect(() => { load() }, [router])

  async function createPersonalNote() {
    if (!personalTitle.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/sign-in'); return }

    const { error } = await supabase.from('listings').insert({
      seller_id: user.id,
      title: personalTitle.trim(),
      description: personalDesc.trim(),
      code: '',
      type: 'Notes',
      faculty: '',
      tone: 'turquoise',
      price: 0,
      pages: 0,
      file_urls: [],
      status: 'personal',
    })

    setSaving(false)
    if (error) { setToast({ tone: 'coral', msg: 'Could not save. Try again.' }); return }
    setPersonalTitle('')
    setPersonalDesc('')
    setShowPersonalForm(false)
    setToast({ tone: 'sage', msg: 'Personal note saved.' })
    load()
  }

  const tabBtn = (key: 'saved' | 'mine', label: string) => (
    <button onClick={() => setTab(key)}
      style={{ flex: 1, padding: '10px', background: 'none', border: 'none', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: tab === key ? 'var(--charcoal)' : 'var(--fg-muted)', borderBottom: `2px solid ${tab === key ? 'var(--sage)' : 'transparent'}`, marginBottom: -1, cursor: 'pointer' }}>
      {label}
    </button>
  )

  const inputStyle = { width: '100%', padding: '12px 14px', background: 'var(--cream-warm)', border: '1.5px solid transparent', borderRadius: 14, fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--charcoal)', outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color 200ms' }

  return (
    <>
      <Shell title="Library" sticky>
        <div style={{ padding: '0 20px', borderBottom: '1px solid var(--hairline)', display: 'flex' }}>
          {tabBtn('saved', 'Wishlist')}
          {tabBtn('mine', 'My Notes')}
        </div>

        <section style={{ padding: '20px 20px 100px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[1,2,3,4].map(i => <Skeleton key={i} h={200} r={20}/>)}
            </div>
          ) : tab === 'saved' ? (
            saved.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--turquoise-soft)', color: 'var(--turquoise-deep, #2a7a7a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Icon.bookmark size={24}/></div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 6 }}>Your wishlist is empty.</div>
                <div style={{ fontSize: 13, color: 'var(--charcoal-soft)', marginBottom: 20 }}>Save notes you like and find them here.</div>
                <Button variant="primary" size="sm" onClick={() => router.push('/browse')}>Shop notes</Button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {saved.map(p => <NoteCard key={p.id} pack={p} saved onClick={() => router.push(`/notes/${p.id}`)} onSave={() => {}}/>)}
              </div>
            )
          ) : (
            <>
              {mine.length === 0 && !showPersonalForm ? (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--sage-soft)', color: 'var(--sage-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Icon.doc size={24}/></div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 6 }}>No notes yet.</div>
                  <div style={{ fontSize: 13, color: 'var(--charcoal-soft)', marginBottom: 20 }}>Upload notes to sell, or create personal ones to study.</div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <Button variant="primary" size="sm" onClick={() => router.push('/sell')}>Sell notes</Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowPersonalForm(true)}>+ Personal</Button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {mine.map(p => (
                    <div key={p.id} onClick={() => p.price !== 'Personal' ? router.push(`/notes/${p.id}`) : undefined}
                      style={{ background: 'var(--white)', borderRadius: 20, border: '1px solid var(--hairline)', padding: '16px', display: 'flex', alignItems: 'center', gap: 14, cursor: p.price !== 'Personal' ? 'pointer' : 'default' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: `var(--${p.tone}-soft)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: `var(--${p.tone}-deep)` }}>
                        <Icon.doc size={20}/>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', marginTop: 2 }}>{p.price === 'Personal' ? 'Personal note' : `${p.code} · ${p.pages} pages · ${p.price}`}</div>
                      </div>
                      {p.price !== 'Personal' && <Icon.chevron size={16}/>}
                    </div>
                  ))}
                  {!showPersonalForm && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => router.push('/sell')} style={{ flex: 1, padding: '14px', background: 'var(--cream-warm)', border: '1.5px dashed var(--sage)', borderRadius: 20, color: 'var(--sage-deep)', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <Icon.sell size={16}/> Sell notes
                      </button>
                      <button onClick={() => setShowPersonalForm(true)} style={{ flex: 1, padding: '14px', background: 'var(--cream-warm)', border: '1.5px dashed var(--turquoise, #4aa8a0)', borderRadius: 20, color: 'var(--turquoise-deep, #2a7a7a)', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <Icon.doc size={16}/> + Personal
                      </button>
                    </div>
                  )}
                </div>
              )}

              {showPersonalForm && (
                <div style={{ background: 'var(--white)', borderRadius: 24, border: '1px solid var(--hairline)', padding: 20, marginTop: mine.length > 0 ? 16 : 0 }}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 17, color: 'var(--charcoal)', marginBottom: 14 }}>New personal note</div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--charcoal-soft)', marginBottom: 6 }}>Title</label>
                    <input value={personalTitle} onChange={e => setPersonalTitle(e.target.value)}
                      placeholder="e.g. Anatomy - Chapter 4 summary"
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--sage)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'transparent')}/>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--charcoal-soft)', marginBottom: 6 }}>Notes (optional)</label>
                    <textarea value={personalDesc} onChange={e => setPersonalDesc(e.target.value)}
                      placeholder="Add any notes or context here..."
                      rows={3}
                      style={{ ...inputStyle, resize: 'none' as const }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--sage)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'transparent')}/>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="primary" size="sm" onClick={createPersonalNote} disabled={saving || !personalTitle.trim()}>
                      {saving ? 'Saving...' : 'Save note'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setShowPersonalForm(false); setPersonalTitle(''); setPersonalDesc('') }}>Cancel</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </Shell>

      {toast && <Toast tone={toast.tone} onClose={() => setToast(null)}>{toast.msg}</Toast>}
    </>
  )
}
