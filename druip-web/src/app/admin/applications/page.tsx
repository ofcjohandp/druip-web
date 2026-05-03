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

  const userIds = (applications || []).map((a: { user_id: string }) => a.user_id)
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

  const enriched = (applications || []).map((a: { id: string; user_id: string; report_url: string; status: string; reviewer_notes: string | null; created_at: string }) => ({
    ...a,
    name: profileMap[a.user_id]
      ? `${(profileMap[a.user_id] as { first_name: string; last_name: string }).first_name} ${(profileMap[a.user_id] as { first_name: string; last_name: string }).last_name}`
      : 'Unknown',
    reportSignedUrl: signedUrls[a.report_url] || null,
  }))

  return <AdminApplicationsClient applications={enriched}/>
}
