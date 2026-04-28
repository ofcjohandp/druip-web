'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shell } from '@/components/druip/shell'
import { Chip, NoteCard, IconButton, Skeleton } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'
import type { Pack } from '@/components/druip/ui'

const FACULTIES = ['All', 'Health Sci', 'Engineering', 'Law', 'Commerce', 'Education', 'Natural Sciences', 'Arts', 'Theology']
const VALID_TONES = ['sage', 'gold', 'turquoise', 'coral', 'cream'] as const

export default function BrowsePage() {
  const router = useRouter()
  const [faculty, setFaculty] = useState('All')
  const [query, setQuery] = useState('')
  const [listings, setListings] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (user && listingsData?.length) {
        const { data: savedData } = await supabase
          .from('saved_items')
          .select('listing_id')
          .eq('user_id', user.id)
        setSaved(new Set((savedData || []).map((s: any) => s.listing_id)))
      }

      if (!listingsData?.length) { setLoading(false); return }

      const sellerIds = Array.from(new Set(listingsData.map((l: any) => l.seller_id)))
      const { data: profilesData } = await supabase
        .from('profiles').select('id, first_name, last_name').in('id', sellerIds)
      const profileMap = Object.fromEntries((profilesData || []).map((p: any) => [p.id, p]))

      setListings(listingsData.map((l: any) => ({
        id: l.id,
        code: l.code,
        faculty: l.faculty,
        tone: (VALID_TONES.includes(l.tone) ? l.tone : 'sage') as Pack['tone'],
        thumb: '',
        title: l.title,
        pages: l.pages,
        rating: 0,
        seller: [profileMap[l.seller_id]?.first_name, profileMap[l.seller_id]?.last_name].filter(Boolean).join(' ') || 'Anonymous',
        price: `R ${Number(l.price).toFixed(0)}`,
        desc: l.description,
        badge: 'New',
        badgeTone: 'sage',
      })))
      setLoading(false)
    }
    init()
  }, [])

  const filtered = listings.filter(p => {
    const matchFaculty = faculty === 'All' || p.faculty === faculty
    const matchQuery = !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.code.toLowerCase().includes(query.toLowerCase())
    return matchFaculty && matchQuery
  })

  const toggleSave = async (id: string) => {
    if (!userId) { router.push('/sign-in'); return }
    const isSaved = saved.has(id)
    setSaved(s => { const n = new Set(s); isSaved ? n.delete(id) : n.add(id); return n })
    const supabase = createClient()
    if (isSaved) {
      await supabase.from('saved_items').delete().eq('user_id', userId).eq('listing_id', id)
    } else {
      await supabase.from('saved_items').insert({ user_id: userId, listing_id: id })
    }
  }

  return (
    <Shell title="Browse" sticky
      rightAction={<IconButton ariaLabel="filter"><Icon.filter size={18}/></IconButton>}
    >
      <section style={{ padding: '0 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--white)', borderRadius: 16, padding: '0 16px', border: '1px solid var(--hairline)' }}>
          <Icon.search size={16}/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search notes, course codes…"
            style={{ flex: 1, border: 'none', outline: 'none', padding: '14px 0', fontFamily: 'Nunito, sans-serif', fontSize: 14, background: 'transparent', color: 'var(--charcoal)' }}/>
          {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', display: 'flex' }}><Icon.close size={14}/></button>}
        </div>
      </section>

      <section style={{ padding: '0 0 20px' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 20px', scrollbarWidth: 'none' }}>
          {FACULTIES.map(f => (
            <Chip key={f} active={faculty === f} tone={faculty === f ? 'neutral' : 'white'} onClick={() => setFaculty(f)} style={{ flexShrink: 0 }}>{f}</Chip>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 20px 100px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} h={220} r={20}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 6 }}>
              {listings.length === 0 ? 'No notes listed yet.' : 'No notes found.'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--charcoal-soft)' }}>
              {listings.length === 0 ? 'Be the first to sell your notes.' : 'Try a different search or faculty.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {filtered.map(p => (
              <NoteCard key={p.id} pack={p} saved={saved.has(p.id)}
                onClick={() => router.push(`/notes/${p.id}`)}
                onSave={() => toggleSave(p.id)}/>
            ))}
          </div>
        )}
      </section>
    </Shell>
  )
}
