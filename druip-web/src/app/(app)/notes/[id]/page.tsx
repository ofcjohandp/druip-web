import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'

const NoteDetailClient = dynamic(() => import('./note-detail-client'), { ssr: false })

export default async function NoteDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { payment?: string } }) {
  const supabase = await createClient()
  // Service role client bypasses RLS for storage signed URL generation
  const storage = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

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

  // Cover URL: dedicated cover first, then first image file, then first PDF
  let coverSignedUrl: string | null = null
  const filePaths: string[] = Array.isArray(listing.file_urls) ? listing.file_urls : []

  if (listing.cover_url) {
    if (listing.cover_url.startsWith('http')) {
      coverSignedUrl = listing.cover_url
    } else {
      const { data } = await storage.storage.from('notes').createSignedUrl(listing.cover_url, 3600)
      coverSignedUrl = data?.signedUrl ?? null
    }
  }
  if (!coverSignedUrl && filePaths.length) {
    const firstImage = filePaths.find(p => !p.toLowerCase().endsWith('.pdf'))
    const fallbackPath = firstImage ?? filePaths[0]
    if (fallbackPath.startsWith('http')) {
      coverSignedUrl = fallbackPath
    } else {
      const { data } = await storage.storage.from('notes').createSignedUrl(fallbackPath, 3600)
      coverSignedUrl = data?.signedUrl ?? null
    }
  }

  // First PDF signed URL — available to all users for the preview
  let firstPdfSignedUrl: string | null = null
  const firstPdfPath = filePaths.find(p => p.toLowerCase().endsWith('.pdf'))
  if (firstPdfPath) {
    if (firstPdfPath.startsWith('http')) {
      firstPdfSignedUrl = firstPdfPath
    } else {
      const { data } = await storage.storage.from('notes').createSignedUrl(firstPdfPath, 3600)
      firstPdfSignedUrl = data?.signedUrl ?? null
    }
  }

  const previewItems: { url: string; type: 'image' | 'pdf' }[] = []
  if ((isOwner || alreadyPurchased) && filePaths.length) {
    for (const path of filePaths) {
      const { data } = await storage.storage.from('notes').createSignedUrl(path, 3600)
      if (data?.signedUrl) {
        const isPdf = path.toLowerCase().endsWith('.pdf')
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

  // Strip raw storage paths — only needed server-side, not safe to send to client
  const listingForClient = { ...listing, file_urls: [] }

  return (
    <NoteDetailClient
      listing={listingForClient}
      sellerName={[seller?.first_name, seller?.last_name].filter(Boolean).join(' ') || 'Anonymous'}
      firstPdfUrl={firstPdfSignedUrl}
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
