import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './profile-client'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const firstName = user.user_metadata?.first_name ?? ''
  const lastName = user.user_metadata?.last_name ?? ''
  const email = user.email ?? ''
  const university = user.user_metadata?.university ?? 'NWU Potchefstroom'
  const rawRoles: string[] = user.user_metadata?.roles ?? ['Student']

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, code, price, pages, tone, status, description, created_at')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const hasListings = (listings?.length ?? 0) > 0
  const roles = hasListings && !rawRoles.includes('Seller') ? [...rawRoles, 'Seller'] : rawRoles

  const ids = listings?.map(l => l.id) || []
  let salesCount = 0
  if (ids.length > 0) {
    const { count } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true })
      .in('listing_id', ids)
    salesCount = count || 0
  }

  const { data: application } = await supabase
    .from('seller_applications')
    .select('status, reviewer_notes')
    .eq('user_id', user.id)
    .maybeSingle()

  // Reviews received on this seller's listings
  type ReceivedReview = {
    id: string
    listing_id: string
    listing_title: string
    reviewer_name: string
    score: number
    comment: string | null
    created_at: string
  }
  let receivedReviews: ReceivedReview[] = []
  if (ids.length > 0) {
    const { data: rows } = await supabase
      .from('ratings')
      .select('id, listing_id, score, comment, created_at, buyer_id')
      .in('listing_id', ids)
      .order('created_at', { ascending: false })

    if (rows && rows.length > 0) {
      const reviewerIds = Array.from(new Set(rows.map(r => r.buyer_id as string)))
      const { data: reviewerProfiles } = reviewerIds.length > 0
        ? await supabase.from('profiles').select('id, first_name, last_name').in('id', reviewerIds)
        : { data: [] as { id: string; first_name: string | null; last_name: string | null }[] }
      const nameMap: Record<string, string> = {}
      for (const p of reviewerProfiles || []) {
        const n = [p.first_name, p.last_name].filter(Boolean).join(' ').trim()
        nameMap[p.id as string] = n || 'Student'
      }
      const titleMap: Record<string, string> = {}
      for (const l of listings || []) titleMap[l.id] = l.title

      receivedReviews = rows.map(r => ({
        id: r.id as string,
        listing_id: r.listing_id as string,
        listing_title: titleMap[r.listing_id as string] || 'Listing',
        reviewer_name: nameMap[r.buyer_id as string] || 'Student',
        score: r.score as number,
        comment: (r as { comment?: string | null }).comment ?? null,
        created_at: r.created_at as string,
      }))
    }
  }

  return (
    <ProfileClient
      firstName={firstName}
      lastName={lastName}
      email={email}
      university={university}
      roles={roles}
      listings={listings || []}
      salesCount={salesCount}
      applicationStatus={(application?.status as 'pending' | 'approved' | 'denied') ?? null}
      reviewerNotes={application?.reviewer_notes ?? null}
      receivedReviews={receivedReviews}
    />
  )
}
