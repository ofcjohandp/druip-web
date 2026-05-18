import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const VALID_BANKS = ['Absa', 'FNB', 'Nedbank', 'Standard Bank', 'Capitec', 'Other'] as const

export async function GET() {
  // Returns the seller's most recent payout request so the UI can pre-fill
  // bank details, and a list of recent requests for history.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('payout_requests')
    .select('id, amount, bank_name, account_number, account_holder, status, paid_at, created_at')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ requests: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    amount?: number
    bank_name?: string
    account_number?: string
    account_holder?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const amount = Number(body.amount)
  const bank_name = (body.bank_name ?? '').toString().trim()
  const account_number = (body.account_number ?? '').toString().trim()
  const account_holder = (body.account_holder ?? '').toString().trim()

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Amount must be greater than zero.' }, { status: 400 })
  }
  if (!(VALID_BANKS as readonly string[]).includes(bank_name)) {
    return NextResponse.json({ error: 'Pick a valid bank.' }, { status: 400 })
  }
  if (!/^\d{6,20}$/.test(account_number)) {
    return NextResponse.json({ error: 'Account number must be 6-20 digits.' }, { status: 400 })
  }
  if (account_holder.length < 2 || account_holder.length > 80) {
    return NextResponse.json({ error: 'Enter the account holder name.' }, { status: 400 })
  }

  // Re-derive available balance from purchases server-side so a caller can't
  // request more than they've actually earned.
  const { data: paidPurchases, error: balErr } = await supabase
    .from('purchases')
    .select('seller_amount')
    .eq('seller_id', user.id)
    .eq('payment_status', 'paid')
  if (balErr) return NextResponse.json({ error: balErr.message }, { status: 500 })

  const earned = (paidPurchases ?? []).reduce((s, p) => s + Number(p.seller_amount || 0), 0)

  const { data: prior, error: priorErr } = await supabase
    .from('payout_requests')
    .select('amount, status')
    .eq('seller_id', user.id)
  if (priorErr) return NextResponse.json({ error: priorErr.message }, { status: 500 })

  // Pending + paid payouts are both deducted from the available balance.
  const reserved = (prior ?? [])
    .filter(p => p.status !== 'rejected')
    .reduce((s, p) => s + Number(p.amount || 0), 0)

  const available = Math.max(earned - reserved, 0)
  if (amount > available + 0.005) {
    return NextResponse.json(
      { error: `Requested R ${amount.toFixed(2)} exceeds available balance R ${available.toFixed(2)}.` },
      { status: 400 }
    )
  }

  // Insert via service role so it works regardless of any RLS gaps.
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: inserted, error: insertErr } = await service
    .from('payout_requests')
    .insert({
      seller_id: user.id,
      amount,
      bank_name,
      account_number,
      account_holder,
      status: 'pending',
    })
    .select('id')
    .single()

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  return NextResponse.json({ id: inserted.id, ok: true })
}
