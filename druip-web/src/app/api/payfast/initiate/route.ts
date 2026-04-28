import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSignature, PAYFAST_URL } from '@/lib/payfast'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`
  const mPaymentId = `${listingId.slice(0, 8)}-${Date.now()}`

  const paymentData: Record<string, string> = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID!,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
    return_url: `${baseUrl}/notes/${listingId}?payment=success`,
    cancel_url: `${baseUrl}/notes/${listingId}?payment=cancelled`,
    notify_url: `${baseUrl}/api/payfast/notify`,
    name_first: profile?.first_name || 'Student',
    name_last: profile?.last_name || '',
    email_address: user.email!,
    m_payment_id: mPaymentId,
    amount: Number(listing.price).toFixed(2),
    item_name: listing.title.slice(0, 100),
    custom_str1: listingId,
    custom_str2: user.id,
  }

  const signature = generateSignature(paymentData)
  paymentData.signature = signature

  const fields = Object.entries(paymentData)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${v.replace(/"/g, '&quot;')}">`)
    .join('\n    ')

  const html = `<!DOCTYPE html>
<html>
<head><title>Redirecting to PayFast...</title></head>
<body>
  <form id="pf" action="${PAYFAST_URL}" method="post">
    ${fields}
  </form>
  <script>document.getElementById('pf').submit();</script>
</body>
</html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
}
