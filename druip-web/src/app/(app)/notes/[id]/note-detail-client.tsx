'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
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

interface PreviewItem { url: string; type: 'image' | 'pdf' }

interface Review {
  id: string
  score: number
  comment: string | null
  created_at: string
  reviewer_name: string
}

interface Props {
  listing: Listing
  sellerName: string
  firstPdfUrl: string | null
  coverUrl: string | null
  previewItems: PreviewItem[]
  isOwner: boolean
  alreadyPurchased: boolean
  isSignedIn: boolean
  paymentStatus?: string | null
  avgRating: number
  ratingCount: number
  userRating: number | null
  userReviewComment: string | null
  reviews: Review[]
}

const TONE_COLORS: Record<string, string> = {
  sage: 'var(--sage)', gold: 'var(--gold)', turquoise: 'var(--turquoise)',
  coral: 'var(--coral)', cream: 'var(--cream-deep)',
}

export default function NoteDetailClient({ listing, sellerName, firstPdfUrl, coverUrl, previewItems, isOwner, alreadyPurchased, isSignedIn, paymentStatus, avgRating: initialAvgRating, ratingCount: initialRatingCount, userRating: initialUserRating, userReviewComment: initialUserReviewComment, reviews: initialReviews }: Props) {
  const router = useRouter()
  const [userRating, setUserRating] = useState<number | null>(initialUserRating)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [pdfWidth, setPdfWidth] = useState(335)
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [avgRating, setAvgRating] = useState<number>(initialAvgRating)
  const [ratingCount, setRatingCount] = useState<number>(initialRatingCount)
  const [reviewComment, setReviewComment] = useState<string>(initialUserReviewComment || '')
  const [draftScore, setDraftScore] = useState<number | null>(initialUserRating)
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
    setPdfWidth(Math.min(window.innerWidth - 40, 680))
  }, [])
  const [toast, setToast] = useState<{ tone: 'sage' | 'gold' | 'coral'; msg: string } | null>(
    paymentStatus === 'success' ? { tone: 'sage', msg: 'Payment successful! Good luck studying.' } :
    paymentStatus === 'cancelled' ? { tone: 'coral', msg: 'Payment cancelled.' } : null
  )

  const accentColor = TONE_COLORS[listing.tone] || 'var(--sage)'
  const sellerInitial = sellerName.charAt(0).toUpperCase()

  useEffect(() => {
    if (!isSignedIn || isOwner) return
    async function loadSaved() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('saved_items').select('id').eq('user_id', user.id).eq('listing_id', listing.id).maybeSingle()
      setIsSaved(!!data)
    }
    loadSaved()
  }, [isSignedIn, isOwner, listing.id])

  async function toggleSave() {
    if (!isSignedIn) { router.push('/sign-in'); return }
    if (!userId) return
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    if (isSaved) {
      await supabase.from('saved_items').delete().eq('user_id', userId).eq('listing_id', listing.id)
      setIsSaved(false)
    } else {
      await supabase.from('saved_items').insert({ user_id: userId, listing_id: listing.id })
      setIsSaved(true)
      setToast({ tone: 'sage', msg: 'Saved to your library.' })
    }
  }

  async function submitReview() {
    if (!draftScore) {
      setToast({ tone: 'coral', msg: 'Pick a star rating first.' })
      return
    }
    setSubmittingReview(true)
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmittingReview(false); return }

    const trimmed = reviewComment.trim()
    const { error } = await supabase
      .from('ratings')
      .upsert(
        {
          listing_id: listing.id,
          buyer_id: user.id,
          score: draftScore,
          comment: trimmed || null,
        },
        { onConflict: 'listing_id,buyer_id' }
      )

    if (error) {
      setSubmittingReview(false)
      const msg = /duplicate|unique/i.test(error.message)
        ? 'You\'ve already left a review for these notes.'
        : 'Could not save review. Try again.'
      setToast({ tone: 'coral', msg })
      return
    }

    // Refresh aggregate stats on the listing row
    const { data: allRatings } = await supabase
      .from('ratings')
      .select('score')
      .eq('listing_id', listing.id)
    if (allRatings?.length) {
      const avg = allRatings.reduce((s, r) => s + r.score, 0) / allRatings.length
      await supabase
        .from('listings')
        .update({ avg_rating: Number(avg.toFixed(2)), rating_count: allRatings.length })
        .eq('id', listing.id)
      setAvgRating(Number(avg.toFixed(2)))
      setRatingCount(allRatings.length)
    }

    // Refresh review list inline
    const { data: rows } = await supabase
      .from('ratings')
      .select('id, score, comment, created_at, buyer_id')
      .eq('listing_id', listing.id)
      .order('created_at', { ascending: false })

    const ids = Array.from(new Set((rows || []).map(r => r.buyer_id as string)))
    const nameMap: Record<string, string> = {}
    if (ids.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', ids)
      for (const p of profs || []) {
        const n = [p.first_name, p.last_name].filter(Boolean).join(' ').trim()
        nameMap[p.id as string] = n || 'Student'
      }
    }

    setReviews((rows || []).map(r => ({
      id: r.id as string,
      score: r.score as number,
      comment: (r as { comment?: string | null }).comment ?? null,
      created_at: r.created_at as string,
      reviewer_name: nameMap[r.buyer_id as string] || 'Student',
    })))

    setUserRating(draftScore)
    setSubmittingReview(false)
    setToast({ tone: 'sage', msg: initialUserRating ? 'Review updated.' : 'Thanks for the review!' })
  }

  return (
    <>
      <Shell hideNav onBack={() => router.back()} title=""
        rightAction={!isOwner ? (
          <button onClick={toggleSave} aria-label={isSaved ? 'Unsave' : 'Save'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: isSaved ? 'var(--sage-deep)' : 'var(--fg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.bookmark size={22} fill={isSaved ? 'currentColor' : 'none'}/>
          </button>
        ) : undefined}
      >

        {/* Preview */}
        <section style={{ padding: '0 20px 20px' }}>
          <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid var(--hairline)', position: 'relative', background: `linear-gradient(140deg, ${accentColor}22 0%, var(--cream-warm) 100%)`, minHeight: 180 }}>
            {firstPdfUrl ? (
              <>
                <Document
                  file={firstPdfUrl}
                  loading={<div style={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--charcoal-soft)' }}>Loading preview…</div>}
                  error={<div style={{ minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: accentColor }}><Icon.doc size={40}/><span style={{ fontSize: 12, color: 'var(--charcoal-soft)', fontWeight: 600 }}>{listing.pages} pages</span></div>}
                >
                  <Page pageNumber={1} width={pdfWidth} renderTextLayer={false} renderAnnotationLayer={false}/>
                </Document>
                {!isOwner && !alreadyPurchased && (
                  <>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '52%', background: 'linear-gradient(to bottom, transparent, var(--cream-warm))', pointerEvents: 'none' }}/>
                    <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-card)' }}>
                        <Icon.lock size={20}/>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--charcoal)', background: 'var(--white)', borderRadius: 20, padding: '4px 14px', boxShadow: 'var(--shadow-card)' }}>
                        {listing.pages} pages · Buy to unlock
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : coverUrl ? (
              <div style={{ position: 'relative', width: '100%' }}>
                <img src={coverUrl} alt="Preview" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }}/>
                {!isOwner && !alreadyPurchased && <>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to bottom, transparent, var(--cream-warm))' }}/>
                  <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-card)' }}><Icon.lock size={18}/></div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--charcoal)', background: 'var(--white)', borderRadius: 20, padding: '4px 12px', boxShadow: 'var(--shadow-card)' }}>{listing.pages} pages · Buy to unlock</div>
                  </div>
                </>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 32, minHeight: 180, justifyContent: 'center', color: accentColor }}>
                <Icon.doc size={48}/>
                <div style={{ fontSize: 13, color: 'var(--charcoal-soft)', fontWeight: 600 }}>{listing.pages} pages</div>
              </div>
            )}
          </div>
        </section>

        {/* Meta */}
        <section style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            <Chip tone="white" size="sm">{listing.code}</Chip>
            <Chip tone="white" size="sm">{listing.type}</Chip>
            <Chip tone="white" size="sm"><Icon.doc size={10}/> {listing.pages} pages</Chip>
            {ratingCount > 0 && (
              <Chip tone="white" size="sm">
                <span style={{ color: 'var(--gold-deep)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Icon.star size={10} fill="currentColor"/>
                  {Number(avgRating).toFixed(1)}
                </span>
                <span style={{ color: 'var(--charcoal-soft)', marginLeft: 2 }}>({ratingCount})</span>
              </Chip>
            )}
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

        {/* Leave-a-review widget — paid buyers only */}
        {alreadyPurchased && (
          <section style={{ padding: '0 20px 20px' }}>
            <div style={{ background: 'var(--white)', borderRadius: 20, padding: '16px 20px', border: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
                {userRating ? 'Your review' : 'Leave a review'}
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map(star => {
                  const filled = star <= (hoverRating ?? draftScore ?? 0)
                  return (
                    <button key={star} type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setDraftScore(star)}
                      aria-label={`${star} star${star === 1 ? '' : 's'}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: filled ? 'var(--gold-deep)' : 'var(--hairline)', transition: 'color 150ms' }}>
                      <Icon.star size={28} fill={filled ? 'currentColor' : 'none'}/>
                    </button>
                  )
                })}
              </div>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Share what made these notes useful (optional)"
                rows={3}
                style={{ width: '100%', padding: '12px 14px', background: 'var(--cream-warm)', border: '1.5px solid transparent', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--charcoal)', outline: 'none', boxSizing: 'border-box', resize: 'none' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--sage)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'transparent')}
              />
              <button
                onClick={submitReview}
                disabled={submittingReview || !draftScore}
                style={{
                  marginTop: 12, width: '100%', padding: '12px 16px',
                  background: !draftScore ? 'var(--cream-warm)' : 'var(--sage)',
                  color: !draftScore ? 'var(--fg-muted)' : '#fff',
                  border: 'none', borderRadius: 12,
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14,
                  cursor: submittingReview || !draftScore ? 'not-allowed' : 'pointer',
                }}>
                {submittingReview ? 'Saving…' : userRating ? 'Update review' : 'Submit review'}
              </button>
            </div>
          </section>
        )}

        {/* Reviews list */}
        {reviews.length > 0 && (
          <section style={{ padding: '0 20px 20px' }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 17, letterSpacing: '-.01em', margin: '0 0 10px', color: 'var(--charcoal)' }}>
              Reviews <span style={{ fontSize: 13, color: 'var(--fg-muted)', fontWeight: 600 }}>({reviews.length})</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reviews.map(r => (
                <div key={r.id} style={{ background: 'var(--white)', borderRadius: 16, padding: '14px 16px', border: '1px solid var(--hairline)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--charcoal)' }}>{r.reviewer_name}</div>
                    <div style={{ display: 'flex', gap: 2, color: 'var(--gold-deep)' }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Icon.star key={s} size={13} fill={s <= r.score ? 'currentColor' : 'none'}/>
                      ))}
                    </div>
                  </div>
                  {r.comment && (
                    <div style={{ fontSize: 13, color: 'var(--charcoal-soft)', lineHeight: 1.5, marginTop: 4 }}>{r.comment}</div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 6 }}>
                    {new Date(r.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
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
              <Button variant="primary" size="lg" full onClick={() => router.push(`/notes/${listing.id}/view`)}>
                <Icon.doc size={16}/> View notes
              </Button>
            ) : (
              <>
                <Button variant="gold" size="lg" full onClick={() => {
                  if (!isSignedIn) { router.push('/sign-in'); return }
                  router.push(`/api/paystack/initiate?listing_id=${listing.id}`)
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
