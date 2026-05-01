import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const paymentRequestId = body?.data?.clientPaymentInitiationRequest?.id
  const status = body?.data?.clientPaymentInitiationRequest?.status?.__typename

  if (!paymentRequestId || status !== 'PaymentInitiationRequestCompleted') {
    return NextResponse.json({ ok: true })
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Skip if already recorded by callback
  const { data: existing } = await supabase
    .from('purchases')
    .select('id')
    .eq('payfast_payment_id', paymentRequestId)
    .maybeSingle()

  if (existing) return NextResponse.json({ ok: true })

  const extRef: string = body?.data?.clientPaymentInitiationRequest?.externalReference
  if (!extRef) return NextResponse.json({ ok: true })

  const [listingId, buyerId] = extRef.split(':')

  const { data: listing } = await supabase
    .from('listings')
    .select('seller_id, price')
    .eq('id', listingId)
    .single()

  if (!listing) return NextResponse.json({ ok: true })

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

  return NextResponse.json({ ok: true })
}
