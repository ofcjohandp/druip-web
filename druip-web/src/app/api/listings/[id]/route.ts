import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

async function getOwnershipContext(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, listing: null, error: 'Unauthorized', status: 401 }

  const { data: listing } = await supabase
    .from('listings')
    .select('id, seller_id')
    .eq('id', id)
    .single()

  if (!listing) return { user, listing: null, error: 'Not found', status: 404 }
  if (listing.seller_id !== user.id) return { user, listing: null, error: 'Forbidden', status: 403 }

  return { user, listing, error: null, status: 200 }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { listing, error, status } = await getOwnershipContext(params.id)
  if (error) return NextResponse.json({ error }, { status })

  const body = await req.json()
  const { title, code, description, price, cover_url } = body

  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error: updateError } = await service
    .from('listings')
    .update({
      title: title.trim(),
      code: code?.trim() || null,
      description: description?.trim() || null,
      price: Number(price) || 0,
      ...(cover_url !== undefined ? { cover_url: cover_url || null } : {}),
    })
    .eq('id', listing!.id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { listing, error, status } = await getOwnershipContext(params.id)
  if (error) return NextResponse.json({ error }, { status })

  const supabase = await createClient()
  const { count } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('listing_id', listing!.id)

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: 'Students have purchased this listing — it cannot be deleted.' },
      { status: 409 }
    )
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error: deleteError } = await service
    .from('listings')
    .delete()
    .eq('id', listing!.id)

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
