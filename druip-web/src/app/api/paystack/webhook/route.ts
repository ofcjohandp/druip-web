import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature')
  const secret = process.env.PAYSTACK_SECRET_KEY!

  const expectedSig = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  if (signature !== expectedSig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const body = JSON.parse(rawBody)

  if (body.event !== 'charge.success') {
    return NextResponse.json({ ok: true })
  }

  const reference: string = body.data?.reference
  const metadata: Record<string, string> = body.data?.metadata || {}
  const listingId: string = metadata.listing_id
  const buyerId: string = metadata.buyer_id

  if (!reference || !listingId || !buyerId) {
    return NextResponse.json({ ok: true })
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: existing } = await supabase
    .from('purchases')
    .select('id')
    .eq('payfast_payment_id', reference)
    .maybeSingle()

  if (existing) return NextResponse.json({ ok: true })

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
    payfast_payment_id: reference,
    payment_status: 'paid',
  })

  return NextResponse.json({ ok: true })
}
