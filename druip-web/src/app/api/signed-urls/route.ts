import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

async function canAccessPath(supabase: any, userId: string, path: string): Promise<boolean> {
  // Cover images are browsable by any authenticated user
  const { data: coverListing } = await supabase
    .from('listings')
    .select('id')
    .eq('cover_url', path)
    .maybeSingle()
  if (coverListing) return true

  // For file paths: require seller ownership or a paid purchase
  const { data: listings } = await supabase
    .from('listings')
    .select('id, seller_id')
    .contains('file_urls', [path])
    .limit(1)

  const listing = listings?.[0]
  if (!listing) return false
  if (listing.seller_id === userId) return true

  const { data: purchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('buyer_id', userId)
    .eq('listing_id', listing.id)
    .eq('payment_status', 'paid')
    .maybeSingle()
  return !!purchase
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { paths } = await request.json() as { paths: string[] }
  if (!Array.isArray(paths) || paths.length === 0) {
    return NextResponse.json({})
  }

  const storage = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const result: Record<string, string> = {}
  const external = paths.filter(p => p.startsWith('http'))
  const storagePaths = paths.filter(p => !p.startsWith('http'))
  external.forEach(url => { result[url] = url })

  // Validate each storage path before signing
  const allowed: string[] = []
  for (const path of storagePaths) {
    if (await canAccessPath(supabase, user.id, path)) {
      allowed.push(path)
    }
  }

  if (allowed.length) {
    const { data } = await storage.storage.from('notes').createSignedUrls(allowed, 3600)
    if (data) {
      data.forEach((item, idx) => { if (item.signedUrl) result[allowed[idx]] = item.signedUrl })
    }
  }

  return NextResponse.json(result)
}
