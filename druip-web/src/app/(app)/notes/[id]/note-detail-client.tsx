'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell } from '@/components/druip/shell'
import { Avatar, Chip, Button, Toast } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'

interface Listing {
  id: string
  title: string
  code: string
  type: string
  description: string | null
  price: number
  pages: number
  tone: string
  file_urls: string[]
  seller_id: string
}

interface Props {
  listing: Listing
  sellerName: string
  previewUrls: string[]
  isOwner: boolean
  alreadyPurchased: boolean
  isSignedIn: boolean
  paymentStatus?: string | null
}

const TONE_COLORS: Record<string, string> = {
  sage: 'var(--sage)', gold: 'var(--gold)', turquoise: 'var(--turquoise)',
  coral: 'var(--coral)', cream: 'var(--cream-deep)',
}

export default function NoteDetailClient({ listing, sellerName, previewUrls, isOwner, alreadyPurchased, isSignedIn, paymentStatus }: Props) {
  const router = useRouter()
  const [toast, setToast] = useState<{ tone: 'sage' | 'gold' | 'coral'; msg: string } | null>(
    paymentStatus === 'success' ? { tone: 'sage', msg: 'Payment successful! Your notes are ready to download.' } :
    paymentStatus === 'cancelled' ? { tone: 'coral', msg: 'Payment cancelled.' } : null
  )

  const accentColor = TONE_COLORS[listing.tone] || 'var(--sage)'
  const sellerInitial = sellerName.charAt(0).toUpperCase()

  return (
    <>
      <Shell hideNav onBack={() => router.back()} title="">

        {/* Cover */}
        <section style={{ padding: '0 20px 20px' }}>
          <div style={{ borderRadius: 24, overflow: 'hidden', background: `linear-gradient(140deg, ${accentColor}22 0%, var(--cream-warm) 100%)`, minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--hairline)', position: 'relative' }}>
            {previewUrls.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, padding: 16, overflowX: 'auto', width: '100%' }}>
                {previewUrls.slice(0, 2).map((url, i) => (
                  <img key={i} src={url} alt={`Page ${i + 1}`} style={{ height: 160, borderRadius: 12, objectFit: 'cover', flexShrink: 0, boxShadow: 'var(--shadow-card)' }}/>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 32, color: accentColor }}>
                <Icon.doc size={48}/>
                <div style={{ fontSize: 13, color: 'var(--charcoal-soft)', fontWeight: 600 }}>{listing.pages} pages</div>
              </div>
            )}
          </div>
        </section>

        {/* Meta */}
        <section style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <Chip tone="white" size="sm">{listing.code}</Chip>
            <Chip tone="white" size="sm">{listing.type}</Chip>
            <Chip tone="white" size="sm"><Icon.doc size={10}/> {listing.pages} pages</Chip>
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 26, lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 0 16px', color: 'var(--charcoal)' }}>
            {listing.title}
          </h1>

          {/* Seller */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--white)', borderRadius: 16, border: '1px solid var(--hairline)' }}>
            <Avatar name={sellerInitial} tone="sage" size={36}/>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--charcoal)' }}>{sellerName}</div>
              <div style={{ fontSize: 11, color: 'var(--charcoal-soft)' }}>Seller</div>
            </div>
          </div>
        </section>

        {/* Description */}
        {listing.description && (
          <section style={{ padding: '0 20px 20px' }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 17, letterSpacing: '-.01em', margin: '0 0 8px', color: 'var(--charcoal)' }}>About these notes</h2>
            <p style={{ fontSize: 14, color: 'var(--charcoal-soft)', lineHeight: 1.6, margin: 0 }}>{listing.description}</p>
          </section>
        )}

        {/* Price + CTA */}
        <section style={{ padding: '0 20px 100px' }}>
          <div style={{ background: 'var(--white)', borderRadius: 24, padding: 20, border: '1px solid var(--hairline)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Price</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 36, color: 'var(--charcoal)', lineHeight: 1, marginTop: 4 }}>
                  R {Number(listing.price).toFixed(0)}
                </div>
              </div>
              <Chip tone="sage" size="sm">New</Chip>
            </div>

            {isOwner ? (
              <div style={{ padding: '12px 16px', background: 'var(--sage-soft)', borderRadius: 14, fontSize: 13, fontWeight: 700, color: 'var(--sage-deep)', textAlign: 'center' }}>
                This is your listing
              </div>
            ) : alreadyPurchased ? (
              <Button variant="primary" size="lg" full onClick={() => setToast({ tone: 'sage', msg: 'Download coming in Phase 4.' })}>
                <Icon.download size={16}/> Download notes
              </Button>
            ) : (
              <>
                <Button variant="gold" size="lg" full onClick={() => {
                  if (!isSignedIn) { router.push('/sign-in'); return }
                  router.push(`/api/payfast/initiate?listing_id=${listing.id}`)
                }}>
                  Buy for R {Number(listing.price).toFixed(0)}
                </Button>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)', textAlign: 'center', marginTop: 10 }}>
                  Secure payment · Instant access after purchase
                </div>
              </>
            )}
          </div>
        </section>
      </Shell>

      {toast && <Toast tone={toast.tone} onClose={() => setToast(null)}>{toast.msg}</Toast>}
    </>
  )
}
