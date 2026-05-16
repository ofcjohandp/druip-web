import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import dynamicImport from 'next/dynamic'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ViewClient = dynamicImport(() => import('./view-client'), { ssr: false })

export default async function ViewPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const storage = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, file_urls, seller_id')
    .eq('id', params.id)
    .eq('status', 'published')
    .single()

  if (!listing) notFound()

  const isOwner = user.id === listing.seller_id

  let hasPurchased = false
  if (!isOwner) {
    const { data } = await supabase
      .from('purchases')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('listing_id', listing.id)
      .maybeSingle()
    hasPurchased = !!data
  }

  if (!isOwner && !hasPurchased) redirect(`/notes/${params.id}`)

  const filePaths: string[] = Array.isArray(listing.file_urls) ? listing.file_urls : []
  const files: { url: string; type: 'image' | 'pdf' }[] = []

  for (const path of filePaths) {
    const { data } = await storage.storage.from('notes').createSignedUrl(path, 600)
    if (data?.signedUrl) {
      files.push({ url: data.signedUrl, type: path.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image' })
    }
  }

  return <ViewClient title={listing.title} files={files} userEmail={user.email ?? user.id} />
}
