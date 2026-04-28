import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { verifySignature } from '@/lib/payfast'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const data: Record<string, string> = {}
  formData.forEach((value, key) => { data[key] = value.toString() })

  if (!verifySignature(data, data.signature)) {
    return new NextResponse('Invalid signature', { status: 400 })
  }

  if (data.payment_status !== 'COMPLETE') {
    return new NextResponse('OK', { status: 200 })
  }

  const listingId = data.custom_str1
  const buyerId = data.custom_str2
  const amountGross = parseFloat(data.amount_gross)
  const platformFee = amountGross * 0.15
  const sellerAmount = amountGross - platformFee

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: listing } = await supabase
    .from('listings')
    .select('seller_id')
    .eq('id', listingId)
    .single()

  if (!listing) return new NextResponse('Listing not found', { status: 404 })

  await supabase.from('purchases').insert({
    listing_id: listingId,
    buyer_id: buyerId,
    seller_id: listing.seller_id,
    amount_paid: amountGross,
    platform_fee: platformFee,
    seller_amount: sellerAmount,
    payfast_payment_id: data.pf_payment_id,
    payment_status: 'paid',
  })

  return new NextResponse('OK', { status: 200 })
}
