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
    .select('id, title, code, price, pages, tone, status, created_at')
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
    />
  )
}
