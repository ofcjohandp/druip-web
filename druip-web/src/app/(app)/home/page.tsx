import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HomeClient from './home-client'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const firstName = user.user_metadata?.first_name ?? 'there'

  const { data: sellerListings } = await supabase
    .from('listings')
    .select('id')
    .eq('seller_id', user.id)

  const ids = sellerListings?.map(l => l.id) || []
  let earnings = 0
  if (ids.length > 0) {
    const { data: purchases } = await supabase
      .from('purchases')
      .select('amount_paid')
      .in('listing_id', ids)
      .eq('payment_status', 'paid')
    earnings = (purchases || []).reduce((sum, p) => sum + Number(p.amount_paid) * 0.85, 0)
  }

  return <HomeClient firstName={firstName} streak={0} earnings={earnings} />
}
