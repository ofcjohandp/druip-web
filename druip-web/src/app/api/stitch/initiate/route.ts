import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPaymentRequest } from '@/lib/stitch'

export async function GET(request: NextRequest) {
  const listingId = request.nextUrl.searchParams.get('listing_id')
  if (!listingId) return NextResponse.json({ error: 'Missing listing_id' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/sign-in', request.url))

  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, price, seller_id')
    .eq('id', listingId)
    .eq('status', 'published')
    .single()

  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  if (listing.seller_id === user.id) return NextResponse.json({ error: 'Cannot buy your own listing' }, { status: 400 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`

  try {
    const payment = await createPaymentRequest({
      amountRands: Number(listing.price),
      externalReference: `${listingId}:${user.id}`,
      redirectUri: `${baseUrl}/api/stitch/callback`,
    })
    return NextResponse.redirect(payment.url)
  } catch (err) {
    console.error('Stitch initiate error:', err)
    return NextResponse.redirect(`${baseUrl}/notes/${listingId}?payment=error`)
  }
}
