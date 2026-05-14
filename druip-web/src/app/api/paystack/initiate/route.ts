import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializeTransaction } from '@/lib/paystack'

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
  const reference = `druip_${listingId}_${user.id}_${Date.now()}`

  try {
    const { authorization_url } = await initializeTransaction({
      amountRands: Number(listing.price),
      email: user.email!,
      reference,
      metadata: { listing_id: listingId, buyer_id: user.id },
      callbackUrl: `${baseUrl}/api/paystack/callback`,
    })
    return NextResponse.redirect(authorization_url)
  } catch (err) {
    console.error('Paystack initiate error:', err)
    return NextResponse.redirect(`${baseUrl}/notes/${listingId}?payment=error`)
  }
}
