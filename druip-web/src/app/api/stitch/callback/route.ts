import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getPaymentStatus } from '@/lib/stitch'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const paymentRequestId = searchParams.get('id')

  if (!paymentRequestId) {
    return NextResponse.redirect(`${origin}/home?payment=error`)
  }

  try {
    const status = await getPaymentStatus(paymentRequestId)

    if (status !== 'PaymentInitiationRequestCompleted') {
      return NextResponse.redirect(`${origin}/home?payment=cancelled`)
    }

    // Status is complete — record the purchase
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Look up the payment request external reference to get listingId + buyerId
    // We stored externalReference as "listingId:buyerId" during initiation
    // Stitch doesn't return externalReference in the status query, so we
    // query by the payment request ID from our own records if available,
    // or fall back to reading from the Stitch node query which includes it.
    const { data: existing } = await supabase
      .from('purchases')
      .select('id')
      .eq('payfast_payment_id', paymentRequestId)
      .maybeSingle()

    if (existing) {
      // Already recorded (e.g. webhook beat us to it)
      const { data: purchase } = await supabase
        .from('purchases')
        .select('listing_id')
        .eq('payfast_payment_id', paymentRequestId)
        .single()
      return NextResponse.redirect(`${origin}/notes/${purchase?.listing_id}?payment=success`)
    }

    // Need externalReference — fetch it from Stitch
    const token = await getStitchToken()
    const extRef = await fetchExternalReference(paymentRequestId, token)

    if (!extRef) return NextResponse.redirect(`${origin}/home?payment=error`)

    const [listingId, buyerId] = extRef.split(':')

    const { data: listing } = await supabase
      .from('listings')
      .select('seller_id, price')
      .eq('id', listingId)
      .single()

    if (!listing) return NextResponse.redirect(`${origin}/home?payment=error`)

    const amountPaid = Number(listing.price)
    const platformFee = amountPaid * 0.15
    const sellerAmount = amountPaid - platformFee

    await supabase.from('purchases').insert({
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: listing.seller_id,
      amount_paid: amountPaid,
      platform_fee: platformFee,
      seller_amount: sellerAmount,
      payfast_payment_id: paymentRequestId,
      payment_status: 'paid',
    })

    return NextResponse.redirect(`${origin}/notes/${listingId}?payment=success`)
  } catch (err) {
    console.error('Stitch callback error:', err)
    return NextResponse.redirect(`${origin}/home?payment=error`)
  }
}

async function getStitchToken(): Promise<string> {
  const res = await fetch('https://secure.stitch.money/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.STITCH_CLIENT_ID!,
      client_secret: process.env.STITCH_CLIENT_SECRET!,
      scope: 'client_paymentrequest',
    }),
  })
  const data = await res.json()
  return data.access_token
}

async function fetchExternalReference(paymentRequestId: string, token: string): Promise<string | null> {
  const res = await fetch('https://api.stitch.money/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: `
        query GetPaymentRequest($id: ID!) {
          node(id: $id) {
            ... on ClientPaymentInitiationRequest {
              externalReference
            }
          }
        }
      `,
      variables: { id: paymentRequestId },
    }),
  })
  const data = await res.json()
  return data.data?.node?.externalReference ?? null
}
