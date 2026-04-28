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

  const previewUrls: string[] = []
  if (user && listing.file_urls?.length) {
    for (const path of listing.file_urls.slice(0, 3)) {
      const { data } = await supabase.storage.from('notes').createSignedUrl(path, 3600)
      if (data?.signedUrl) previewUrls.push(data.signedUrl)
    }
  }

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

  return (
    <NoteDetailClient
      listing={listing}
      sellerName={[seller?.first_name, seller?.last_name].filter(Boolean).join(' ') || 'Anonymous'}
      previewUrls={previewUrls}
      isOwner={isOwner}
      alreadyPurchased={alreadyPurchased}
      isSignedIn={!!user}
      paymentStatus={searchParams.payment ?? null}
    />
  )
}
