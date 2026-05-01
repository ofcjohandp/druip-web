import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HomeClient from './home-client'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const rawName = user.user_metadata?.first_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? ''
  const firstName = rawName ? rawName.split(' ')[0] : ''

  return <HomeClient firstName={firstName} streak={0} />
}
