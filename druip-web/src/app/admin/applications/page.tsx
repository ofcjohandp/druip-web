import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import AdminApplicationsClient from './admin-client'

const ADMIN_EMAIL = 'ofc.johandp@gmail.com'

export default async function AdminApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/home')

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: applications } = await admin
    .from('seller_applications')
    .select('id, user_id, report_url, status, reviewer_notes, created_at')
    .order('created_at', { ascending: false })

  const { data: payouts } = await admin
    .from('payout_requests')
    .select('id, seller_id, amount, bank_name, account_number, account_holder, status, paid_at, created_at')
    .order('created_at', { ascending: false })

  const appUserIds = (applications || []).map((a: { user_id: string }) => a.user_id)
  const payoutSellerIds = (payouts || []).map((p: { seller_id: string }) => p.seller_id)
  const userIds = Array.from(new Set([...appUserIds, ...payoutSellerIds]))

  const { data: profiles } = userIds.length > 0
    ? await admin.from('profiles').select('id, first_name, last_name').in('id', userIds)
    : { data: [] }

  const reportPaths = (applications || []).map((a: { report_url: string }) => a.report_url)
  const { data: signedData } = reportPaths.length > 0
    ? await admin.storage.from('notes').createSignedUrls(reportPaths, 3600)
    : { data: [] }

  const signedUrls: Record<string, string> = {}
  signedData?.forEach((item: { signedUrl?: string }, idx: number) => {
    if (item.signedUrl) signedUrls[reportPaths[idx]] = item.signedUrl
  })

  const profileMap = Object.fromEntries(
    (profiles || []).map((p: { id: string; first_name: string; last_name: string }) => [p.id, p])
  )

  function nameFor(id: string) {
    const p = profileMap[id] as { first_name: string; last_name: string } | undefined
    if (!p) return 'Unknown'
    return [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unknown'
  }

  const enriched = (applications || []).map((a: { id: string; user_id: string; report_url: string; status: string; reviewer_notes: string | null; created_at: string }) => ({
    ...a,
    name: nameFor(a.user_id),
    reportSignedUrl: signedUrls[a.report_url] || null,
  }))

  const enrichedPayouts = (payouts || []).map((p: {
    id: string; seller_id: string; amount: number; bank_name: string;
    account_number: string; account_holder: string; status: string;
    paid_at: string | null; created_at: string
  }) => ({
    ...p,
    seller_name: nameFor(p.seller_id),
  }))

  return <AdminApplicationsClient applications={enriched} payouts={enrichedPayouts}/>
}
