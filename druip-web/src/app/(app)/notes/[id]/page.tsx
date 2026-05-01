import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import NoteDetailClient from './note-detail-client'

export default async function NoteDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { payment?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'published')
    .single()

  if (!listing) notFound()

  const { data: seller } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', listing.seller_id)
    .single()

  const isOwner = user?.id === listing.seller_id

  let alreadyPurchased = false
  if (user && !isOwner) {
    const { data } = await supabase
      .from('purchases')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('listing_id', listing.id)
      .maybeSingle()
    alreadyPurchased = !!data
  }

  // Generate cover URL — priority: dedicated cover, then first image file, else null
  let coverSignedUrl: string | null = null
  if (listing.cover_url) {
    const { data } = await supabase.storage.from('notes').createSignedUrl(listing.cover_url, 3600)
    coverSignedUrl = data?.signedUrl ?? null
  }
  if (!coverSignedUrl && listing.file_urls?.length) {
    const firstImage = (listing.file_urls as string[]).find(p => !p.toLowerCase().includes('.pdf'))
    if (firstImage) {
      const { data } = await supabase.storage.from('notes').createSignedUrl(firstImage, 3600)
      coverSignedUrl = data?.signedUrl ?? null
    }
  }

  const previewItems: { url: string; type: 'image' | 'pdf' }[] = []
  if ((isOwner || alreadyPurchased) && listing.file_urls?.length) {
    for (const path of listing.file_urls) {
      const { data } = await supabase.storage.from('notes').createSignedUrl(path, 3600)
      if (data?.signedUrl) {
        const isPdf = path.toLowerCase().includes('.pdf')
        previewItems.push({ url: data.signedUrl, type: isPdf ? 'pdf' : 'image' })
      }
    }
  }

  let userRating: number | null = null
  if (user && alreadyPurchased) {
    const { data: ratingData } = await supabase
      .from('ratings')
      .select('score')
      .eq('listing_id', listing.id)
      .eq('buyer_id', user.id)
      .maybeSingle()
    userRating = ratingData?.score ?? null
  }

  return (
    <NoteDetailClient
      listing={listing}
      sellerName={[seller?.first_name, seller?.last_name].filter(Boolean).join(' ') || 'Anonymous'}
      coverUrl={coverSignedUrl}
      previewItems={previewItems}
      isOwner={isOwner}
      alreadyPurchased={alreadyPurchased}
      isSignedIn={!!user}
      paymentStatus={searchParams.payment ?? null}
      avgRating={listing.avg_rating ?? 0}
      ratingCount={listing.rating_count ?? 0}
      userRating={userRating}
    />
  )
}
