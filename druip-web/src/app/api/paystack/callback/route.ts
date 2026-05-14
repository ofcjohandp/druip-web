import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { verifyTransaction } from '@/lib/paystack'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const reference = searchParams.get('reference') || searchParams.get('trxref')

  if (!reference) return NextResponse.redirect(`${origin}/home?payment=error`)

  try {
    const txn = await verifyTransaction(reference)

    if (txn.status !== 'success') {
      return NextResponse.redirect(`${origin}/home?payment=cancelled`)
    }

    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: existing } = await supabase
      .from('purchases')
      .select('id, listing_id')
      .eq('payfast_payment_id', reference)
      .maybeSingle()

    if (existing) {
      return NextResponse.redirect(`${origin}/notes/${existing.listing_id}?payment=success`)
    }

    const listingId: string = txn.metadata.listing_id
    const buyerId: string = txn.metadata.buyer_id

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
      payfast_payment_id: reference,
      payment_status: 'paid',
    })

    return NextResponse.redirect(`${origin}/notes/${listingId}?payment=success`)
  } catch (err) {
    console.error('Paystack callback error:', err)
    return NextResponse.redirect(`${origin}/home?payment=error`)
  }
}
