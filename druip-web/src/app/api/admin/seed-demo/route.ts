import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// One-shot seed endpoint — delete after demo
export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get('key') !== 'druip-seed-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Find the seller user
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
  if (usersError || !users?.length) {
    return NextResponse.json({ error: 'No users found', detail: usersError?.message }, { status: 500 })
  }

  // Pick the first user (or find by email if needed)
  const seller = users.find(u => u.email === 'ofc.johandp@gmail.com') ?? users[0]

  const { data: listing, error: insertError } = await supabase.from('listings').insert({
    seller_id: seller.id,
    title: '1,000 Viral Hooks — Full Guide',
    code: 'MKT 301',
    type: 'Notes',
    faculty: 'Commerce',
    tone: 'gold',
    description: 'A complete reference guide to writing viral hooks for essays, presentations, and social media content.',
    price: 45,
    pages: 8,
    file_urls: [],
    cover_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
    language: 'English',
    format: 'PDF',
    status: 'published',
  }).select().single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: listing.id, url: `/notes/${listing.id}` })
}
