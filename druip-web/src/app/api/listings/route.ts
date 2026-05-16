import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify seller: must have an approved application OR an existing published listing
  const [{ data: application }, { count: publishedCount }] = await Promise.all([
    supabase
      .from('seller_applications')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .maybeSingle(),
    supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id)
      .eq('status', 'published'),
  ])

  const isSeller = !!application || (publishedCount ?? 0) > 0
  if (!isSeller) {
    return NextResponse.json({ error: 'Seller approval required' }, { status: 403 })
  }

  const body = await request.json()
  const { title, code, type, faculty, tone, description, price, pages, file_urls, cover_url, language, format } = body

  if (!title || !file_urls?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: listing, error } = await service.from('listings').insert({
    seller_id: user.id,
    title,
    code,
    type,
    faculty,
    tone,
    description,
    price,
    pages,
    file_urls,
    cover_url: cover_url ?? null,
    language,
    format,
    status: 'published',
  }).select('id').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: listing.id })
}
