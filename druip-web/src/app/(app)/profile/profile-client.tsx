'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shell } from '@/components/druip/shell'
import { Avatar, Button, Chip, ListRow, Toast } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'

interface Listing {
  id: string
  title: string
  code: string
  price: number
  pages: number
  tone: string
  status: string
  description: string
  created_at: string
}

interface ReceivedReview {
  id: string
  listing_id: string
  listing_title: string
  reviewer_name: string
  score: number
  comment: string | null
  created_at: string
}

interface Props {
  firstName: string
  lastName: string
  email: string
  university: string
  roles: string[]
  listings: Listing[]
  salesCount: number
  applicationStatus: 'pending' | 'approved' | 'denied' | null
  reviewerNotes: string | null
  receivedReviews: ReceivedReview[]
}

const ROLE_TONES: Record<string, 'white' | 'gold' | 'turquoise' | 'sage'> = {
  Student: 'white',
  Seller: 'gold',
  Lecturer: 'gold',
  Teacher: 'turquoise',
  Scholar: 'sage',
}

const AVATAR_TONES = ['sage', 'gold', 'turquoise', 'coral'] as const
type AvatarTone = typeof AVATAR_TONES[number]

export default function ProfileClient({ firstName, lastName, email, university, roles, listings: initialListings, salesCount, applicationStatus, reviewerNotes, receivedReviews }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'listings' | 'reviews' | 'settings'>('listings')
  const [avatarTone, setAvatarTone] = useState<AvatarTone>('sage')
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [toast, setToast] = useState<{ tone: 'sage' | 'gold' | 'coral'; msg: string } | null>(null)

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCode, setEditCode] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPrice, setEditPrice] = useState<string>('')
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null)
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('druip_avatar_tone') as AvatarTone | null
    if (stored && (AVATAR_TONES as readonly string[]).includes(stored)) setAvatarTone(stored)
  }, [])

  function pickAvatarTone(tone: AvatarTone) {
    setAvatarTone(tone)
    localStorage.setItem('druip_avatar_tone', tone)
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function openEdit(l: Listing) {
    setEditingId(l.id)
    setEditTitle(l.title)
    setEditCode(l.code || '')
    setEditDesc(l.description || '')
    setEditPrice(String(l.price))
    setEditCoverFile(null)
    setEditCoverPreview(null)
  }

  function closeEdit() {
    setEditingId(null)
    setEditCoverFile(null)
    setEditCoverPreview(null)
  }

  async function saveEdit() {
    if (!editingId || !editTitle.trim()) return
    setSaving(true)

    let coverPath: string | undefined
    if (editCoverFile) {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const safeName = editCoverFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `${user.id}/covers/${Date.now()}-${safeName}`
        const { error: uploadErr } = await supabase.storage.from('notes').upload(path, editCoverFile)
        if (!uploadErr) coverPath = path
      }
    }

    const body: Record<string, unknown> = {
      title: editTitle.trim(),
      code: editCode.trim(),
      description: editDesc.trim(),
      price: Number(editPrice) || 0,
    }
    if (coverPath !== undefined) body.cover_url = coverPath

    const res = await fetch(`/api/listings/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setToast({ tone: 'coral', msg: data.error || 'Something went wrong.' })
      return
    }

    setListings(prev => prev.map(l =>
      l.id === editingId
        ? { ...l, title: editTitle.trim(), code: editCode.trim(), description: editDesc.trim(), price: Number(editPrice) || 0 }
        : l
    ))
    setToast({ tone: 'sage', msg: 'Listing updated.' })
    closeEdit()
  }

  async function confirmDelete() {
    if (!deletingId) return
    setDeleting(true)

    const res = await fetch(`/api/listings/${deletingId}`, { method: 'DELETE' })
    setDeleting(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setToast({ tone: 'coral', msg: data.error || 'Could not delete listing.' })
      setDeletingId(null)
      return
    }

    setListings(prev => prev.filter(l => l.id !== deletingId))
    setToast({ tone: 'sage', msg: 'Listing deleted.' })
    setDeletingId(null)
  }

  const publishedListings = listings.filter(l => l.status === 'published')
  const displayRoles = roles.length > 0 ? roles : ['Student']
  const avgReceivedScore = receivedReviews.length > 0
    ? receivedReviews.reduce((s, r) => s + r.score, 0) / receivedReviews.length
    : 0

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', background: 'var(--cream-warm)',
    border: '1.5px solid transparent', borderRadius: 14,
    fontFamily: 'Nunito, sans-serif', fontSize: 15, outline: 'none',
    boxSizing: 'border-box', color: 'var(--charcoal)',
  }

  return (
    <>
      <Shell title="You" sticky>
        <section style={{ padding: '8px 20px 20px' }}>
          <div style={{ background: 'linear-gradient(140deg, var(--cream-warm) 0%, var(--gold-soft) 100%)', borderRadius: 28, padding: 22, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar name={firstName} tone={avatarTone} size={64}/>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 22, lineHeight: 1.1, letterSpacing: '-.02em', margin: 0, color: 'var(--charcoal)' }}>{firstName} {lastName}</h1>
                <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', marginTop: 4 }}>{university}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {displayRoles.map(r => (
                    <Chip key={r} tone={ROLE_TONES[r] || 'white'} size="sm">
                      <Icon.shield size={10}/> {r}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--charcoal-soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginRight: 2 }}>Colour</span>
              {AVATAR_TONES.map(t => (
                <button key={t} onClick={() => pickAvatarTone(t)}
                  style={{ width: 22, height: 22, borderRadius: '50%', background: `var(--${t})`, border: `2.5px solid ${avatarTone === t ? 'var(--charcoal)' : 'transparent'}`, outline: avatarTone === t ? '1.5px solid rgba(255,255,255,0.7)' : 'none', outlineOffset: -4, cursor: 'pointer', padding: 0, transition: 'border-color 200ms', flexShrink: 0 }}/>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16 }}>
              {[
                { n: String(salesCount), l: 'Sales' },
                { n: receivedReviews.length === 0 ? '-' : avgReceivedScore.toFixed(1), l: 'Rating' },
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
                  <div key={l.id}>
                    {deletingId === l.id ? (
                      <div style={{ background: 'var(--white)', borderRadius: 20, border: '1.5px solid var(--coral)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)' }}>Delete &ldquo;{l.title}&rdquo;?</div>
                        <div style={{ fontSize: 13, color: 'var(--charcoal-soft)', lineHeight: 1.5 }}>This cannot be undone. Buyers who already purchased it will lose access.</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button variant="ghost" size="sm" onClick={() => setDeletingId(null)}>Cancel</Button>
                          <Button variant="primary" size="sm" onClick={confirmDelete} disabled={deleting}
                            style={{ background: 'var(--coral)', flex: 1 }}>
                            {deleting ? 'Deleting...' : 'Yes, delete'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: 'var(--white)', borderRadius: 20, border: '1px solid var(--hairline)', padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: `var(--${['sage','gold','turquoise','coral'].includes(l.tone) ? l.tone : 'sage'}-soft)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon.doc size={20}/>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', marginTop: 2 }}>{l.code} · {l.pages} pages · R {Number(l.price).toFixed(0)}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button onClick={() => openEdit(l)} aria-label="Edit listing"
                            style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--cream-warm)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--charcoal-soft)' }}>
                            <Icon.edit size={15}/>
                          </button>
                          <button onClick={() => setDeletingId(l.id)} aria-label="Delete listing"
                            style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--cream-warm)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--coral)' }}>
                            <Icon.trash size={15}/>
                          </button>
                        </div>
                      </div>
                    )}
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
          <section style={{ padding: '20px' }}>
            {receivedReviews.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--fg-muted)' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 18, color: 'var(--charcoal)', marginBottom: 8 }}>No reviews yet.</div>
                <div style={{ fontSize: 13 }}>Reviews appear after buyers rate your notes.</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 28, color: 'var(--charcoal)', lineHeight: 1 }}>
                    {avgReceivedScore.toFixed(1)}
                  </div>
                  <div style={{ display: 'flex', gap: 2, color: 'var(--gold-deep)' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Icon.star key={s} size={14} fill={s <= Math.round(avgReceivedScore) ? 'currentColor' : 'none'}/>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginLeft: 4 }}>
                    {receivedReviews.length} review{receivedReviews.length === 1 ? '' : 's'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {receivedReviews.map(r => (
                    <div key={r.id}
                      onClick={() => router.push(`/notes/${r.listing_id}`)}
                      style={{ background: 'var(--white)', borderRadius: 16, padding: '14px 16px', border: '1px solid var(--hairline)', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, paddingRight: 8 }}>
                          {r.listing_title}
                        </div>
                        <div style={{ display: 'flex', gap: 2, color: 'var(--gold-deep)', flexShrink: 0 }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <Icon.star key={s} size={12} fill={s <= r.score ? 'currentColor' : 'none'}/>
                          ))}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 6 }}>{r.reviewer_name}</div>
                      {r.comment && (
                        <div style={{ fontSize: 13, color: 'var(--charcoal-soft)', lineHeight: 1.5 }}>{r.comment}</div>
                      )}
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 8 }}>
                        {new Date(r.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {tab === 'settings' && (
          <section style={{ padding: '14px 0' }}>
            <div style={{ background: 'var(--white)', margin: '0 16px 12px', borderRadius: 20, border: '1px solid var(--hairline)', overflow: 'hidden' }}>
              {listings.length > 0 ? (
                <ListRow icon={<Icon.zap size={18}/>} label="Earnings" sub="View sales and cash out" onClick={() => router.push('/earnings')}/>
              ) : applicationStatus === 'pending' ? (
                <ListRow icon={<Icon.zap size={18}/>} label="Application under review" sub="We'll notify you once approved"/>
              ) : applicationStatus === 'denied' ? (
                <ListRow icon={<Icon.zap size={18}/>} label="Reapply to sell" sub={reviewerNotes || 'Your application was not approved'} onClick={() => router.push('/apply-to-sell')}/>
              ) : (
                <ListRow icon={<Icon.zap size={18}/>} label="Earn from your notes" sub="Apply to become a seller" onClick={() => router.push('/apply-to-sell')}/>
              )}
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

      {editingId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={closeEdit} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}/>
          <div style={{ position: 'relative', background: 'var(--cream)', borderRadius: '28px 28px 0 0', padding: '24px 20px 40px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 20, color: 'var(--charcoal)' }}>Edit listing</div>
              <button onClick={closeEdit} style={{ background: 'var(--cream-warm)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--charcoal-soft)' }}>
                <Icon.close size={16}/>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--charcoal-soft)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Title</div>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={inputStyle} placeholder="Title"/>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--charcoal-soft)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Module code</div>
                <input value={editCode} onChange={e => setEditCode(e.target.value)} style={inputStyle} placeholder="e.g. PHYS 201"/>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--charcoal-soft)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Price (R)</div>
                <input value={editPrice} onChange={e => setEditPrice(e.target.value)} style={inputStyle} type="number" min={0} placeholder="45"/>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--charcoal-soft)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Description</div>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ ...inputStyle, resize: 'none', minHeight: 90 }} placeholder="What's in these notes?"/>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--charcoal-soft)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Cover image</div>
                <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  setEditCoverFile(f)
                  setEditCoverPreview(URL.createObjectURL(f))
                  e.target.value = ''
                }}/>
                {editCoverPreview ? (
                  <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', width: 80, height: 80 }}>
                    <img src={editCoverPreview} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                    <button onClick={() => { setEditCoverFile(null); setEditCoverPreview(null) }}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 6, width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Icon.close size={10}/>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => coverInputRef.current?.click()}
                    style={{ background: 'var(--cream-warm)', border: '1.5px dashed var(--sage)', borderRadius: 14, padding: '14px 20px', cursor: 'pointer', fontSize: 13, color: 'var(--sage-deep)', fontWeight: 700, width: '100%', textAlign: 'center' }}>
                    Replace cover image
                  </button>
                )}
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              <Button variant="ghost" size="md" onClick={closeEdit}>Cancel</Button>
              <Button variant="primary" size="md" full onClick={saveEdit} disabled={saving || !editTitle.trim()}>
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast tone={toast.tone} onClose={() => setToast(null)}>{toast.msg}</Toast>}
    </>
  )
}
