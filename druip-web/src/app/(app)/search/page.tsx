'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shell } from '@/components/druip/shell'
import { NoteCard, Skeleton } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'
import type { Pack } from '@/components/druip/ui'

const VALID_TONES = ['sage', 'gold', 'turquoise', 'coral', 'cream'] as const

export default function SearchPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Pack[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearched(false); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,code.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(30)

      if (!listingsData?.length) { setResults([]); setLoading(false); setSearched(true); return }

      const sellerIds = Array.from(new Set(listingsData.map((l: any) => l.seller_id)))
      const { data: profilesData } = await supabase
        .from('profiles').select('id, first_name, last_name').in('id', sellerIds)
      const profileMap = Object.fromEntries((profilesData || []).map((p: any) => [p.id, p]))

      setResults(listingsData.map((l: any) => ({
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
      })))
      setLoading(false)
      setSearched(true)
    }, 350)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <Shell hideNav onBack={() => router.back()} title="">
      {/* Search bar */}
      <section style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--white)', borderRadius: 16, padding: '0 16px', border: '1.5px solid var(--sage)', boxShadow: '0 0 0 3px var(--sage-soft)' }}>
          <Icon.search size={16}/>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search notes, course codes, subjects…"
            style={{ flex: 1, border: 'none', outline: 'none', padding: '14px 0', fontFamily: 'Nunito, sans-serif', fontSize: 14, background: 'transparent', color: 'var(--charcoal)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', display: 'flex' }}>
              <Icon.close size={14}/>
            </button>
          )}
        </div>
      </section>

      {/* Results */}
      <section style={{ padding: '0 20px 100px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} h={220} r={20}/>)}
          </div>
        ) : !query.trim() ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--fg-muted)' }}>
            <Icon.search size={32}/>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)', marginTop: 12, marginBottom: 6 }}>Search for notes</div>
            <div style={{ fontSize: 13 }}>Try a course code like "FISI 111" or a subject like "Physiology"</div>
          </div>
        ) : searched && results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 6 }}>No results for "{query}"</div>
            <div style={{ fontSize: 13, color: 'var(--charcoal-soft)' }}>Try a different search or browse by faculty.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {results.map(p => (
              <NoteCard key={p.id} pack={p} onClick={() => router.push(`/notes/${p.id}`)}/>
            ))}
          </div>
        )}
      </section>
    </Shell>
  )
}
